from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RecommendationRequest, RecommendationResponse, TagRecommendationResponse
from app.services.recommend import NoCandidatesError, recommend_restaurant, recommend_tag


router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

NO_CANDIDATES_DETAIL = {
    "code": "NO_CANDIDATES",
    "message": "조건에 맞는 식당이 없어요. 조건을 바꾸거나 식당을 등록해 주세요.",
}
NO_TAG_CANDIDATES_DETAIL = {
    "code": "NO_CANDIDATES",
    "message": "저장된 음식 종류가 없어요. 식당을 등록하면서 음식 종류를 추가해 주세요.",
}


@router.post(
    "",
    response_model=RecommendationResponse,
    responses={404: {"description": "조건에 맞는 후보가 없음 (NO_CANDIDATES)"}},
)
def recommend(
    payload: RecommendationRequest,
    session: Session = Depends(get_db),
) -> RecommendationResponse:
    try:
        return recommend_restaurant(session, payload)
    except NoCandidatesError:
        raise HTTPException(status_code=404, detail=NO_CANDIDATES_DETAIL) from None


@router.post(
    "/tag",
    response_model=TagRecommendationResponse,
    responses={404: {"description": "저장된 음식 종류가 없음 (NO_CANDIDATES)"}},
)
def recommend_food_tag(session: Session = Depends(get_db)) -> TagRecommendationResponse:
    try:
        return recommend_tag(session)
    except NoCandidatesError:
        raise HTTPException(status_code=404, detail=NO_TAG_CANDIDATES_DETAIL) from None
