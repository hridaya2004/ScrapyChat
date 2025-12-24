import logging

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, Field

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
    # TODO: Perform a server side distinct search using Qdrant client
    try:
        all_websites = await sv_store.query("a", {"user_id": user_id}, 999)
        return {
            "ingested_urls": {
                node.node.metadata.get("url")
                for node in all_websites.source_nodes
                if node.node.metadata.get("url")
            }
        }
    except Exception as e:
        logger.error("Exception while listing scraped websites: %s", e)
        raise HTTPException(status_code=500, detail="Something went wrong")


@router.post("/new")
async def scrape_new(scrape_url: ScrapeUrl, user_id: str = Depends(get_user)):
    extracted_text = await fetch_page_text(scrape_url.url)
    logger.info("Extracted text: %s", extracted_text)
    await sv_store.ingest(extracted_text, {"user_id": user_id, "url": scrape_url.url})
    return {"status": "OK"}
