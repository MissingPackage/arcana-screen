import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppErrorBoundary from './components/AppErrorBoundary.tsx'
import { useScreenStore } from './store/useScreenStore'

// Both persisted stores hydrate synchronously from localStorage when imported, so the
// active Screen's widgets can be copied into the widget store before the first render.
// Doing it here instead of in an App effect means App never renders (or autosaves) the
// pre-hydration widget layout.
useScreenStore.getState().hydrateActiveScreen()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  });
}
