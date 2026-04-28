import { useEffect, useState } from 'react';
import ArticleCard from '../components/ArticleCard';
import VocabListCard from '../components/VocabListCard';
import Toolbar from '../components/Toolbar';
import type { ArticleSummary, VocabListSummary } from '../types';

type Lang = 'en' | 'ja';

const LANG_LABELS: Record<Lang, { name: string; subtitle: string; sectionTitle: string; sectionDesc: string; vocabTitle: string; vocabDesc: string }> = {
  en: {
    name: 'English',
    subtitle: '禅定阅读 · 沉浸式英语学习',
    sectionTitle: 'Choose Your Reading',
    sectionDesc: 'Select an article to begin your focused reading session. Stars indicate difficulty level.',
    vocabTitle: 'Vocabulary',
    vocabDesc: 'Master essential words with spaced repetition and interactive flashcards.',
  },
  ja: {
    name: '日本語',
    subtitle: '禅定読書 · 没入型日本語学習',
    sectionTitle: '記事を選ぶ',
    sectionDesc: '集中読書セッションを始める記事を選んでください。★は難易度（N1レベル中心）を示します。',
    vocabTitle: '単語リスト',
    vocabDesc: '単語カードで効率的に語彙を習得しましょう。',
  },
};

export default function HomePage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [vocabLists, setVocabLists] = useState<VocabListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('zenreading-lang') as Lang) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('zenreading-lang', lang);
    setLoading(true);
    Promise.all([
      fetch(`/api/articles?lang=${lang}`).then((r) => r.json()),
      fetch(`/api/vocabulary/lists?lang=${lang}`).then((r) => r.json()),
    ])
      .then(([articlesData, vocabData]) => {
        setArticles(articlesData);
        setVocabLists(vocabData);
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

      <section className="home-section">
        <h2 className="section-title">{labels.sectionTitle}</h2>
        <p className="section-desc">{labels.sectionDesc}</p>

        {loading ? (
          <div className="loading">Loading articles...</div>
        ) : (
          <div className="article-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      {vocabLists.length > 0 && (
        <section className="home-section">
          <h2 className="section-title">{labels.vocabTitle}</h2>
          <p className="section-desc">{labels.vocabDesc}</p>
          <div className="vocab-grid">
            {vocabLists.map((v) => (
              <VocabListCard key={v.id} list={v} />
            ))}
          </div>
        </section>
      )}

      <Toolbar />
    </div>
  );
}
