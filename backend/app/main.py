from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from app.config import DATABASE_URL
from app.routers.auth import router as auth_router
from app.routers.recommendations import router as recommendations_router
from app.routers.restaurants import router as restaurants_router
from app.routers.tags import router as tags_router


FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

app = FastAPI(title="오늘 뭐 먹지?")
app.state.database_url = DATABASE_URL
app.include_router(auth_router)
app.include_router(restaurants_router)
app.include_router(tags_router)
app.include_router(recommendations_router)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


# 등록되지 않은 /api 경로는 화면용 정적 파일로 넘기지 않고 JSON 404로 돌려준다.
@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
)
def api_not_found(path: str) -> None:
    raise HTTPException(status_code=404, detail="요청한 API를 찾을 수 없어요.")


# 프론트엔드 빌드 결과가 있으면 같은 서버에서 화면도 서빙한다.
# /api와 /docs는 위에서 먼저 등록되므로 이 마운트보다 우선한다.
if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
