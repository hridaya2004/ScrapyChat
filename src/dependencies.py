from base64 import urlsafe_b64decode

from fastapi import Request
from fastapi.exceptions import HTTPException
from jose import jwt

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
jwks_url = "https://scrapychat.hridaya.tech/.well-known/jwks.json"


def get_public_key(jwks, kid):
    for key in jwks["keys"]:
        # Decode public key using kid
        if key["kid"] == kid:
            x = key["x"]
            return urlsafe_b64decode(x + "=" * (4 - len(x) % 4))
    raise HTTPException(status_code=401, detail="Unknown key ID")


def verify_token(token: str):
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Missing kid")

        public_key = get_public_key(jwks, kid)

        decoded = jwt.decode(
            token,
            public_key,
            algorithms=["EdDSA"],
        )

        return decoded

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Signature expired")
    except jwt.JWTError:
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
