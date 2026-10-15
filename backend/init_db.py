"""빈 DB에 schema.sql로 테이블을 만든다.

사용법: backend 폴더에서 `python init_db.py`

- 새 DB(예: db 서버)를 처음 준비할 때 한 번 실행한다.
- 앱 테이블이 하나라도 있으면 아무것도 바꾸지 않고 멈춘다. 삭제나 초기화는 하지 않는다.
- migrations/는 이미 만든 옛 DB를 올리는 용도라서 여기서 실행하지 않는다.
"""

import sys
from pathlib import Path

from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError

from app.database import engine


SCHEMA_FILE = Path(__file__).resolve().parent / "sql" / "schema.sql"
APP_TABLES = {"users", "sessions", "restaurants", "tags", "restaurant_tags"}


def split_statements(sql: str) -> list[str]:
    # 주석 줄을 뺀 뒤 세미콜론 기준으로 나눈다
    lines = [line for line in sql.splitlines() if not line.lstrip().startswith("--")]
    return [statement.strip() for statement in "\n".join(lines).split(";") if statement.strip()]


def main() -> int:
    try:
        existing = APP_TABLES & set(inspect(engine).get_table_names())
    except OperationalError as exc:
        print(f"DB에 접속하지 못했어요. backend/.env의 DB 호스트·계정과 보안 그룹을 확인해 주세요. ({exc.orig})")
        return 2
    if existing:
        print(f"이미 테이블이 있어서 아무것도 바꾸지 않았어요: {', '.join(sorted(existing))}")
        return 1

    statements = split_statements(SCHEMA_FILE.read_text(encoding="utf-8"))
    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
    print(f"테이블 {len(APP_TABLES)}개를 만들었어요.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
