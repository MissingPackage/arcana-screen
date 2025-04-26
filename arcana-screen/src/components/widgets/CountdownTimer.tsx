import { useEffect, useRef } from 'react';
import { useWidgetStore } from '../../store/useWidgetStore';

interface CountdownTimerProps {
  id: string;
  updateWidget: (id: string, updates: any) => void;
}

export default function CountdownTimer({ id, updateWidget }: CountdownTimerProps) {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!widget?.seconds || widget.isRunning === undefined) {
      updateWidget(id, { seconds: 60, isRunning: false });
    }
  }, [widget, id, updateWidget]);

  const seconds = widget?.seconds || 60;
  const isRunning = widget?.isRunning || false;

  const setSeconds = (s: number) => updateWidget(id, { seconds: s });
  const setIsRunning = (r: boolean) => updateWidget(id, { isRunning: r });

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      // compute next seconds value
      const current = useWidgetStore.getState().widgets.find(w => w.id === id)?.seconds || 60;
      if (current <= 1) {
        clearInterval(timerRef.current!);
        setIsRunning(false);
        setSeconds(0);
      } else {
        setSeconds(current - 1);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(60);
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  if (widget == null) return <div>Loading timer...</div>;
  return (
    <div className="bg-green-100 text-gray-900 p-4 rounded-lg shadow-md w-full h-full flex flex-col justify-between">
      <h2 className="text-lg font-bold mb-2">Countdown Timer</h2>

      <div className="text-4xl font-bold text-center">{seconds}s</div>

      <div className="flex gap-2 justify-center mt-4">
        <button
          onClick={startTimer}
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
        >
          Start
        </button>
        <button
          onClick={stopTimer}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
        >
          Stop
        </button>
        <button
          onClick={resetTimer}
          className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      <div className="mt-4">
        <input
          type="number"
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
          className="w-full border rounded p-2 text-center"
          min={1}
        />
      </div>
    </div>
  );
}