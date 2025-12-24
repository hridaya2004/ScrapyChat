import logging

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, Field
from qdrant_client import models

from ..dependencies import get_user
from ..internal.browser import fetch_page_text
from ..internal.vector_store import ScrapyVectorStoreProvider

router = APIRouter()
sv_store = ScrapyVectorStoreProvider()

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
        return {"ingested_urls": {record.get("url") for record in records}}

    except Exception as e:
        logger.error("Exception while listing scraped websites: %s", e)
        raise HTTPException(status_code=500, detail="Something went wrong")


@router.post("/new")
async def scrape_new(scrape_url: ScrapeUrl, user_id: str = Depends(get_user)):
    extracted_text = await fetch_page_text(scrape_url.url)
    logger.info("Extracted text: %s", extracted_text)
    await sv_store.ingest(extracted_text, {"user_id": user_id, "url": scrape_url.url})
    return {"status": "OK"}
