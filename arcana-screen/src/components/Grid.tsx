import { useDrag, useDrop } from 'react-dnd';
import { useCallback } from 'react';
import { useWidgetStore } from '../store/useWidgetStore';
import type { WidgetDisplaySize } from '../store/useWidgetStore';
import type { ScreenMode } from '../store/useScreenStore';
import { createToolInstance, getToolDefinitionByType } from './widgets/toolRegistry';
import ToolFrame from './ToolFrame';

const GridItemType = 'GRID_WIDGET';
const SidebarItemType = 'SIDEBAR_WIDGET';

interface DraggableBoxProps {
  id: string;
  index: number;
  moveItem: (from: number, to: number) => void;
  children: React.ReactNode;
  canDrag: boolean;
}

function DraggableBox({ id, index, moveItem, children, canDrag }: DraggableBoxProps) {
  const [, drag] = useDrag({
    type: GridItemType,
    item: { id, index },
    canDrag,
  });

  const [, drop] = useDrop({
    accept: GridItemType,
    hover: (dragged: { id: string; index: number }) => {
      if (!canDrag) return;
      if (dragged.index !== index) {
        moveItem(dragged.index, index);
        dragged.index = index;
      }
    },
  });

  return (
    <div
      ref={node => {
        drag(drop(node));
      }}
      className={`w-full h-full ${canDrag ? 'cursor-grab' : ''}`}
    >
      {children}
    </div>
  );
}

interface GridProps {
  mode: ScreenMode;
}

const sizeClass: Record<WidgetDisplaySize, string> = {
  compact: 'widget-frame--compact',
  standard: 'widget-frame--standard',
  wide: 'widget-frame--wide',
};

export default function Grid({ mode }: GridProps) {
  const widgets = useWidgetStore((state) => state.widgets);
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const removeWidget = useWidgetStore((state) => state.removeWidget);
  const addWidget = useWidgetStore((state) => state.addWidget);
  const moveWidget = useWidgetStore((state) => state.moveWidget);
  const setWidgetDisplaySize = useWidgetStore((state) => state.setWidgetDisplaySize);
  const structuralHistory = useWidgetStore((state) => state.structuralHistory);
  const undoStructuralChange = useWidgetStore((state) => state.undoStructuralChange);
  const isPrepare = mode === 'prepare';

  const moveItem = useCallback((from: number, to: number) => {
    if (from === to) return;
    moveWidget(from, to);
  }, [moveWidget]);

  // Global drop target for the grid
  const [, drop] = useDrop({
    accept: SidebarItemType,
    drop: (item: { widgetType?: string }) => {
      if (isPrepare && item.widgetType) {
        addWidget(createToolInstance(item.widgetType));
      }
    },
    canDrop: (item: { widgetType?: string }) => isPrepare && !!item.widgetType,
  });

  return (
    <section className="workspace" data-mode={mode}>
      {isPrepare && (
        <div className="workspace-toolbar" aria-label="Layout controls">
          <div>
            <strong>Prepare layout</strong>
            <span>Add tools from the library, then order and size them here.</span>
          </div>
          <button
            type="button"
            className="screen-action-button screen-action-button--quiet"
            disabled={structuralHistory.length === 0}
            onClick={undoStructuralChange}
          >
            Undo layout change
          </button>
        </div>
      )}
      <div
        ref={(node) => {
          drop(node);
        }}
        className="workspace-grid"
      >
        {widgets.length === 0 && (
          <div className="surface workspace-empty">
            <h2>No tools on this screen</h2>
            <p>
              {isPrepare
                ? 'Add a tool from the library to begin.'
                : 'Switch to Prepare to add tools to this screen.'}
            </p>
          </div>
        )}
        {widgets.map((widget, index) => {
          const definition = getToolDefinitionByType(widget.type);
          const displaySize = widget.displaySize ?? 'standard';
          if (!definition) {
            return (
              <article key={widget.id} className="surface unknown-tool">
                <h2>Unsupported tool</h2>
                <p>{widget.type}</p>
                {isPrepare && (
                  <button
                    type="button"
                    className="screen-action-button screen-action-button--danger"
                    onClick={() => removeWidget(widget.id)}
                  >
                    Remove tool
                  </button>
                )}
              </article>
            );
          }
          return (
            <article
              key={widget.id}
              className={`widget-frame ${sizeClass[displaySize]}`}
              data-tool-type={definition.type}
              data-tool-schema={widget.schemaVersion ?? definition.stateVersion}
            >
              <ToolFrame
                definition={definition}
                mode={mode}
                index={index}
                total={widgets.length}
                displaySize={displaySize}
                onMove={(to) => moveItem(index, to)}
                onSizeChange={(size) => setWidgetDisplaySize(widget.id, size)}
                onRemove={() => removeWidget(widget.id)}
              >
                <DraggableBox id={widget.id} index={index} moveItem={moveItem} canDrag={isPrepare}>
                  {definition.render(widget, { updateWidget, removeWidget })}
                </DraggableBox>
              </ToolFrame>
            </article>
          );
        })}
      </div>
    </section>
  );
}
