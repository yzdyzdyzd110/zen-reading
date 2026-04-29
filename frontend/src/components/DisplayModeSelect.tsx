import { useState, useRef, useEffect } from 'react';

type DisplayMode = 'both' | 'kanji' | 'kana';

const OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: 'both', label: '漢字＋仮名' },
  { value: 'kanji', label: '漢字のみ' },
  { value: 'kana', label: '仮名のみ' },
];

interface Props {
  value: DisplayMode;
  onChange: (next: DisplayMode) => void;
}

export default function DisplayModeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const currentLabel = OPTIONS.find((o) => o.value === value)?.label || '';

  return (
    <div className="display-mode-select" ref={ref}>
      <button className="dms-trigger" onClick={() => setOpen(!open)}>
        <span>{currentLabel}</span>
        <span className={`dms-arrow ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="dms-dropdown">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`dms-option ${value === opt.value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
