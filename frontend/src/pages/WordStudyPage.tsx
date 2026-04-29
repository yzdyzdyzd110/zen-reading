import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import DisplayModeSelect from '../components/DisplayModeSelect';
import type { VocabWord } from '../types';

type DisplayMode = 'both' | 'kanji' | 'kana';

interface ListMeta {
  id: number;
  title: string;
  wordCount: number;
}

interface SetData {
  id: number;
  title: string;
  gradient: string;
  lists: ListMeta[];
}

interface ListData {
  id: number;
  title: string;
  setId: number;
  setTitle: string;
  gradient: string;
  words: VocabWord[];
}

interface ListState {
  index: number;
  revealed: boolean;
  finished: boolean;
  knownCount: number;
}

function makeListKey(listId: number) {
  return `list-state-${listId}`;
}

function makeUnfamiliarKey(listId: number) {
  return `zenreading-unfamiliar-${listId}`;
}

export default function WordStudyPage() {
  const { id: setId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [setData, setSetData] = useState<SetData | null>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [listData, setListData] = useState<ListData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Per-list study state (persisted in localStorage)
  const [listStates, setListStates] = useState<Record<number, ListState>>({});
  // Unfamiliarity: composite key "listId_wordId"
  const [unfamiliarity, setUnfamiliarity] = useState<Record<string, number>>({});
  const [sideOpen, setSideOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    return (localStorage.getItem('zenreading-display-mode') as DisplayMode) || 'both';
  });

  // Load set metadata
  useEffect(() => {
    fetch(`/api/vocabulary/sets/${setId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: SetData) => {
        setSetData(data);
        if (data.lists.length > 0) {
          setActiveListId(data.lists[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, [setId]);

  // Restore per-list states from localStorage
  useEffect(() => {
    if (!setData) return;
    const restored: Record<number, ListState> = {};
    for (const list of setData.lists) {
      const stored = localStorage.getItem(makeListKey(list.id));
      if (stored) {
        try { restored[list.id] = JSON.parse(stored); } catch { /* ignore */ }
      }
    }
    if (Object.keys(restored).length > 0) {
      setListStates(restored);
    }
  }, [setData]);

  // Load active list's words
  useEffect(() => {
    if (!activeListId) return;
    fetch(`/api/vocabulary/lists/${activeListId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ListData) => setListData(data))
      .catch((err) => setError(err.message));
  }, [activeListId]);

  // Restore unfamiliarity for active list
  useEffect(() => {
    if (!activeListId) return;
    const stored = localStorage.getItem(makeUnfamiliarKey(activeListId));
    if (stored) {
      try { setUnfamiliarity(JSON.parse(stored)); } catch { /* ignore */ }
    } else {
      setUnfamiliarity({});
    }
  }, [activeListId]);

  const saveUnfamiliarity = useCallback(
    (next: Record<string, number>) => {
      setUnfamiliarity(next);
      if (activeListId) {
        localStorage.setItem(makeUnfamiliarKey(activeListId), JSON.stringify(next));
      }
    },
    [activeListId]
  );

  const saveListState = useCallback(
    (listId: number, state: ListState) => {
      setListStates((prev) => ({ ...prev, [listId]: state }));
      localStorage.setItem(makeListKey(listId), JSON.stringify(state));
    },
    []
  );

  const changeDisplayMode = (next: DisplayMode) => {
    setDisplayMode(next);
    localStorage.setItem('zenreading-display-mode', next);
  };

  const switchList = (listId: number) => {
    if (listId === activeListId) return;
    setActiveListId(listId);
    setListData(null);
  };

  // Derived state for current list
  const currentState: ListState = (activeListId && listStates[activeListId]) || {
    index: 0, revealed: false, finished: false, knownCount: 0,
  };

  const unfamiliarWords = useMemo(() => {
    if (!listData) return [];
    return listData.words
      .filter((w) => {
        const key = `${activeListId}_${w.id}`;
        return (unfamiliarity[key] || 0) > 0;
      })
      .sort((a, b) => {
        const ka = `${activeListId}_${a.id}`;
        const kb = `${activeListId}_${b.id}`;
        return (unfamiliarity[kb] || 0) - (unfamiliarity[ka] || 0);
      });
  }, [listData, unfamiliarity, activeListId]);

  if (error) {
    return (
      <div className="study-page">
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>加载失敗</h2>
          <p style={{ color: '#e53935', margin: '16px 0' }}>{error}</p>
          <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 8, cursor: 'pointer' }}>← 戻る</button>
        </div>
        <Toolbar />
      </div>
    );
  }

  if (!setData || !activeListId) {
    return (
      <div className="study-page">
        <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
        <Toolbar />
      </div>
    );
  }

  // If no list data yet but we have active list
  if (!listData) {
    return (
      <div className="study-page">
        <div style={{ padding: 40, textAlign: 'center' }}>Loading list...</div>
        <Toolbar />
      </div>
    );
  }

  const { index, revealed, finished, knownCount } = currentState;
  const word: VocabWord = listData.words[index];
  const total = listData.words.length;
  const progress = ((index + (finished ? 1 : 0)) / total) * 100;
  const isLast = index >= total - 1;
  const uKey = `${activeListId}_${word.id}`;
  const uCount = unfamiliarity[uKey] || 0;
  const maxU = Math.max(...Object.values(unfamiliarity), 1);

  const updateState = (partial: Partial<ListState>) => {
    saveListState(activeListId, { ...currentState, ...partial });
  };

  const handleKnown = () => {
    const nextKnown = knownCount + 1;
    if (uCount > 0) {
      saveUnfamiliarity({ ...unfamiliarity, [uKey]: uCount - 1 });
    }
    if (isLast) {
      updateState({ knownCount: nextKnown, finished: true });
    } else {
      updateState({ index: index + 1, knownCount: nextKnown });
    }
  };

  const handleUnknown = () => {
    saveUnfamiliarity({ ...unfamiliarity, [uKey]: uCount + 1 });
    updateState({ revealed: true });
  };

  const handleNext = () => {
    if (isLast) {
      updateState({ revealed: false, finished: true });
    } else {
      updateState({ index: index + 1, revealed: false });
    }
  };

  const resetCurrentList = () => {
    saveListState(activeListId, { index: 0, revealed: false, finished: false, knownCount: 0 });
    setSideOpen(false);
  };

  if (finished) {
    return (
      <div className="study-page">
        <button className="read-drawer-tab" onClick={() => setDrawer(true)}>
          <span className="tab-label">{setData.title.replace(/語彙.*/, '')}</span>
        </button>
        {drawer && (
          <>
            <div className="read-drawer-overlay" onClick={() => setDrawer(false)} />
            <div className="read-drawer">
              <div className="read-drawer-head">
                <span>{setData.title}</span>
                <button onClick={() => setDrawer(false)}>✕</button>
              </div>
              {setData.lists.map((l) => (
                <button
                  key={l.id}
                  className={`read-drawer-item ${l.id === activeListId ? 'active' : ''}`}
                  onClick={() => { switchList(l.id); setDrawer(false); }}
                >
                  <div className="rdi-title">{l.title.replace(/^N[12] 語彙 /, '')}</div>
                  <div className="rdi-difficulty">{l.wordCount}語</div>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="study-main">
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
                      <span className="umi-count">{'❕'.repeat(unfamiliarity[`${activeListId}_${w.id}`] || 0)}</span>
                    </div>
                  ))}
                  {unfamiliarWords.length > 10 && <span className="umi-more">他 {unfamiliarWords.length - 10} 語...</span>}
                </div>
              </div>
            )}
            <div className="complete-actions">
              <button className="btn-submit" onClick={() => navigate('/')}>ホームに戻る</button>
              <button className="btn-reset" onClick={resetCurrentList}>もう一度</button>
            </div>
          </div>
          <Toolbar />
        </div>
      </div>
    );
  }

  return (
    <div className={`study-page ${sideOpen ? 'side-open' : ''}`}>
      <button className="read-drawer-tab" onClick={() => setDrawer(true)}>
        <span className="tab-label">{setData.title.replace(/語彙.*/, '')}</span>
      </button>
      {drawer && (
        <>
          <div className="read-drawer-overlay" onClick={() => setDrawer(false)} />
          <div className="read-drawer">
            <div className="read-drawer-head">
              <span>{setData.title}</span>
              <button onClick={() => setDrawer(false)}>✕</button>
            </div>
            {setData.lists.map((l) => (
              <button
                key={l.id}
                className={`read-drawer-item ${l.id === activeListId ? 'active' : ''}`}
                onClick={() => { switchList(l.id); setDrawer(false); }}
              >
                <div className="rdi-title">{l.title.replace(/^N[12] 語彙 /, '')}</div>
                <div className="rdi-difficulty">{l.wordCount}語</div>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="study-main">
        <header className="study-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div className="study-header-info">
            <span className="study-list-title">{listData.title}</span>
            <span className="study-progress-text">{index + 1} / {total}</span>
          </div>
          <DisplayModeSelect value={displayMode} onChange={changeDisplayMode} />
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
            <span className="word-main">
              {revealed ? word.word : (displayMode === 'kana' ? word.reading : word.word)}
            </span>
            {(revealed || displayMode === 'both') && (
              <span className="word-reading">{word.reading}</span>
            )}
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

        {sideOpen && <div className="side-panel-overlay" onClick={() => setSideOpen(false)} />}
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
                const count = unfamiliarity[`${activeListId}_${w.id}`] || 0;
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

        <Toolbar />
      </div>
    </div>
  );
}
