import logging

from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from qdrant_client import models

from src.internal.redis import RedisProvider

from ..dependencies import get_user
from ..internal.browser import fetch_page_text
from ..internal.vector_store import VectorStoreProvider

router = APIRouter()
sv_store = VectorStoreProvider()
redis = RedisProvider()

logger = logging.getLogger("scraper")


class ScrapeUrl(BaseModel):
    url: str = Field(..., description="The URL of the page to be scraped")


@router.get("/list")
async def list_scraped(user_id: str = Depends(get_user)):
    try:
        res, _ = await sv_store.client.scroll(
            collection_name=sv_store._collection,
            scroll_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="user_id",
                        match=models.MatchValue(value=user_id),
                    )
                ]
            ),
            with_payload=["document_id", "url"],
        )

        records = [record.model_dump().get("payload", {}) for record in res]
        return {"urls": {record.get("url") for record in records}}

    except Exception as e:
        logger.error("Exception while listing scraped websites: %s", e)
        raise HTTPException(status_code=500, detail="Something went wrong")


@router.post("/new")
async def scrape_new(
    scrape_url: ScrapeUrl,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_user),
) -> JSONResponse:
    extracted_text = await fetch_page_text(scrape_url.url)
    logger.debug("Extracted text: %s", extracted_text)
    background_tasks.add_task(
        sv_store.ingest, user_id=user_id, url=scrape_url.url, text=extracted_text
    )
    return JSONResponse(
        status_code=202,
        content={"message": "Scrape request scheduled", "url": scrape_url.url},
    )


@router.get("/progress")
async def get_progress(user_id: str = Depends(get_user)) -> StreamingResponse:
    return StreamingResponse(
        redis.get_progress(user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
