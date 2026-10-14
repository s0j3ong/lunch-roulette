from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import CURRENT_USER_ID
from app.database import get_db
from app.models import Restaurant, Tag
from app.schemas import PriceRangeResponse, TagResponse


router = APIRouter(prefix="/api")


@router.get("/tags", response_model=list[TagResponse], tags=["tags"])
def list_tags(session: Session = Depends(get_db)) -> list[Tag]:
    return list(
        session.scalars(
            select(Tag)
            .where(Tag.user_id == CURRENT_USER_ID)
            .order_by(Tag.is_default.desc(), Tag.name, Tag.id)
        ).all()
    )


@router.get("/price-range", response_model=PriceRangeResponse, tags=["price-range"])
def get_price_range(session: Session = Depends(get_db)) -> PriceRangeResponse:
    min_price, max_price = session.execute(
        select(func.min(Restaurant.price), func.max(Restaurant.price)).where(
            Restaurant.user_id == CURRENT_USER_ID
        )
    ).one()
    return PriceRangeResponse(min_price=min_price, max_price=max_price)
