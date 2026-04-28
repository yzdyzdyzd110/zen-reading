import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className={`sheet-overlay ${open ? 'visible' : ''}`} onClick={onClose} />
      <div ref={sheetRef} className={`bottom-sheet ${open ? 'open' : ''}`}>
        <div className="sheet-handle" onClick={onClose}>
          <div className="handle-bar" />
        </div>
        {children}
      </div>
    </>
  );
}
