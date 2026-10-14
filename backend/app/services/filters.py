from sqlalchemy import Select, and_

from app.config import CURRENT_USER_ID
from app.models import Restaurant, Tag


def apply_restaurant_filters(
    statement: Select,
    tags: list[str],
    price_min: int | None,
    price_max: int | None,
    visited: bool | None,
) -> Select:
    """식당 조회 조건을 붙인다. 목록 필터와 추천 후보 조회가 함께 쓴다."""
    statement = statement.where(Restaurant.user_id == CURRENT_USER_ID)

    # 여러 태그를 고르면 그중 하나라도 붙은 식당을 포함한다.
    if tags:
        statement = statement.where(
            Restaurant.tags.any(and_(Tag.user_id == CURRENT_USER_ID, Tag.name.in_(tags)))
        )

    # 가격 범위를 정하면 가격이 있는 식당만 포함한다.
    if price_min is not None or price_max is not None:
        statement = statement.where(Restaurant.price.is_not(None))
    if price_min is not None:
        statement = statement.where(Restaurant.price >= price_min)
    if price_max is not None:
        statement = statement.where(Restaurant.price <= price_max)

    if visited is not None:
        statement = statement.where(Restaurant.visited == visited)

    return statement
