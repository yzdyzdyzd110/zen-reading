import { Router, Request, Response } from 'express';
import articles from '../data/articles.json';

const SET_META: Record<string, { id: number; title: string; description: string; gradient: string }> = {
  en: {
    id: 1,
    title: 'English Reading',
    description: 'Immersive English reading practice with curated articles across various topics.',
    gradient: 'linear-gradient(135deg, #2c3e6b, #4a5d8f, #7285b5)',
  },
  ja: {
    id: 2,
    title: '日本語読解',
    description: '日本語能力試験N1レベルの読解記事を厳選しました。',
    gradient: 'linear-gradient(135deg, #8b4557, #b5656d, #d4958a)',
  },
};

const router = Router();

router.get('/sets', (req: Request, res: Response) => {
  const lang = req.query.lang as string | undefined;
  const grouped: Record<string, number> = {};
  for (const a of articles) {
    const l = (a as any).language || 'en';
    grouped[l] = (grouped[l] || 0) + 1;
  }
  const sets = Object.entries(SET_META)
    .filter(([l]) => !lang || l === lang)
    .map(([language, meta]) => ({
      id: meta.id,
      title: meta.title,
      description: meta.description,
      language,
      gradient: meta.gradient,
      articleCount: grouped[language] || 0,
    }));
  res.json(sets);
});

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
