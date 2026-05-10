import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import Toolbar from '../components/Toolbar';
import type { ArticleSummary, ArticleSetSummary } from '../types';

export default function ArticleSetPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const lang = searchParams.get('lang') || '';
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [allSets, setAllSets] = useState<ArticleSetSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const q = `?setId=${encodeURIComponent(id)}${lang ? `&lang=${encodeURIComponent(lang)}` : ''}`;
    Promise.all([
      fetch('/api/articles/sets').then((r) => r.json()),
      fetch(`/api/articles${q}`).then((r) => r.json()),
    ])
      .then(([setsData, articlesData]) => {
        setAllSets(setsData);
        setArticles(articlesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, lang]);

  const setMeta = useMemo(
    () => allSets.find((s) => s.id === id && s.language === lang) || allSets.find((s) => s.id === id) || null,
    [allSets, id, lang],
  );
  const title = setMeta?.title || id || '';

  return (
    <div className="home-page">
      <button className="back-btn-v2" onClick={() => navigate('/')}>← Back</button>

      <header className="home-header">
        <h1>{title}</h1>
        <p className="home-subtitle">{articles.length} articles</p>
      </header>

      <section className="home-section">
        {loading ? (
          <div className="loading">Loading articles...</div>
        ) : (
          <div className="article-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      <Toolbar />
    </div>
  );
}
