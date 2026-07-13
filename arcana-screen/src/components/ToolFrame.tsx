import { useState, type ReactNode } from 'react';
import type { ScreenMode } from '../store/useScreenStore';
import { useTrustStore } from '../store/trustStore';
import type { WidgetDisplaySize } from '../store/useWidgetStore';
import type { ToolDefinition } from './widgets/toolRegistry';
import WidgetHelpButton from './WidgetHelpButton/WidgetHelpButton';

interface ToolFrameProps {
  definition: ToolDefinition;
  mode: ScreenMode;
  index: number;
  total: number;
  displaySize: WidgetDisplaySize;
  onMove: (to: number) => void;
  onSizeChange: (size: WidgetDisplaySize) => void;
  onRemove: () => void;
  children: ReactNode;
}

export default function ToolFrame({
  definition,
  mode,
  index,
  total,
  displaySize,
  onMove,
  onSizeChange,
  onRemove,
  children,
}: ToolFrameProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const isPrepare = mode === 'prepare';
  const saveStatus = useTrustStore((state) => state.status);
  const saveLabel =
    saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Storage attention' : 'Saved';

  return (
    <>
      <header className="tool-chrome">
        <div className="tool-chrome__identity">
          <span>{definition.category}</span>
          <h2>{definition.name}</h2>
        </div>
        <span className="tool-chrome__state" aria-live="polite">{saveLabel}</span>
        <WidgetHelpButton helpText={definition.description} />
        {isPrepare && (
          <button
            type="button"
            className="screen-action-button screen-action-button--quiet"
            aria-expanded={isConfigOpen}
            onClick={() => setIsConfigOpen((value) => !value)}
          >
            Configure
          </button>
        )}
      </header>

      {isPrepare && isConfigOpen && (
        <div className="widget-edit-toolbar" aria-label={`Configuration for ${definition.name}`}>
          <button
            type="button"
            className="screen-action-button screen-action-button--quiet"
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
          >
            Move earlier
          </button>
          <button
            type="button"
            className="screen-action-button screen-action-button--quiet"
            disabled={index === total - 1}
            onClick={() => onMove(index + 1)}
          >
            Move later
          </button>
          <label className="widget-edit-toolbar__size">
            <span>Size</span>
            <select
              aria-label={`Size of ${definition.name}`}
              value={displaySize}
              onChange={(event) => onSizeChange(event.target.value as WidgetDisplaySize)}
            >
              <option value="compact">Compact</option>
              <option value="standard">Standard</option>
              <option value="wide">Wide</option>
            </select>
          </label>
          <button
            type="button"
            className="screen-action-button screen-action-button--danger"
            onClick={onRemove}
          >
            Remove tool
          </button>
        </div>
      )}

      <div className="tool-body">{children}</div>
    </>
  );
}
