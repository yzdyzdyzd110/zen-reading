import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import type { ArticleSummary } from '../types';

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  const navigate = useNavigate();

  return (
    <div
      className="article-card"
      style={{
        backgroundImage: `url(${article.image}), ${article.gradient}`,
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
          <span className="difficulty-label">
            {article.difficulty <= 2 ? 'Beginner' : article.difficulty <= 3 ? 'Intermediate' : 'Advanced'}
          </span>
          <span className="enter-btn">Start Reading →</span>
        </div>
      </div>
    </div>
  );
}
