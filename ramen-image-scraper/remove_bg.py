#!/usr/bin/env python3
"""Remove backgrounds from ramen images using rembg (U2-Net AI model).

Tracks processed images in a manifest (output/bg_removed.json) so future
runs only process new images.

Usage:
    python remove_bg.py              # Process only new images
    python remove_bg.py --limit 10   # Process max 10 new images
    python remove_bg.py --force      # Re-process all (ignore manifest)
"""

import argparse
import json
import os
import sys
from pathlib import Path

from PIL import Image
from rembg import remove
from tqdm import tqdm

TARGET_SIZE = 400
PRODUCT_SCALE = 0.85
QUALITY = 85

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.normpath(
    os.path.join(PROJECT_ROOT, os.pardir, "public", "images", "ramen")
)
MANIFEST_PATH = os.path.join(PROJECT_ROOT, "output", "bg_removed.json")


def load_manifest():
    if os.path.isfile(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r") as f:
            data = json.load(f)
            return set(data.get("processed", []))
    return set()


def save_manifest(processed):
    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    with open(MANIFEST_PATH, "w") as f:
        json.dump(
            {"processed": sorted(processed), "count": len(processed)},
            f,
            indent=2,
        )


def process_image(path):
    try:
        img = Image.open(path)
        result = remove(img)

        white = Image.new("RGB", result.size, (255, 255, 255))
        white.paste(result, mask=result.split()[3])

        scale = min(TARGET_SIZE / white.width, TARGET_SIZE / white.height) * PRODUCT_SCALE
        new_w = int(white.width * scale)
        new_h = int(white.height * scale)
        resized = white.resize((new_w, new_h), Image.LANCZOS)

        final = Image.new("RGB", (TARGET_SIZE, TARGET_SIZE), (255, 255, 255))
        final.paste(resized, ((TARGET_SIZE - new_w) // 2, (TARGET_SIZE - new_h) // 2))
        final.save(path, "WEBP", quality=QUALITY)
        return True
    except Exception as e:
        print(f"\n  Error: {path}: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Remove backgrounds from ramen images")
    parser.add_argument("--limit", type=int, default=None, help="Max images to process")
    parser.add_argument("--force", action="store_true", help="Re-process all images (ignore manifest)")
    args = parser.parse_args()

    processed = set() if args.force else load_manifest()
    all_files = sorted(Path(IMAGES_DIR).glob("*.webp"))

    # Filter to only unprocessed images
    to_process = []
    for f in all_files:
        review_num = f.stem  # e.g. "5296" from "5296.webp"
        if review_num not in processed:
            to_process.append((f, review_num))

    if args.limit:
        to_process = to_process[: args.limit]

    print(f"Total images: {len(all_files)}")
    print(f"Already processed: {len(processed)}")
    print(f"To process: {len(to_process)}")

    if not to_process:
        print("Nothing to do.")
        return

    success = 0
    failed = 0

    for f, review_num in tqdm(to_process, desc="Removing backgrounds", unit="img"):
        if process_image(str(f)):
            processed.add(review_num)
            success += 1
        else:
            failed += 1

        # Save manifest every 10 images for crash recovery
        if (success + failed) % 10 == 0:
            save_manifest(processed)

    save_manifest(processed)
    print(f"\nDone. Success: {success}, Failed: {failed}")


if __name__ == "__main__":
    main()
