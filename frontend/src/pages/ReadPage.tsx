import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomSheet from '../components/BottomSheet';
import QuestionPanel from '../components/QuestionPanel';
import Toolbar from '../components/Toolbar';
import type { Article, ArticleSummary } from '../types';

const OPT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);

  // Answer tracking
  const [selectedByArticle, setSelectedByArticle] = useState<Record<number, Record<number, number>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number } | null>(null);

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [setQuestionData, setSetQuestionData] = useState<any[]>([]);
  const [loadingSetQ, setLoadingSetQ] = useState(false);

  // Exit confirmation modal
  const [showExitModal, setShowExitModal] = useState(false);

  const setId = (article as any)?.setId;

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then(setArticle)
      .catch(() => navigate('/'));
  }, [id, navigate]);

  useEffect(() => {
    if (!article) return;
    const q = (article as any).setId
      ? `?setId=${encodeURIComponent((article as any).setId)}`
      : `?lang=${article.language}`;
    fetch(`/api/articles${q}`)
      .then((res) => res.json())
      .then(setArticles)
      .catch(() => {});
  }, [article]);

  // Restore saved answers & submission state
  useEffect(() => {
    if (!setId) return;
    try {
      const saved = localStorage.getItem(`zenreading-answers-${setId}`);
      if (saved) setSelectedByArticle(JSON.parse(saved));
      if (localStorage.getItem(`zenreading-submitted-${setId}`) === 'true') setSubmitted(true);
      const scr = localStorage.getItem(`zenreading-score-${setId}`);
      if (scr) setScoreResult(JSON.parse(scr));
    } catch { /* ignore */ }
  }, [setId]);

  const handleAnswerChange = (qId: number, optIdx: number) => {
    if (submitted || !article) return;
    const articleAnswers = { ...(selectedByArticle[article.id] || {}), [qId]: optIdx };
    const next = { ...selectedByArticle, [article.id]: articleAnswers };
    setSelectedByArticle(next);
    if (setId) localStorage.setItem(`zenreading-answers-${setId}`, JSON.stringify(next));
  };

  const openSubmitModal = () => {
    if (!setId) return;
    setLoadingSetQ(true);
    fetch(`/api/articles/set/${setId}/questions`)
      .then((r) => r.json())
      .then((data) => { setSetQuestionData(data); setShowSubmitModal(true); })
      .catch(() => {})
      .finally(() => setLoadingSetQ(false));
  };

  const confirmSubmit = () => {
    let totalScore = 0;
    let earnedScore = 0;
    for (const art of setQuestionData) {
      const articleAnswers = selectedByArticle[art.id] || {};
      for (const q of (art as any).questions || []) {
        totalScore += q.score || 1;
        if (articleAnswers[q.id] === q.answer) earnedScore += q.score || 1;
      }
    }
    const result = { score: earnedScore, total: totalScore };
    setScoreResult(result);
    setSubmitted(true);
    setShowSubmitModal(false);
    if (setId) {
      localStorage.setItem(`zenreading-score-${setId}`, JSON.stringify(result));
      localStorage.setItem(`zenreading-submitted-${setId}`, 'true');
    }
  };

  if (!article) {
    return <div className="loading">Loading article...</div>;
  }

  return (
    <div className="read-page">
      {/* Article drawer trigger */}
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
        <div className="read-hero-top">
          <button
            className="back-btn"
            onClick={() => {
              if (!submitted && Object.keys(selectedByArticle).length > 0) {
                setShowExitModal(true);
              } else {
                navigate('/');
              }
            }}
          >
            ← Back
          </button>
          {setId && !submitted && (
            <button className="submit-btn" onClick={openSubmitModal} disabled={loadingSetQ}>
              {loadingSetQ ? 'Loading…' : '交卷'}
            </button>
          )}
          {setId && submitted && scoreResult && (
            <div className="submit-btn score-badge" onClick={openSubmitModal}>
              得分：{scoreResult.score}/{scoreResult.total}
            </div>
          )}
        </div>
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
        <QuestionPanel
          questions={article.questions}
          selected={selectedByArticle[article.id] || {}}
          onChange={handleAnswerChange}
          disabled={submitted}
        />
      </BottomSheet>

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">退出确认</h2>
            <div className="modal-body">
              <p>确定要退出吗？您尚未交卷，退出后将丢失作答进度。</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowExitModal(false)}>取消</button>
              <button className="modal-btn-confirm" onClick={() => navigate('/')}>确认退出</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">确认交卷</h2>
            <div className="modal-body">
              {setQuestionData.length === 0 && (
                <p className="modal-empty">此试题集没有题目。</p>
              )}
              {setQuestionData.map((art: any) => {
                const articleAnswers = selectedByArticle[art.id] || {};
                if (!art.questions || art.questions.length === 0) return null;
                return (
                  <div key={art.id} className="modal-article-block">
                    <h3 className="modal-article-title">{art.title}</h3>
                    {art.questions.map((q: any, qi: number) => {
                      const chosen = articleAnswers[q.id];
                      const chosenText = chosen !== undefined
                        ? `${OPT_LABELS[chosen] || chosen}. ${q.options[chosen]}`
                        : <span className="modal-unanswered">未作答</span>;
                      return (
                        <div key={q.id} className="modal-q-item">
                          <span className="modal-q-text">
                            {qi + 1}. {q.text}
                          </span>
                          <span className="modal-q-answer">已选：{chosenText}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowSubmitModal(false)}>取消</button>
              <button className="modal-btn-confirm" onClick={confirmSubmit} disabled={setQuestionData.length === 0}>
                确认交卷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
