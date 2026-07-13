import { memo, useEffect, useRef, useState, type FormEvent } from 'react';
import { useWidgetStore, type CaptureItem } from '../../store/useWidgetStore';

interface QuickCaptureProps {
  id: string;
}

const createCaptureId = () =>
  globalThis.crypto?.randomUUID?.() ?? `capture-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const formatTimestamp = (timestamp: string) =>
  new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    .format(new Date(timestamp));

function QuickCapture({ id }: QuickCaptureProps) {
  const widget = useWidgetStore((state) => state.widgets.find((item) => item.id === id));
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const widgets = useWidgetStore((state) => state.widgets);
  const [draft, setDraft] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const captures = widget?.captures ?? [];

  useEffect(() => {
    if (widget && widget.captures === undefined) updateWidget(id, { captures: [] });
  }, [id, updateWidget, widget]);

  useEffect(() => {
    const focusCapture = () => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    window.addEventListener('arcana:focus-capture', focusCapture);
    return () => window.removeEventListener('arcana:focus-capture', focusCapture);
  }, []);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const submitCapture = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const capture: CaptureItem = {
      id: createCaptureId(),
      text,
      createdAt: new Date().toISOString(),
      status: 'inbox',
    };
    updateWidget(id, { captures: [capture, ...captures] });
    setDraft('');
    inputRef.current?.focus();
  };

  const updateCapture = (captureId: string, updates: Partial<CaptureItem>) => {
    updateWidget(id, {
      captures: captures.map((capture) =>
        capture.id === captureId ? { ...capture, ...updates } : capture,
      ),
    });
  };

  const promoteCapture = (capture: CaptureItem) => {
    const notebook = widgets.find((item) => item.type === 'QuickNotes');
    if (!notebook) return;
    const prefix = notebook.text?.trim() ? `${notebook.text.trim()}\n\n` : '';
    updateWidget(notebook.id, { text: `${prefix}- ${capture.text}` });
    updateCapture(capture.id, { status: 'promoted' });
  };

  const saveEdit = (captureId: string) => {
    const text = editingText.trim();
    if (text) updateCapture(captureId, { text });
    setEditingId(null);
  };

  if (!widget) return <div className="tool-empty-state">Loading capture inbox…</div>;

  return (
    <div className="surface quick-capture">
      <form className="quick-capture__form" onSubmit={submitCapture}>
        <label htmlFor={`capture-${id}`}>Capture what just happened</label>
        <div className="quick-capture__entry">
          <input
            id={`capture-${id}`}
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Name, decision, consequence, improvisation…"
          />
          <button type="submit" className="screen-action-button" disabled={!draft.trim()}>
            Capture
          </button>
        </div>
        <span className="quick-capture__shortcut">Shortcut: Ctrl/Cmd + Shift + K</span>
      </form>

      <div className="quick-capture__summary">
        <span>{captures.length} captured</span>
        <button type="button" className="screen-action-button screen-action-button--quiet" onClick={() => setIsReviewOpen((value) => !value)}>
          {isReviewOpen ? 'Close review' : 'Review captures'}
        </button>
      </div>

      {captures.length === 0 ? (
        <p className="tool-empty-state">New captures appear here with an automatic timestamp.</p>
      ) : (
        <ul className="capture-list">
          {(isReviewOpen ? captures : captures.slice(0, 3)).map((capture) => (
            <li key={capture.id} className="capture-card">
              {editingId === capture.id ? (
                <div className="capture-card__edit">
                  <input ref={editInputRef} aria-label="Edit capture" value={editingText} onChange={(event) => setEditingText(event.target.value)} />
                  <button type="button" onClick={() => saveEdit(capture.id)}>Save</button>
                  <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <p>{capture.text}</p>
              )}
              <div className="capture-card__meta">
                <time dateTime={capture.createdAt}>{formatTimestamp(capture.createdAt)}</time>
                <span>{capture.status}</span>
              </div>
              {isReviewOpen && editingId !== capture.id && (
                <div className="capture-card__actions">
                  <button type="button" onClick={() => { setEditingId(capture.id); setEditingText(capture.text); }}>Edit</button>
                  <button type="button" onClick={() => updateCapture(capture.id, { status: 'kept' })}>Keep</button>
                  <button type="button" onClick={() => promoteCapture(capture)} disabled={!widgets.some((item) => item.type === 'QuickNotes')}>Promote to notebook</button>
                  <button type="button" className="danger-text" onClick={() => updateWidget(id, { captures: captures.filter((item) => item.id !== capture.id) })}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(QuickCapture);
