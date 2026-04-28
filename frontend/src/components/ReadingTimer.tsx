import { useState, useRef, useEffect, useCallback } from 'react';

export default function ReadingTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [target, setTarget] = useState(25 * 60);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setElapsed((prev) => {
      const next = prev + 1;
      if (mode === 'countdown' && next >= target) {
        clearTimer();
        setRunning(false);
        return target;
      }
      return next;
    });
  }, [mode, target, clearTimer]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(tick, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [running, tick, clearTimer]);

  const toggle = () => {
    if (mode === 'countdown' && elapsed >= target) {
      setElapsed(0);
    }
    setRunning(!running);
  };

  const reset = () => {
    clearTimer();
    setRunning(false);
    setElapsed(0);
  };

  const switchMode = () => {
    clearTimer();
    setRunning(false);
    setElapsed(0);
    setMode(mode === 'stopwatch' ? 'countdown' : 'stopwatch');
  };

  const displayValue = mode === 'countdown' ? Math.max(0, target - elapsed) : elapsed;
  const minutes = Math.floor(displayValue / 60);
  const seconds = displayValue % 60;

  const presets = [5, 10, 15, 25, 30, 45];

  return (
    <div className="reading-timer">
      <div className="timer-mode-row">
        <button className={`timer-mode-btn ${mode === 'stopwatch' ? 'active' : ''}`} onClick={switchMode}>
          Stopwatch
        </button>
        <button className={`timer-mode-btn ${mode === 'countdown' ? 'active' : ''}`} onClick={switchMode}>
          Countdown
        </button>
      </div>

      {mode === 'countdown' && !running && (
        <div className="timer-presets">
          {presets.map((m) => (
            <button
              key={m}
              className={`preset-btn ${target === m * 60 ? 'active' : ''}`}
              onClick={() => {
                setTarget(m * 60);
                setElapsed(0);
              }}
            >
              {m}m
            </button>
          ))}
        </div>
      )}

      <div className="timer-display">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="timer-actions">
        <button className="timer-btn-play" onClick={toggle}>
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button className="timer-btn-reset" onClick={reset}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
