import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { screenTemplateCatalog, templateLabel, type ScreenTemplate } from '../../store/screenTemplates';
import { useScreenStore } from '../../store/useScreenStore';
import type { ScreenMode } from '../../store/useScreenStore';
import { useTrustStore } from '../../store/trustStore';
import { useWidgetStore } from '../../store/useWidgetStore';
import { useEvolutionStore, type PersonalScreenTemplate } from '../../store/useEvolutionStore';

export default function ScreenManager() {
  const screens = useScreenStore((state) => state.screens);
  const activeScreenId = useScreenStore((state) => state.activeScreenId);
  const createScreen = useScreenStore((state) => state.createScreen);
  const openScreen = useScreenStore((state) => state.openScreen);
  const renameScreen = useScreenStore((state) => state.renameScreen);
  const updateScreenOrganization = useScreenStore((state) => state.updateScreenOrganization);
  const createScreenFromTemplate = useScreenStore((state) => state.createScreenFromTemplate);
  const duplicateScreen = useScreenStore((state) => state.duplicateScreen);
  const deleteScreen = useScreenStore((state) => state.deleteScreen);
  const restoreDeletedScreen = useScreenStore((state) => state.restoreDeletedScreen);
  const setActiveMode = useScreenStore((state) => state.setActiveMode);
  const saveStatus = useTrustStore((state) => state.status);
  const saveMessage = useTrustStore((state) => state.message);
  const widgets = useWidgetStore((state) => state.widgets);
  const personalTemplates = useEvolutionStore((state) => state.personalTemplates);
  const savePersonalTemplate = useEvolutionStore((state) => state.savePersonalTemplate);
  const deletePersonalTemplate = useEvolutionStore((state) => state.deletePersonalTemplate);
  const importPersonalTemplates = useEvolutionStore((state) => state.importPersonalTemplates);
  const locale = useEvolutionStore((state) => state.locale);

  const [isCreating, setIsCreating] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<ScreenTemplate>('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [screenSearch, setScreenSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const createNameRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) createNameRef.current?.focus();
  }, [isCreating]);

  useEffect(() => {
    if (editingId) renameRef.current?.focus();
  }, [editingId]);

  const activeScreen = useMemo(
    () => screens.find((screen) => screen.id === activeScreenId) ?? screens[0],
    [activeScreenId, screens],
  );
  const activeMode = activeScreen?.mode ?? 'prepare';
  const copy = locale === 'it' ? {
    controls: 'Controlli schermata', current: 'Schermata corrente', prepare: 'Prepara', run: 'Gioca',
    saved: 'Salvato in locale', saving: 'Salvataggio…', issue: 'Problema salvataggio', manage: 'Gestisci schermate',
    create: 'Nuova schermata', prepareStatus: 'Modalità Preparazione · Il layout è modificabile.',
    runStatus: 'Modalità Gioco · Il layout è protetto mentre gli strumenti restano attivi.',
  } : {
    controls: 'Screen controls', current: 'Current screen', prepare: 'Prepare', run: 'Run',
    saved: 'Saved locally', saving: 'Saving…', issue: 'Save issue', manage: 'Manage screens',
    create: 'New screen', prepareStatus: 'Prepare mode · Layout editing is available.',
    runStatus: 'Run mode · Layout is protected while tools remain active.',
  };
  const selectableScreens = screens.filter((screen) => !screen.archived || screen.id === activeScreenId);
  const visibleScreens = useMemo(() => {
    const query = screenSearch.trim().toLowerCase();
    return screens.filter((screen) => {
      if (screen.archived !== showArchived) return false;
      if (!query) return true;
      return [screen.name, screen.folder, ...screen.tags].join(' ').toLowerCase().includes(query);
    });
  }, [screenSearch, screens, showArchived]);

  const handleModeChange = (mode: ScreenMode) => {
    setIsCreating(false);
    setIsManaging(false);
    setActiveMode(mode);
  };

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const screenName = name.trim() || `${templateLabel[template]} Screen`;
    createScreen(screenName, template);
    setName('');
    setTemplate('general');
    setIsCreating(false);
    toast.success(`${screenName} created`);
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleRename = (event: FormEvent, id: string) => {
    event.preventDefault();
    if (!editingName.trim()) return;
    renameScreen(id, editingName);
    setEditingId(null);
    toast.success('Screen renamed');
  };

  const handleDelete = (id: string) => {
    const deleted = deleteScreen(id);
    if (!deleted) return;

    toast(
      (toastInstance) => (
        <div className="flex items-center gap-3">
          <span>{deleted.screen.name} deleted</span>
          <button
            type="button"
            className="screen-action-button"
            onClick={() => {
              restoreDeletedScreen(deleted);
              toast.dismiss(toastInstance.id);
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 15000 },
    );
  };

  const handleArchive = (id: string, archived: boolean) => {
    updateScreenOrganization(id, { archived });
    if (archived && id === activeScreenId) {
      const next = screens.find((screen) => screen.id !== id && !screen.archived);
      if (next) openScreen(next.id);
    }
    toast.success(archived ? 'Screen archived' : 'Screen restored');
  };

  const handleTemplateImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { templates?: PersonalScreenTemplate[] };
      const imported = importPersonalTemplates(Array.isArray(parsed.templates) ? parsed.templates : []);
      if (!imported) throw new Error('No valid templates found');
      toast.success(`${imported} template${imported === 1 ? '' : 's'} imported`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Template import failed');
    }
  };

  const exportPersonalTemplates = () => {
    const blob = new Blob([JSON.stringify({
      format: 'arcana-screen-templates',
      schemaVersion: 1,
      templates: personalTemplates,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `arcana-templates-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <section className="screen-manager" aria-label={copy.controls}>
      <div className="screen-manager__primary">
        <div className="min-w-0">
          <p className="screen-manager__eyebrow">{copy.current}</p>
          <select
            className="screen-manager__select"
            aria-label={copy.current}
            value={activeScreen?.id ?? ''}
            onChange={(event) => openScreen(event.target.value)}
          >
            {selectableScreens.map((screen) => (
              <option key={screen.id} value={screen.id}>
                {screen.name}
              </option>
            ))}
          </select>
        </div>

        <div className="screen-manager__actions">
          <div className="screen-mode" aria-label="Workspace mode">
            <button
              type="button"
              className="screen-mode__button"
              aria-pressed={activeMode === 'prepare'}
              onClick={() => handleModeChange('prepare')}
            >
              {copy.prepare}
            </button>
            <button
              type="button"
              className="screen-mode__button"
              aria-pressed={activeMode === 'run'}
              onClick={() => handleModeChange('run')}
            >
              {copy.run}
            </button>
          </div>
          <span
            className={`screen-manager__saved screen-manager__saved--${saveStatus}`}
            role="status"
            title={saveMessage ?? undefined}
          >
            {saveStatus === 'saving'
              ? copy.saving
              : saveStatus === 'error'
                ? copy.issue
                : copy.saved}
          </span>
          {activeMode === 'prepare' && (
            <>
              <button
                type="button"
                className="screen-action-button screen-action-button--quiet"
                onClick={() => {
                  setIsCreating(false);
                  setIsManaging((value) => !value);
                }}
                aria-expanded={isManaging}
              >
                {copy.manage}
              </button>
              <button
                type="button"
                className="screen-action-button"
                onClick={() => {
                  setIsManaging(false);
                  setIsCreating((value) => !value);
                }}
                aria-expanded={isCreating}
              >
                {copy.create}
              </button>
            </>
          )}
        </div>
      </div>

      <p className="screen-mode__status" role="status">
        {activeMode === 'prepare'
          ? copy.prepareStatus
          : copy.runStatus}
      </p>

      {isCreating && (
        <form className="surface screen-manager__panel" onSubmit={handleCreate}>
          <div>
            <p className="screen-manager__panel-title">Create a screen</p>
            <p className="screen-manager__panel-copy">
              Choose a useful starting point. You can change its tools later.
            </p>
          </div>

          <label className="screen-manager__field">
            <span>Name</span>
            <input
              ref={createNameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`${templateLabel[template]} Screen`}
            />
          </label>

          <fieldset className="screen-manager__templates">
            <legend>Starting point</legend>
            <div className="screen-manager__template-grid">
              {screenTemplateCatalog.map((item) => (
                <label
                  key={item.id}
                  className={`screen-template ${template === item.id ? 'screen-template--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="screen-template"
                    value={item.id}
                    checked={template === item.id}
                    onChange={() => setTemplate(item.id)}
                  />
                  <span className="screen-template__name">{templateLabel[item.id]}</span>
                  <span className="screen-template__description">{item.description}</span>
                  <span className="screen-template__outcome">{item.outcome}</span>
                  <span className="screen-template__tools">
                    {item.tools.length ? item.tools.join(' · ') : 'No tools — add your own from the library'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {personalTemplates.length > 0 && (
            <fieldset className="screen-manager__templates">
              <legend>Personal templates</legend>
              <div className="screen-manager__template-grid">
                {personalTemplates.map((item) => (
                  <article className="screen-template" key={item.id}>
                    <span className="screen-template__name">{item.name}</span>
                    <span className="screen-template__description">{item.description}</span>
                    <button
                      type="button"
                      className="screen-action-button"
                      onClick={() => {
                        createScreenFromTemplate(name.trim() || item.name, item);
                        setIsCreating(false);
                        toast.success('Screen created from personal template');
                      }}
                    >
                      Use template
                    </button>
                  </article>
                ))}
              </div>
            </fieldset>
          )}

          <div className="screen-manager__panel-actions">
            <button
              type="button"
              className="screen-action-button screen-action-button--quiet"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </button>
            <button type="submit" className="screen-action-button">
              Create screen
            </button>
          </div>
        </form>
      )}

      {isManaging && (
        <div className="surface screen-manager__panel">
          <div className="screen-manager__panel-heading">
            <div>
              <p className="screen-manager__panel-title">Your screens</p>
              <p className="screen-manager__panel-copy">Open, rename or reuse a setup.</p>
            </div>
            <button
              type="button"
              className="screen-action-button screen-action-button--quiet"
              onClick={() => setIsManaging(false)}
            >
              Close
            </button>
          </div>

          <div className="screen-library-controls">
            <label className="screen-manager__field">
              <span>Search names, folders or tags</span>
              <input
                type="search"
                value={screenSearch}
                onChange={(event) => setScreenSearch(event.target.value)}
                placeholder="Search screens"
              />
            </label>
            <button
              type="button"
              className="screen-action-button screen-action-button--quiet"
              aria-pressed={showArchived}
              onClick={() => setShowArchived((value) => !value)}
            >
              {showArchived ? 'Show active' : `Archive (${screens.filter((screen) => screen.archived).length})`}
            </button>
            {activeScreen && (
              <button
                type="button"
                className="screen-action-button screen-action-button--quiet"
                onClick={() => {
                  savePersonalTemplate({ ...activeScreen, layoutConfig: widgets });
                  toast.success('Personal template saved');
                }}
              >
                Save current as template
              </button>
            )}
            <button type="button" className="screen-action-button screen-action-button--quiet" onClick={exportPersonalTemplates} disabled={!personalTemplates.length}>
              Export templates
            </button>
            <label className="screen-action-button screen-action-button--quiet template-import-button">
              Import templates
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => void handleTemplateImport(event.target.files?.[0])}
              />
            </label>
          </div>

          <ul className="screen-list">
            {visibleScreens.map((screen) => (
              <li className="screen-list__item" key={screen.id}>
                {editingId === screen.id ? (
                  <form
                    className="screen-list__rename"
                    onSubmit={(event) => handleRename(event, screen.id)}
                  >
                    <label className="sr-only" htmlFor={`screen-name-${screen.id}`}>
                      Screen name
                    </label>
                    <input
                      id={`screen-name-${screen.id}`}
                      ref={renameRef}
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                    />
                    <button type="submit" className="screen-action-button">
                      Save
                    </button>
                    <button
                      type="button"
                      className="screen-action-button screen-action-button--quiet"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="screen-list__identity">
                      <strong>{screen.name}</strong>
                      <span>
                        {templateLabel[screen.template]}
                        {screen.folder ? ` · ${screen.folder}` : ''}
                        {screen.tags.length ? ` · ${screen.tags.join(', ')}` : ''}
                        {screen.id === activeScreenId ? ' · Current' : ''}
                      </span>
                      <div className="screen-list__organization">
                        <label>
                          <span className="sr-only">Folder for {screen.name}</span>
                          <input
                            defaultValue={screen.folder}
                            placeholder="Folder"
                            onBlur={(event) => updateScreenOrganization(screen.id, { folder: event.target.value.trim() })}
                          />
                        </label>
                        <label>
                          <span className="sr-only">Tags for {screen.name}</span>
                          <input
                            defaultValue={screen.tags.join(', ')}
                            placeholder="Tags, comma separated"
                            onBlur={(event) => updateScreenOrganization(screen.id, {
                              tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean),
                            })}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="screen-list__actions">
                      {screen.id !== activeScreenId && (
                        <button
                          type="button"
                          className="screen-action-button screen-action-button--quiet"
                          onClick={() => openScreen(screen.id)}
                        >
                          Open
                        </button>
                      )}
                      <button
                        type="button"
                        className="screen-action-button screen-action-button--quiet"
                        onClick={() => startRename(screen.id, screen.name)}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="screen-action-button screen-action-button--quiet"
                        onClick={() => duplicateScreen(screen.id)}
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        className="screen-action-button screen-action-button--quiet"
                        onClick={() => {
                          savePersonalTemplate(screen.id === activeScreenId ? { ...screen, layoutConfig: widgets } : screen);
                          toast.success('Personal template saved');
                        }}
                      >
                        Save template
                      </button>
                      <button
                        type="button"
                        className="screen-action-button screen-action-button--quiet"
                        onClick={() => handleArchive(screen.id, !screen.archived)}
                      >
                        {screen.archived ? 'Restore' : 'Archive'}
                      </button>
                      <button
                        type="button"
                        className="screen-action-button screen-action-button--danger"
                        onClick={() => handleDelete(screen.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          {visibleScreens.length === 0 && <p className="screen-manager__panel-copy">No matching screens.</p>}

          {personalTemplates.length > 0 && (
            <details className="personal-template-library">
              <summary>Manage personal templates ({personalTemplates.length})</summary>
              <ul>
                {personalTemplates.map((item) => (
                  <li key={item.id}>
                    <span><strong>{item.name}</strong><small>{item.description}</small></span>
                    <button type="button" className="screen-action-button screen-action-button--danger" onClick={() => deletePersonalTemplate(item.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
