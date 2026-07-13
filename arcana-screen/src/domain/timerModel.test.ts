import { describe, expect, it } from 'vitest';
import { pauseTimer, remainingSeconds, startTimer, type TimerState } from './timerModel';

const timer = (): TimerState => ({
  durationSeconds: 60,
  remainingSeconds: 60,
  endAt: null,
  running: false,
});

describe('Timestamp timer', () => {
  it('calculates elapsed time from the absolute end timestamp', () => {
    const running = startTimer(timer(), 1_000);
    expect(remainingSeconds(running, 31_000)).toBe(30);
  });

  it('pauses at the wall-clock remaining value', () => {
    const running = startTimer(timer(), 1_000);
    const paused = pauseTimer(running, 21_250);

    expect(paused.running).toBe(false);
    expect(paused.endAt).toBeNull();
    expect(paused.remainingSeconds).toBe(40);
  });

  it('never returns a negative duration after a long suspension', () => {
    const running = startTimer(timer(), 1_000);
    expect(remainingSeconds(running, 121_000)).toBe(0);
  });
});
