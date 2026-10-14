from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RestaurantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    tags: list[str] = Field(default_factory=list)
    price: int | None = Field(default=None, ge=0)
    memo: str | None = Field(default=None, max_length=255)
    visited: bool = False
    rating: int | None = Field(default=None, ge=1, le=5)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("식당 이름은 비워둘 수 없어요.")
        return name

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, values: list[str]) -> list[str]:
        tags = list(dict.fromkeys(value.strip() for value in values))
        if any(not tag for tag in tags):
            raise ValueError("태그 이름은 비워둘 수 없어요.")
        if any(len(tag) > 100 for tag in tags):
            raise ValueError("태그 이름은 100자 이하여야 해요.")
        return tags


class RestaurantUpdate(RestaurantCreate):
    pass


class RestaurantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tags: list[str]
    price: int | None
    memo: str | None
    visited: bool
    rating: int | None
    created_at: datetime
    updated_at: datetime


class RestaurantListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tags: list[str]
    price: int | None
    memo: str | None
    visited: bool
    rating: int | None


class TagResponse(BaseModel):
    id: int
    name: str
    is_default: bool
