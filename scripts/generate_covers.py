#!/usr/bin/env python3
"""Generate cover images for ZenReading articles using 豆包 seedream model."""

import os
import sys
import json
import time
import requests

ARK_API_KEY = 'bfbbb398-e666-4a93-8da5-95345a13f20f'
ARK_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'public', 'covers')

ARTICLES = [
    {
        "id": 1,
        "title": "The Lost City of Atlantis",
        "prompt": (
            "Ancient underwater ruins of a lost civilization, sunken beneath the deep blue ocean, "
            "sunbeams piercing through turquoise water, mysterious stone pillars and arches, "
            "ethereal atmosphere, cinematic lighting, photorealistic, wide angle"
        ),
    },
    {
        "id": 2,
        "title": "The Art of Deep Focus",
        "prompt": (
            "Zen meditation scene, smooth balancing stones on a misty lake shore at dawn, "
            "soft warm golden light, calm tranquil atmosphere, minimalist composition, "
            "shallow depth of field, photorealistic, peaceful aesthetic"
        ),
    },
    {
        "id": 3,
        "title": "The Science of White Noise",
        "prompt": (
            "Abstract flowing sound wave visualization, gentle curves like audio frequencies, "
            "serene gradient from deep blue to soft purple, minimal clean design, "
            "smooth gradient background, calming ambient aesthetic, digital art"
        ),
    },
    {
        "id": 4,
        "title": "The Pomodoro Technique",
        "prompt": (
            "Cozy study desk from above, a red tomato shaped mechanical kitchen timer as focal point, "
            "open notebook, steaming coffee cup, warm morning sunlight, "
            "minimalist workspace, hygge atmosphere, photorealistic, soft shadows"
        ),
    },
    {
        "id": 5,
        "title": "Climate Change and Global Food Security",
        "prompt": (
            "Looking up through a dense lush green forest canopy towards bright sky, "
            "sunlight streaming through layers of leaves, sense of hope and renewal, "
            "majestic old growth trees, environmental conservation theme, "
            "photorealistic, inspiring nature photography"
        ),
    },
]


def generate_image(prompt: str) -> str | None:
    """Submit a generation request and return the image URL."""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ARK_API_KEY}',
    }
    payload = {
        'model': 'doubao-seedream-4-5-251128',
        'prompt': prompt,
        'sequential_image_generation': 'disabled',
        'response_format': 'url',
        'size': '2K',
        'stream': False,
        'watermark': True,
    }

    resp = requests.post(ARK_ENDPOINT, headers=headers, json=payload, timeout=120)
    if resp.status_code != 200:
        print(f'  API error ({resp.status_code}): {resp.text[:200]}')
        return None

    result = resp.json()
    data = result.get('data', [])
    if not data:
        print(f'  No data in response: {json.dumps(result, ensure_ascii=False)[:200]}')
        return None

    image_url = data[0].get('url')
    return image_url


def download_image(url: str, filepath: str) -> bool:
    """Download image from URL and save to filepath."""
    resp = requests.get(url, timeout=60)
    if resp.status_code != 200:
        print(f'  Download failed ({resp.status_code})')
        return False
    with open(filepath, 'wb') as f:
        f.write(resp.content)
    size_kb = len(resp.content) / 1024
    print(f'  Saved: {filepath} ({size_kb:.1f} KB)')
    return True


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    results = {}

    for article in ARTICLES:
        print(f'\n[{article["id"]}/5] {article["title"]}')
        print(f'  Prompt: {article["prompt"][:80]}...')

        image_url = generate_image(article['prompt'])
        if not image_url:
            print(f'  FAILED: no image URL returned')
            continue

        filename = f'cover_{article["id"]}.png'
        filepath = os.path.join(OUTPUT_DIR, filename)
        if download_image(image_url, filepath):
            results[article['id']] = f'/covers/{filename}'

        time.sleep(2)

    print('\n' + '=' * 50)
    print(f'Done. Generated {len(results)}/5 images.')
    print(f'Images saved to: {OUTPUT_DIR}')
    print('\nImage paths for articles.json:')
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
