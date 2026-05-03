import { Router, Request, Response } from 'express';
import articles from '../data/articles.json';

const EN_SETS: Record<string, { id: number; title: string; description: string; gradient: string }> = {
  en: {
    id: 1,
    title: 'English Reading',
    description: 'Immersive English reading practice with curated articles across various topics.',
    gradient: 'linear-gradient(135deg, #2c3e6b, #4a5d8f, #7285b5)',
  },
};

const N1_TYPES: { type: string; id: number; title: string; description: string; gradient: string }[] = [
  { type: 'short', id: 10, title: '短文理解', description: '内容理解（短篇）· ~200字の短文を読み、筆者の主張を把握する。', gradient: 'linear-gradient(135deg, #4a6fa5, #5b8ec4, #7aadd8)' },
  { type: 'medium', id: 11, title: '中篇理解', description: '内容理解（中篇）· ~500字の中文を読み、因果関係や理由を理解する。', gradient: 'linear-gradient(135deg, #6b8e5a, #7da868, #95c080)' },
  { type: 'long', id: 12, title: '長篇理解', description: '内容理解（長篇）· ~1000字の長文を読み、全体構造と中心思想を把握する。', gradient: 'linear-gradient(135deg, #7a5a4a, #966e58, #b58668)' },
  { type: 'integrated', id: 13, title: '統合理解', description: '複数の文章を読み比べ、情報を統合して解答する。', gradient: 'linear-gradient(135deg, #5a4a7a, #6e5e96, #8878b5)' },
  { type: 'argument', id: 14, title: '主張理解', description: '社説・評論などの論理的文章を読み、論理構造を整理する。', gradient: 'linear-gradient(135deg, #8b4557, #a85568, #c57080)' },
  { type: 'search', id: 15, title: '情報検索', description: '広告・通知・案内などから必要な情報を検索する。', gradient: 'linear-gradient(135deg, #4a7a7a, #5e9696, #78b5b5)' },
];

const router = Router();

router.get('/sets', (req: Request, res: Response) => {
  const lang = req.query.lang as string | undefined;
  const jaArticles = articles.filter((a: any) => a.language === 'ja');

  if (lang === 'ja') {
    const sets = N1_TYPES.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      language: 'ja',
      gradient: t.gradient,
      articleCount: jaArticles.filter((a: any) => a.type === t.type).length,
    }));
    res.json(sets);
    return;
  }

  // English: language-based sets
  const enCount = articles.filter((a: any) => a.language === 'en').length;
  const sets = Object.entries(EN_SETS).map(([language, meta]) => ({
    id: meta.id,
    title: meta.title,
    description: meta.description,
    language,
    gradient: meta.gradient,
    articleCount: enCount,
  }));
  res.json(sets);
});

router.get('/', (req: Request, res: Response) => {
  const lang = req.query.lang as string | undefined;
  const type = req.query.type as string | undefined;
  let filtered = articles;
  if (lang) filtered = filtered.filter((a: any) => a.language === lang);
  if (type) filtered = filtered.filter((a: any) => a.type === type);
  const summaries = filtered.map(({ id, title, description, difficulty, language, type, image, gradient }) => ({
    id,
    title,
    description,
    difficulty,
    language,
    type,
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
