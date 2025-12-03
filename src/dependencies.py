import logging
from datetime import datetime, timezone

import jwt
from fastapi import Request
from fastapi.exceptions import HTTPException
from jwt import PyJWKClient

logger = logging.getLogger("Dependencies")

jwks = {
    "keys": [
        {
            "crv": "Ed25519",
            "kty": "OKP",
            "x": "ylWh8tootR_atiNkT84y-yMsQ-9Vh3tLuQhEKLEj5sE",
            "kid": "606cda0d-cef6-40a7-b1ac-b2cd8c21646e",
            "use": "sig",
            "alg": "EdDSA",
        }
    ]
}


# TODO: Grab JWKS from here
# jwks_url = "https://scrapychat.hridaya.tech/.well-known/jwks.json"

jwks_url = "http://host.docker.internal:3000/.well-known/jwks.json"


def verify_token(token: str):
    """
    Verifies the token and returns the decoded payload
    It checks for proper signature and expiration.
    """
    try:
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        decoded = jwt.decode(
            token,
            signing_key,
            audience="http://localhost:3001",
            algorithms=["EdDSA"],
            options={"verify_signature": True},
        )

        if decoded["exp"] < datetime.now(timezone.utc).timestamp():
            raise HTTPException(status_code=401, detail="Token expired")

        return decoded

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Signature expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_user(request: Request):
    """
    Gets user details from auth token
    """
    auth_token = request.headers.get("Authorization")

    if auth_token is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    parts = auth_token.split(" ")
    if len(parts) != 2 or parts[0].lower() != "Bearer":
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = parts[1]
    decoded = verify_token(token)
    return decoded["id"]
