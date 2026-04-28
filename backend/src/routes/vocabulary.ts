import { Router, Request, Response } from 'express';
import lists from '../data/vocabulary.json';

const router = Router();

router.get('/lists', (req: Request, res: Response) => {
  const lang = req.query.lang as string | undefined;
  const filtered = lang
    ? lists.filter((l) => (l as any).language === lang)
    : lists;
  const summaries = filtered.map(({ id, title, description, language, gradient, words }) => ({
    id,
    title,
    description,
    language,
    gradient,
    wordCount: words.length,
  }));
  res.json(summaries);
});

router.get('/lists/:id', (req: Request, res: Response) => {
  const list = lists.find((l) => l.id === Number(req.params.id));
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }
  res.json({ ...list, wordCount: list.words.length });
});

export default router;
