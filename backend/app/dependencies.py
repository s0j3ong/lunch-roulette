from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import SESSION_COOKIE_NAME
from app.database import get_db
from app.models import User
from app.services.auth import get_session_user


def get_current_user(request: Request, session: Session = Depends(get_db)) -> User:
    """로그인 쿠키로 사용자를 찾는다. 없거나 만료됐으면 401을 돌려준다."""
    token = request.cookies.get(SESSION_COOKIE_NAME)
    user = get_session_user(session, token) if token else None
    if user is None:
        raise HTTPException(status_code=401, detail="로그인이 필요해요.")
    return user


def get_current_user_id(user: User = Depends(get_current_user)) -> int:
    return user.id
