from sqlalchemy import Select, and_, or_

from app.config import CURRENT_USER_ID
from app.models import Restaurant, Tag


# 가격대별 조건. 1만원 이하 / 1만원 초과 2만원 미만 / 2만원 이상으로 겹치지 않게 나눈다.
PRICE_BAND_CONDITIONS = {
    "under_10k": lambda price: price <= 10000,
    "10k_20k": lambda price: and_(price > 10000, price < 20000),
    "over_20k": lambda price: price >= 20000,
}


def apply_restaurant_filters(
    statement: Select,
    tags: list[str],
    price_bands: list[str],
    visited: bool | None,
) -> Select:
    """식당 조회 조건을 붙인다. 목록 필터와 추천 후보 조회가 함께 쓴다."""
    statement = statement.where(Restaurant.user_id == CURRENT_USER_ID)

    # 여러 태그를 고르면 그중 하나라도 붙은 식당을 포함한다.
    if tags:
        statement = statement.where(
            Restaurant.tags.any(and_(Tag.user_id == CURRENT_USER_ID, Tag.name.in_(tags)))
        )

    # 가격대를 고르면 가격이 있고 고른 가격대 중 하나에 드는 식당만 포함한다.
    if price_bands:
        statement = statement.where(
            Restaurant.price.is_not(None),
            or_(*(PRICE_BAND_CONDITIONS[band](Restaurant.price) for band in dict.fromkeys(price_bands))),
        )

    if visited is not None:
        statement = statement.where(Restaurant.visited == visited)

    return statement
