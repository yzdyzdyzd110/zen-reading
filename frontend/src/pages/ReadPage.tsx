import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomSheet from '../components/BottomSheet';
import QuestionPanel from '../components/QuestionPanel';
import Toolbar from '../components/Toolbar';
import type { Article, ArticleSummary } from '../types';


export default function ReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then(setArticle)
      .catch(() => navigate('/'));
  }, [id]);

  useEffect(() => {
    if (!article) return;
    const a = article as any;
    const query = a.language === 'ja' && a.type
      ? `?type=${a.type}`
      : `?lang=${article.language}`;
    fetch(`/api/articles${query}`)
      .then((res) => res.json())
      .then(setArticles)
      .catch(() => {});
  }, [article]);

  if (!article) {
    return <div className="loading">Loading article...</div>;
  }

  return (
    <div className="read-page">
      {/* Article drawer trigger — fixed left edge */}
      <button className="read-drawer-tab" onClick={() => setDrawer(true)}>
        <span className="tab-label">{article.language === 'ja' ? '記事' : 'List'}</span>
      </button>

      {/* Article list drawer */}
      {drawer && (
        <>
          <div className="read-drawer-overlay" onClick={() => setDrawer(false)} />
          <div className="read-drawer">
            <div className="read-drawer-head">
              <span>{article.language === 'ja' ? '記事一覧' : 'Articles'}</span>
              <button onClick={() => setDrawer(false)}>✕</button>
            </div>
            {articles.map((a) => (
              <button
                key={a.id}
                className={`read-drawer-item ${a.id === article.id ? 'active' : ''}`}
                onClick={() => { setDrawer(false); navigate(`/read/${a.id}`); }}
              >
                <div className="rdi-title">{a.title}</div>
                <div className="rdi-difficulty">
                  {'★'.repeat(a.difficulty)}{'☆'.repeat(5 - a.difficulty)}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <div
        className="read-hero"
        style={{
          backgroundImage: article.image
            ? `url(${article.image}), ${article.gradient}`
            : article.gradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="read-hero-content">
          <h1>{article.title}</h1>
          <span className="read-difficulty">
            {'★'.repeat(article.difficulty)}{'☆'.repeat(5 - article.difficulty)}
          </span>
        </div>
      </div>

      <article className="read-article">
        {article.content.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </article>

      <button className="fab" onClick={() => setSheetOpen(true)}>
        📋 Questions
      </button>

      <Toolbar />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <QuestionPanel questions={article.questions} />
      </BottomSheet>
    </div>
  );
}
