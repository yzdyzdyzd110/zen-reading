import { useNavigate } from 'react-router-dom';
import type { VocabSetSummary } from '../types';

export default function VocabListCard({ list }: { list: VocabSetSummary }) {
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
          <span className="vocab-count">{list.listCount} リスト · {list.totalWords}語</span>
          <span className="enter-btn">選択 →</span>
        </div>
      </div>
    </div>
  );
}
