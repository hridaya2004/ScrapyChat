import logging

from fastapi import APIRouter, BackgroundTasks, Depends, Response
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, field_validator

from ..dependencies import get_user
from ..internal.redis import RedisProvider
from ..internal.scrape import ScrapeProvider
from ..internal.vector_store import VectorStoreProvider

router = APIRouter()
sv_store = VectorStoreProvider()
redis = RedisProvider()
scraper = ScrapeProvider()

logger = logging.getLogger("scraper")


class ScrapeUrl(BaseModel):
    url: str = Field(..., description="The URL of the page to be scraped")

    @field_validator("url", mode="before")
    @classmethod
    def strip_trailing_slash(cls, v: str) -> str:
        return v.removesuffix("/")


class ScrapeRequest(ScrapeUrl):
    deep_search: bool = Field(False, description="Whether to perform a deep search")


@router.get("/list")
async def list_scraped(user_id: str = Depends(get_user)):
    ingested_urls = await sv_store.get_ingested(user_id)
    return {"urls": ingested_urls}


@router.delete("/remove")
async def remove_ingested_urls(
    request: ScrapeUrl,
    user_id: str = Depends(get_user),
):
    result = await sv_store.remove(url=request.url, user_id=user_id)

    if not result:
        raise HTTPException(status_code=404, detail="URL not found")

    return Response(status_code=204, content="Given ingested URL removed")


@router.post("/new")
async def scrape_new(
    scrape_request: ScrapeRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_user),
) -> JSONResponse:
    # Extract text from URL and its internal pages
    url_texts = await scraper.scrape_text_content(
        url=scrape_request.url, depth=3 if scrape_request.deep_search else 0
    )
    logger.debug("Extracted text from %d pages", len(url_texts))

    # Filter out already ingested URLs
    ingested_urls = await sv_store.get_ingested(user_id)
    new_urls = {
        url: text for url, text in url_texts.items() if url not in ingested_urls
    }

    if not new_urls:
        raise HTTPException(
            status_code=409, detail="All URLs have already been ingested"
        )

    # Add ingestion background task for each URL
    for page_url, text in new_urls.items():
        background_tasks.add_task(
            sv_store.ingest, user_id=user_id, url=page_url, text=text
        )

    return JSONResponse(
        status_code=202,
        content={
            "message": "Scrape request scheduled",
            "urls": list(new_urls.keys()),
        },
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
