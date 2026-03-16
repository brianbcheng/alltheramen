from __future__ import annotations

"""
Resolve a ramen review number (and optionally brand/variety) to the
canonical review-page URL on theramenrater.com.

Two strategies are attempted in order:
  1. WordPress REST API search
  2. Site HTML search fallback
"""

import logging
import time
import random
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup

import config

logger = logging.getLogger(__name__)


class UrlResolver:
    """Locate the review page URL for a given review number."""

    def __init__(self, session: requests.Session | None = None):
        self.session = session or self._default_session()

    # ------------------------------------------------------------------
    # public
    # ------------------------------------------------------------------
    def resolve(
        self,
        review_number: int | str,
        brand: str = "",
        variety: str = "",
    ) -> str | None:
        """Return the canonical review URL or *None* if it cannot be found."""
        review_number = str(review_number).strip()

        # Strategy 1 – WordPress REST API
        url = self._try_wp_api(review_number)
        if url:
            logger.debug("WP-API resolved #%s -> %s", review_number, url)
            return url

        # Strategy 2 – site search page
        url = self._try_site_search(review_number, brand)
        if url:
            logger.debug("Site search resolved #%s -> %s", review_number, url)
            return url

        logger.warning("Could not resolve URL for review #%s", review_number)
        return None

    # ------------------------------------------------------------------
    # private – strategy helpers
    # ------------------------------------------------------------------
    def _try_wp_api(self, review_number: str) -> str | None:
        """Query the WordPress REST API for posts matching the review number."""
        api_url = (
            f"{config.BASE_URL}/wp-json/wp/v2/posts"
            f"?search={quote_plus(review_number)}&per_page=5&_fields=link,title"
        )
        try:
            self._polite_delay()
            resp = self.session.get(api_url, timeout=15)
            if resp.status_code != 200:
                logger.debug(
                    "WP-API returned %s for #%s", resp.status_code, review_number
                )
                return None

            posts = resp.json()
            if not isinstance(posts, list):
                return None

            # Look for a post whose link or title contains the review number.
            for post in posts:
                link = post.get("link", "")
                title_text = ""
                title_obj = post.get("title")
                if isinstance(title_obj, dict):
                    title_text = title_obj.get("rendered", "")
                elif isinstance(title_obj, str):
                    title_text = title_obj

                if review_number in link or review_number in title_text:
                    return link

            # If only one result came back, assume it is correct.
            if len(posts) == 1:
                return posts[0].get("link")

        except (requests.RequestException, ValueError, KeyError) as exc:
            logger.debug("WP-API error for #%s: %s", review_number, exc)

        return None

    def _try_site_search(self, review_number: str, brand: str = "") -> str | None:
        """Fall back to scraping the site's own search results page."""
        query_parts = [review_number]
        if brand:
            query_parts.append(brand)
        query = " ".join(query_parts)

        search_url = f"{config.BASE_URL}/?s={quote_plus(query)}"
        try:
            self._polite_delay()
            resp = self.session.get(search_url, timeout=15)
            if resp.status_code != 200:
                logger.debug(
                    "Site search returned %s for #%s",
                    resp.status_code,
                    review_number,
                )
                return None

            soup = BeautifulSoup(resp.text, "lxml")

            # Search result links typically live inside <h2 class="entry-title">
            # or generic <a> tags within the results area.
            candidates = []
            for a_tag in soup.select("h2.entry-title a, article a, .entry-title a"):
                href = a_tag.get("href", "")
                if href and review_number in href:
                    candidates.append(href)

            if candidates:
                return candidates[0]

            # Broader scan: any <a> whose href contains the review number
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"]
                if review_number in href and config.BASE_URL in href:
                    return href

        except requests.RequestException as exc:
            logger.debug("Site search error for #%s: %s", review_number, exc)

        return None

    # ------------------------------------------------------------------
    # helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _polite_delay():
        """Sleep for a random interval within the configured range."""
        delay = random.uniform(config.REQUEST_DELAY_MIN, config.REQUEST_DELAY_MAX)
        time.sleep(delay)

    @staticmethod
    def _default_session() -> requests.Session:
        s = requests.Session()
        s.headers.update({"User-Agent": config.USER_AGENT})
        return s
