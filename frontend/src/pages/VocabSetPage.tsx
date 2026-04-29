import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import type { VocabSet } from '../types';

export default function VocabSetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [set, setSet] = useState<VocabSet | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/vocabulary/sets/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setSet)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>加载失敗</h2>
        <p style={{ color: '#e53935', margin: '16px 0' }}>{error}</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 8, cursor: 'pointer' }}>← 戻る</button>
      </div>
    );
  }

  if (!set) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="home-page">
      <button className="back-btn" onClick={() => navigate('/')} style={{ marginTop: 16, marginLeft: 16 }}>← Back</button>
      <header className="home-header">
        <h1>{set.title}</h1>
        <p className="home-subtitle">{set.description}</p>
      </header>

      <section className="home-section">
        <h2 className="section-title">リスト一覧（{set.totalWords}語）</h2>
        <p className="section-desc">学習するリストを選んでください。</p>

        <div className="vocab-grid">
          {set.lists.map((list) => (
            <div
              key={list.id}
              className="vocab-card"
              style={{ background: set.gradient }}
              onClick={() => navigate(`/vocab/${list.id}`)}
            >
              <div className="vocab-card-inner">
                <h3>{list.title}</h3>
                <p>{list.wordCount}語</p>
                <div className="vocab-card-footer">
                  <span className="vocab-count">{list.wordCount} words</span>
                  <span className="enter-btn">学習開始 →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Toolbar />
    </div>
  );
}
