import logging

from fastapi import APIRouter, Depends
from pydantic import Field

from ..dependencies import get_user
from ..internal.vector_store import ScrapyVectorStoreProvider
from ..routers.scrape import ScrapeUrl

router = APIRouter()
sv_store = ScrapyVectorStoreProvider()


logger = logging.getLogger("chat")


class ChatRequest(ScrapeUrl):
    query: str = Field(..., description="The query from the user")


@router.post("/new")
async def new_chat(chat_request: ChatRequest, user_id: str = Depends(get_user)):
    retrieved_text = await sv_store.query(
        chat_request.query, {"user_id": user_id, "url": chat_request.url}
    )
    response = await sv_store.llm.query(
        f"Use the following context to answer this question: {chat_request.query}. Context: {retrieved_text}"
    )

    return {
        "response": response.text,
        "references": [node.text for node in retrieved_text.source_nodes],
    }
