import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import type { ArticleSetSummary, VocabSetSummary } from '../types';

type Lang = 'en' | 'ja';

const LANG_LABELS: Record<Lang, { name: string; subtitle: string; sectionTitle: string; sectionDesc: string; vocabTitle: string; vocabDesc: string }> = {
  en: {
    name: 'English',
    subtitle: '禅定阅读 · 沉浸式英语学习',
    sectionTitle: 'Reading',
    sectionDesc: 'Select an article set to begin your focused reading session.',
    vocabTitle: 'Vocabulary',
    vocabDesc: 'Master essential words with spaced repetition and interactive flashcards.',
  },
  ja: {
    name: '日本語',
    subtitle: '禅定読書 · 没入型日本語学習',
    sectionTitle: '読解',
    sectionDesc: '記事セットを選んで集中読書セッションを始めましょう。',
    vocabTitle: '単語セット',
    vocabDesc: '単語カードで効率的に語彙を習得しましょう。',
  },
};

export default function HomePage() {
  const [articleSets, setArticleSets] = useState<ArticleSetSummary[]>([]);
  const [vocabSets, setVocabSets] = useState<VocabSetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('zenreading-lang') as Lang) || 'en';
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('zenreading-lang', lang);
    setLoading(true);
    Promise.all([
      fetch(`/api/articles/sets?lang=${lang}`).then((r) => r.json()),
      fetch(`/api/vocabulary/sets?lang=${lang}`).then((r) => r.json()),
    ])
      .then(([articlesData, vocabData]) => {
        setArticleSets(articlesData);
        setVocabSets(vocabData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lang]);

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
              <h2 className="section-title">{labels.sectionTitle}</h2>
              <p className="section-desc">{labels.sectionDesc}</p>
              <div className="vocab-grid">
                {articleSets.map((set) => (
                  <div
                    key={set.id}
                    className="vocab-card"
                    style={{ background: set.gradient }}
                    onClick={() => navigate(`/read-set/${set.id}`)}
                  >
                    <div className="vocab-card-inner">
                      <h3>{set.title}</h3>
                      <p>{set.description}</p>
                      <div className="vocab-card-footer">
                        <span className="vocab-count">{set.articleCount} articles</span>
                        <span className="enter-btn">選択 →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {vocabSets.length > 0 && (
            <section className="home-section">
              <h2 className="section-title">{labels.vocabTitle}</h2>
              <p className="section-desc">{labels.vocabDesc}</p>
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
