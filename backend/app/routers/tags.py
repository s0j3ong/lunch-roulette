from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import CURRENT_USER_ID
from app.database import get_db
from app.models import Tag
from app.schemas import TagResponse


router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("", response_model=list[TagResponse])
def list_tags(session: Session = Depends(get_db)) -> list[Tag]:
    return list(
        session.scalars(
            select(Tag)
            .where(Tag.user_id == CURRENT_USER_ID)
            .order_by(Tag.is_default.desc(), Tag.name, Tag.id)
        ).all()
    )
