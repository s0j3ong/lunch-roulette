from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Table, Column
from sqlalchemy.dialects.mysql import INTEGER, TINYINT
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


restaurant_tags = Table(
    "restaurant_tags",
    Base.metadata,
    Column("restaurant_id", INTEGER, ForeignKey("restaurants.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", INTEGER, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    Index("ix_restaurant_tags_tag_id", "tag_id"),
)


class Restaurant(Base):
    __tablename__ = "restaurants"
    __table_args__ = (
        Index("ix_restaurants_user_visited", "user_id", "visited"),
        Index("ix_restaurants_user_price", "user_id", "price"),
    )

    id: Mapped[int] = mapped_column(INTEGER(unsigned=False), primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(INTEGER(unsigned=False), nullable=False, default=1)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[int | None] = mapped_column(INTEGER(unsigned=False), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    memo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    visited: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    rating: Mapped[int | None] = mapped_column(TINYINT(unsigned=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    tags: Mapped[list["Tag"]] = relationship(secondary=restaurant_tags, back_populates="restaurants")


class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (Index("uq_tags_user_name", "user_id", "name", unique=True),)

    id: Mapped[int] = mapped_column(INTEGER(unsigned=False), primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(INTEGER(unsigned=False), nullable=False, default=1)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    restaurants: Mapped[list[Restaurant]] = relationship(secondary=restaurant_tags, back_populates="tags")
