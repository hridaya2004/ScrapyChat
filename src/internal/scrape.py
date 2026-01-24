import logging
from collections import deque
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

from bs4 import BeautifulSoup
from fastapi.exceptions import HTTPException
from httpx import AsyncClient, HTTPStatusError, RequestError

from ..internal.browser import fetch_page_text
from ..types.provider import BaseProvider

USER_AGENT = "ScrapyChat Crawler"
DEFAULT_TIMEOUT = 10.0
DEFAULT_DEPTH = 3
DEFAULT_MAX_PAGES = 30

VALID_SCHEMES = frozenset({"http", "https"})
IGNORED_PREFIXES = ("#", "javascript:", "mailto:", "tel:", "data:", "ftp:")

logger = logging.getLogger("scrape")


class ScrapeException(Exception):
    pass


class InvalidURLError(ScrapeException):
    pass


@dataclass(frozen=True)
class CrawlConfig:
    max_depth: int = DEFAULT_DEPTH
    max_pages: int = DEFAULT_MAX_PAGES
    timeout: float = DEFAULT_TIMEOUT


@dataclass
class CrawlResult:
    urls: set[str]
    pages_visited: int
    max_depth_reached: int


class ScrapeProvider(BaseProvider):
    def __init__(self) -> None:
        self._user_agent = USER_AGENT
        self._default_timeout = DEFAULT_TIMEOUT
        self._default_depth = DEFAULT_DEPTH
        self._default_max_pages = DEFAULT_MAX_PAGES

    @property
    def client(self):
        return self

    @staticmethod
    def _is_valid_url(url: str) -> bool:
        try:
            parsed = urlparse(url)
            return parsed.scheme in VALID_SCHEMES and bool(parsed.netloc)
        except (AttributeError, ValueError):
            return False

    @staticmethod
    def _normalize_url(url: str) -> str:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/") if parsed.path != "/" else parsed.path

        if parsed.query:
            return f"{scheme}://{netloc}{path}?{parsed.query}"
        return f"{scheme}://{netloc}{path}"

    @staticmethod
    def _get_domain(url: str) -> str:
        return urlparse(url).netloc.lower()

    @staticmethod
    def _is_internal(link: str, origin: str) -> bool:
        return ScrapeProvider._get_domain(link) == ScrapeProvider._get_domain(origin)

    @staticmethod
    def _resolve_href(base_url: str, href: str) -> str | None:
        if not href:
            return None

        href = href.strip()
        if href.startswith(IGNORED_PREFIXES):
            return None

        absolute = urljoin(base_url, href)
        if not ScrapeProvider._is_valid_url(absolute):
            return None

        return ScrapeProvider._normalize_url(absolute)

    async def _check_robots_txt(self, url: str) -> bool:
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"

        parser = RobotFileParser()
        parser.set_url(robots_url)

        try:
            parser.read()
        except Exception as e:
            logger.warning(f"Could not read robots.txt at {robots_url}: {e}")
            return True

        return parser.can_fetch(self._user_agent, url)

    async def _filter_by_robots(self, urls: set[str]) -> list[str]:
        allowed = []
        for url in urls:
            if await self._check_robots_txt(url):
                allowed.append(url)
            else:
                logger.debug(f"Blocked by robots.txt: {url}")
        return allowed

    async def _fetch_page_links(self, url: str, timeout: float) -> set[str]:
        try:
            async with AsyncClient(timeout=timeout, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()
        except HTTPStatusError as e:
            logger.warning(f"HTTP {e.response.status_code} for {url}")
            return set()
        except RequestError as e:
            logger.warning(f"Request failed for {url}: {e}")
            return set()
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return set()

        soup = BeautifulSoup(response.content, "html.parser")
        links: set[str] = set()

        for anchor in soup.find_all("a", href=True):
            href = anchor.get("href")
            if isinstance(href, str):
                resolved = self._resolve_href(url, href)
                if resolved:
                    links.add(resolved)

        return links

    async def _crawl_bfs(self, start_url: str, config: CrawlConfig) -> CrawlResult:
        if not self._is_valid_url(start_url):
            raise InvalidURLError(f"Invalid URL: {start_url}")

        start_url = self._normalize_url(start_url)
        visited: set[str] = {start_url}
        queue: deque[tuple[str, int]] = deque([(start_url, 0)])

        max_depth_reached = 0
        pages_fetched = 0

        while queue:
            if pages_fetched >= config.max_pages:
                logger.info(f"Reached page limit ({config.max_pages})")
                break

            current_url, depth = queue.popleft()
            max_depth_reached = max(max_depth_reached, depth)

            if depth >= config.max_depth:
                continue

            logger.debug(f"Crawling [{depth}]: {current_url}")
            pages_fetched += 1

            links = await self._fetch_page_links(current_url, config.timeout)

            for link in links:
                if link in visited:
                    continue
                if not self._is_internal(link, start_url):
                    continue

                visited.add(link)
                queue.append((link, depth + 1))

        logger.info(
            f"Crawl done: {len(visited)} URLs, {pages_fetched} fetched, depth {max_depth_reached}"
        )

        return CrawlResult(
            urls=visited,
            pages_visited=pages_fetched,
            max_depth_reached=max_depth_reached,
        )

    async def scrape_site_links(
        self,
        url: str,
        depth: int | None = None,
        max_pages: int | None = None,
    ) -> set[str]:
        """Crawl a site and return all internal URLs found."""
        config = CrawlConfig(
            max_depth=depth or self._default_depth,
            max_pages=max_pages or self._default_max_pages,
        )

        try:
            result = await self._crawl_bfs(url, config)
            return result.urls
        except InvalidURLError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def scrape_text_content(
        self,
        url: str,
        depth: int | None = None,
        max_pages: int | None = None,
    ) -> dict[str, str]:
        """Crawl a site and extract text content from all allowed pages."""
        # Fast path for single page (no crawling needed)
        if depth == 0:
            normalized = self._normalize_url(url)
            try:
                text = await fetch_page_text(normalized)
                if text and text.strip():
                    return {normalized: text}
            except Exception as e:
                logger.error(f"Failed to extract from {normalized}: {e}")
            raise HTTPException(status_code=400, detail="Failed to extract content")

        discovered = await self.scrape_site_links(url, depth=depth, max_pages=max_pages)

        if not discovered:
            raise HTTPException(status_code=400, detail="No URLs found")

        logger.debug(f"Discovered {len(discovered)} URLs")

        allowed = await self._filter_by_robots(discovered)
        if not allowed:
            raise HTTPException(
                status_code=403, detail="All URLs blocked by robots.txt"
            )

        logger.debug(f"{len(allowed)} URLs allowed by robots.txt")

        results: dict[str, str] = {}
        for page_url in allowed:
            try:
                text = await fetch_page_text(page_url)
                if text and text.strip():
                    results[page_url] = text
            except Exception as e:
                logger.error(f"Failed to extract from {page_url}: {e}")

        logger.debug(f"Extracted text from {len(results)} pages")
        return results
