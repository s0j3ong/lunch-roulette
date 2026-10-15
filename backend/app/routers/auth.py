from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.config import SESSION_COOKIE_NAME, SESSION_DAYS
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import LoginRequest, SignupRequest, UserResponse
from app.services.auth import (
    UsernameTakenError,
    authenticate,
    create_session,
    create_user,
    delete_session,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_session_cookie(response: Response, token: str) -> None:
    # 개발 환경은 http라 secure를 끈다. https로 배포하면 secure=True로 바꾼다.
    response.set_cookie(
        SESSION_COOKIE_NAME,
        token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        samesite="lax",
        path="/",
    )


def _user_response(user: User) -> UserResponse:
    return UserResponse(id=user.id, username=user.username)


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, response: Response, session: Session = Depends(get_db)) -> UserResponse:
    try:
        user = create_user(session, payload.username, payload.password)
    except UsernameTakenError:
        raise HTTPException(status_code=409, detail="이미 쓰고 있는 아이디예요. 다른 아이디를 입력해 주세요.") from None
    _set_session_cookie(response, create_session(session, user.id))
    return _user_response(user)


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, response: Response, session: Session = Depends(get_db)) -> UserResponse:
    user = authenticate(session, payload.username, payload.password)
    if user is None:
        raise HTTPException(status_code=401, detail="아이디나 비밀번호가 맞지 않아요.")
    _set_session_cookie(response, create_session(session, user.id))
    return _user_response(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, session: Session = Depends(get_db)) -> Response:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token:
        delete_session(session, token)
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(SESSION_COOKIE_NAME, path="/")
    return response


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> UserResponse:
    return _user_response(user)
