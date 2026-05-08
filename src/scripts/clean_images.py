import os
import hashlib
import json
import shutil
from pathlib import Path
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
IMAGES_DIR = BASE_DIR.parent.parent / "images"
TRASH_DIR = IMAGES_DIR / "trash"
MANIFEST_PATH = IMAGES_DIR / "manifest.json"

# Quality Thresholds
MIN_WIDTH = 800
MIN_SIZE_KB = 60

def get_image_hash(file_path):
    hasher = hashlib.md5()
    with open(file_path, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def clean_library():
    print("\n" + "="*50)
    print(" IMAGE CLEANUP & SANITIZATION")
    print("="*50 + "\n")

    if not IMAGES_DIR.exists():
        print(f"ERROR: Could not find images directory at {IMAGES_DIR}")
        return

    # Ensure trash directory exists
    TRASH_DIR.mkdir(exist_ok=True)

    seen_hashes = set()
    cleaned_manifest = []
    moved_to_trash = 0
    
    # Scan all files in the images directory (not just the manifest)
    image_files = [f for f in os.listdir(IMAGES_DIR) if os.path.isfile(IMAGES_DIR / f) and f != 'manifest.json']
    
    print(f"Scanning {len(image_files)} files in {IMAGES_DIR}...")

    for filename in image_files:
        file_path = IMAGES_DIR / filename
        
        # 1. Check for Duplicates (Hash)
        img_hash = get_image_hash(file_path)
        if img_hash in seen_hashes:
            shutil.move(file_path, TRASH_DIR / filename)
            moved_to_trash += 1
            continue
        
        # 2. Check Quality (Size & Dimensions)
        file_size_kb = os.path.getsize(file_path) / 1024
        is_bad = False
        
        try:
            with Image.open(file_path) as img:
                width, _ = img.size
                if width < MIN_WIDTH:
                    is_bad = True
        except Exception:
            is_bad = True

        if is_bad or file_size_kb < MIN_SIZE_KB:
            shutil.move(file_path, TRASH_DIR / filename)
            moved_to_trash += 1
            continue

        # If it passes everything, keep it
        seen_hashes.add(img_hash)
        
        # Add to manifest (reconstructing basic info)
        source_label = filename.split('_')[0].upper()
        cleaned_manifest.append({
            "filename": filename,
            "source_name": source_label,
            "photographer": "Rockstar Games", # Default, can be refined
            "title": f"Landscape from {source_label}"
        })

    # Save the new manifest
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(cleaned_manifest, f, indent=2)

    print(f"\nCleanup Complete!")
    print(f"Moved to trash: {moved_to_trash} images")
    print(f"Remaining high-quality images: {len(cleaned_manifest)}")
    print(f"Manifest updated: {MANIFEST_PATH}")
    print("="*50 + "\n")

if __name__ == "__main__":
    clean_library()
