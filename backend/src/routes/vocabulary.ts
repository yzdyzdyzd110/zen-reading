import { Router, Request, Response } from 'express';
import sets from '../data/vocabulary.json';

const router = Router();

// GET /api/vocabulary/sets — list all word sets
router.get('/sets', (req: Request, res: Response) => {
  const lang = req.query.lang as string | undefined;
  const filtered = lang
    ? sets.filter((s) => (s as any).language === lang)
    : sets;
  const summaries = filtered.map(({ id, title, description, language, gradient, lists }) => ({
    id,
    title,
    description,
    language,
    gradient,
    listCount: lists.length,
    totalWords: lists.reduce((sum, l) => sum + l.words.length, 0),
  }));
  res.json(summaries);
});

// GET /api/vocabulary/sets/:id — single set with sub-list metadata
router.get('/sets/:id', (req: Request, res: Response) => {
  const set = sets.find((s) => s.id === Number(req.params.id));
  if (!set) {
    res.status(404).json({ error: 'Set not found' });
    return;
  }
  res.json({
    id: set.id,
    title: set.title,
    description: set.description,
    language: set.language,
    gradient: set.gradient,
    lists: set.lists.map((l) => ({
      id: l.id,
      title: l.title,
      wordCount: l.words.length,
    })),
  });
});

// GET /api/vocabulary/lists/:id — single list with full words
router.get('/lists/:id', (req: Request, res: Response) => {
  for (const set of sets) {
    const list = set.lists.find((l) => l.id === Number(req.params.id));
    if (list) {
      res.json({
        id: list.id,
        title: list.title,
        setId: set.id,
        setTitle: set.title,
        language: set.language,
        gradient: set.gradient,
        wordCount: list.words.length,
        words: list.words,
      });
      return;
    }
  }
  res.status(404).json({ error: 'List not found' });
});

export default router;
