import json
from base64 import urlsafe_b64decode

from fastapi import Request
from fastapi.exceptions import HTTPException


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

    access_token = parts[1]

    # TODO: decode the token properly
    encoded_payload = access_token.split(".")[1]
    padding = "=" * (4 - len(encoded_payload) % 4)
    decoded_payload = urlsafe_b64decode(encoded_payload + padding).decode()
    json_payload = json.loads(decoded_payload)

    return json_payload.get("id")
