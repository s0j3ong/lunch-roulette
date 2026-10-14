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
        price_min=request.price_min,
        price_max=request.price_max,
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


def recommend_tag(session: Session, request: RecommendationRequest) -> TagRecommendationResponse:
    # 가격·가본 곳·제외 조건에 맞는 식당이 하나라도 붙은 태그만 후보로 한다.
    restaurant_ids = apply_restaurant_filters(
        select(Restaurant.id),
        tags=[],
        price_min=request.price_min,
        price_max=request.price_max,
        visited=request.visited,
    )
    if request.exclude_ids:
        restaurant_ids = restaurant_ids.where(Restaurant.id.not_in(request.exclude_ids))

    statement = select(Tag).where(
        Tag.user_id == CURRENT_USER_ID,
        Tag.restaurants.any(Restaurant.id.in_(restaurant_ids)),
    )
    # 태그를 골라 보냈으면 그 태그들 안에서만 고른다.
    if request.tags:
        statement = statement.where(Tag.name.in_(request.tags))

    candidates = list(session.scalars(statement).all())
    if not candidates:
        raise NoCandidatesError

    winner = random.choice(candidates)
    wheel = _build_wheel(winner, candidates, key=lambda tag: tag.id)
    return TagRecommendationResponse(
        winner_tag=TagResponse(id=winner.id, name=winner.name, is_default=winner.is_default),
        wheel=[TagResponse(id=tag.id, name=tag.name, is_default=tag.is_default) for tag in wheel],
    )
