import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { VocabList, VocabWord } from '../types';

export default function WordStudyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<VocabList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unfamiliarity, setUnfamiliarity] = useState<Record<number, number>>({});
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`zenreading-unfamiliar-${id}`);
    if (stored) {
      try { setUnfamiliarity(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [id]);

  useEffect(() => {
    console.log('[WordStudyPage] fetching:', `/api/vocabulary/lists/${id}`);
    fetch(`/api/vocabulary/lists/${id}`)
      .then((res) => {
        console.log('[WordStudyPage] response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('[WordStudyPage] data received:', data?.title, data?.words?.length, 'words');
        if (!data || !Array.isArray(data.words)) {
          throw new Error('Invalid response');
        }
        setList(data);
      })
      .catch((err) => {
        console.error('[WordStudyPage] error:', err);
        setError(err.message || 'Unknown error');
      });
  }, [id]);

  const saveUnfamiliarity = (next: Record<number, number>) => {
    setUnfamiliarity(next);
    localStorage.setItem(`zenreading-unfamiliar-${id}`, JSON.stringify(next));
  };

  const unfamiliarWords = useMemo(() => {
    if (!list) return [];
    return list.words
      .filter((w) => (unfamiliarity[w.id] || 0) > 0)
      .sort((a, b) => (unfamiliarity[b.id] || 0) - (unfamiliarity[a.id] || 0));
  }, [list, unfamiliarity]);

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>加载失败</h2>
        <p style={{ color: '#e53935', margin: '16px 0' }}>{error}</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 8, cursor: 'pointer' }}>← 返回主页</button>
      </div>
    );
  }

  if (!list) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading... (ID: {id})</div>;
  }

  const word: VocabWord = list.words[index];
  const total = list.words.length;
  const progress = ((index + (finished ? 1 : 0)) / total) * 100;
  const isLast = index >= total - 1;
  const uCount = unfamiliarity[word.id] || 0;

  const handleKnown = () => {
    setKnownCount((c) => c + 1);
    if (isLast) { setFinished(true); } else { setIndex((i) => i + 1); }
  };

  const handleUnknown = () => {
    saveUnfamiliarity({ ...unfamiliarity, [word.id]: uCount + 1 });
    setRevealed(true);
  };

  const handleNext = () => {
    setRevealed(false);
    if (isLast) { setFinished(true); } else { setIndex((i) => i + 1); }
  };

  const maxU = Math.max(...Object.values(unfamiliarity), 1);

  const resetAll = () => {
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setKnownCount(0);
    setUnfamiliarity({});
    localStorage.removeItem(`zenreading-unfamiliar-${id}`);
    setSideOpen(false);
  };

  if (finished) {
    return (
      <div className="study-page">
        <div className="study-complete">
          <div className="complete-icon">🎉</div>
          <h2>学習完了</h2>
          <p className="complete-stats">
            {total}語中 <strong>{knownCount}</strong>語を既知としてマークしました
          </p>
          <div className="complete-bar-wrap">
            <div className="complete-bar">
              <div className="complete-bar-fill" style={{ width: `${(knownCount / total) * 100}%` }} />
            </div>
            <span>{Math.round((knownCount / total) * 100)}%</span>
          </div>
          {unfamiliarWords.length > 0 && (
            <div className="complete-unfamiliar">
              <h3>要復習 ({unfamiliarWords.length}語)</h3>
              <div className="unfamiliar-mini-list">
                {unfamiliarWords.slice(0, 10).map((w) => (
                  <div key={w.id} className="unfamiliar-mini-item">
                    <span className="umi-word">{w.word}</span>
                    <span className="umi-meaning">{w.meaning}</span>
                    <span className="umi-count">{'❕'.repeat(unfamiliarity[w.id] || 0)}</span>
                  </div>
                ))}
                {unfamiliarWords.length > 10 && <span className="umi-more">他 {unfamiliarWords.length - 10} 語...</span>}
              </div>
            </div>
          )}
          <div className="complete-actions">
            <button className="btn-submit" onClick={() => navigate('/')}>ホームに戻る</button>
            <button className="btn-reset" onClick={resetAll}>もう一度</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`study-page ${sideOpen ? 'side-open' : ''}`}>
      <header className="study-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="study-header-info">
          <span className="study-list-title">{list.title}</span>
          <span className="study-progress-text">{index + 1} / {total}</span>
        </div>
        <button
          className={`side-toggle ${unfamiliarWords.length > 0 ? 'has-unfamiliar' : ''}`}
          onClick={() => setSideOpen(!sideOpen)}
          title="生疏度一覧"
        >
          {unfamiliarWords.length > 0 && <span className="side-badge">{unfamiliarWords.length}</span>}
          📋
        </button>
      </header>

      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className={`word-stage ${revealed ? 'revealed' : ''}`}>
        <div className="word-strip">
          {uCount > 0 && (
            <span className="unfamiliar-marks" title={`生疏度: ${uCount}`}>
              {'❕'.repeat(Math.min(uCount, 5))}
            </span>
          )}
          <span className="word-main">{word.word}</span>
          <span className="word-reading">{word.reading}</span>
        </div>
        <div className="word-meaning">
          <span className="meaning-label">意味</span>
          <span className="meaning-text">{word.meaning}</span>
        </div>
      </div>

      <div className="word-actions">
        {!revealed ? (
          <>
            <button className="word-btn known-btn" onClick={handleKnown} title="知っている">✓</button>
            <button className="word-btn unknown-btn" onClick={handleUnknown} title="まだ覚えていない">✗</button>
          </>
        ) : (
          <button className="word-btn next-btn" onClick={handleNext} title="次へ">→</button>
        )}
      </div>

      <div className={`side-panel ${sideOpen ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h3>生疏度ランク</h3>
          <button className="toolbar-panel-close" onClick={() => setSideOpen(false)}>✕</button>
        </div>
        {unfamiliarWords.length === 0 ? (
          <p className="side-empty">まだ生疏な単語はありません</p>
        ) : (
          <div className="side-list">
            {unfamiliarWords.map((w) => {
              const count = unfamiliarity[w.id] || 0;
              const intensity = count / maxU;
              return (
                <div key={w.id} className="side-item" style={{ backgroundColor: `rgba(229, 115, 115, ${0.04 + intensity * 0.12})` }}>
                  <div className="side-item-main">
                    <span className="side-word">{w.word}</span>
                    <span className="side-reading">{w.reading}</span>
                  </div>
                  <div className="side-item-right">
                    <span className="side-meaning">{w.meaning}</span>
                    <span className="side-marks">{'❕'.repeat(count)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
