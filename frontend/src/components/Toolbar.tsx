import { useState, useRef } from 'react';
import MusicPlayer from './MusicPlayer';
import ReadingTimer from './ReadingTimer';
import ThemeToggle from './ThemeToggle';

export default function Toolbar() {
  const [active, setActive] = useState<'music' | 'timer' | null>(null);
  const lastType = useRef<'music' | 'timer'>('music');

  const toggle = (type: 'music' | 'timer') => {
    if (active === type) {
      setActive(null);
    } else {
      lastType.current = type;
      setActive(type);
    }
  };

  const close = () => setActive(null);

  return (
    <>
      <div className="toolbar">
        <button
          className={`toolbar-btn ${active === 'music' ? 'active' : ''}`}
          onClick={() => toggle('music')}
          title="White Noise Player"
        >
          🎵
        </button>
        <button
          className={`toolbar-btn ${active === 'timer' ? 'active' : ''}`}
          onClick={() => toggle('timer')}
          title="Reading Timer"
        >
          ⏱
        </button>
        <div className="toolbar-divider" />
        <ThemeToggle />
      </div>

      <div className={`toolbar-overlay ${active ? 'visible' : ''}`} onClick={close} />

      <div className={`toolbar-panel ${active ? 'open' : ''}`}>
        <div className="toolbar-panel-header">
          <span>{lastType.current === 'music' ? 'Focus Sounds' : 'Reading Timer'}</span>
          <button className="toolbar-panel-close" onClick={close}>
            ✕
          </button>
        </div>
        <div style={{ display: lastType.current === 'music' ? 'block' : 'none' }}>
          <MusicPlayer />
        </div>
        <div style={{ display: lastType.current === 'timer' ? 'block' : 'none' }}>
          <ReadingTimer />
        </div>
      </div>
    </>
  );
}
