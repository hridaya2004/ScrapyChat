import logging
from urllib.parse import urlparse

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, HTTPCrawlerConfig
from crawl4ai.async_crawler_strategy import AsyncHTTPCrawlerStrategy
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from fastapi.exceptions import HTTPException

from ..internal.browser import fetch_page_text
from ..types.provider import BaseProvider

logger = logging.getLogger("scrape")

DEFAULT_MAX_PAGES = 30

_http_config = HTTPCrawlerConfig(method="GET", follow_redirects=True)
_http_strategy = AsyncHTTPCrawlerStrategy(browser_config=_http_config)


class ScrapeException(Exception):
    pass


class InvalidURLError(ScrapeException):
    pass


class ScrapeProvider(BaseProvider):
    def __init__(self) -> None:
        self._default_max_pages = DEFAULT_MAX_PAGES

    @property
    def client(self):
        return self

    @staticmethod
    def _is_valid_url(url: str) -> bool:
        try:
            parsed = urlparse(url)
            return parsed.scheme in ("http", "https") and bool(parsed.netloc)
        except (AttributeError, ValueError):
            return False

    @staticmethod
    def _normalize_url(url: str) -> str:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/")

        if parsed.query:
            return f"{scheme}://{netloc}{path}?{parsed.query}"
        return f"{scheme}://{netloc}{path}"

    async def scrape_text_content(
        self,
        url: str,
        depth: int | None = None,
        max_pages: int | None = None,
    ) -> dict[str, str]:
        """Scrape a page and optionally crawl its internal links."""

        # Single page scrape
        if depth == 0:
            normalized = self._normalize_url(url)
            try:
                text = await fetch_page_text(normalized)
                if text and text.strip():
                    return {normalized: text}
            except Exception as e:
                logger.error(f"Failed to extract from {normalized}: {e}")
            raise HTTPException(status_code=400, detail="Failed to extract content")

        # Deep crawl via crawl4ai
        limit = max_pages or self._default_max_pages
        crawl_depth = min(depth or 3, 3)

        config = CrawlerRunConfig(
            deep_crawl_strategy=BFSDeepCrawlStrategy(
                max_depth=crawl_depth,
                include_external=False,
                max_pages=limit,
            ),
            scraping_strategy=LXMLWebScrapingStrategy(),
            verbose=False,
        )

        try:
            async with AsyncWebCrawler(crawler_strategy=_http_strategy) as crawler:
                results = await crawler.arun(url, config=config)
        except Exception as e:
            logger.error(f"Crawl failed for {url}: {e}")
            raise HTTPException(status_code=400, detail="Crawl failed")

        url_texts: dict[str, str] = {}
        for result in results:
            page_url = result.url
            markdown = result.markdown or ""
            if page_url and markdown.strip():
                url_texts[page_url] = markdown

        if not url_texts:
            raise HTTPException(status_code=400, detail="No content extracted")

        logger.debug(f"Extracted text from {len(url_texts)} pages")
        return url_texts
