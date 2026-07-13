import { ArrowElbowDownLeft, NotePencil } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

interface QuickCaptureBarProps {
  onCapture: (text: string) => void;
  recentCapture?: string;
  captureCount?: number;
  onReview?: () => void;
}

export default function QuickCaptureBar({ onCapture, recentCapture, captureCount = 0, onReview }: QuickCaptureBarProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusCapture = () => inputRef.current?.focus();
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const editing = target instanceof Element && target.matches('input, textarea, select, [contenteditable="true"]');
      if (event.key === '/' && !editing) {
        event.preventDefault();
        focusCapture();
      }
    };
    window.addEventListener('arcana:focus-capture', focusCapture);
    window.addEventListener('keydown', handleShortcut);
    return () => {
      window.removeEventListener('arcana:focus-capture', focusCapture);
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onCapture(text);
    setDraft('');
  };

  return (
    <div className="capture-stack">
      <form className="quick-capture" onSubmit={submit}>
        <NotePencil size={25} weight="regular" aria-hidden="true" />
        <input
          ref={inputRef}
          aria-label="Quick capture"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Capture a name, decision, or consequence…"
        />
        <span className="quick-capture__shortcut">Press <kbd>/</kbd> to focus</span>
        <button type="submit" aria-label="Save capture">
          <ArrowElbowDownLeft size={19} aria-hidden="true" />
        </button>
      </form>
      {recentCapture && <p className="recent-capture"><strong>Recent capture</strong> <span>{recentCapture}</span>{onReview && <button type="button" aria-label="Review captures" onClick={onReview}>Review captures <b aria-hidden="true">{captureCount}</b></button>}</p>}
    </div>
  );
}
