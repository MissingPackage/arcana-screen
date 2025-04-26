import { useState, useEffect, useRef } from 'react';

export default function CountdownTimer() {
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(60);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

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