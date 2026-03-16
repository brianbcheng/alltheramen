from __future__ import annotations

"""
Download a source image, resize / pad it to the target dimensions, and save
it as an optimised WebP file.
"""

import logging
import os

import requests
from PIL import Image
from io import BytesIO

import config

logger = logging.getLogger(__name__)


class ImageProcessor:
    """Download, resize, pad, and save product images."""

    def __init__(self, session: requests.Session | None = None):
        self.session = session or self._default_session()
        os.makedirs(config.OUTPUT_DIR, exist_ok=True)

    # ------------------------------------------------------------------
    # public
    # ------------------------------------------------------------------
    def process(self, image_url: str, review_number: str | int) -> dict:
        """Download *image_url*, process it, and save as WebP.

        Returns a dict with keys:
            filename, width, height, file_size_bytes
        Raises on failure (caller should catch and record in manifest).
        """
        review_number = str(review_number)
        image_data = self._download(image_url)
        img = Image.open(BytesIO(image_data))

        # Convert palette / RGBA images so we can save as WebP without issues.
        if img.mode in ("P", "PA"):
            img = img.convert("RGBA")
        if img.mode == "RGBA":
            # Composite onto white background for WebP compatibility.
            background = Image.new("RGB", img.size, config.PAD_COLOR)
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        img = self._resize_and_pad(img)

        filename = f"{review_number}.webp"
        out_path = os.path.join(config.OUTPUT_DIR, filename)
        img.save(out_path, format="WEBP", quality=config.WEBP_QUALITY)

        file_size = os.path.getsize(out_path)
        logger.info(
            "Saved %s (%dx%d, %d bytes)",
            filename,
            img.width,
            img.height,
            file_size,
        )

        return {
            "filename": filename,
            "width": img.width,
            "height": img.height,
            "file_size_bytes": file_size,
        }

    # ------------------------------------------------------------------
    # private
    # ------------------------------------------------------------------
    def _download(self, url: str) -> bytes:
        """Download the image bytes from *url*."""
        resp = self.session.get(url, timeout=30, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("Content-Type", "")
        if not content_type.startswith("image/"):
            raise ValueError(
                f"Unexpected Content-Type '{content_type}' for {url}"
            )

        # Read up to 20 MB to guard against absurdly large files.
        max_bytes = 20 * 1024 * 1024
        chunks = []
        total = 0
        for chunk in resp.iter_content(chunk_size=8192):
            total += len(chunk)
            if total > max_bytes:
                raise ValueError(f"Image exceeds {max_bytes} bytes: {url}")
            chunks.append(chunk)

        return b"".join(chunks)

    @staticmethod
    def _resize_and_pad(img: Image.Image) -> Image.Image:
        """Resize *img* to fit within TARGET_SIZE, then pad to exact size."""
        target_w, target_h = config.TARGET_SIZE

        # Compute the scale factor so the image fits inside the target box.
        scale = min(target_w / img.width, target_h / img.height)
        if scale < 1.0:
            new_w = int(img.width * scale)
            new_h = int(img.height * scale)
            img = img.resize((new_w, new_h), Image.LANCZOS)

        # Pad (letter-box) to exact target dimensions.
        if img.size != (target_w, target_h):
            padded = Image.new("RGB", (target_w, target_h), config.PAD_COLOR)
            offset_x = (target_w - img.width) // 2
            offset_y = (target_h - img.height) // 2
            padded.paste(img, (offset_x, offset_y))
            img = padded

        return img

    @staticmethod
    def _default_session() -> requests.Session:
        s = requests.Session()
        s.headers.update({"User-Agent": config.USER_AGENT})
        return s
