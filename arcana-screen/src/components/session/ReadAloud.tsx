import { useEffect, useRef, useState } from 'react';
import { Eye, PencilSimple } from '@phosphor-icons/react';

// A reusable boxed read-aloud passage: static by default (no accidental edits to verbatim prose),
// an Edit toggle to change it, and a one-tap full-screen presenter (keyboard-safe) to read it to the table.
export default function ReadAloud({ text, onChange }: { text: string; onChange: (text: string) => void }) {
  const [presentOpen, setPresentOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!presentOpen) return;
    const trigger = triggerRef.current;
    closeButtonRef.current?.focus(); // move focus into the modal so aria-modal is honest
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setPresentOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); trigger?.focus(); }; // restore focus on close
  }, [presentOpen]);

  return (
    <section className="read-aloud">
      <div className="read-aloud__head">
        <span>Read aloud</span>
        <button type="button" className="read-aloud__edit" aria-pressed={editing} onClick={() => setEditing((open) => !open)}><PencilSimple size={13} /> {editing ? 'Done' : 'Edit'}</button>
        <button ref={triggerRef} type="button" className="read-aloud__present" disabled={!text.trim()} onClick={() => setPresentOpen(true)}><Eye size={13} /> Present</button>
      </div>
      {editing
        ? <textarea aria-label="Read-aloud text" value={text} onChange={(event) => onChange(event.target.value)} placeholder="Write the boxed text you read to the players…" />
        : text ? <p>{text}</p> : <p className="read-aloud__empty">No boxed text here yet — tap Edit to add it.</p>}
      {presentOpen && (
        <div className="read-aloud-present" role="dialog" aria-modal="true" aria-label="Read-aloud presenter">
          <p>{text}</p>
          <button ref={closeButtonRef} type="button" onClick={() => setPresentOpen(false)}>Close</button>
        </div>
      )}
    </section>
  );
}
