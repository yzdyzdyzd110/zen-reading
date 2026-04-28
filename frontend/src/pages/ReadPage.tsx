import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomSheet from '../components/BottomSheet';
import QuestionPanel from '../components/QuestionPanel';
import Toolbar from '../components/Toolbar';
import type { Article } from '../types';

export default function ReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then(setArticle)
      .catch(() => navigate('/'));
  }, [id, navigate]);

  if (!article) {
    return <div className="loading">Loading article...</div>;
  }

  return (
    <div className="read-page">
      <div
        className="read-hero"
        style={{
          backgroundImage: `url(${article.image}), ${article.gradient}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
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
