import { Router, Request, Response } from 'express';
import { getArticles, getArticleSets } from '../dataStore.js';

const router = Router();

router.get('/sets', (_req: Request, res: Response) => {
  res.json(getArticleSets());
});

router.get('/', (req: Request, res: Response) => {
  const lang = req.query.lang as string | undefined;
  const type = req.query.type as string | undefined;
  const setId = req.query.setId as string | undefined;
  let filtered = getArticles();
  if (lang) filtered = filtered.filter((a: any) => a.language === lang);
  if (type) filtered = filtered.filter((a: any) => a.type === type);
  if (setId) filtered = filtered.filter((a: any) => a.setId === setId);
  const summaries = filtered.map(({ id, title, description, difficulty, language, type, image, gradient, setId }) => ({
    id, title, description, difficulty, language, type, image, gradient, setId,
  }));
  res.json(summaries);
});

router.get('/set/:setId/questions', (req: Request, res: Response) => {
  const filtered = getArticles().filter((a: any) => a.setId === req.params.setId);
  const stripped = filtered.map(({ content, ...rest }: any) => rest);
  res.json(stripped);
});

router.get('/:id', (req: Request, res: Response) => {
  const article = getArticles().find((a) => a.id === Number(req.params.id));
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json(article);
});

export default router;
