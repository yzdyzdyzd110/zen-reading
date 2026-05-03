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

const EN_SETS = {
  en: { id: 1, title: 'English Reading', description: 'Immersive English reading practice.', gradient: 'linear-gradient(135deg, #2c3e6b, #4a5d8f, #7285b5)' },
};
const N1_TYPES = [
  { type: 'short', id: 10, title: '短文理解', description: '~200字短文、筆者の主張を把握。', gradient: 'linear-gradient(135deg, #4a6fa5, #5b8ec4, #7aadd8)' },
  { type: 'medium', id: 11, title: '中篇理解', description: '~500字中文、因果関係を理解。', gradient: 'linear-gradient(135deg, #6b8e5a, #7da868, #95c080)' },
  { type: 'long', id: 12, title: '長篇理解', description: '~1000字長文、全体構造を把握。', gradient: 'linear-gradient(135deg, #7a5a4a, #966e58, #b58668)' },
  { type: 'integrated', id: 13, title: '統合理解', description: '複数文章を読み比べ統合。', gradient: 'linear-gradient(135deg, #5a4a7a, #6e5e96, #8878b5)' },
  { type: 'argument', id: 14, title: '主張理解', description: '社説・評論の論理構造を整理。', gradient: 'linear-gradient(135deg, #8b4557, #a85568, #c57080)' },
  { type: 'search', id: 15, title: '情報検索', description: '広告・案内から情報を検索。', gradient: 'linear-gradient(135deg, #4a7a7a, #5e9696, #78b5b5)' },
];

app.get('/api/articles/sets', (req, res) => {
  const lang = req.query.lang;
  if (lang === 'ja') {
    const jaArticles = articles.filter(a => a.language === 'ja');
    res.json(N1_TYPES.map(t => ({ ...t, language: 'ja', articleCount: jaArticles.filter(a => a.type === t.type).length })));
    return;
  }
  const enCount = articles.filter(a => a.language === 'en').length;
  res.json(Object.entries(EN_SETS).map(([lang, m]) => ({ ...m, language: lang, articleCount: enCount })));
});
app.get('/api/articles', (req, res) => {
  const lang = req.query.lang, type = req.query.type;
  let filtered = articles;
  if (lang) filtered = filtered.filter(a => a.language === lang);
  if (type) filtered = filtered.filter(a => a.type === type);
  res.json(filtered.map(({ id, title, description, difficulty, language, type, image, gradient }) =>
    ({ id, title, description, difficulty, language, type, image, gradient })));
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
