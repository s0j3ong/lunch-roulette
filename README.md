# 오늘 뭐 먹지?

저장한 식당 중에서 조건에 맞는 곳을 룰렛으로 골라주는 개인 맛집 기록장 웹앱이에요.

- 식당 관리: 식당 등록·수정·삭제, 음식 종류 태그와 가격 범위로 목록 필터
- 룰렛: 조건(음식 종류, 가격 범위, 가본 곳/가고 싶은 곳) 선택, 음식 종류 태그 룰렛, 식당 룰렛, 다시 돌리기

| 계층 | 기술 | 포트 |
| --- | --- | --- |
| 프론트엔드 | React (Vite) | 5173 |
| 백엔드 | FastAPI, SQLAlchemy | 8001 |
| 데이터베이스 | MariaDB | 3306 |

> 이 개발 환경에서는 8000번 포트를 다른 앱이 쓰고 있어서 백엔드를 8001번으로 실행해요. 포트를 바꾸려면 백엔드 실행 명령의 `--port`와 `frontend/vite.config.js`의 프록시 대상을 함께 바꿔요.

## 1. 실행 준비

- Python 3와 Node.js(corepack 포함)가 설치되어 있어야 해요.
- MariaDB가 실행 중이어야 해요.
- 이 서비스 전용 데이터베이스(`lunch_box`)와 계정(`lunch@localhost`)이 있어야 하고, 계정에는 이 데이터베이스 권한만 주어요.

### DB 접속 정보

DB 접속 정보는 `backend/.env`에만 적어요. 다음 키를 직접 채우고, 이 파일은 Git에 올리지 않아요(`.gitignore`에 들어 있어요).

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

### 테이블 만들기 (처음 한 번)

`backend/sql/schema.sql`을 서비스 데이터베이스에서 실행해요. 식당·태그·연결 테이블 세 개를 만들고 기본 태그 네 개(한식·중식·일식·양식)를 넣어요.

```bash
mariadb -u lunch -p lunch_box < backend/sql/schema.sql
```

이미 테이블이 있으면 다시 실행하지 마세요. `CREATE TABLE`에서 오류가 나요.

## 2. 백엔드 실행

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8001
```

- 테스트 응답: <http://localhost:8001/api/health>
- API 문서: <http://localhost:8001/docs>

## 3. 프론트엔드 실행

다른 터미널에서 실행해요.

```bash
cd frontend
corepack pnpm install
corepack pnpm dev
```

브라우저에서 <http://localhost:5173>을 열어요. 개발 서버가 `/api` 요청을 백엔드 `localhost:8001`로 넘겨줘요.

| 할 일 | 명령 (`frontend` 폴더) |
| --- | --- |
| 개발 서버 | `corepack pnpm dev` |
| 빌드 | `corepack pnpm build` |
| 코드 검사 | `corepack pnpm lint` |

## 4. 사용 방법

1. 상단의 **식당 관리**에서 식당을 등록해요. 이름은 필수이고, 음식 종류는 여러 개 고르거나 직접 입력할 수 있어요.
2. 목록 위의 음식 종류와 가격 범위로 식당을 걸러 볼 수 있어요.
3. 상단의 **룰렛**에서 조건을 골라요. 조건을 고르지 않으면 저장한 모든 식당이 후보예요.
4. 음식 종류부터 정하기 어려우면 **태그 룰렛 돌리기**를 눌러요. 나온 음식 종류가 조건에 들어가고, 바꿀 수도 있어요.
5. **룰렛 돌리기**를 누르면 당첨 식당이 나와요. 마음에 들지 않으면 **다시 돌리기**로 나온 식당을 빼고 다시 돌려요. 조건을 바꾸면 빠진 식당 목록은 비워져요.

룰렛 칸은 최대 8개이고, 후보가 더 많으면 서버가 무작위로 8개를 골라 올려요. 당첨은 서버가 정하고, 화면은 그 칸에서 멈춰요. 기기에서 "동작 줄이기"를 켜 두면 룰렛이 짧게 돌아요.

## 5. API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/api/restaurants` | 식당 목록. `tag`(여러 번), `price_min`, `price_max`, `visited` 필터 |
| POST | `/api/restaurants` | 식당 등록 (없는 태그는 새로 만들어요) |
| GET | `/api/restaurants/{id}` | 식당 한 곳 조회 |
| PUT | `/api/restaurants/{id}` | 식당 수정 |
| DELETE | `/api/restaurants/{id}` | 식당 삭제 |
| GET | `/api/tags` | 태그 목록 |
| GET | `/api/price-range` | 저장된 식당의 최저가·최고가 |
| POST | `/api/recommendations` | 식당 룰렛 (`winner`, `wheel`, `remaining`) |
| POST | `/api/recommendations/tag` | 태그 룰렛 (`winner_tag`, `wheel`) |

후보가 없으면 두 추천 API 모두 404와 `{"detail": {"code": "NO_CANDIDATES", "message": "..."}}`를 돌려줘요.

## 6. 디렉터리

```text
backend/app/            main.py, config.py, database.py, models.py, schemas.py
backend/app/routers/    restaurants.py, tags.py(태그·가격 범위), recommendations.py
backend/app/services/   filters.py(조건 필터), recommend.py(무작위 선택과 룰렛 칸)
backend/sql/            schema.sql
frontend/src/api/       백엔드 호출 함수
frontend/src/components/ 룰렛, 식당 폼·목록, 필터, 확인 창
frontend/src/pages/     식당 관리 화면, 룰렛 화면
frontend/src/hooks/     룰렛 회전, 동작 줄이기 설정
frontend/src/styles/    theme.css (색상 토큰)
```
