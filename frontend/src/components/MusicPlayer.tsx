import { useState, useRef, useEffect, useCallback } from 'react';

const TRACKS = [
  { label: 'Study', icon: '📖', file: '/audio/study.mp3' },
  { label: 'Wave', icon: '🌊', file: '/audio/wave.mp3' },
  { label: 'Cafe', icon: '☕', file: '/audio/coffeShop.mp3' },
  { label: 'Fire', icon: '🔥', file: '/audio/fire.mp3' },
];

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const volBeforeMute = useRef(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(
    (trackIdx: number, vol: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = TRACKS[trackIdx].file;
      audio.volume = vol;
      audio.play().catch(() => { /* ignore autoplay block */ });
      setPlaying(true);
      setCurrent(trackIdx);
    },
    []
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setPlaying(false);
  }, []);

  const toggle = () => {
    if (playing) {
      stop();
    } else {
      play(current, volume);
    }
  };

  const selectTrack = (idx: number) => {
    stop();
    play(idx, volume);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0) setMuted(false);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      const prev = volBeforeMute.current || 0.3;
      audio.volume = prev;
      setVolume(prev);
      setMuted(false);
    } else {
      volBeforeMute.current = volume || 0.3;
      audio.volume = 0;
      setMuted(true);
    }
  };

  return (
    <div className="music-player">
      <div className="mp-track-row">
        {TRACKS.map((t, i) => (
          <button
            key={t.label}
            className={`mp-track-btn ${i === current && playing ? 'active' : ''}`}
            onClick={() => selectTrack(i)}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div className="mp-controls">
        <button className="mp-play-btn" onClick={toggle} title={playing ? 'Pause' : 'Play'}>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
            {playing ? (
              <>
                <rect x="0" y="2" width="5" height="14" rx="1" fill="#fff" />
                <rect x="11" y="2" width="5" height="14" rx="1" fill="#fff" />
              </>
            ) : (
              <path d="M2 1.5L15 9L2 16.5Z" fill="#fff" />
            )}
          </svg>
        </button>
        <button className="mp-mute-btn" onClick={toggleMute} title={muted ? '解除静音' : '静音'}>
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" className="mp-speaker-svg" stroke="currentColor">
            <path d="M2 5.5H0V10.5H2L6 14.5V1.5L2 5.5Z" fill="currentColor" />
            {muted ? (
              <path d="M12 3L19 13M19 3L12 13" stroke="#e53935" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <path d="M 7 4 A 7 7 0 0 1 7 12" fill="none" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 7 1.5 A 10 10 0 0 1 7 14.5" fill="none" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          className="mp-volume"
        />
      </div>
    </div>
  );
}
