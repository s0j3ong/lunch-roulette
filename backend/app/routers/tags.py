from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import DEFAULT_TAG_NAMES
from app.database import get_db
from app.dependencies import get_current_user_id
from app.models import Tag, restaurant_tags
from app.schemas import TagListItem


router = APIRouter(prefix="/api")


def _tag_order(tag: Tag) -> tuple[int, str]:
    if tag.name in DEFAULT_TAG_NAMES:
        return DEFAULT_TAG_NAMES.index(tag.name), ""
    return len(DEFAULT_TAG_NAMES), tag.name


@router.get("/tags", response_model=list[TagListItem], tags=["tags"])
def list_tags(
    session: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> list[TagListItem]:
    rows = session.execute(
        select(Tag, func.count(restaurant_tags.c.restaurant_id))
        .outerjoin(restaurant_tags, restaurant_tags.c.tag_id == Tag.id)
        .where(Tag.user_id == user_id)
        .group_by(Tag.id)
    ).all()
    # 기본 태그는 정해 둔 순서(한식, 중식, ...)로, 사용자 태그는 그 뒤에 이름순으로 둔다.
    rows = sorted(rows, key=lambda row: _tag_order(row[0]))
    return [
        TagListItem(id=tag.id, name=tag.name, is_default=tag.is_default, restaurant_count=count)
        for tag, count in rows
    ]


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["tags"])
def delete_tag(
    tag_id: int,
    session: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Response:
    tag = session.scalar(select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id))
    if tag is None:
        raise HTTPException(status_code=404, detail="음식 종류를 찾을 수 없어요.")
    if tag.is_default:
        raise HTTPException(status_code=400, detail="기본 음식 종류는 삭제할 수 없어요.")
    # 식당과의 연결(restaurant_tags)만 함께 지워지고 식당은 남는다.
    session.delete(tag)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
