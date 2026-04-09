import logging
import os
import ssl
from datetime import datetime, timezone

import httpx
import jwt
from fastapi import Request
from fastapi.exceptions import HTTPException
from jwt import ExpiredSignatureError, PyJWKClient, PyJWTError

logger = logging.getLogger("Dependencies")

# Only for development
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

FRONTEND_URL = os.environ["FRONTEND_URL"]
JWKS_URL = os.environ["AUTH_URL"] + "/api/auth/.well-known/jwks.json"
SESSIONS_URL = os.environ["AUTH_URL"] + "/api/auth/list-sessions"


def verify_token(token: str) -> bool:
    """
    Verifies the token signature and expiration.
    Returns True if valid, False otherwise.
    """
    try:
        jwks_client = PyJWKClient(
            JWKS_URL,
            ssl_context=ssl_context,
            headers={"User-Agent": "ScrapyChat JWKS Client v1.0"},
        )
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        decoded = jwt.decode(
            token,
            signing_key.key,
            audience=FRONTEND_URL,
            algorithms=["EdDSA"],
            options={"verify_signature": True},
        )

        if decoded["exp"] < datetime.now(timezone.utc).timestamp():
            return False

        return True

    except ExpiredSignatureError:
        return False
    except PyJWTError as e:
        logger.error("Exception while verifying token: %s", e)
        return False


def _user_id_from_jwt(token: str) -> str | None:
    """Extracts sub from an already-verified JWT without re-checking the signature."""
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded.get("sub")
    except PyJWTError as e:
        logger.error("Exception while extracting sub from token: %s", e)
        return None


async def get_user(request: Request) -> str:
    """
    Verifies the JWT token, then validates the session by calling the
    auth server's list-sessions endpoint and extracts the userId from
    the matching session. Falls back to the JWT sub claim if session
    validation fails.
    """
    auth_header = request.headers.get("Authorization")

    if auth_header is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    parts = auth_header.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = parts[1]

    # Verify the JWT signature and expiration
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")

    def jwt_fallback() -> str:
        user_id = _user_id_from_jwt(token)
        if user_id is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return user_id

    # Extract session token from the cookie
    session_cookie = request.cookies.get("better-auth.session_token")
    if not session_cookie:
        logger.warning("Session cookie missing, falling back to JWT sub")
        return jwt_fallback()

    # The cookie value is "<session_token>.<signature>", we need the part before "."
    session_token = session_cookie.split(".")[0]

    # Validate session and grab userId from the sessions endpoint
    try:
        cookies = dict(request.cookies)
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(
                SESSIONS_URL,
                headers={"Authorization": auth_header},
                cookies=cookies,
            )

        if response.status_code != 200:
            logger.warning(
                "Session list request failed with status %d, falling back to JWT sub",
                response.status_code,
            )
            return jwt_fallback()

        sessions = response.json()

        for session in sessions:
            if session.get("token") == session_token:
                user_id = session.get("userId")
                if user_id is None:
                    raise HTTPException(status_code=401, detail="Unauthorized")
                return user_id

        logger.warning("Session not found in list, falling back to JWT sub")
        return jwt_fallback()

    except httpx.HTTPError as e:
        logger.warning("Error contacting auth server: %s, falling back to JWT sub", e)
        return jwt_fallback()
