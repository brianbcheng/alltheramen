#!/usr/bin/env python3
"""Remove backgrounds from only NEW images (ones larger than 20KB, since
already-processed bg-removed images are typically smaller)."""

import os
import sys
from pathlib import Path
from PIL import Image
from rembg import remove
from tqdm import tqdm

TARGET_SIZE = 400
PRODUCT_SCALE = 0.85
QUALITY = 85
IMAGES_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir, "public", "images", "ramen")
)

# Already-processed images are typically 5-20KB after bg removal.
# Unprocessed scraped images are typically 20-50KB.
# Use file size + check for white border as heuristic.
MIN_SIZE_BYTES = 18000  # Only process files larger than this


def needs_processing(path: str) -> bool:
    """Heuristic: if the file is large, it probably hasn't had bg removed yet."""
    return os.path.getsize(path) > MIN_SIZE_BYTES


def process_image(path: str) -> bool:
    try:
        img = Image.open(path)
        result = remove(img)
        white = Image.new("RGB", result.size, (255, 255, 255))
        white.paste(result, mask=result.split()[3])
        scale = min(TARGET_SIZE / white.width, TARGET_SIZE / white.height) * PRODUCT_SCALE
        new_w, new_h = int(white.width * scale), int(white.height * scale)
        resized = white.resize((new_w, new_h), Image.LANCZOS)
        final = Image.new("RGB", (TARGET_SIZE, TARGET_SIZE), (255, 255, 255))
        final.paste(resized, ((TARGET_SIZE - new_w) // 2, (TARGET_SIZE - new_h) // 2))
        final.save(path, "WEBP", quality=QUALITY)
        return True
    except Exception as e:
        print(f"\n  Error: {path}: {e}", file=sys.stderr)
        return False


def main():
    files = sorted(Path(IMAGES_DIR).glob("*.webp"))
    to_process = [f for f in files if needs_processing(str(f))]
    print(f"Found {len(files)} total images, {len(to_process)} need bg removal")

    success = 0
    failed = 0
    for f in tqdm(to_process, desc="Removing backgrounds", unit="img"):
        if process_image(str(f)):
            success += 1
        else:
            failed += 1

    print(f"\nDone. Success: {success}, Failed: {failed}")


if __name__ == "__main__":
    main()
