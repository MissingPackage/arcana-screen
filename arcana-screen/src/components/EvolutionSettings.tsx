import { useEvolutionStore } from '../store/useEvolutionStore';

export default function EvolutionSettings() {
  const density = useEvolutionStore((state) => state.density);
  const locale = useEvolutionStore((state) => state.locale);
  const accentTheme = useEvolutionStore((state) => state.accentTheme);
  const customAccent = useEvolutionStore((state) => state.customAccent);
  const setDensity = useEvolutionStore((state) => state.setDensity);
  const setLocale = useEvolutionStore((state) => state.setLocale);
  const setAccentTheme = useEvolutionStore((state) => state.setAccentTheme);
  const setCustomAccent = useEvolutionStore((state) => state.setCustomAccent);
  const italian = locale === 'it';

  return (
    <details className="evolution-settings">
      <summary>{italian ? 'Aspetto e lingua' : 'Appearance & language'}</summary>
      <div>
        <label>
          <span>{italian ? 'Densità' : 'Density'}</span>
          <select value={density} onChange={(event) => setDensity(event.target.value as typeof density)}>
            <option value="comfortable">{italian ? 'Comoda' : 'Comfortable'}</option>
            <option value="compact">{italian ? 'Compatta' : 'Compact'}</option>
          </select>
        </label>
        <label>
          <span>{italian ? 'Lingua' : 'Language'}</span>
          <select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)}>
            <option value="en">English</option>
            <option value="it">Italiano</option>
          </select>
        </label>
        <label>
          <span>{italian ? 'Tema accento' : 'Accent theme'}</span>
          <select value={accentTheme} onChange={(event) => setAccentTheme(event.target.value as typeof accentTheme)}>
            <option value="arcane">Arcane</option>
            <option value="ember">Ember</option>
            <option value="forest">Forest</option>
            <option value="custom">{italian ? 'Personalizzato' : 'Custom'}</option>
          </select>
        </label>
        <label>
          <span>{italian ? 'Colore personalizzato' : 'Custom color'}</span>
          <input type="color" value={customAccent} onChange={(event) => setCustomAccent(event.target.value)} />
        </label>
        <div className="cloud-sync-gate" role="note">
          <strong>{italian ? 'Sync cloud disattivata' : 'Cloud sync is off'}</strong>
          <span>{italian ? 'Nessun dato viene trasmesso. Il modello di minaccia e conflitto deve essere approvato prima di collegare un provider.' : 'No data is transmitted. The threat and conflict model must be approved before a provider is connected.'}</span>
          <a href={`${import.meta.env.BASE_URL}docs/cloud-sync-model.html`} target="_blank" rel="noreferrer">{italian ? 'Leggi il modello' : 'Read the model'}</a>
        </div>
      </div>
    </details>
  );
}
