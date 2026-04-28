import { useNavigate } from 'react-router-dom';
import type { VocabListSummary } from '../types';

export default function VocabListCard({ list }: { list: VocabListSummary }) {
  const navigate = useNavigate();

  return (
    <div
      className="vocab-card"
      style={{ background: list.gradient }}
      onClick={() => navigate(`/vocab/${list.id}`)}
    >
      <div className="vocab-card-inner">
        <h3>{list.title}</h3>
        <p>{list.description}</p>
        <div className="vocab-card-footer">
          <span className="vocab-count">{list.wordCount} words</span>
          <span className="enter-btn">学習開始 →</span>
        </div>
      </div>
    </div>
  );
}
