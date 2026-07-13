import { Component, type ReactNode } from 'react';
import { exportRawLocalData, resetArcanaData } from '../utils/dataPortability';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
  confirmReset: boolean;
}

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
    confirmReset: false,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error, confirmReset: false };
  }

  componentDidCatch() {
    // The recovery surface intentionally avoids external telemetry.
  }

  private retry = () => {
    this.setState({ error: null, confirmReset: false });
  };

  private reset = () => {
    if (!this.state.confirmReset) {
      this.setState({ confirmReset: true });
      return;
    }
    resetArcanaData();
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="error-recovery">
        <section className="surface error-recovery__card" role="alert">
          <p className="error-recovery__eyebrow">ArcanaScreen recovery</p>
          <h1>The workspace could not render safely</h1>
          <p>
            Your local data has not been sent anywhere. Retry first, or export the raw payload
            before resetting this browser.
          </p>
          <details>
            <summary>Technical detail</summary>
            <pre>{this.state.error.message}</pre>
          </details>
          <div className="error-recovery__actions">
            <button type="button" className="screen-action-button" onClick={this.retry}>
              Retry
            </button>
            <button
              type="button"
              className="screen-action-button screen-action-button--quiet"
              onClick={exportRawLocalData}
            >
              Export raw data
            </button>
            <button
              type="button"
              className="screen-action-button screen-action-button--danger"
              onClick={this.reset}
            >
              {this.state.confirmReset ? 'Confirm local reset' : 'Reset local data'}
            </button>
          </div>
          {this.state.confirmReset && (
            <p className="data-manager__warning">
              This permanently removes ArcanaScreen data from this browser.
            </p>
          )}
        </section>
      </main>
    );
  }
}
