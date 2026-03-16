#!/usr/bin/env python3
"""Remove backgrounds from all scraped ramen images using rembg (U2-Net AI model).

Processes images in-place: reads from public/images/ramen/, removes background,
composites onto white, and overwrites the original file.

Usage:
    python remove_bg.py              # Process all images
    python remove_bg.py --limit 10   # Process only 10 images (for testing)
"""

import argparse
import os
import sys
from pathlib import Path

from PIL import Image
from rembg import remove
from tqdm import tqdm

TARGET_SIZE = 400
# Scale the isolated product to 85% of the canvas so it has breathing room
PRODUCT_SCALE = 0.85
QUALITY = 85

IMAGES_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    os.pardir,
    "public",
    "images",
    "ramen",
)


def process_image(path: str) -> bool:
    """Remove background from a single image file, overwrite in place.
    Returns True on success, False on failure."""
    try:
        img = Image.open(path)
        result = remove(img)

        # Composite the RGBA result onto a white RGB background
        white = Image.new("RGB", result.size, (255, 255, 255))
        white.paste(result, mask=result.split()[3])

        # Resize to fit within target with padding for breathing room
        scale = min(TARGET_SIZE / white.width, TARGET_SIZE / white.height) * PRODUCT_SCALE
        new_w = int(white.width * scale)
        new_h = int(white.height * scale)
        resized = white.resize((new_w, new_h), Image.LANCZOS)

        # Center on white canvas
        final = Image.new("RGB", (TARGET_SIZE, TARGET_SIZE), (255, 255, 255))
        final.paste(resized, ((TARGET_SIZE - new_w) // 2, (TARGET_SIZE - new_h) // 2))

        final.save(path, "WEBP", quality=QUALITY)
        return True
    except Exception as e:
        print(f"\n  Error processing {path}: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Remove backgrounds from ramen images")
    parser.add_argument("--limit", type=int, default=None, help="Max images to process")
    args = parser.parse_args()

    images_dir = os.path.normpath(IMAGES_DIR)
    files = sorted(Path(images_dir).glob("*.webp"))

    if args.limit:
        files = files[: args.limit]

    print(f"Processing {len(files)} images from {images_dir}")

    success = 0
    failed = 0

    for f in tqdm(files, desc="Removing backgrounds", unit="img"):
        if process_image(str(f)):
            success += 1
        else:
            failed += 1

    print(f"\nDone. Success: {success}, Failed: {failed}")


if __name__ == "__main__":
    main()
