import { useState, type FormEvent } from 'react';
import { screenTemplateCatalog, templateLabel, type ScreenTemplate } from '../../store/screenTemplates';
import { useScreenStore } from '../../store/useScreenStore';
import { CompassRose } from '@phosphor-icons/react';

export default function FirstRun() {
  const createScreen = useScreenStore((state) => state.createScreen);
  const [template, setTemplate] = useState<ScreenTemplate>('general');
  const [name, setName] = useState('');
  const selected = screenTemplateCatalog.find((item) => item.id === template) ?? screenTemplateCatalog[0];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    createScreen(name.trim() || `${templateLabel[template]} Screen`, template);
  };

  return (
    <main className="first-run">
      <header className="first-run__brand">
        <span><CompassRose size={31} weight="light" aria-hidden="true" /> ArcanaScreen</span>
        <small>Your personal DM screen</small>
      </header>
      <section className="surface first-run__card" aria-labelledby="first-run-title">
        <div className="first-run__intro">
          <span className="screen-manager__eyebrow">Welcome to ArcanaScreen</span>
          <h1 id="first-run-title">Create a useful screen first</h1>
          <p>Choose the result you need for your next session. There is no required tour, and every tool includes help when you need it.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset className="first-run__templates">
            <legend>What would you like to start with?</legend>
            <div className="first-run__template-grid">
              {screenTemplateCatalog.map((item) => (
                <label key={item.id} className={`screen-template ${template === item.id ? 'screen-template--selected' : ''}`}>
                  <input type="radio" name="first-template" value={item.id} checked={template === item.id} onChange={() => setTemplate(item.id)} />
                  <span className="screen-template__name">{item.label}</span>
                  <span className="screen-template__description">{item.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <section className="template-preview" aria-live="polite">
            <div>
              <span className="screen-manager__eyebrow">Preview</span>
              <h2>{selected.label} Screen</h2>
              <p>{selected.outcome}</p>
            </div>
            {selected.tools.length ? (
              <ul>{selected.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
            ) : (
              <p className="tool-empty-state">No starter tools. The library opens in Prepare so you can build from scratch.</p>
            )}
          </section>

          <label className="screen-manager__field first-run__name">
            <span>Screen name <small>(optional)</small></span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder={`${selected.label} Screen`} />
          </label>

          <button type="submit" className="screen-action-button first-run__submit">
            Create {selected.label} Screen
          </button>
        </form>
      </section>
    </main>
  );
}
