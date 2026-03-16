from __future__ import annotations

"""
Extract the best product image URL from a ramen review page.

Strategy:
  1. Look for images inside the main content area (.entry-content or <article>).
  2. Filter out tiny images, ad/tracking pixels, and known junk domains.
  3. Attempt to get the full-size version by stripping WordPress dimension
     suffixes (e.g. "-300x200" before the file extension).
"""

import logging
import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

import config

logger = logging.getLogger(__name__)

# Domains / path fragments that indicate ads, tracking, or irrelevant images.
_JUNK_PATTERNS = [
    "gravatar.com",
    "pixel.",
    "doubleclick.net",
    "googlesyndication.com",
    "googleadservices.com",
    "facebook.com/tr",
    "amazon-adsystem.com",
    "wp-content/plugins",
    "wp-includes",
    "s.w.org",
    "secure.gravatar",
    "feeds.feedburner",
    "feedburner.com",
    "widgets.",
    "badge",
    "icon",
    "logo",
    "banner",
    "adsbygoogle",
    "share",
    "social",
    "emoji",
    "smilies",
]

# Regex to strip WordPress auto-generated dimension suffixes.
# Matches patterns like "-300x200", "-1024x768", "-150x150" right before the
# file extension.
_WP_DIM_RE = re.compile(r"-\d{2,4}x\d{2,4}(?=\.\w{3,4}(?:\?|$))")


class ImageExtractor:
    """Extract the primary product image URL from review page HTML."""

    def extract_image_url(self, html: str, page_url: str) -> str | None:
        """Return the best full-size image URL found in *html*, or *None*."""
        soup = BeautifulSoup(html, "lxml")

        # Locate the main content container.
        container = (
            soup.select_one(".entry-content")
            or soup.select_one("article")
            or soup.select_one("#content")
            or soup.body
        )

        if container is None:
            logger.debug("No content container found on %s", page_url)
            return None

        for img in container.find_all("img"):
            src = self._best_src(img)
            if not src:
                continue

            # Make absolute.
            src = urljoin(page_url, src)

            # Skip junk / tracking images.
            if self._is_junk(src):
                continue

            # Skip images that declare a tiny width.
            if self._is_too_small(img):
                continue

            # Try to obtain the full-size version.
            full_src = self._strip_wp_dimensions(src)
            logger.debug("Selected image: %s (full: %s)", src, full_src)
            return full_src

        logger.debug("No qualifying image found on %s", page_url)
        return None

    # ------------------------------------------------------------------
    # helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _best_src(img_tag) -> str | None:
        """Return the highest-quality ``src`` available on the <img> tag.

        Prefers ``data-orig-file`` (Jetpack/Photon), then ``data-src``
        (lazy-load), then the regular ``src``.
        """
        for attr in ("data-orig-file", "data-large-file", "data-src", "src"):
            val = img_tag.get(attr)
            if val and not val.startswith("data:"):
                return val.strip()
        return None

    @staticmethod
    def _is_junk(url: str) -> bool:
        url_lower = url.lower()
        return any(pat in url_lower for pat in _JUNK_PATTERNS)

    @staticmethod
    def _is_too_small(img_tag) -> bool:
        """Return *True* if the <img> tag declares a width below the minimum."""
        for attr in ("width", "data-orig-width"):
            raw = img_tag.get(attr)
            if raw:
                try:
                    if int(raw) < config.MIN_SOURCE_WIDTH:
                        return True
                except (ValueError, TypeError):
                    pass
        return False

    @staticmethod
    def _strip_wp_dimensions(url: str) -> str:
        """Remove WordPress auto-generated dimension suffix from *url*.

        Example::
            .../photo-300x200.jpg  ->  .../photo.jpg
        """
        return _WP_DIM_RE.sub("", url)
