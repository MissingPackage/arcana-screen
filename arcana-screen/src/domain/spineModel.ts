// The session spine: the night's 3–5 beats plus a pacing read against the wall-clock,
// so a DM can see "still on beat 1 of 4, 95 minutes in" and cut a dragging scene.
export interface SessionSpine {
  beats: string[];
  currentIndex: number;
  startedAt: number | null; // ms epoch when the session clock was started
  plannedMinutes: number; // the night's target length
}

export type SpinePace = 'idle' | 'ahead' | 'on-track' | 'behind';

export const createDefaultSpine = (): SessionSpine => ({
  beats: ['Hook', 'Rising action', 'Turn', 'Climax'],
  currentIndex: 0,
  startedAt: null,
  plannedMinutes: 180,
});

export const startSpine = (spine: SessionSpine, at: number): SessionSpine => ({ ...spine, startedAt: at });

export const advanceSpineBeat = (spine: SessionSpine): SessionSpine => ({
  ...spine,
  currentIndex: Math.min(spine.beats.length - 1, spine.currentIndex + 1),
});

export const spineElapsedMinutes = (spine: SessionSpine, now: number): number =>
  spine.startedAt === null ? 0 : Math.max(0, Math.floor((now - spine.startedAt) / 60000));

// Where the night SHOULD be by now, if beats were spread evenly across the planned length.
const expectedIndex = (spine: SessionSpine, now: number): number =>
  Math.min(spine.beats.length - 1, Math.floor((spineElapsedMinutes(spine, now) / spine.plannedMinutes) * spine.beats.length));

export const spinePace = (spine: SessionSpine, now: number): SpinePace => {
  if (spine.startedAt === null || spine.beats.length === 0) return 'idle';
  const expected = expectedIndex(spine, now);
  if (spine.currentIndex > expected) return 'ahead'; // burning through the arc faster than the clock
  if (spine.currentIndex < expected) return 'behind'; // clock is moving, the story isn't — a scene is dragging
  return 'on-track';
};
