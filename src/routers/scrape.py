import logging

from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

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
    ingested_urls = await sv_store.get_ingested(user_id)
    return {"urls": ingested_urls}


@router.post("/new")
async def scrape_new(
    scrape_url: ScrapeUrl,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_user),
) -> JSONResponse:
    # Check if the URL has already been ingested by the same user
    ingested_urls = await sv_store.get_ingested(user_id)
    if scrape_url.url in ingested_urls:
        raise HTTPException(
            status_code=409, detail="Duplicate, the URL has already been ingested"
        )

    # Extract text from the URL
    extracted_text = await fetch_page_text(scrape_url.url)
    logger.debug("Extracted text: %s", extracted_text)

    # Add ingestion background task
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
        redis.stream_progress(user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
