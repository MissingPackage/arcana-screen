import { memo, useEffect } from 'react';
import { useWidgetStore, type Widget } from '../../store/useWidgetStore';

interface CounterProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
}

function Counter({ id, updateWidget }: CounterProps) {
  const widget = useWidgetStore((state) => state.widgets.find((item) => item.id === id));

  useEffect(() => {
    if (widget && widget.counterValue === undefined) {
      updateWidget(id, {
        counterName: 'Resource counter',
        counterValue: 0,
        counterMin: 0,
        counterMax: 20,
        counterThreshold: 5,
      });
    }
  }, [id, updateWidget, widget]);

  if (!widget) return <div className="tool-empty-state">Loading counter…</div>;

  const min = widget.counterMin ?? 0;
  const max = Math.max(min + 1, widget.counterMax ?? 20);
  const value = Math.min(max, Math.max(min, widget.counterValue ?? 0));
  const threshold = Math.min(max, Math.max(min, widget.counterThreshold ?? min));
  const percent = ((value - min) / (max - min)) * 100;
  const setValue = (next: number) => updateWidget(id, { counterValue: Math.min(max, Math.max(min, next)) });

  return (
    <div className={`surface resource-counter${value <= threshold ? ' resource-counter--warning' : ''}`}>
      <input
        className="resource-counter__name"
        value={widget.counterName ?? ''}
        onChange={(event) => updateWidget(id, { counterName: event.target.value })}
        aria-label="Counter name"
      />
      <output className="resource-counter__value" aria-live="polite">{value}</output>
      <div className="resource-counter__bar" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
      <div className="resource-counter__actions">
        {[-5, -1, 1, 5].map((step) => (
          <button key={step} type="button" onClick={() => setValue(value + step)}>{step > 0 ? `+${step}` : step}</button>
        ))}
        <button type="button" onClick={() => setValue(min)}>Reset</button>
      </div>
      <fieldset className="resource-counter__limits">
        <legend>Limits</legend>
        <label>Min<input type="number" value={min} onChange={(event) => updateWidget(id, { counterMin: Number(event.target.value), counterValue: Math.max(Number(event.target.value), value) })} /></label>
        <label>Max<input type="number" value={max} onChange={(event) => updateWidget(id, { counterMax: Math.max(min + 1, Number(event.target.value)), counterValue: Math.min(Math.max(min + 1, Number(event.target.value)), value) })} /></label>
        <label>Warn at<input type="number" value={threshold} onChange={(event) => updateWidget(id, { counterThreshold: Number(event.target.value) })} /></label>
      </fieldset>
      {value <= threshold && <p className="resource-counter__warning" role="status">Threshold reached</p>}
    </div>
  );
}

export default memo(Counter);
