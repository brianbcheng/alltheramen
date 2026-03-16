#!/usr/bin/env python3
from __future__ import annotations

"""
Main CLI entry point for scraping ramen product images from
theramenrater.com.

Usage examples::

    # Scrape all products (respects SKIP_EXISTING by default)
    python scrape.py

    # Scrape only the 50 newest products
    python scrape.py --limit 50

    # Scrape only products rated 4 stars or higher
    python scrape.py --min-stars 4

    # Re-attempt previously failed items
    python scrape.py --retry-failed

    # Preview which URLs would be fetched without downloading anything
    python scrape.py --dry-run --limit 10
"""

import argparse
import csv
import logging
import os
import random
import sys
import time
from pathlib import Path

import requests
from tqdm import tqdm

import config
from url_resolver import UrlResolver
from image_extractor import ImageExtractor
from image_processor import ImageProcessor
from manifest import Manifest

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

def _setup_logging(log_path: str) -> logging.Logger:
    """Configure root logger with both file and console handlers."""
    os.makedirs(os.path.dirname(log_path) or ".", exist_ok=True)

    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    # File handler – verbose
    fh = logging.FileHandler(log_path, encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(
        logging.Formatter(
            "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    root.addHandler(fh)

    # Console handler – info and above
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    ch.setFormatter(
        logging.Formatter("%(levelname)-8s  %(message)s")
    )
    root.addHandler(ch)

    return logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CSV loading
# ---------------------------------------------------------------------------

def _load_csv(csv_path: str) -> list[dict]:
    """Load the ramen ratings CSV, returning a list of row dicts.

    Each dict has keys: review_number, brand, variety, style, country, stars,
    top_ten.  Rows with non-numeric stars are excluded.
    """
    if not os.path.isfile(csv_path):
        # Try a symlink / copy from the parent project's data directory.
        parent_csv = os.path.join(
            config.PROJECT_ROOT, os.pardir, "data", "ramen-ratings.csv"
        )
        parent_csv = os.path.normpath(parent_csv)
        if os.path.isfile(parent_csv):
            # Create a symlink so future runs find it automatically.
            os.symlink(parent_csv, csv_path)
            logging.getLogger(__name__).info(
                "Created symlink %s -> %s", csv_path, parent_csv
            )
        else:
            raise FileNotFoundError(
                f"CSV not found at {csv_path} or {parent_csv}"
            )

    rows: list[dict] = []
    with open(csv_path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for raw in reader:
            # Normalise column names – the CSV uses "Review #", "Brand", etc.
            # The "Top Ten" column may appear as "Top Ten" or "T".
            review_num = raw.get("Review #", "").strip()
            stars_raw = raw.get("Stars", "").strip()

            # Skip rows without a usable review number.
            if not review_num:
                continue
            try:
                int(review_num)
            except ValueError:
                continue

            # Skip unrated / non-numeric star values.
            try:
                stars = float(stars_raw)
            except (ValueError, TypeError):
                continue

            top_ten = raw.get("Top Ten", raw.get("T", "")).strip()

            rows.append(
                {
                    "review_number": review_num,
                    "brand": raw.get("Brand", "").strip(),
                    "variety": raw.get("Variety", "").strip(),
                    "style": raw.get("Style", "").strip(),
                    "country": raw.get("Country", "").strip(),
                    "stars": stars,
                    "top_ten": top_ten,
                }
            )

    return rows


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Scrape ramen product images from theramenrater.com"
    )
    p.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of products to process",
    )
    p.add_argument(
        "--min-stars",
        type=float,
        default=None,
        help="Only process products with at least this star rating",
    )
    p.add_argument(
        "--retry-failed",
        action="store_true",
        help="Only re-attempt items previously marked as 'failed'",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Resolve URLs and log them but do not download images",
    )
    return p.parse_args()


# ---------------------------------------------------------------------------
# Main scrape loop
# ---------------------------------------------------------------------------

def main() -> None:
    args = _parse_args()
    logger = _setup_logging(config.LOG_PATH)
    logger.info("=== Ramen image scraper started ===")

    # Shared HTTP session.
    session = requests.Session()
    session.headers.update({"User-Agent": config.USER_AGENT})

    resolver = UrlResolver(session=session)
    extractor = ImageExtractor()
    processor = ImageProcessor(session=session)
    manifest = Manifest(config.MANIFEST_PATH)

    # Load and filter products.
    products = _load_csv(config.CSV_PATH)
    logger.info("Loaded %d products from CSV", len(products))

    if args.min_stars is not None:
        products = [p for p in products if p["stars"] >= args.min_stars]
        logger.info(
            "Filtered to %d products with >= %.1f stars",
            len(products),
            args.min_stars,
        )

    # Sort by review number descending (newest first).
    products.sort(key=lambda p: int(p["review_number"]), reverse=True)

    # Apply global cap.
    effective_limit = args.limit or config.MAX_PRODUCTS
    if effective_limit:
        products = products[:effective_limit]
        logger.info("Capped to %d products", len(products))

    # Track current delay (may increase on 429 / 503).
    delay_min = config.REQUEST_DELAY_MIN
    delay_max = config.REQUEST_DELAY_MAX

    processed = 0
    skipped = 0
    errors = 0

    try:
        for idx, product in enumerate(
            tqdm(products, desc="Scraping", unit="product"), start=1
        ):
            rnum = product["review_number"]

            # --- skip / retry logic ---
            existing = manifest.get(rnum)

            if args.retry_failed:
                # In retry-failed mode, only process items with status "failed".
                if not existing or existing.get("status") != "failed":
                    skipped += 1
                    continue
            elif config.SKIP_EXISTING and existing:
                if existing.get("status") == "found":
                    skipped += 1
                    continue

            # --- resolve review URL ---
            try:
                review_url = resolver.resolve(
                    rnum, product["brand"], product["variety"]
                )
            except Exception as exc:
                logger.error("Resolver error for #%s: %s", rnum, exc)
                manifest.set(rnum, _fail_entry(error=str(exc)))
                errors += 1
                _periodic_save(manifest, idx)
                continue

            if not review_url:
                logger.warning("No URL found for #%s", rnum)
                manifest.set(rnum, _fail_entry(error="URL not resolved"))
                errors += 1
                _periodic_save(manifest, idx)
                continue

            if args.dry_run:
                logger.info("[DRY-RUN] #%s -> %s", rnum, review_url)
                _periodic_save(manifest, idx)
                continue

            # --- fetch review page ---
            try:
                _polite_delay(delay_min, delay_max)
                page_resp = session.get(review_url, timeout=20)
                page_resp, delay_min, delay_max = _handle_http_status(
                    page_resp, delay_min, delay_max, logger
                )
                page_resp.raise_for_status()
            except requests.RequestException as exc:
                logger.error("Page fetch error for #%s (%s): %s", rnum, review_url, exc)
                manifest.set(
                    rnum,
                    _fail_entry(review_url=review_url, error=str(exc)),
                )
                errors += 1
                _periodic_save(manifest, idx)
                continue

            # --- extract image URL ---
            image_url = extractor.extract_image_url(page_resp.text, review_url)
            if not image_url:
                logger.warning("No image found on page for #%s", rnum)
                manifest.set(
                    rnum,
                    {
                        "status": "no_image",
                        "filename": None,
                        "source_url": None,
                        "review_url": review_url,
                        "width": None,
                        "height": None,
                        "file_size_bytes": None,
                        "error": None,
                    },
                )
                _periodic_save(manifest, idx)
                continue

            # --- download and process image ---
            try:
                _polite_delay(delay_min, delay_max)
                result = processor.process(image_url, rnum)
            except Exception as exc:
                logger.error(
                    "Image processing error for #%s (%s): %s",
                    rnum,
                    image_url,
                    exc,
                )
                manifest.set(
                    rnum,
                    _fail_entry(
                        review_url=review_url,
                        source_url=image_url,
                        error=str(exc),
                    ),
                )
                errors += 1
                _periodic_save(manifest, idx)
                continue

            # --- success ---
            manifest.set(
                rnum,
                {
                    "status": "found",
                    "filename": result["filename"],
                    "source_url": image_url,
                    "review_url": review_url,
                    "width": result["width"],
                    "height": result["height"],
                    "file_size_bytes": result["file_size_bytes"],
                    "error": None,
                },
            )
            processed += 1
            _periodic_save(manifest, idx)

    except KeyboardInterrupt:
        logger.warning("Interrupted by user – saving manifest before exit")
    except Exception as exc:
        logger.exception("Unexpected crash: %s", exc)
    finally:
        manifest.save()
        stats = manifest.get_stats()
        logger.info("=== Scrape complete ===")
        logger.info(
            "Processed: %d | Skipped: %d | Errors: %d", processed, skipped, errors
        )
        logger.info("Manifest stats: %s", stats)
        print(f"\nDone.  Processed: {processed}  Skipped: {skipped}  Errors: {errors}")
        print(f"Manifest: {stats}")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fail_entry(
    review_url: str | None = None,
    source_url: str | None = None,
    error: str = "",
) -> dict:
    return {
        "status": "failed",
        "filename": None,
        "source_url": source_url,
        "review_url": review_url,
        "width": None,
        "height": None,
        "file_size_bytes": None,
        "error": error,
    }


def _polite_delay(delay_min: float, delay_max: float) -> None:
    time.sleep(random.uniform(delay_min, delay_max))


def _handle_http_status(
    resp: requests.Response,
    delay_min: float,
    delay_max: float,
    logger: logging.Logger,
) -> tuple[requests.Response, float, float]:
    """Handle rate-limit (429) and service-unavailable (503) responses.

    Waits 30 s and doubles the delay range so subsequent requests back off.
    Returns the original response (caller should still call raise_for_status).
    """
    if resp.status_code in (429, 503):
        logger.warning(
            "HTTP %d – backing off (waiting 30 s, doubling delay)", resp.status_code
        )
        time.sleep(30)
        delay_min *= 2
        delay_max *= 2
    return resp, delay_min, delay_max


def _periodic_save(manifest: Manifest, index: int, every: int = 50) -> None:
    """Save the manifest every *every* iterations."""
    if index % every == 0:
        manifest.save()


if __name__ == "__main__":
    main()
