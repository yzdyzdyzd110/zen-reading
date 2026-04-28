import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import type { ArticleSummary } from '../types';

const DIFF_LABELS: Record<string, (d: number) => string> = {
  en: (d) => (d <= 2 ? 'Beginner' : d <= 3 ? 'Intermediate' : 'Advanced'),
  ja: (d) => (d <= 2 ? 'N3' : d <= 3 ? 'N2' : 'N1'),
};

const ENTER_LABELS: Record<string, string> = {
  en: 'Start Reading →',
  ja: '読む →',
};

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  const navigate = useNavigate();
  const lang = article.language || 'en';
  const diffLabel = (DIFF_LABELS[lang] || DIFF_LABELS.en)(article.difficulty);
  const enterLabel = ENTER_LABELS[lang] || ENTER_LABELS.en;

  return (
    <div
      className="article-card"
      style={{
        backgroundImage: article.image
          ? `url(${article.image}), ${article.gradient}`
          : article.gradient,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => navigate(`/read/${article.id}`)}
    >
      <div className="article-card-inner">
        <div className="article-card-header">
          <h3>{article.title}</h3>
          <StarRating difficulty={article.difficulty} />
        </div>
        <p className="article-card-desc">{article.description}</p>
        <div className="article-card-footer">
          <span className="difficulty-label">{diffLabel}</span>
          <span className="enter-btn">{enterLabel}</span>
        </div>
      </div>
    </div>
  );
}
