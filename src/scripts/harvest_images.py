import os
import json
import csv
import requests
import hashlib
import shutil
from pathlib import Path
from PIL import Image
from io import BytesIO

# Path detection relative to this script's location (src/scripts/)
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "data"
OUTPUT_DIR = BASE_DIR.parent.parent / "images"
TRASH_DIR = OUTPUT_DIR / "trash"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"

# Quality Thresholds
MIN_WIDTH = 800
MIN_SIZE_KB = 60

# Ensure directories exist
OUTPUT_DIR.mkdir(exist_ok=True)
TRASH_DIR.mkdir(exist_ok=True)

def is_valid_image(binary_data):
    if len(binary_data) / 1024 < MIN_SIZE_KB:
        return False
    try:
        img = Image.open(BytesIO(binary_data))
        width, _ = img.size
        if width < MIN_WIDTH:
            return False
        return True
    except Exception:
        return False

def get_binary_hash(data):
    return hashlib.md5(data).hexdigest()

def start_harvest():
    print("\n" + "="*50)
    print(" RED DEAD LANDSCAPE HARVESTER")
    print("="*50 + "\n")

    if not DATA_DIR.exists():
        print(f"ERROR: Could not find data directory at {DATA_DIR}")
        return

    # Load existing hashes to prevent duplicates
    seen_hashes = set()
    manifest = []
    if MANIFEST_PATH.exists():
        try:
            with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
                for entry in manifest:
                    p = OUTPUT_DIR / entry['filename']
                    if p.exists():
                        with open(p, 'rb') as f_img:
                            seen_hashes.add(hashlib.md5(f_img.read()).hexdigest())
        except Exception:
            manifest = []

    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.json') or f.endswith('.csv')]
    grand_total = 0

    for i, file in enumerate(files, 1):
        file_path = DATA_DIR / file
        source_label = file.split('_')[0].upper().split('.')[0]
        
        if file.endswith('.json') and any(domain in file for domain in ['.com', '.blog', '.photo']):
            print(f"[{i}/{len(files)}] Harvesting from: {source_label}...")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = json.load(f)
            
            source_url_base = content.get('data', {}).get('metadata', {}).get('sourceURL', 'Unknown Source')
            photographer = content.get('data', {}).get('metadata', {}).get('ogTitle', 'Rockstar Games').split('by ')[-1].split(' - ')[0]
            if 'Sindy' in file: photographer = 'Sindy JB (Mesopotamian_meow)'
            
            images = content.get('data', {}).get('images', [])
            extra_img = content.get('data', {}).get('json', {}).get('image file')
            if extra_img: images.append(extra_img)
            
            count = 0
            for j, url in enumerate(images, 1):
                if not url or not url.startswith('http'): continue
                
                try:
                    resp = requests.get(url, timeout=15)
                    if resp.status_code == 200:
                        data = resp.content
                        h = get_binary_hash(data)
                        ext = os.path.splitext(url.split('?')[0])[1] or ".jpg"
                        filename = f"{source_label.lower()}_{j}{ext}"

                        if h not in seen_hashes:
                            if is_valid_image(data):
                                with open(OUTPUT_DIR / filename, 'wb') as f_img:
                                    f_img.write(data)
                                manifest.append({
                                    "filename": filename,
                                    "source_url": url,
                                    "origin_page": source_url_base,
                                    "source_name": source_label,
                                    "photographer": photographer,
                                    "title": f"Landscape from {source_label}"
                                })
                                seen_hashes.add(h)
                                count += 1
                                grand_total += 1
                            else:
                                # Move failed quality check to trash
                                with open(TRASH_DIR / filename, 'wb') as f_bad:
                                    f_bad.write(data)
                except Exception:
                    pass
                
                percent = (j / len(images)) * 100
                print(f"\r  Progress: [{'#'*int(percent/5)}{'-'*(20-int(percent/5))}] {j}/{len(images)}", end="")
            print(f"\n  Done: Captured {count} unique high-quality images.\n")

        elif "pinterest-com" in file and file.endswith('.csv'):
            print(f"[{i}/{len(files)}] Harvesting from: PINTEREST (Max 125)...")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                header = next(reader)
                rows = list(reader)[:125]
            
            count = 0
            for j, row in enumerate(rows, 1):
                url = row[-1].strip()
                pin_url = row[1].strip()
                title = row[2].strip() if len(row) > 2 else "Pinterest Landscape"
                
                if not url or not url.startswith('http'): continue

                try:
                    resp = requests.get(url, timeout=15)
                    if resp.status_code == 200:
                        data = resp.content
                        h = get_binary_hash(data)
                        filename = f"pinterest_{j}.jpg"
                        
                        if h not in seen_hashes:
                            if is_valid_image(data):
                                with open(OUTPUT_DIR / filename, 'wb') as f_img:
                                    f_img.write(data)
                                manifest.append({
                                    "filename": filename,
                                    "source_url": url,
                                    "origin_page": pin_url,
                                    "source_name": "PINTEREST",
                                    "photographer": "Community Artist",
                                    "title": title
                                })
                                seen_hashes.add(h)
                                count += 1
                                grand_total += 1
                            else:
                                with open(TRASH_DIR / filename, 'wb') as f_bad:
                                    f_bad.write(data)
                except Exception:
                    pass
                
                percent = (j / len(rows)) * 100
                print(f"\r  Progress: [{'#'*int(percent/5)}{'-'*(20-int(percent/5))}] {j}/{len(rows)}", end="")
            print(f"\n  Done: Captured {count} unique high-quality images.\n")

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

    print("="*50)
    print(f" HARVEST COMPLETE: {grand_total} unique assets in /images.")
    print(f" Metadata updated: {MANIFEST_PATH}")
    print("="*50 + "\n")

if __name__ == "__main__":
    start_harvest()
