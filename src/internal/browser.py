import logging

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

logger = logging.getLogger("browser")


class BrowserException(Exception):
    """
    Abstract exception for all the browser errors
    """


async def fetch_page_html(url: str) -> str:
    """
    Returns the html content from a page
    """

    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=15000)
            html = await page.content()
            await browser.close()
            return html
        except Exception as e:
            logger.exception(f"Exception in browser: {e}")
            raise BrowserException("Something went wrong")


async def fetch_page_text(url: str) -> str:
    """
    Returns the text content from a page
    """

    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=15000)
            html = await page.content()
            await browser.close()

            # Cleanup using BeautifulSoup
            soup = BeautifulSoup(html, "html.parser")
            for element in soup(["script", "style", "noscript"]):
                element.decompose()
            text = " ".join(soup.stripped_strings)
            return text
        except Exception as e:
            logger.exception(f"Exception in browser: {e}")
            raise BrowserException("Something went wrong")
