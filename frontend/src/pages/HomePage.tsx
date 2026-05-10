import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import type { ArticleSetSummary, VocabSetSummary } from '../types';

type Lang = 'en' | 'ja';

const LANG_LABELS: Record<Lang, { name: string; subtitle: string; readingTitle: string; vocabTitle: string }> = {
  en: {
    name: 'English',
    subtitle: '禅定阅读 · 沉浸式英语学习',
    readingTitle: 'Reading Sets',
    vocabTitle: 'Vocabulary Sets',
  },
  ja: {
    name: '日本語',
    subtitle: '禅定読書 · 没入型日本語学習',
    readingTitle: '読解セット',
    vocabTitle: '単語セット',
  },
};

interface ScoreData {
  score: number;
  total: number;
}

function useScore(setId: string, refreshKey: number): ScoreData | null {
  const [score, setScore] = useState<ScoreData | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`zenreading-score-${setId}`);
      setScore(raw ? JSON.parse(raw) : null);
    } catch { /* ignore */ }
  }, [setId, refreshKey]);
  return score;
}

export default function HomePage() {
  const [allArticleSets, setAllArticleSets] = useState<ArticleSetSummary[]>([]);
  const [allVocabSets, setAllVocabSets] = useState<VocabSetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('zenreading-lang') as Lang) || 'en';
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null!);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/articles/sets').then((r) => r.json()),
      fetch('/api/vocabulary/sets').then((r) => r.json()),
    ])
      .then(([articlesData, vocabData]) => {
        setAllArticleSets(articlesData);
        setAllVocabSets(vocabData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('zenreading-lang', lang);
  }, [lang]);

  // Close menu on outside click
  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeMenu]);

  const articleSets = useMemo(
    () => allArticleSets.filter((s) => s.language === lang),
    [allArticleSets, lang],
  );
  const vocabSets = useMemo(
    () => allVocabSets.filter((s) => s.language === lang),
    [allVocabSets, lang],
  );

  const clearScore = (setId: string) => {
    localStorage.removeItem(`zenreading-score-${setId}`);
    localStorage.removeItem(`zenreading-submitted-${setId}`);
    localStorage.removeItem(`zenreading-answers-${setId}`);
    setActiveMenu(null);
    setRefreshKey((k) => k + 1);
  };

  const labels = LANG_LABELS[lang];

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>ZenReading</h1>
        <p className="home-subtitle">{labels.subtitle}</p>
        <div className="lang-switcher">
          {(['en', 'ja'] as Lang[]).map((l) => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => setLang(l)}
            >
              {l === 'en' ? '🇬🇧 EN' : '🇯🇵 日本語'}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {articleSets.length > 0 && (
            <section className="home-section">
              <h2 className="section-title">{labels.readingTitle}</h2>
              <div className="vocab-grid">
                {articleSets.map((set) => (
                  <ArticleSetCard
                    key={set.id}
                    set={set}
                    refreshKey={refreshKey}
                    navigate={navigate}
                    activeMenu={activeMenu}
                    onMenuToggle={() => setActiveMenu(activeMenu === set.id ? null : set.id)}
                    onClearScore={() => clearScore(set.id)}
                    menuRef={menuRef}
                  />
                ))}
              </div>
            </section>
          )}

          {vocabSets.length > 0 && (
            <section className="home-section">
              <h2 className="section-title">{labels.vocabTitle}</h2>
              <div className="vocab-grid">
                {vocabSets.map((set) => (
                  <div
                    key={set.id}
                    className="vocab-card"
                    style={{ background: set.gradient }}
                    onClick={() => navigate(`/vocab/${set.id}`)}
                  >
                    <div className="vocab-card-inner">
                      <h3>{set.title}</h3>
                      <p>{set.description}</p>
                      <div className="vocab-card-footer">
                        <span className="vocab-count">{set.listCount} リスト · {set.totalWords}語</span>
                        <span className="enter-btn">選択 →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Toolbar />
    </div>
  );
}

function ArticleSetCard({
  set,
  refreshKey,
  navigate,
  activeMenu,
  onMenuToggle,
  onClearScore,
  menuRef,
}: {
  set: ArticleSetSummary;
  refreshKey: number;
  navigate: ReturnType<typeof useNavigate>;
  activeMenu: string | null;
  onMenuToggle: () => void;
  onClearScore: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
}) {
  const score = useScore(set.id, refreshKey);
  const isMenuOpen = activeMenu === set.id;

  return (
    <div
      className="vocab-card"
      style={{ background: set.gradient, zIndex: isMenuOpen ? 100 : undefined }}
      onClick={() => navigate(`/read-set/${set.id}?lang=${set.language}`)}
    >
      {/* Three-dot menu */}
      <div className="card-menu" ref={menuRef}>
        <button
          className="card-menu-btn"
          onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
        >
          ⋮
        </button>
        {isMenuOpen && (
          <div className="card-menu-dropdown">
            <button
              className="card-menu-item"
              onClick={(e) => { e.stopPropagation(); onClearScore(); }}
            >
              清除历史分数
            </button>
          </div>
        )}
      </div>

      <div className="vocab-card-inner">
        <h3>{set.title}</h3>
        <p>{set.description}</p>
        <div className="vocab-card-footer">
          <span className="vocab-count">{set.articleCount} articles</span>
          <span className="enter-btn">選択 →</span>
        </div>
        {score && (
          <div className="card-score">
            得分：{score.score}/{score.total}
          </div>
        )}
      </div>
    </div>
  );
}
