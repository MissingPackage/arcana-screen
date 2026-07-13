import { memo, useEffect, useMemo, useState } from 'react';
import { useWidgetStore, type Widget } from '../../store/useWidgetStore';

interface CountdownTimerProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  showHeader?: boolean;
}

const clampDuration = (seconds: number) => Math.min(24 * 60 * 60, Math.max(0, Math.round(seconds)));

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

function CountdownTimer({ id, updateWidget }: CountdownTimerProps) {
  const widget = useWidgetStore((state) => state.widgets.find((item) => item.id === id));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (widget && (widget.seconds === undefined || widget.timerDurationSeconds === undefined || widget.timerEndAt === undefined)) {
      updateWidget(id, {
        seconds: widget.seconds ?? 60,
        timerDurationSeconds: widget.timerDurationSeconds ?? widget.seconds ?? 60,
        timerEndAt: widget.timerEndAt ?? null,
        isRunning: widget.isRunning ?? false,
      });
    }
  }, [id, updateWidget, widget]);

  const remaining = useMemo(() => {
    if (!widget) return 0;
    if (widget.isRunning && widget.timerEndAt) {
      return Math.max(0, Math.ceil((widget.timerEndAt - now) / 1000));
    }
    return widget.seconds ?? 60;
  }, [now, widget]);

  useEffect(() => {
    if (!widget?.isRunning || !widget.timerEndAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [widget?.isRunning, widget?.timerEndAt]);

  useEffect(() => {
    if (widget?.isRunning && widget.timerEndAt && remaining === 0) {
      updateWidget(id, { seconds: 0, isRunning: false, timerEndAt: null });
    }
  }, [id, remaining, updateWidget, widget?.isRunning, widget?.timerEndAt]);

  if (!widget) return <div className="tool-empty-state">Loading timer…</div>;

  const duration = widget.timerDurationSeconds ?? 60;
  const minutes = Math.floor(duration / 60);
  const secondsPart = duration % 60;

  const setDuration = (nextMinutes: number, nextSeconds: number) => {
    const nextDuration = clampDuration(Math.max(0, nextMinutes) * 60 + Math.min(59, Math.max(0, nextSeconds)));
    updateWidget(id, {
      timerDurationSeconds: nextDuration,
      seconds: nextDuration,
      isRunning: false,
      timerEndAt: null,
    });
  };

  const start = () => {
    if (remaining <= 0 || widget.isRunning) return;
    updateWidget(id, {
      seconds: remaining,
      isRunning: true,
      timerEndAt: Date.now() + remaining * 1000,
    });
    setNow(Date.now());
  };

  const pause = () => {
    if (!widget.isRunning) return;
    updateWidget(id, { seconds: remaining, isRunning: false, timerEndAt: null });
  };

  const reset = () => {
    updateWidget(id, { seconds: duration, isRunning: false, timerEndAt: null });
  };

  return (
    <div className="surface countdown-timer">
      <output className={`timer-display ${remaining === 0 ? 'timer-display--complete' : ''}`} aria-live="polite">
        {formatDuration(remaining)}
      </output>
      <p className="timer-status">
        {remaining === 0 ? 'Time is up' : widget.isRunning ? 'Running from a reliable end timestamp' : 'Paused'}
      </p>

      <div className="timer-actions">
        <button type="button" className="screen-action-button" onClick={start} disabled={widget.isRunning || remaining <= 0}>Start</button>
        <button type="button" onClick={pause} disabled={!widget.isRunning}>Pause</button>
        <button type="button" onClick={reset}>Reset</button>
      </div>

      <fieldset className="timer-duration" disabled={widget.isRunning}>
        <legend>Set duration</legend>
        <label>
          <span>Minutes</span>
          <input type="number" min={0} max={1440} value={minutes} onChange={(event) => setDuration(Number(event.target.value) || 0, secondsPart)} />
        </label>
        <label>
          <span>Seconds</span>
          <input type="number" min={0} max={59} value={secondsPart} onChange={(event) => setDuration(minutes, Number(event.target.value) || 0)} />
        </label>
      </fieldset>
      <p className="timer-recovery-note">The countdown catches up after background tabs, sleep and reload.</p>
    </div>
  );
}

export default memo(CountdownTimer);
