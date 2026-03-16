from __future__ import annotations

"""
Thread-safe manifest that tracks the status of every image we attempt to
scrape.  Persisted as a single JSON file.

Structure::

    {
        "generated_at": "2026-03-16T12:00:00Z",
        "stats": {
            "total": 100,
            "found": 80,
            "failed": 15,
            "no_image": 5
        },
        "images": {
            "2580": {
                "status": "found",
                "filename": "2580.webp",
                "source_url": "https://...",
                "review_url": "https://...",
                "width": 400,
                "height": 400,
                "file_size_bytes": 12345,
                "error": null
            },
            ...
        }
    }
"""

import json
import logging
import os
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class Manifest:
    """Persistent JSON manifest of scraped image metadata."""

    def __init__(self, path: str):
        self.path = path
        self._data: dict = self._load()

    # ------------------------------------------------------------------
    # public
    # ------------------------------------------------------------------

    def get(self, review_number: str | int) -> dict | None:
        """Return the entry for *review_number*, or *None*."""
        return self._data["images"].get(str(review_number))

    def set(self, review_number: str | int, entry: dict) -> None:
        """Create or update the entry for *review_number*."""
        self._data["images"][str(review_number)] = entry

    def save(self) -> None:
        """Write the manifest to disk (atomic-ish via tmp + rename)."""
        self._data["generated_at"] = datetime.now(timezone.utc).isoformat()
        self._data["stats"] = self._compute_stats()

        tmp_path = self.path + ".tmp"
        os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)

        with open(tmp_path, "w", encoding="utf-8") as fh:
            json.dump(self._data, fh, indent=2, ensure_ascii=False)

        os.replace(tmp_path, self.path)
        logger.debug("Manifest saved (%d entries)", len(self._data["images"]))

    def get_stats(self) -> dict:
        """Return a summary dict of current counts."""
        return self._compute_stats()

    # ------------------------------------------------------------------
    # private
    # ------------------------------------------------------------------

    def _load(self) -> dict:
        """Load from disk or return a fresh structure."""
        if os.path.isfile(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as fh:
                    data = json.load(fh)
                if isinstance(data, dict) and "images" in data:
                    logger.info(
                        "Loaded manifest with %d entries", len(data["images"])
                    )
                    return data
            except (json.JSONDecodeError, OSError) as exc:
                logger.warning("Could not load manifest (%s), starting fresh", exc)

        return {
            "generated_at": None,
            "stats": {},
            "images": {},
        }

    def _compute_stats(self) -> dict:
        images = self._data["images"]
        counts: dict[str, int] = {}
        for entry in images.values():
            status = entry.get("status", "unknown")
            counts[status] = counts.get(status, 0) + 1
        counts["total"] = len(images)
        return counts
