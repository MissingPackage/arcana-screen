import { memo, useEffect, useState, type FormEvent } from 'react';
import { useWidgetStore, type ReferenceLink } from '../../store/useWidgetStore';
import { useEvolutionStore } from '../../store/useEvolutionStore';

interface QuickReferenceProps {
  id: string;
}

const createLinkId = () =>
  globalThis.crypto?.randomUUID?.() ?? `reference-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

function QuickReference({ id }: QuickReferenceProps) {
  const widget = useWidgetStore((state) => state.widgets.find((item) => item.id === id));
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [packName, setPackName] = useState('');
  const referencePacks = useEvolutionStore((state) => state.referencePacks);
  const saveReferencePack = useEvolutionStore((state) => state.saveReferencePack);
  const deleteReferencePack = useEvolutionStore((state) => state.deleteReferencePack);
  const links = widget?.referenceLinks ?? [];
  const orderedLinks = [...links].sort((a, b) =>
    Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
    || (b.lastOpenedAt ?? '').localeCompare(a.lastOpenedAt ?? ''),
  );

  useEffect(() => {
    if (widget && (widget.referenceTitle === undefined || widget.referenceBody === undefined || widget.referenceLinks === undefined)) {
      updateWidget(id, {
        referenceTitle: widget.referenceTitle ?? 'Quick reference',
        referenceBody: widget.referenceBody ?? '',
        referenceLinks: widget.referenceLinks ?? [],
      });
    }
  }, [id, updateWidget, widget]);

  const addLink = (event: FormEvent) => {
    event.preventDefault();
    const normalizedUrl = normalizeUrl(url);
    try {
      const parsed = new URL(normalizedUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
      const link: ReferenceLink = {
        id: createLinkId(),
        label: label.trim() || parsed.hostname,
        url: parsed.toString(),
      };
      updateWidget(id, { referenceLinks: [...links, link] });
      setLabel('');
      setUrl('');
      setError('');
    } catch {
      setError('Enter a valid web address, such as https://example.com.');
    }
  };

  if (!widget) return <div className="tool-empty-state">Loading quick reference…</div>;

  return (
    <div className="surface quick-reference">
      <input
        className="quick-reference__title"
        value={widget.referenceTitle ?? ''}
        onChange={(event) => updateWidget(id, { referenceTitle: event.target.value })}
        aria-label="Reference title"
        placeholder="Reference title"
      />
      <textarea
        value={widget.referenceBody ?? ''}
        onChange={(event) => updateWidget(id, { referenceBody: event.target.value })}
        placeholder="Rules, DCs, names, clues or any concise information you need at a glance…"
        aria-label="Reference content"
      />

      <form className="reference-link-form" onSubmit={addLink}>
        <strong>Add source link</strong>
        <div className="reference-link-form__fields">
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label" aria-label="Link label" />
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" aria-label="Link address" />
          <button type="submit" disabled={!url.trim()}>Add</button>
        </div>
        {error && <p className="tool-error" role="alert">{error}</p>}
      </form>

      {links.length === 0 ? (
        <p className="tool-empty-state">Optional source links keep outside material one click away.</p>
      ) : (
        <ul className="reference-links">
          {orderedLinks.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => updateWidget(id, {
                  referenceLinks: links.map((item) => item.id === link.id
                    ? { ...item, lastOpenedAt: new Date().toISOString() }
                    : item),
                })}
              >
                {link.pinned ? '★ ' : ''}{link.label}
              </a>
              <button
                type="button"
                aria-label={`${link.pinned ? 'Unpin' : 'Pin'} ${link.label}`}
                onClick={() => updateWidget(id, {
                  referenceLinks: links.map((item) => item.id === link.id ? { ...item, pinned: !item.pinned } : item),
                })}
              >
                {link.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button type="button" aria-label={`Remove ${link.label}`} onClick={() => updateWidget(id, { referenceLinks: links.filter((item) => item.id !== link.id) })}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      <details className="reference-pack-library">
        <summary>Reference packs ({referencePacks.length})</summary>
        <div className="reference-pack-library__save">
          <input value={packName} onChange={(event) => setPackName(event.target.value)} placeholder="Pack name" aria-label="Reference pack name" />
          <button
            type="button"
            disabled={!links.length}
            onClick={() => {
              saveReferencePack(packName, links);
              setPackName('');
            }}
          >
            Save current links
          </button>
        </div>
        {referencePacks.length === 0 ? (
          <p className="tool-empty-state">Save reusable source lists for future screens.</p>
        ) : (
          <ul>
            {referencePacks.map((pack) => (
              <li key={pack.id}>
                <span><strong>{pack.name}</strong> · {pack.links.length} links</span>
                <button
                  type="button"
                  onClick={() => updateWidget(id, {
                    referenceLinks: [
                      ...links,
                      ...pack.links.map((link) => ({ ...link, id: createLinkId(), lastOpenedAt: undefined })),
                    ],
                  })}
                >
                  Add pack
                </button>
                <button type="button" className="danger-text" onClick={() => deleteReferencePack(pack.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}

export default memo(QuickReference);
