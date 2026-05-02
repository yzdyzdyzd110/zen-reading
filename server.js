// ZenReading Launcher — starts backend and opens browser
const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const PORT = 3001;
const app = express();
app.use(cors());
app.use(express.json());

// ── API routes ──
const articles = require('./backend/src/data/articles.json');
const vocabSets = require('./backend/src/data/vocabulary.json');

const ARTICLE_SETS = {
  en: { id: 1, title: 'English Reading', description: 'Immersive English reading practice.', gradient: 'linear-gradient(135deg, #2c3e6b, #4a5d8f, #7285b5)' },
  ja: { id: 2, title: '日本語読解', description: '日本語能力試験N1レベルの読解記事。', gradient: 'linear-gradient(135deg, #8b4557, #b5656d, #d4958a)' },
};

app.get('/api/articles/sets', (req, res) => {
  const lang = req.query.lang;
  const grouped = {}; articles.forEach(a => { grouped[a.language] = (grouped[a.language] || 0) + 1; });
  res.json(Object.entries(ARTICLE_SETS).filter(([l]) => !lang || l === lang)
    .map(([lang, m]) => ({ ...m, language: lang, articleCount: grouped[lang] || 0 })));
});
app.get('/api/articles', (req, res) => {
  const filtered = req.query.lang ? articles.filter(a => a.language === req.query.lang) : articles;
  res.json(filtered.map(({ id, title, description, difficulty, language, image, gradient }) =>
    ({ id, title, description, difficulty, language, image, gradient })));
});
app.get('/api/articles/:id', (req, res) => {
  const a = articles.find(a => a.id === +req.params.id);
  a ? res.json(a) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/vocabulary/sets', (req, res) => {
  const filtered = req.query.lang ? vocabSets.filter(s => s.language === req.query.lang) : vocabSets;
  res.json(filtered.map(({ id, title, description, language, gradient, lists }) => ({
    id, title, description, language, gradient,
    listCount: lists.length, totalWords: lists.reduce((s, l) => s + l.words.length, 0),
  })));
});
app.get('/api/vocabulary/sets/:id', (req, res) => {
  const s = vocabSets.find(s => s.id === +req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ id: s.id, title: s.title, description: s.description, language: s.language, gradient: s.gradient,
    lists: s.lists.map(l => ({ id: l.id, title: l.title, wordCount: l.words.length })) });
});
app.get('/api/vocabulary/lists/:id', (req, res) => {
  for (const s of vocabSets) {
    const list = s.lists.find(l => l.id === +req.params.id);
    if (list) return res.json({ id: list.id, title: list.title, setId: s.id, setTitle: s.title,
      language: s.language, gradient: s.gradient, wordCount: list.words.length, words: list.words });
  }
  res.status(404).json({ error: 'Not found' });
});

// ── Shutdown ──
app.get('/api/shutdown', (_req, res) => {
  res.json({ ok: true });
  setTimeout(() => process.exit(0), 500);
});

// ── Serve frontend ──
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html')));

// ── Start ──
http.createServer(app).listen(PORT, () => {
  console.log(`ZenReading running at http://localhost:${PORT}`);
  // Open browser
  const cmd = process.platform === 'darwin' ? 'open' : 'start';
  exec(`${cmd} http://localhost:${PORT}`);
});
