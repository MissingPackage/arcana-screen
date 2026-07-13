export interface TimerState {
  durationSeconds: number;
  remainingSeconds: number;
  endAt: number | null;
  running: boolean;
}

export const remainingSeconds = (timer: TimerState, now: number) => {
  if (!timer.running || timer.endAt === null) return Math.max(0, timer.remainingSeconds);
  return Math.max(0, Math.ceil((timer.endAt - now) / 1000));
};

export const startTimer = (timer: TimerState, now: number): TimerState => {
  const remaining = remainingSeconds(timer, now);
  if (remaining <= 0) return { ...timer, running: false, endAt: null };
  return {
    ...timer,
    remainingSeconds: remaining,
    running: true,
    endAt: now + remaining * 1000,
  };
};

export const pauseTimer = (timer: TimerState, now: number): TimerState => ({
  ...timer,
  remainingSeconds: remainingSeconds(timer, now),
  running: false,
  endAt: null,
});

export const resetTimer = (timer: TimerState): TimerState => ({
  ...timer,
  remainingSeconds: timer.durationSeconds,
  running: false,
  endAt: null,
});
