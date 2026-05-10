// ZenReading Launcher — starts backend and opens browser
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const PORT = 3001;
const app = express();
app.use(cors());
app.use(express.json());

// ── API routes ──
const { initData, getArticles, getVocabSets, getArticleSets } = require('./backend/src/dataStore.js');
initData(__dirname);

app.get('/api/articles/sets', (_req, res) => {
  res.json(getArticleSets());
});
app.get('/api/articles', (req, res) => {
  const lang = req.query.lang, type = req.query.type, setId = req.query.setId;
  let filtered = getArticles();
  if (lang) filtered = filtered.filter(a => a.language === lang);
  if (type) filtered = filtered.filter(a => a.type === type);
  if (setId) filtered = filtered.filter(a => a.setId === setId);
  res.json(filtered.map(({ id, title, description, difficulty, language, type, image, gradient, setId }) =>
    ({ id, title, description, difficulty, language, type, image, gradient, setId })));
});
app.get('/api/articles/:id', (req, res) => {
  const a = getArticles().find(a => a.id === +req.params.id);
  a ? res.json(a) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/articles/set/:setId/questions', (req, res) => {
  const filtered = getArticles().filter(a => a.setId === req.params.setId);
  const stripped = filtered.map(({ content, ...rest }) => rest);
  res.json(stripped);
});

app.get('/api/vocabulary/sets', (req, res) => {
  const allVocab = getVocabSets();
  const filtered = req.query.lang ? allVocab.filter(s => s.language === req.query.lang) : allVocab;
  res.json(filtered.map(({ id, title, description, language, gradient, lists }) => ({
    id, title, description, language, gradient,
    listCount: lists.length, totalWords: lists.reduce((s, l) => s + l.words.length, 0),
  })));
});
app.get('/api/vocabulary/sets/:id', (req, res) => {
  const s = getVocabSets().find(s => s.id === +req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ id: s.id, title: s.title, description: s.description, language: s.language, gradient: s.gradient,
    lists: s.lists.map(l => ({ id: l.id, title: l.title, wordCount: l.words.length })) });
});
app.get('/api/vocabulary/lists/:id', (req, res) => {
  for (const s of getVocabSets()) {
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
});
