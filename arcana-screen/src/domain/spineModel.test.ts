import { describe, expect, it } from 'vitest';
import { advanceSpineBeat, createDefaultSpine, spineElapsedMinutes, spinePace, startSpine } from './spineModel';

const MINUTE = 60_000;

describe('Session spine', () => {
  it('starts with four beats and an unstarted clock', () => {
    const spine = createDefaultSpine();
    expect(spine.beats).toHaveLength(4);
    expect(spine.currentIndex).toBe(0);
    expect(spine.startedAt).toBeNull();
  });

  it('advances the beat and clamps at the last one', () => {
    let spine = createDefaultSpine(); // 4 beats
    for (let i = 0; i < 6; i += 1) spine = advanceSpineBeat(spine);
    expect(spine.currentIndex).toBe(3);
  });

  it('reports elapsed minutes only once the clock is started', () => {
    const spine = createDefaultSpine();
    const now = 10_000_000;
    expect(spineElapsedMinutes(spine, now)).toBe(0);
    expect(spineElapsedMinutes(startSpine(spine, now - 95 * MINUTE), now)).toBe(95);
  });

  it('flags a dragging session as behind and a rushed one as ahead', () => {
    const now = 10_000_000;
    const started = startSpine(createDefaultSpine(), now - 95 * MINUTE); // ~53% of 180 min → expected beat 2
    expect(spinePace(started, now)).toBe('behind'); // still on beat 0
    expect(spinePace({ ...started, currentIndex: 2 }, now)).toBe('on-track');
    expect(spinePace({ ...started, currentIndex: 3 }, now)).toBe('ahead');
    expect(spinePace(createDefaultSpine(), now)).toBe('idle'); // clock not started
  });
});
