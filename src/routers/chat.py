import logging
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from google.genai.errors import ClientError as GenAI_ClientError
from pydantic import Field

from ..dependencies import get_user
from ..internal.llm import LLMConfig
from ..internal.vector_store import VectorStoreProvider
from ..routers.scrape import ScrapeUrl

router = APIRouter()
sv_store = VectorStoreProvider()


logger = logging.getLogger("chat")


class ChatRequest(ScrapeUrl):
    query: str = Field(..., description="The query from the user")
    llm: Optional[LLMConfig] = Field(None, description="The LLM provider to be used")


@router.post("/new")
async def new_chat(chat_request: ChatRequest, user_id: str = Depends(get_user)):
    try:
        retrieved_text = await sv_store.query(
            text=chat_request.query,
            llm=chat_request.llm.client() if chat_request.llm else None,
            filter={"user_id": user_id, "url": chat_request.url},
        )
    except GenAI_ClientError as e:
        raise HTTPException(status_code=429, detail=str(e))

    return {
        "response": retrieved_text.response,  # type: ignore
        "references": [node.text for node in retrieved_text.source_nodes],
    }
