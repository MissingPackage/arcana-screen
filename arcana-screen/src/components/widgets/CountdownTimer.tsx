import { useEffect, useRef, memo } from 'react';
import { useWidgetStore, Widget } from '../../store/useWidgetStore';
import WidgetHelpButton from '../WidgetHelpButton/WidgetHelpButton';

interface CountdownTimerProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
}

function CountdownTimer({ id, updateWidget }: CountdownTimerProps) {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (widget && (widget.seconds === undefined || widget.isRunning === undefined)) {
      updateWidget(id, {
        seconds: widget.seconds ?? 60,
        isRunning: widget.isRunning ?? false,
      });
    }
  }, [widget, id, updateWidget]);

  const seconds = widget?.seconds ?? 60;
  const isRunning = widget?.isRunning ?? false;

  const setSeconds = (s: number) => updateWidget(id, { seconds: s });
  const setIsRunning = (r: boolean) => updateWidget(id, { isRunning: r });

  const startTimer = () => {
    if (isRunning || seconds <= 0) return;
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      const current = useWidgetStore.getState().widgets.find(w => w.id === id)?.seconds ?? 0;
      if (current <= 1) {
        updateWidget(id, { seconds: 0, isRunning: false });
      } else {
        updateWidget(id, { seconds: current - 1 });
      }
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, isRunning, updateWidget]);

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(60);
    setIsRunning(false);
  };

  const helpText = `Set a custom time using the number input at the bottom, then use the controls to manage the timer.

Start: Begin counting down from the current time.
Stop: Pause the timer at its current value.
Reset: Stop the timer and reset it back to 60 seconds.

The timer will automatically stop when it reaches 0 seconds.`;

  if (widget == null) return <div>Loading timer...</div>;
  return (
    <div className="surface p-4 rounded-lg shadow-md w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Countdown Timer</h2>
        <WidgetHelpButton helpText={helpText} />
      </div>

      <div className="text-4xl font-bold text-center">{seconds}s</div>

      <div className="flex gap-2 justify-center mt-4">
        <button
          onClick={startTimer}
          disabled={isRunning || seconds <= 0}
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
        >
          Start
        </button>
        <button
          onClick={stopTimer}
          className="px-3 py-2 rounded transition"
        >
          Stop
        </button>
        <button
          onClick={resetTimer}
          className="px-3 py-2 rounded transition"
        >
          Reset
        </button>
      </div>

      <div className="mt-4">
        <input
          type="number"
          value={seconds}
          onChange={(e) => setSeconds(Math.max(0, Number(e.target.value)))}
          className="w-full border rounded p-2 text-center"
          min={0}
        />
      </div>
    </div>
  );
}

export default memo(CountdownTimer);
