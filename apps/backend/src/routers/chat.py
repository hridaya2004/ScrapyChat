import logging

from fastapi import APIRouter, Depends, Header
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
    llm: LLMConfig = Field(..., description="The LLM provider to be used")
    match_subpaths: bool = Field(False, description="Match all URLs under this path")


@router.post("/new")
async def new_chat(
    chat_request: ChatRequest,
    authorization: str = Header(None),
    user_id: str = Depends(get_user),
):
    llm_client = await chat_request.llm.client(authorization)

    try:
        retrieved_text = await sv_store.query(
            text=chat_request.query,
            llm=llm_client,
            filter={"user_id": user_id, "url": chat_request.url},
            url_prefix_match=chat_request.match_subpaths,
        )
    except GenAI_ClientError as e:
        raise HTTPException(status_code=429, detail=str(e))

    return {
        "response": retrieved_text.response,  # type: ignore
        "references": [node.text for node in retrieved_text.source_nodes],
    }
