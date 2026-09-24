import { Component, type ReactNode } from 'react';

interface WidgetErrorBoundaryProps {
  toolName: string;
  children: ReactNode;
}

interface WidgetErrorBoundaryState {
  error: Error | null;
}

// One tool failing to render must not take the whole Screen down to the app-level
// recovery page (AppErrorBoundary): the other tools stay usable mid-session. The
// widget's stored data is untouched, so Retry re-renders from the same state.
export default class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  state: WidgetErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { error };
  }

  componentDidCatch() {
    // The recovery surface intentionally avoids external telemetry.
  }

  private retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="tool-empty-state" role="alert">
        <p>{this.props.toolName} could not render. The other tools keep working and its data is unchanged.</p>
        <button type="button" className="screen-action-button" onClick={this.retry}>
          Retry
        </button>
      </div>
    );
  }
}
