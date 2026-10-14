from fastapi import FastAPI

from app.config import DATABASE_URL


app = FastAPI(title="오늘 뭐 먹지?")
app.state.database_url = DATABASE_URL


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
