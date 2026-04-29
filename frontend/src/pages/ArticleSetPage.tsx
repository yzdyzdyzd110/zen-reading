import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import Toolbar from '../components/Toolbar';
import type { ArticleSummary } from '../types';

export default function ArticleSetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const setId = Number(id);
  const lang = setId === 2 ? 'ja' : 'en';
  const title = lang === 'ja' ? '日本語読解' : 'English Reading';

  useEffect(() => {
    fetch(`/api/articles?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lang]);

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
