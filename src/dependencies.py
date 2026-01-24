import logging
import os
import ssl
from datetime import datetime, timezone

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
JWKS_URL = os.environ["JWKS_URL"] + "/api/auth/.well-known/jwks.json"


def verify_token(token: str):
    """
    Verifies the token and returns the decoded payload
    It checks for proper signature and expiration.
    """
    try:
        jwks_client = PyJWKClient(JWKS_URL, ssl_context=ssl_context)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        decoded = jwt.decode(
            token,
            signing_key.key,
            audience=FRONTEND_URL,
            algorithms=["EdDSA"],
            options={"verify_signature": True},
        )

        if decoded["exp"] < datetime.now(timezone.utc).timestamp():
            raise HTTPException(status_code=401, detail="Token expired")

        return decoded

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Signature expired")
    except PyJWTError as e:
        logger.error("Exception while verifying token: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token")


def get_user(request: Request):
    """
    Gets user details from auth token
    """
    auth_token = request.headers.get("Authorization")

    if auth_token is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    parts = auth_token.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = parts[1]
    decoded = verify_token(token)
    return decoded["id"]
