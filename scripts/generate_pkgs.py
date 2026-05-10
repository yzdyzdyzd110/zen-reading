"""Generate PKG files from existing JSON data."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Read existing data
with open(os.path.join(ROOT, 'backend', 'src', 'data', 'articles.json'), 'r', encoding='utf-8') as f:
    articles = json.load(f)
with open(os.path.join(ROOT, 'backend', 'src', 'data', 'vocabulary.json'), 'r', encoding='utf-8') as f:
    vocab_sets = json.load(f)

# PKG: default_reading
reading_pkg = {
    'format': 'zenreading-pkg',
    'version': 1,
    'meta': {
        'name': '样例试题1',
        'description': 'Built-in reading articles.',
        'gradient': 'linear-gradient(135deg, #5c2e6b, #7e459b, #a068c4)',
        'sets': {
            'en': { 'name': 'English Reading', 'description': 'Immersive English reading practice.' },
            'ja': { 'name': '样例试题1', 'description': '日本語の読解力を鍛えるために厳選された記事集。' },
        },
    },
    'articles': articles,
    'vocabularySets': []
}
path = os.path.join(DATA_DIR, 'default_reading.pkg')
with open(path, 'w', encoding='utf-8') as f:
    json.dump(reading_pkg, f, ensure_ascii=False, indent=2)
print(f'Created {path} ({len(articles)} articles)')

# PKG: default_vocabulary
vocab_pkg = {
    'format': 'zenreading-pkg',
    'version': 1,
    'meta': {
        'name': 'Default Vocabulary',
        'description': 'Built-in Japanese vocabulary sets.',
        'gradient': 'linear-gradient(135deg, #8b4557, #b5656d, #d4958a)',
    },
    'articles': [],
    'vocabularySets': vocab_sets
}
path = os.path.join(DATA_DIR, 'default_vocabulary.pkg')
with open(path, 'w', encoding='utf-8') as f:
    json.dump(vocab_pkg, f, ensure_ascii=False, indent=2)
print(f'Created {path} ({len(vocab_sets)} vocab sets)')

# Update manifest.json with correct counts
manifest_path = os.path.join(ROOT, 'manifest.json')
with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)
manifest['pkgs'][0]['meta']['articleCount'] = len(articles)
manifest['pkgs'][0]['meta']['vocabSetCount'] = 0
manifest['pkgs'][0]['meta']['gradient'] = reading_pkg['meta']['gradient']
manifest['pkgs'][1]['meta']['articleCount'] = 0
manifest['pkgs'][1]['meta']['vocabSetCount'] = len(vocab_sets)
manifest['pkgs'][1]['meta']['gradient'] = vocab_pkg['meta']['gradient']
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print(f'Updated {manifest_path}')
print('Done!')
