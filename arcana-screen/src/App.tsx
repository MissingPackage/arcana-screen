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

function App() {
  const { theme, reducedMotion, toggleTheme, toggleReducedMotion } = useThemeStore();
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
  const updateActiveFocusWorkspace = useScreenStore((state) => state.updateActiveFocusWorkspace);
  const [screenIsHydrated, setScreenIsHydrated] = useState(false);
  const screens = useScreenStore((state) => state.screens);
  const hasQuickCapture = widgets.some((widget) => widget.type === 'QuickCapture');

  useEffect(() => {
    hydrateActiveScreen();
    setScreenIsHydrated(true);
  }, [hydrateActiveScreen]);

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

  if (screenIsHydrated && screens.length === 0) {
    return <FirstRun />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
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
              <button
                type="button"
                className="screen-action-button"
                disabled={activeMode === 'prepare' && !hasQuickCapture}
                title={activeMode === 'run' || hasQuickCapture ? 'Focus Quick Capture (Ctrl/Cmd + Shift + K)' : 'Add Quick Capture in Prepare'}
                onClick={() => window.dispatchEvent(new Event('arcana:focus-capture'))}
              >
                Quick capture
              </button>
              <span className="layout-protection"><LockKey size={17} /> {activeMode === 'run' ? 'Layout protected' : 'Editing layout'}</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="header-icon-button"
                aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
              >
                {theme === 'dark' ? <Sun size={19} /> : <MoonStars size={19} />}
              </button>
              <details className="header-resources">
                <summary className="header-icon-button" aria-label="Help and resources">
                  <Question size={19} aria-hidden="true" />
                </summary>
                <div className="header-resources__panel" aria-label="Help and resources">
                  <button type="button" onClick={restartTour}>Restart guide</button>
                  <button
                    type="button"
                    onClick={toggleReducedMotion}
                    aria-pressed={reducedMotion}
                    aria-label={reducedMotion ? 'Enable interface motion' : 'Reduce interface motion'}
                  >
                    {reducedMotion ? 'Enable motion' : 'Reduce motion'}
                  </button>
                  {activeMode === 'prepare' && <DataManager />}
                  <a href={`${import.meta.env.BASE_URL}privacy.html`}>Privacy</a>
                  <a href="https://github.com/MissingPackage/arcana-screen/issues/new/choose" target="_blank" rel="noreferrer">Send feedback</a>
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
              <Grid mode={activeMode} />
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
