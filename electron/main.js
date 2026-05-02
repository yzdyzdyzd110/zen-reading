const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

// ── Express backend (runs inline, no fork needed) ──
const server = express();
const PORT = 3001;

server.use(cors());
server.use(express.json());

// Load article routes
const articles = require(path.join(__dirname, '..', 'backend', 'src', 'data', 'articles.json'));
const ARTICLE_SET_META = {
  en: { id: 1, title: 'English Reading', description: 'Immersive English reading practice with curated articles across various topics.', gradient: 'linear-gradient(135deg, #2c3e6b, #4a5d8f, #7285b5)' },
  ja: { id: 2, title: '日本語読解', description: '日本語能力試験N1レベルの読解記事を厳選しました。', gradient: 'linear-gradient(135deg, #8b4557, #b5656d, #d4958a)' },
};
server.get('/api/articles/sets', (req, res) => {
  const lang = req.query.lang;
  const grouped = {}; articles.forEach((a) => { grouped[a.language] = (grouped[a.language] || 0) + 1; });
  const sets = Object.entries(ARTICLE_SET_META)
    .filter(([l]) => !lang || l === lang)
    .map(([language, meta]) => ({ ...meta, language, articleCount: grouped[language] || 0 }));
  res.json(sets);
});
server.get('/api/articles', (req, res) => {
  const lang = req.query.lang;
  const filtered = lang ? articles.filter((a) => a.language === lang) : articles;
  res.json(filtered.map(({ id, title, description, difficulty, language, image, gradient }) =>
    ({ id, title, description, difficulty, language, image, gradient })));
});
server.get('/api/articles/:id', (req, res) => {
  const a = articles.find((a) => a.id === Number(req.params.id));
  a ? res.json(a) : res.status(404).json({ error: 'Not found' });
});

// Load vocabulary routes
const vocabSets = require(path.join(__dirname, '..', 'backend', 'src', 'data', 'vocabulary.json'));
server.get('/api/vocabulary/sets', (req, res) => {
  const lang = req.query.lang;
  const filtered = lang ? vocabSets.filter((s) => s.language === lang) : vocabSets;
  res.json(filtered.map(({ id, title, description, language, gradient, lists }) => ({
    id, title, description, language, gradient,
    listCount: lists.length,
    totalWords: lists.reduce((s, l) => s + l.words.length, 0),
  })));
});
server.get('/api/vocabulary/sets/:id', (req, res) => {
  const s = vocabSets.find((s) => s.id === Number(req.params.id));
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ id: s.id, title: s.title, description: s.description, language: s.language, gradient: s.gradient,
    lists: s.lists.map((l) => ({ id: l.id, title: l.title, wordCount: l.words.length })) });
});
server.get('/api/vocabulary/lists/:id', (req, res) => {
  for (const s of vocabSets) {
    const list = s.lists.find((l) => l.id === Number(req.params.id));
    if (list) return res.json({ id: list.id, title: list.title, setId: s.id, setTitle: s.title,
      language: s.language, gradient: s.gradient, wordCount: list.words.length, words: list.words });
  }
  res.status(404).json({ error: 'Not found' });
});

// Serve built frontend
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
server.use(express.static(frontendDist));
server.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));

server.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));

// ── Electron window ──
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    title: 'ZenReading - 禅定阅读',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(`http://localhost:${PORT}`);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
