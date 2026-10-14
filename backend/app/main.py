from fastapi import FastAPI

from app.config import DATABASE_URL
from app.routers.recommendations import router as recommendations_router
from app.routers.restaurants import router as restaurants_router
from app.routers.tags import router as tags_router


app = FastAPI(title="오늘 뭐 먹지?")
app.state.database_url = DATABASE_URL
app.include_router(restaurants_router)
app.include_router(tags_router)
app.include_router(recommendations_router)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
