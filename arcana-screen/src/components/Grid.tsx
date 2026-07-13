import { useDrag, useDrop } from 'react-dnd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWidgetStore } from '../store/useWidgetStore';
import type {
  DeviceProfile,
  Widget,
  WidgetDisplaySize,
  WidgetGeometry,
} from '../store/useWidgetStore';
import type { ScreenMode } from '../store/useScreenStore';
import { createToolInstance, getToolDefinitionByType } from './widgets/toolRegistry';
import ToolFrame from './ToolFrame';
import { getDeviceProfile, observeDeviceProfile } from '../utils/deviceProfile';

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
  const [, drag] = useDrag({ type: GridItemType, item: { id, index }, canDrag });
  const [, drop] = useDrop({
    accept: GridItemType,
    hover: (dragged: { id: string; index: number }) => {
      if (!canDrag || dragged.index === index) return;
      moveItem(dragged.index, index);
      dragged.index = index;
    },
  });

  return (
    <div ref={(node) => { drag(drop(node)); }} className={`w-full h-full ${canDrag ? 'cursor-grab' : ''}`}>
      {children}
    </div>
  );
}

interface GridProps {
  mode: ScreenMode;
  layoutMode?: 'grid' | 'canvas';
  onLayoutModeChange?: (mode: 'grid' | 'canvas') => void;
  onlyWidgetId?: string;
}

const sizeClass: Record<WidgetDisplaySize, string> = {
  compact: 'widget-frame--compact',
  standard: 'widget-frame--standard',
  wide: 'widget-frame--wide',
};

const defaultGeometry = (widget: Widget, index: number): WidgetGeometry => ({
  x: widget.position?.x || (index % 2) * 520,
  y: widget.position?.y || Math.floor(index / 2) * 420,
  w: widget.size?.w && widget.size.w > 10 ? widget.size.w : 500,
  h: widget.size?.h && widget.size.h > 10 ? widget.size.h : 380,
});

export default function Grid({ mode, layoutMode = 'grid', onLayoutModeChange, onlyWidgetId }: GridProps) {
  const widgets = useWidgetStore((state) => state.widgets);
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const removeWidget = useWidgetStore((state) => state.removeWidget);
  const addWidget = useWidgetStore((state) => state.addWidget);
  const moveWidget = useWidgetStore((state) => state.moveWidget);
  const setWidgetDisplaySize = useWidgetStore((state) => state.setWidgetDisplaySize);
  const setWidgetGeometry = useWidgetStore((state) => state.setWidgetGeometry);
  const structuralHistory = useWidgetStore((state) => state.structuralHistory);
  const undoStructuralChange = useWidgetStore((state) => state.undoStructuralChange);
  const [focusedWidgetId, setFocusedWidgetId] = useState<string | null>(onlyWidgetId ?? null);
  const [sidecarWidgetId, setSidecarWidgetId] = useState<string | null>(null);
  const [draftGeometry, setDraftGeometry] = useState<Record<string, WidgetGeometry>>({});
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile>(() => getDeviceProfile());
  const isPrepare = mode === 'prepare';

  useEffect(() => observeDeviceProfile(setDeviceProfile), []);

  const moveItem = useCallback((from: number, to: number) => {
    if (from !== to) moveWidget(from, to);
  }, [moveWidget]);

  const [, drop] = useDrop({
    accept: SidebarItemType,
    drop: (item: { widgetType?: string }) => {
      if (isPrepare && item.widgetType) addWidget(createToolInstance(item.widgetType));
    },
    canDrop: (item: { widgetType?: string }) => isPrepare && Boolean(item.widgetType),
  });

  const visibleWidgets = useMemo(() => {
    if (onlyWidgetId) return widgets.filter((widget) => widget.id === onlyWidgetId);
    if (focusedWidgetId) return widgets.filter((widget) => widget.id === focusedWidgetId);
    return widgets.filter((widget) => widget.id !== sidecarWidgetId);
  }, [focusedWidgetId, onlyWidgetId, sidecarWidgetId, widgets]);

  const sidecarWidget = !focusedWidgetId && !onlyWidgetId
    ? widgets.find((widget) => widget.id === sidecarWidgetId)
    : undefined;

  const canvasHeight = useMemo(() => Math.max(640, ...visibleWidgets.map((widget, index) => {
    const geometry = widget.deviceLayouts?.[deviceProfile] ?? defaultGeometry(widget, index);
    return geometry.y + geometry.h + 40;
  })), [deviceProfile, visibleWidgets]);

  const openToolWindow = (widgetId: string) => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('popout', widgetId);
    window.open(url, `arcana-tool-${widgetId}`, 'popup=yes,width=720,height=820');
  };

  const openPresenter = () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('present', '1');
    window.open(url, 'arcana-presenter', 'popup=yes,width=1440,height=900');
  };

  const startCanvasMove = (event: React.PointerEvent<HTMLButtonElement>, widgetId: string, geometry: WidgetGeometry) => {
    event.preventDefault();
    const origin = { x: event.clientX, y: event.clientY };
    let current = geometry;
    const handleMove = (moveEvent: PointerEvent) => {
      current = {
        ...geometry,
        x: Math.max(0, Math.round(geometry.x + moveEvent.clientX - origin.x)),
        y: Math.max(0, Math.round(geometry.y + moveEvent.clientY - origin.y)),
      };
      setDraftGeometry((drafts) => ({ ...drafts, [widgetId]: current }));
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      setWidgetGeometry(widgetId, deviceProfile, current);
      setDraftGeometry((drafts) => {
        const next = { ...drafts };
        delete next[widgetId];
        return next;
      });
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp, { once: true });
  };

  const renderWidget = (widget: Widget, index: number, sidecar = false) => {
    const definition = getToolDefinitionByType(widget.type);
    const displaySize = widget.displaySize ?? 'standard';
    const geometry = draftGeometry[widget.id] ?? widget.deviceLayouts?.[deviceProfile] ?? defaultGeometry(widget, index);
    if (!definition) {
      return (
        <article
          key={widget.id}
          className="surface unknown-tool"
          style={layoutMode === 'canvas' && !sidecar ? {
            position: 'absolute', left: geometry.x, top: geometry.y, width: geometry.w, height: geometry.h,
          } : undefined}
        >
          <h2>Unsupported tool</h2>
          <p>{widget.type}</p>
          {isPrepare && <button type="button" className="screen-action-button screen-action-button--danger" onClick={() => removeWidget(widget.id)}>Remove tool</button>}
        </article>
      );
    }

    return (
      <article
        key={`${sidecar ? 'sidecar-' : ''}${widget.id}`}
        className={`widget-frame ${sizeClass[displaySize]}${sidecar ? ' widget-frame--sidecar' : ''}`}
        data-tool-type={definition.type}
        data-tool-schema={widget.schemaVersion ?? definition.stateVersion}
        style={layoutMode === 'canvas' && !sidecar ? {
          position: 'absolute', left: geometry.x, top: geometry.y, width: geometry.w, height: geometry.h, zIndex: widget.widgetZIndex ?? index + 1,
        } : undefined}
        onPointerUp={(event) => {
          if (layoutMode !== 'canvas' || sidecar) return;
          const element = event.currentTarget;
          if (Math.abs(element.offsetWidth - geometry.w) > 1 || Math.abs(element.offsetHeight - geometry.h) > 1) {
            setWidgetGeometry(widget.id, deviceProfile, { ...geometry, w: element.offsetWidth, h: element.offsetHeight });
          }
        }}
      >
        <ToolFrame
          definition={definition}
          mode={mode}
          index={index}
          total={widgets.length}
          displaySize={displaySize}
          isFocused={focusedWidgetId === widget.id}
          isSidecar={sidecarWidgetId === widget.id}
          onToggleFocus={() => setFocusedWidgetId((current) => current === widget.id ? null : widget.id)}
          onToggleSidecar={() => setSidecarWidgetId((current) => current === widget.id ? null : widget.id)}
          onPopout={() => openToolWindow(widget.id)}
          isCanvas={layoutMode === 'canvas'}
          deviceProfile={deviceProfile}
          geometry={geometry}
          onGeometryChange={(next) => setWidgetGeometry(widget.id, deviceProfile, next)}
          zIndex={widget.widgetZIndex ?? index + 1}
          onZIndexChange={(widgetZIndex) => updateWidget(widget.id, { widgetZIndex })}
          onCanvasMoveStart={(event) => startCanvasMove(event, widget.id, geometry)}
          onMove={(to) => moveItem(index, to)}
          onSizeChange={(size) => setWidgetDisplaySize(widget.id, size)}
          onRemove={() => removeWidget(widget.id)}
        >
          <DraggableBox id={widget.id} index={index} moveItem={moveItem} canDrag={isPrepare && layoutMode === 'grid'}>
            {definition.render(widget, { updateWidget, removeWidget })}
          </DraggableBox>
        </ToolFrame>
      </article>
    );
  };

  return (
    <section className={`workspace workspace--${layoutMode}${sidecarWidget ? ' workspace--with-sidecar' : ''}`} data-mode={mode}>
      {isPrepare && !onlyWidgetId && (
        <div className="workspace-toolbar" aria-label="Layout controls">
          <div>
            <strong>{focusedWidgetId ? 'Focused tool' : layoutMode === 'canvas' ? `${deviceProfile} canvas` : 'Prepare layout'}</strong>
            <span>{focusedWidgetId ? 'Return to restore the previous workspace position.' : 'Grid is responsive; Canvas stores independent device geometry.'}</span>
          </div>
          <div className="workspace-toolbar__actions">
            {focusedWidgetId && <button type="button" onClick={() => setFocusedWidgetId(null)}>Return to layout</button>}
            {!focusedWidgetId && (
              <>
                <button type="button" aria-pressed={layoutMode === 'grid'} onClick={() => onLayoutModeChange?.('grid')} title="Auto-arranging responsive layout that adapts to the screen size">Grid</button>
                <button type="button" aria-pressed={layoutMode === 'canvas'} onClick={() => onLayoutModeChange?.('canvas')} title="Free-form layout: drag and resize each tool yourself">Canvas</button>
                <button type="button" onClick={openPresenter} title="Open this screen in a separate window for a second display">Second monitor</button>
              </>
            )}
            <button type="button" className="screen-action-button screen-action-button--quiet" disabled={structuralHistory.length === 0} onClick={undoStructuralChange} title="Undo the last layout change (add, remove, resize or reorder)">Undo layout change</button>
          </div>
        </div>
      )}

      <div className="workspace-stage">
        <div
          ref={(node) => { drop(node); }}
          className={`workspace-grid${layoutMode === 'canvas' ? ' workspace-grid--canvas' : ''}`}
          style={layoutMode === 'canvas' ? { height: canvasHeight } : undefined}
        >
          {visibleWidgets.length === 0 && <div className="surface workspace-empty"><h2>No tools on this screen</h2><p>Add a tool from the library to begin.</p></div>}
          {visibleWidgets.map((widget) => renderWidget(widget, widgets.indexOf(widget)))}
        </div>
        {sidecarWidget && <aside className="workspace-sidecar" aria-label="Tool sidecar">{renderWidget(sidecarWidget, widgets.indexOf(sidecarWidget), true)}</aside>}
      </div>
    </section>
  );
}
