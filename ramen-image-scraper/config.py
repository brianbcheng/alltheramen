"""
Configuration constants for the ramen image scraper.
"""

import os

# ---------------------------------------------------------------------------
# Rate-limiting
# ---------------------------------------------------------------------------
REQUEST_DELAY_MIN = 2.0  # seconds – minimum pause between HTTP requests
REQUEST_DELAY_MAX = 4.0  # seconds – maximum pause between HTTP requests

# ---------------------------------------------------------------------------
# Retry behaviour
# ---------------------------------------------------------------------------
MAX_RETRIES = 3
RETRY_BACKOFF = 5.0  # seconds – base backoff between retries

# ---------------------------------------------------------------------------
# Image processing
# ---------------------------------------------------------------------------
TARGET_SIZE = (400, 400)       # final output dimensions (width, height)
WEBP_QUALITY = 80              # quality for WebP output
JPEG_QUALITY = 85              # quality for JPEG fallback (unused for now)
MIN_SOURCE_WIDTH = 200         # ignore source images narrower than this
PAD_COLOR = (255, 255, 255)    # white padding when letter-boxing

# ---------------------------------------------------------------------------
# Paths  (relative to the project root – ramen-image-scraper/)
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

CSV_PATH = os.path.join(PROJECT_ROOT, "data", "ramen-ratings.csv")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "output", "images")
MANIFEST_PATH = os.path.join(PROJECT_ROOT, "output", "images-manifest.json")
LOG_PATH = os.path.join(PROJECT_ROOT, "logs", "scrape.log")

# ---------------------------------------------------------------------------
# Scraping settings
# ---------------------------------------------------------------------------
USER_AGENT = "RamenGridBot/1.0 (ramen database visualization project)"
BASE_URL = "https://www.theramenrater.com"

MAX_PRODUCTS = None   # set to an integer to cap the total products scraped
SKIP_EXISTING = True  # skip products already marked "found" in the manifest
