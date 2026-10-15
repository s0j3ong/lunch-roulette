import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import DEFAULT_TAG_NAMES, SESSION_DAYS
from app.models import Tag, User, UserSession


# scrypt 설정. 저장 형식: scrypt$n$r$p$salt(hex)$hash(hex)
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1


class UsernameTakenError(Exception):
    """이미 쓰는 아이디로 가입하려 할 때 발생한다."""


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P)
    return f"scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, n, r, p, salt, expected = stored.split("$")
        digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=int(n), r=int(r), p=int(p))
    except ValueError:
        return False
    return hmac.compare_digest(digest.hex(), expected)


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_user(session: Session, username: str, password: str) -> User:
    if session.scalar(select(User.id).where(User.username == username)) is not None:
        raise UsernameTakenError
    user = User(username=username, password_hash=hash_password(password), created_at=datetime.now())
    session.add(user)
    session.flush()
    # 새 사용자에게 기본 음식 종류를 만들어 준다.
    session.add_all(Tag(user_id=user.id, name=name, is_default=True) for name in DEFAULT_TAG_NAMES)
    session.commit()
    return user


# 아이디가 없을 때도 같은 시간이 걸리도록 비교에 쓰는 가짜 해시
_DUMMY_HASH = hash_password(secrets.token_hex(8))


def authenticate(session: Session, username: str, password: str) -> User | None:
    user = session.scalar(select(User).where(User.username == username))
    if user is None:
        verify_password(password, _DUMMY_HASH)
        return None
    return user if verify_password(password, user.password_hash) else None


def create_session(session: Session, user_id: int) -> str:
    """새 로그인 세션을 만들고 쿠키에 넣을 토큰을 돌려준다."""
    token = secrets.token_urlsafe(32)
    now = datetime.now()
    session.add(
        UserSession(
            token_hash=_token_hash(token),
            user_id=user_id,
            expires_at=now + timedelta(days=SESSION_DAYS),
            created_at=now,
        )
    )
    # 이 사용자의 만료된 세션은 이때 함께 정리한다.
    session.execute(delete(UserSession).where(UserSession.user_id == user_id, UserSession.expires_at < now))
    session.commit()
    return token


def get_session_user(session: Session, token: str) -> User | None:
    found = session.get(UserSession, _token_hash(token))
    if found is None:
        return None
    if found.expires_at < datetime.now():
        session.delete(found)
        session.commit()
        return None
    return session.get(User, found.user_id)


def delete_session(session: Session, token: str) -> None:
    session.execute(delete(UserSession).where(UserSession.token_hash == _token_hash(token)))
    session.commit()
