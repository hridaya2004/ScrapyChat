import logging

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.async_crawler_strategy import AsyncHTTPCrawlerStrategy
from crawl4ai import HTTPCrawlerConfig

logger = logging.getLogger("browser")

_http_config = HTTPCrawlerConfig(method="GET", follow_redirects=True)
_http_strategy = AsyncHTTPCrawlerStrategy(browser_config=_http_config)


class BrowserException(Exception):
    """
    Abstract exception for all the browser errors
    """


async def fetch_page_html(url: str) -> str:
    """
    Returns the html content from a page
    """

    try:
        async with AsyncWebCrawler(crawler_strategy=_http_strategy) as crawler:
            result = await crawler.arun(url)
            return result.html or ""
    except Exception as e:
        logger.exception(f"Exception in browser: {e}")
        raise BrowserException("Something went wrong")


async def fetch_page_text(url: str) -> str:
    """
    Returns the text content from a page as markdown
    """

    try:
        async with AsyncWebCrawler(crawler_strategy=_http_strategy) as crawler:
            result = await crawler.arun(url)
            return result.markdown or ""
    except Exception as e:
        logger.exception(f"Exception in browser: {e}")
        raise BrowserException("Something went wrong")
