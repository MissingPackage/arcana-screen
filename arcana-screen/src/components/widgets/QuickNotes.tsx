import { memo, useEffect, useRef, type ReactNode } from 'react';
import { useWidgetStore } from '../../store/useWidgetStore';
import { useTrustStore } from '../../store/trustStore';

interface QuickNotesProps {
  id: string;
  showHeader?: boolean;
}

function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={`${token}-${index}`}>{token.slice(1, -1)}</code>;
    }

    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a key={`${token}-${index}`} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }

    return token;
  });
}

function QuickNotes({ id }: QuickNotesProps) {
  const widget = useWidgetStore((state) => state.widgets.find((item) => item.id === id));
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const saveStatus = useTrustStore((state) => state.status);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const title = widget?.title ?? 'Session notebook';
  const text = widget?.text ?? '';

  useEffect(() => {
    if (widget && (widget.title === undefined || widget.text === undefined)) {
      updateWidget(id, {
        title: widget.title ?? 'Session notebook',
        text: widget.text ?? '',
      });
    }
  }, [id, updateWidget, widget]);

  const applyFormatting = (kind: 'bold' | 'list' | 'link' | 'heading' | 'check' | 'code') => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = text.slice(start, end);
    let replacement = selected;
    let cursorOffset = 0;

    if (kind === 'bold') {
      replacement = `**${selected || 'important'}**`;
      cursorOffset = selected ? replacement.length : 2;
    } else if (kind === 'list') {
      replacement = (selected || 'list item')
        .split('\n')
        .map((line) => `- ${line}`)
        .join('\n');
      cursorOffset = replacement.length;
    } else if (kind === 'link') {
      replacement = `[${selected || 'label'}](https://)`;
      cursorOffset = replacement.length - 1;
    } else if (kind === 'heading') {
      replacement = (selected || 'Section').split('\n').map((line) => `## ${line}`).join('\n');
      cursorOffset = replacement.length;
    } else if (kind === 'check') {
      replacement = (selected || 'task').split('\n').map((line) => `- [ ] ${line}`).join('\n');
      cursorOffset = replacement.length;
    } else {
      replacement = `\`${selected || 'value'}\``;
      cursorOffset = selected ? replacement.length : 1;
    }

    updateWidget(id, { text: `${text.slice(0, start)}${replacement}${text.slice(end)}` });
    requestAnimationFrame(() => {
      editor.focus();
      const cursor = start + cursorOffset;
      editor.setSelectionRange(cursor, cursor);
    });
  };

  if (!widget) return <div className="tool-empty-state">Loading notebook…</div>;

  return (
    <div className="surface session-notebook">
      <div className="session-notebook__heading">
        <label>
          <span className="sr-only">Notebook title</span>
          <input
            className="session-notebook__title"
            value={title}
            onChange={(event) => updateWidget(id, { title: event.target.value })}
            placeholder="Notebook title"
          />
        </label>
        <span className="tool-save-indicator" role="status">
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Save issue' : 'Saved locally'}
        </span>
      </div>

      <div className="note-toolbar" aria-label="Light formatting">
        <button type="button" onClick={() => applyFormatting('bold')} aria-label="Bold selection">
          Bold
        </button>
        <button type="button" onClick={() => applyFormatting('list')} aria-label="Make a list">
          List
        </button>
        <button type="button" onClick={() => applyFormatting('link')} aria-label="Insert a link">
          Link
        </button>
        <button type="button" onClick={() => applyFormatting('heading')} aria-label="Make a heading">Heading</button>
        <button type="button" onClick={() => applyFormatting('check')} aria-label="Make a checklist">Checklist</button>
        <button type="button" onClick={() => applyFormatting('code')} aria-label="Format as inline code">Code</button>
      </div>

      <textarea
        ref={editorRef}
        value={text}
        onChange={(event) => updateWidget(id, { text: event.target.value })}
        placeholder="Prepare beats, NPC details, clues and reminders…"
        className="session-notebook__editor"
      />

      {text.trim() ? (
        <details className="note-preview">
          <summary>Formatted preview</summary>
          <div className="note-preview__content">
            {text.split('\n').map((line, index) => {
              if (line.startsWith('## ')) return <h3 key={`${line}-${index}`}>{renderInline(line.slice(3))}</h3>;
              const checklist = line.match(/^- \[([ xX])\] (.*)$/);
              if (checklist) return <p key={`${line}-${index}`} className="note-preview__list-item">{checklist[1] === ' ' ? '☐ ' : '☑ '}{renderInline(checklist[2])}</p>;
              return (
                <p key={`${line}-${index}`} className={line.startsWith('- ') ? 'note-preview__list-item' : undefined}>
                  {line.startsWith('- ') ? '• ' : ''}{renderInline(line.replace(/^- /, '')) || <br />}
                </p>
              );
            })}
          </div>
        </details>
      ) : (
        <p className="tool-empty-state">Your prepared session notes will stay here while you change tools or modes.</p>
      )}
    </div>
  );
}

export default memo(QuickNotes);
