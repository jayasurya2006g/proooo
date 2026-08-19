from datetime import datetime, timezone

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from accounts.repository import get_user_by_id


class GraphUser:
    """A tiny stand-in for Django's User model, backed by a graph node.

    DRF's permission classes only need `.is_authenticated`, so this is all
    that's required — there's no ORM model behind it.
    """

    is_authenticated = True

    def __init__(self, row: dict):
        self.id = row["id"]
        self.name = row["name"]
        self.email = row["email"]
        self.headline = row.get("headline", "")
        self.role = row.get("role", "candidate")
        self.company_name = row.get("company_name", "")


def issue_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + settings.JWT_ACCESS_TTL).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


class GraphJWTAuthentication(BaseAuthentication):
    """Reads `Authorization: Bearer <token>`, verifies it, and loads the
    corresponding User node from CognoDB."""

    keyword = "Bearer"

    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header.startswith(f"{self.keyword} "):
            return None

        token = header[len(self.keyword) + 1:]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError as exc:
            raise AuthenticationFailed("Session expired, please log in again.") from exc
        except jwt.InvalidTokenError as exc:
            raise AuthenticationFailed("Invalid authentication token.") from exc

        row = get_user_by_id(payload["sub"])
        if row is None:
            raise AuthenticationFailed("User no longer exists.")

        return (GraphUser(row), token)
