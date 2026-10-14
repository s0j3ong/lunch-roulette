# 오늘 뭐 먹지?

저장한 식당 중에서 조건에 맞는 곳을 룰렛으로 골라주는 개인 맛집 기록장 웹앱이에요.

## 실행 준비

- Python 3와 Node.js가 설치되어 있어야 해요.
- MariaDB가 실행 중이어야 해요.
- T01에서 준비한 `lunch_box` 데이터베이스와 `lunch@localhost` 계정이 필요해요.
- DB 접속 정보는 `backend/.env`에만 설정해요. 다음 키를 지정하고 비밀번호는 Git에 올리지 마세요.

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

## 백엔드 실행

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8001
```

백엔드 주소는 <http://localhost:8001>이고, 테스트 응답은 <http://localhost:8001/api/health>에서 확인할 수 있어요. API 문서는 <http://localhost:8001/docs>에서 볼 수 있어요.

## 프론트엔드 실행

다른 터미널에서 실행해요.

```bash
cd frontend
corepack pnpm install
corepack pnpm dev
```

브라우저에서 <http://localhost:5173>을 열어요. 개발 서버는 `/api` 요청을 백엔드 `localhost:8001`으로 프록시해요.
