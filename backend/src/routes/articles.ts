import { Router, Request, Response } from 'express';
import articles from '../data/articles.json';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const summaries = articles.map(({ id, title, description, difficulty, image, gradient }) => ({
    id,
    title,
    description,
    difficulty,
    image,
    gradient,
  }));
  res.json(summaries);
});

router.get('/:id', (req: Request, res: Response) => {
  const article = articles.find((a) => a.id === Number(req.params.id));
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json(article);
});

export default router;
