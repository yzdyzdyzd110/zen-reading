import { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard';
import Toolbar from '../components/Toolbar';
import type { ArticleSummary } from '../types';

export default function HomePage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>ZenReading</h1>
        <p className="home-subtitle">禅定阅读 · 沉浸式英语学习</p>
      </header>

      <section className="home-section">
        <h2 className="section-title">Choose Your Reading</h2>
        <p className="section-desc">Select an article to begin your focused reading session. Stars indicate difficulty level.</p>

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
