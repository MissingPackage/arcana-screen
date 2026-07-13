import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { screenTemplateCatalog, templateLabel, type ScreenTemplate } from '../../store/screenTemplates';
import { useScreenStore } from '../../store/useScreenStore';
import type { ScreenMode } from '../../store/useScreenStore';
import { useTrustStore } from '../../store/trustStore';

export default function ScreenManager() {
  const screens = useScreenStore((state) => state.screens);
  const activeScreenId = useScreenStore((state) => state.activeScreenId);
  const createScreen = useScreenStore((state) => state.createScreen);
  const openScreen = useScreenStore((state) => state.openScreen);
  const renameScreen = useScreenStore((state) => state.renameScreen);
  const duplicateScreen = useScreenStore((state) => state.duplicateScreen);
  const deleteScreen = useScreenStore((state) => state.deleteScreen);
  const restoreDeletedScreen = useScreenStore((state) => state.restoreDeletedScreen);
  const setActiveMode = useScreenStore((state) => state.setActiveMode);
  const saveStatus = useTrustStore((state) => state.status);
  const saveMessage = useTrustStore((state) => state.message);

  const [isCreating, setIsCreating] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<ScreenTemplate>('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
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

  return (
    <section className="screen-manager" aria-label="Screen controls">
      <div className="screen-manager__primary">
        <div className="min-w-0">
          <p className="screen-manager__eyebrow">Current screen</p>
          <select
            className="screen-manager__select"
            aria-label="Current screen"
            value={activeScreen?.id ?? ''}
            onChange={(event) => openScreen(event.target.value)}
          >
            {screens.map((screen) => (
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
              Prepare
            </button>
            <button
              type="button"
              className="screen-mode__button"
              aria-pressed={activeMode === 'run'}
              onClick={() => handleModeChange('run')}
            >
              Run
            </button>
          </div>
          <span
            className={`screen-manager__saved screen-manager__saved--${saveStatus}`}
            role="status"
            title={saveMessage ?? undefined}
          >
            {saveStatus === 'saving'
              ? 'Saving…'
              : saveStatus === 'error'
                ? 'Save issue'
                : 'Saved locally'}
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
                Manage screens
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
                New screen
              </button>
            </>
          )}
        </div>
      </div>

      <p className="screen-mode__status" role="status">
        {activeMode === 'prepare'
          ? 'Prepare mode · Layout editing is available.'
          : 'Run mode · Layout is protected while tools remain active.'}
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

          <ul className="screen-list">
            {screens.map((screen) => (
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
                        {screen.id === activeScreenId ? ' · Current' : ''}
                      </span>
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
        </div>
      )}
    </section>
  );
}
