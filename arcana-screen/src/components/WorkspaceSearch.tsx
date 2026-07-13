import { useMemo, useState } from 'react';
import { useScreenStore } from '../store/useScreenStore';
import { useWidgetStore, type Widget } from '../store/useWidgetStore';

const searchableText = (widget: Widget) => [
  widget.title,
  widget.text,
  widget.referenceTitle,
  widget.referenceBody,
  ...(widget.referenceLinks ?? []).flatMap((link) => [link.label, link.url]),
  ...(widget.captures ?? []).map((capture) => capture.text),
  ...(widget.rows ?? []).flatMap((row) => Object.values(row).map(String)),
].filter(Boolean).join(' ');

export default function WorkspaceSearch() {
  const [query, setQuery] = useState('');
  const screens = useScreenStore((state) => state.screens);
  const activeScreenId = useScreenStore((state) => state.activeScreenId);
  const openScreen = useScreenStore((state) => state.openScreen);
  const widgets = useWidgetStore((state) => state.widgets);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    return screens.flatMap((screen) => {
      const content = screen.id === activeScreenId ? widgets : screen.layoutConfig;
      return content.flatMap((widget) => {
        const haystack = searchableText(widget);
        const index = haystack.toLowerCase().indexOf(needle);
        if (index < 0) return [];
        return [{
          screenId: screen.id,
          screenName: screen.name,
          widgetId: widget.id,
          widgetType: widget.type,
          excerpt: haystack.slice(Math.max(0, index - 35), index + needle.length + 70),
        }];
      });
    }).slice(0, 20);
  }, [activeScreenId, query, screens, widgets]);

  return (
    <details className="workspace-search">
      <summary className="screen-action-button screen-action-button--quiet">Search</summary>
      <div className="workspace-search__panel">
        <label>
          <span>Search every screen</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" placeholder="Notes, captures, references, tables…" />
        </label>
        {query.trim().length < 2 ? (
          <p>Enter at least two characters.</p>
        ) : results.length === 0 ? (
          <p>No matching workspace content.</p>
        ) : (
          <ul>
            {results.map((result) => (
              <li key={`${result.screenId}-${result.widgetId}`}>
                <button type="button" onClick={() => openScreen(result.screenId)}>
                  <strong>{result.screenName} · {result.widgetType}</strong>
                  <span>{result.excerpt}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
