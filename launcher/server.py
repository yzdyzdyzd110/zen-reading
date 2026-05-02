"""
ZenReading Flask backend — runs in-process within the launcher.
Handles all API routes + static file serving.
"""
import json
import os
import sys
import threading
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder=None)

# ── Resolve data and frontend paths ──
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_DIR = os.path.join(BASE_DIR, 'backend', 'src', 'data')
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend', 'dist')


def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), 'r', encoding='utf-8') as f:
        return json.load(f)


articles = load_json('articles.json')
vocab_sets = load_json('vocabulary.json')

ARTICLE_SETS = {
    'en': {'id': 1, 'title': 'English Reading', 'description': 'Immersive English reading practice.',
           'gradient': 'linear-gradient(135deg, #2c3e6b, #4a5d8f, #7285b5)'},
    'ja': {'id': 2, 'title': '日本語読解', 'description': '日本語能力試験N1レベルの読解記事。',
           'gradient': 'linear-gradient(135deg, #8b4557, #b5656d, #d4958a)'},
}

# ── Article routes ──

@app.route('/api/articles/sets')
def article_sets():
    lang = request.args.get('lang')
    grouped = {}
    for a in articles:
        l = a.get('language', 'en')
        grouped[l] = grouped.get(l, 0) + 1
    result = []
    for l, m in ARTICLE_SETS.items():
        if not lang or l == lang:
            result.append({**m, 'language': l, 'articleCount': grouped.get(l, 0)})
    return jsonify(result)


@app.route('/api/articles')
def article_list():
    lang = request.args.get('lang')
    filtered = [a for a in articles if not lang or a.get('language') == lang]
    return jsonify([{k: a[k] for k in ('id', 'title', 'description', 'difficulty',
                     'language', 'image', 'gradient')} for a in filtered])


@app.route('/api/articles/<int:id>')
def article_detail(id):
    a = next((a for a in articles if a['id'] == id), None)
    return jsonify(a) if a else (jsonify({'error': 'Not found'}), 404)


# ── Vocabulary routes ──

@app.route('/api/vocabulary/sets')
def vocab_set_list():
    lang = request.args.get('lang')
    filtered = [s for s in vocab_sets if not lang or s.get('language') == lang]
    return jsonify([{k: s[k] for k in ('id', 'title', 'description', 'language', 'gradient'),
                     'listCount': len(s['lists']),
                     'totalWords': sum(len(l['words']) for l in s['lists'])} for s in filtered])


@app.route('/api/vocabulary/sets/<int:id>')
def vocab_set_detail(id):
    s = next((s for s in vocab_sets if s['id'] == id), None)
    if not s:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({k: s[k] for k in ('id', 'title', 'description', 'language', 'gradient'),
                    'lists': [{'id': l['id'], 'title': l['title'],
                               'wordCount': len(l['words'])} for l in s['lists']]})


@app.route('/api/vocabulary/lists/<int:id>')
def vocab_list_detail(id):
    for s in vocab_sets:
        for l in s['lists']:
            if l['id'] == id:
                return jsonify({'id': l['id'], 'title': l['title'],
                                'setId': s['id'], 'setTitle': s['title'],
                                'language': s['language'], 'gradient': s['gradient'],
                                'wordCount': len(l['words']), 'words': l['words']})
    return jsonify({'error': 'Not found'}), 404


# ── Shutdown ──

@app.route('/api/shutdown')
def shutdown():
    return jsonify({'ok': True})


# ── Frontend static ──

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/<path:path>')
def static_files(path):
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')


# ── Server runner ──

class ServerThread(threading.Thread):
    def __init__(self, port=3001):
        super().__init__(daemon=True)
        self.port = port

    def run(self):
        import logging
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)
        app.run(host='0.0.0.0', port=self.port, debug=False, use_reloader=False)
