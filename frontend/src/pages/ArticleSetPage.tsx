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
  // Japanese N1 types: ids 10-15 map to type query param
  const isN1Type = setId >= 10;
  const N1_TYPE_MAP: Record<number, string> = {
    10: 'short', 11: 'medium', 12: 'long', 13: 'integrated', 14: 'argument', 15: 'search',
  };
  const N1_LABELS: Record<number, string> = {
    10: '短文理解', 11: '中篇理解', 12: '長篇理解', 13: '統合理解', 14: '主張理解', 15: '情報検索',
  };
  const query = isN1Type ? `?type=${N1_TYPE_MAP[setId]}` : `?lang=en`;
  const title = isN1Type ? (N1_LABELS[setId] || '') : 'English Reading';

  useEffect(() => {
    fetch(`/api/articles${query}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

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
