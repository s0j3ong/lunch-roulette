from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import DEFAULT_TAG_NAMES
from app.database import get_db
from app.dependencies import get_current_user_id
from app.models import Restaurant, Tag
from app.schemas import PriceBand, RestaurantCreate, RestaurantListItem, RestaurantResponse, RestaurantUpdate
from app.services.filters import apply_restaurant_filters


router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


def _get_tags(session: Session, user_id: int, names: list[str]) -> list[Tag]:
    unique_names = list(dict.fromkeys(name.strip() for name in names))
    if any(not name for name in unique_names):
        raise HTTPException(status_code=422, detail="태그 이름은 비워둘 수 없어요.")

    tags = []
    for name in unique_names:
        tag = session.scalar(
            select(Tag).where(Tag.user_id == user_id, Tag.name == name)
        )
        if tag is None:
            tag = Tag(
                user_id=user_id,
                name=name,
                is_default=name in DEFAULT_TAG_NAMES,
            )
            session.add(tag)
            session.flush()
        tags.append(tag)
    return tags


def _get_restaurant(session: Session, user_id: int, restaurant_id: int) -> Restaurant:
    restaurant = session.scalar(
        select(Restaurant)
        .options(selectinload(Restaurant.tags.and_(Tag.user_id == user_id)))
        .where(
            Restaurant.id == restaurant_id,
            Restaurant.user_id == user_id,
        )
    )
    if restaurant is None:
        raise HTTPException(status_code=404, detail="식당을 찾을 수 없어요.")
    return restaurant


def _response(restaurant: Restaurant) -> RestaurantResponse:
    return RestaurantResponse(
        id=restaurant.id,
        name=restaurant.name,
        tags=[tag.name for tag in restaurant.tags],
        price=restaurant.price,
        location=restaurant.location,
        memo=restaurant.memo,
        visited=restaurant.visited,
        rating=restaurant.rating,
        created_at=restaurant.created_at,
        updated_at=restaurant.updated_at,
    )


@router.get("", response_model=list[RestaurantListItem])
def list_restaurants(
    tag: list[str] = Query(default=[], description="음식 종류 태그. 여러 개면 하나라도 붙은 식당"),
    price_band: list[PriceBand] = Query(default=[], description="가격대. 여러 개면 하나라도 해당하는 식당"),
    visited: bool | None = None,
    session: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> list[RestaurantListItem]:
    statement = apply_restaurant_filters(
        select(Restaurant).options(selectinload(Restaurant.tags.and_(Tag.user_id == user_id))),
        tags=[name.strip() for name in tag if name.strip()],
        user_id=user_id,
        price_bands=price_band,
        visited=visited,
    )
    restaurants = session.scalars(statement.order_by(Restaurant.id)).all()
    return [
        RestaurantListItem(
            id=restaurant.id,
            name=restaurant.name,
            tags=[tag.name for tag in restaurant.tags],
            price=restaurant.price,
            location=restaurant.location,
            memo=restaurant.memo,
            visited=restaurant.visited,
            rating=restaurant.rating,
        )
        for restaurant in restaurants
    ]


@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(
    payload: RestaurantCreate,
    session: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> RestaurantResponse:
    now = datetime.now()
    restaurant = Restaurant(
        user_id=user_id,
        name=payload.name,
        tags=_get_tags(session, user_id, payload.tags),
        price=payload.price,
        location=payload.location,
        memo=payload.memo,
        visited=payload.visited,
        rating=payload.rating,
        created_at=now,
        updated_at=now,
    )
    session.add(restaurant)
    session.commit()
    session.refresh(restaurant)
    return _response(restaurant)


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(
    restaurant_id: int,
    session: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> RestaurantResponse:
    return _response(_get_restaurant(session, user_id, restaurant_id))


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdate,
    session: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> RestaurantResponse:
    restaurant = _get_restaurant(session, user_id, restaurant_id)
    restaurant.name = payload.name
    restaurant.tags = _get_tags(session, user_id, payload.tags)
    restaurant.price = payload.price
    restaurant.location = payload.location
    restaurant.memo = payload.memo
    restaurant.visited = payload.visited
    restaurant.rating = payload.rating
    restaurant.updated_at = datetime.now()
    session.commit()
    session.refresh(restaurant)
    return _response(restaurant)


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(
    restaurant_id: int,
    session: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Response:
    restaurant = _get_restaurant(session, user_id, restaurant_id)
    session.delete(restaurant)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
