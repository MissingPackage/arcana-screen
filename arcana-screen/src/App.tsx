import Grid from './components/Grid';
import { useThemeStore } from './store/themeStore';
import { Toaster } from 'react-hot-toast';
import WidgetSidebar from './components/WidgetSidebar/WidgetSidebar';
import './index.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import OnboardingTour from './components/OnboardingTour/OnboardingTour';
import { useTourStore } from './store/tourStore';
import { useEffect, useState } from 'react';
import ScreenManager from './components/ScreenManager/ScreenManager';
import { useScreenStore } from './store/useScreenStore';
import { useWidgetStore } from './store/useWidgetStore';
import { useAppStore } from './store/appStore';
import DataManager from './components/DataManager/DataManager';
import FirstRun from './components/FirstRun/FirstRun';
import RunWorkspace from './components/session/RunWorkspace';
import { CompassRose, LockKey, MoonStars, Question, Sun } from '@phosphor-icons/react';
import WorkspaceSearch from './components/WorkspaceSearch';
import EvolutionSettings from './components/EvolutionSettings';
import { useEvolutionStore } from './store/useEvolutionStore';

function App() {
  const { theme, reducedMotion, toggleTheme, toggleReducedMotion } = useThemeStore();
  const density = useEvolutionStore((state) => state.density);
  const locale = useEvolutionStore((state) => state.locale);
  const accentTheme = useEvolutionStore((state) => state.accentTheme);
  const customAccent = useEvolutionStore((state) => state.customAccent);
  const restartTour = useTourStore((state) => state.restartTour);
  const widgets = useWidgetStore((state) => state.widgets);
  const favoriteWidgetIds = useAppStore((state) => state.favoriteWidgetIds);
  const hydrateActiveScreen = useScreenStore((state) => state.hydrateActiveScreen);
  const saveActiveContent = useScreenStore((state) => state.saveActiveContent);
  const activeMode = useScreenStore((state) => {
    const active = state.screens.find((screen) => screen.id === state.activeScreenId);
    return active?.mode ?? 'prepare';
  });
  const activeScreen = useScreenStore((state) =>
    state.screens.find((screen) => screen.id === state.activeScreenId),
  );
  const setActiveFocus = useScreenStore((state) => state.setActiveFocus);
  const setActiveLayoutMode = useScreenStore((state) => state.setActiveLayoutMode);
  const updateActiveFocusWorkspace = useScreenStore((state) => state.updateActiveFocusWorkspace);
  const [screenIsHydrated, setScreenIsHydrated] = useState(false);
  const screens = useScreenStore((state) => state.screens);
  const hasQuickCapture = widgets.some((widget) => widget.type === 'QuickCapture');
  const copy = locale === 'it' ? {
    skip: 'Vai al contenuto principale', capture: 'Cattura rapida', addCapture: 'Aggiungi Cattura rapida in Preparazione',
    focusCapture: 'Vai a Cattura rapida (Ctrl/Cmd + Maiusc + K)', protected: 'Layout protetto', editing: 'Modifica layout',
    light: 'Usa tema chiaro', dark: 'Usa tema scuro', help: 'Aiuto e risorse', restart: 'Riavvia guida',
    enableMotion: 'Abilita animazioni', reduceMotion: 'Riduci animazioni', enableMotionAria: 'Abilita animazioni interfaccia', reduceMotionAria: 'Riduci animazioni interfaccia', privacy: 'Privacy', feedback: 'Invia feedback',
  } : {
    skip: 'Skip to main content', capture: 'Quick capture', addCapture: 'Add Quick Capture in Prepare',
    focusCapture: 'Focus Quick Capture (Ctrl/Cmd + Shift + K)', protected: 'Layout protected', editing: 'Editing layout',
    light: 'Use light theme', dark: 'Use dark theme', help: 'Help and resources', restart: 'Restart guide',
    enableMotion: 'Enable motion', reduceMotion: 'Reduce motion', enableMotionAria: 'Enable interface motion', reduceMotionAria: 'Reduce interface motion', privacy: 'Privacy', feedback: 'Send feedback',
  };
  const query = new URLSearchParams(window.location.search);
  const popoutWidgetId = query.get('popout');
  const isPresenterWindow = query.get('present') === '1';

  useEffect(() => {
    hydrateActiveScreen();
    setScreenIsHydrated(true);
  }, [hydrateActiveScreen]);

  useEffect(() => {
    const accent = accentTheme === 'ember'
      ? '#a5432d'
      : accentTheme === 'forest'
        ? '#2f7258'
        : accentTheme === 'custom'
          ? customAccent
          : '#3A506B';
    document.body.dataset.density = density;
    document.documentElement.lang = locale;
    document.documentElement.style.setProperty('--accent', accent);
  }, [accentTheme, customAccent, density, locale]);

  useEffect(() => {
    if (!screenIsHydrated) return;
    saveActiveContent(widgets, favoriteWidgetIds);
  }, [favoriteWidgetIds, saveActiveContent, screenIsHydrated, widgets]);

  useEffect(() => {
    const handleCaptureShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        window.dispatchEvent(new Event('arcana:focus-capture'));
      }
    };
    window.addEventListener('keydown', handleCaptureShortcut);
    return () => window.removeEventListener('keydown', handleCaptureShortcut);
  }, []);

  useEffect(() => {
    const syncWindow = (event: StorageEvent) => {
      if (event.key === 'arcana_screens') {
        void Promise.resolve(useScreenStore.persist.rehydrate()).then(() => hydrateActiveScreen());
      } else if (event.key === 'arcanaScreenLayout') {
        void useWidgetStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', syncWindow);
    return () => window.removeEventListener('storage', syncWindow);
  }, [hydrateActiveScreen]);

  if (screenIsHydrated && screens.length === 0) {
    return <FirstRun />;
  }

  if (screenIsHydrated && activeScreen && isPresenterWindow) {
    return (
      <div className="presenter-shell">
        <RunWorkspace
          workspace={activeScreen.focusWorkspace}
          onFocusChange={setActiveFocus}
          onWorkspaceChange={(workspace) => updateActiveFocusWorkspace(() => workspace)}
        />
      </div>
    );
  }

  if (screenIsHydrated && popoutWidgetId) {
    return (
      <DndProvider backend={HTML5Backend}>
        <main className="popout-shell">
          <Grid mode="run" onlyWidgetId={popoutWidgetId} />
        </main>
      </DndProvider>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <a className="skip-link" href="#main-content">{copy.skip}</a>
      <div className={`app-shell app-shell--${activeMode}`}>
        {/* Left sidebar */}
        {activeMode === 'prepare' && <WidgetSidebar />}

        {/* Main content area */}
        <div className="app-content">
          <Toaster />
          <header className="app-header arcana-header">
            <div className="app-header__brand">
              <CompassRose size={29} weight="light" aria-hidden="true" />
              <h1>ArcanaScreen</h1>
            </div>
            <ScreenManager />
            <div className="app-header__utilities">
              <WorkspaceSearch />
              <button
                type="button"
                className="screen-action-button"
                disabled={activeMode === 'prepare' && !hasQuickCapture}
                title={activeMode === 'run' || hasQuickCapture ? copy.focusCapture : copy.addCapture}
                onClick={() => window.dispatchEvent(new Event('arcana:focus-capture'))}
              >
                {copy.capture}
              </button>
              <span className="layout-protection"><LockKey size={17} /> {activeMode === 'run' ? copy.protected : copy.editing}</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="header-icon-button"
                aria-label={theme === 'dark' ? copy.light : copy.dark}
              >
                {theme === 'dark' ? <Sun size={19} /> : <MoonStars size={19} />}
              </button>
              <details className="header-resources">
                <summary className="header-icon-button" aria-label={copy.help}>
                  <Question size={19} aria-hidden="true" />
                </summary>
                <div className="header-resources__panel" aria-label={copy.help}>
                  <button type="button" onClick={restartTour}>{copy.restart}</button>
                  <button
                    type="button"
                    onClick={toggleReducedMotion}
                    aria-pressed={reducedMotion}
                    aria-label={reducedMotion ? copy.enableMotionAria : copy.reduceMotionAria}
                  >
                    {reducedMotion ? copy.enableMotion : copy.reduceMotion}
                  </button>
                  {activeMode === 'prepare' && <DataManager />}
                  <EvolutionSettings />
                  <a href={`${import.meta.env.BASE_URL}privacy.html`}>{copy.privacy}</a>
                  <a href="https://github.com/MissingPackage/arcana-screen/issues/new/choose" target="_blank" rel="noreferrer">{copy.feedback}</a>
                </div>
              </details>
            </div>
          </header>
          {activeMode === 'run' && activeScreen ? (
            <RunWorkspace
              workspace={activeScreen.focusWorkspace}
              onFocusChange={setActiveFocus}
              onWorkspaceChange={(workspace) => updateActiveFocusWorkspace(() => workspace)}
            />
          ) : (
            <main id="main-content" className="app-main" tabIndex={-1}>
              <Grid
                mode={activeMode}
                layoutMode={activeScreen?.layoutMode ?? 'grid'}
                onLayoutModeChange={setActiveLayoutMode}
              />
            </main>
          )}
        </div>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour />
    </DndProvider>
  );
}

export default App;
