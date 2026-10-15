import random

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import CURRENT_USER_ID
from app.models import Restaurant, Tag
from app.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RestaurantListItem,
    TagRecommendationResponse,
    TagResponse,
)
from app.services.filters import apply_restaurant_filters


WHEEL_SIZE = 8


class NoCandidatesError(Exception):
    """조건에 맞는 후보가 하나도 없을 때 발생한다."""


def _list_item(restaurant: Restaurant) -> RestaurantListItem:
    return RestaurantListItem(
        id=restaurant.id,
        name=restaurant.name,
        tags=[tag.name for tag in restaurant.tags],
        price=restaurant.price,
        location=restaurant.location,
        memo=restaurant.memo,
        visited=restaurant.visited,
        rating=restaurant.rating,
    )


def _build_wheel(winner, candidates: list, key) -> list:
    """당첨 항목을 반드시 포함해 최대 WHEEL_SIZE개의 칸을 무작위 순서로 만든다."""
    others = [candidate for candidate in candidates if key(candidate) != key(winner)]
    wheel = [winner, *random.sample(others, min(len(others), WHEEL_SIZE - 1))]
    random.shuffle(wheel)
    return wheel


def recommend_restaurant(session: Session, request: RecommendationRequest) -> RecommendationResponse:
    statement = apply_restaurant_filters(
        select(Restaurant).options(selectinload(Restaurant.tags.and_(Tag.user_id == CURRENT_USER_ID))),
        tags=request.tags,
        price_bands=request.price_bands,
        visited=request.visited,
    )
    if request.exclude_ids:
        statement = statement.where(Restaurant.id.not_in(request.exclude_ids))

    candidates = list(session.scalars(statement).all())
    if not candidates:
        raise NoCandidatesError

    # 당첨은 서버가 정하고, 화면은 wheel에서 winner의 칸을 찾아 멈춘다.
    winner = random.choice(candidates)
    wheel = _build_wheel(winner, candidates, key=lambda restaurant: restaurant.id)
    return RecommendationResponse(
        winner=_list_item(winner),
        wheel=[_list_item(restaurant) for restaurant in wheel],
        remaining=len(candidates) - 1,
    )


def recommend_tag(session: Session) -> TagRecommendationResponse:
    # 저장된 음식 종류 전체가 후보다. 8개보다 많으면 칸에는 무작위 8개만 올라간다.
    candidates = list(session.scalars(select(Tag).where(Tag.user_id == CURRENT_USER_ID)).all())
    if not candidates:
        raise NoCandidatesError

    winner = random.choice(candidates)
    wheel = _build_wheel(winner, candidates, key=lambda tag: tag.id)
    return TagRecommendationResponse(
        winner_tag=TagResponse(id=winner.id, name=winner.name, is_default=winner.is_default),
        wheel=[TagResponse(id=tag.id, name=tag.name, is_default=tag.is_default) for tag in wheel],
    )
