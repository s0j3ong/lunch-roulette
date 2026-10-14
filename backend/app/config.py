import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import URL


ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_FILE)


def _required_setting(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Required database setting {name} is missing.")
    return value


try:
    _database_port = int(_required_setting("DB_PORT"))
except ValueError as exc:
    raise RuntimeError("Database setting DB_PORT must be an integer.") from exc

DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=_required_setting("DB_USER"),
    password=_required_setting("DB_PASSWORD"),
    host=_required_setting("DB_HOST"),
    port=_database_port,
    database=_required_setting("DB_NAME"),
)
