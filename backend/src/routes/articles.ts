import { Router, Request, Response } from 'express';
import articles from '../data/articles.json';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const lang = req.query.lang as string | undefined;
  const filtered = lang ? articles.filter((a) => (a as any).language === lang) : articles;
  const summaries = filtered.map(({ id, title, description, difficulty, language, image, gradient }) => ({
    id,
    title,
    description,
    difficulty,
    language,
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
