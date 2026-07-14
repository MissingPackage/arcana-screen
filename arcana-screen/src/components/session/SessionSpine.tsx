import { useEffect, useState } from 'react';
import { CaretRight, Play } from '@phosphor-icons/react';
import { advanceSpineBeat, spineElapsedMinutes, spinePace, startSpine, type SpinePace } from '../../domain/spineModel';
import type { RunWorkspaceProps } from './RunWorkspace';

const PACE_LABEL: Record<SpinePace, string> = {
  idle: 'Clock stopped',
  ahead: 'Ahead of plan',
  'on-track': 'On pace',
  behind: 'Running long',
};

// A quiet rail of the night's beats plus a wall-clock pacing read — "95 min in, still on beat 1 of 4".
export default function SessionSpine({ workspace, onWorkspaceChange }: Pick<RunWorkspaceProps, 'workspace' | 'onWorkspaceChange'>) {
  const spine = workspace.universal.spine;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (spine.startedAt === null) return;
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, [spine.startedAt]);

  const update = (next: typeof spine) => onWorkspaceChange({ ...workspace, universal: { ...workspace.universal, spine: next } });
  const pace = spinePace(spine, now);
  const elapsed = spineElapsedMinutes(spine, now);
  const atLastBeat = spine.currentIndex >= spine.beats.length - 1;

  return (
    <div className={`session-spine session-spine--${pace}`} role="group" aria-label="Session spine">
      <ol className="spine-beats">
        {spine.beats.map((beat, index) => (
          <li
            key={beat}
            className={index === spine.currentIndex ? 'is-current' : index < spine.currentIndex ? 'is-done' : ''}
            aria-current={index === spine.currentIndex ? 'step' : undefined}
          >
            {beat}
          </li>
        ))}
      </ol>
      <div className="spine-status">
        {spine.startedAt === null ? (
          <button type="button" className="spine-start" onClick={() => update(startSpine(spine, Date.now()))}>
            <Play size={12} weight="fill" /> Start session clock
          </button>
        ) : (
          <span className="spine-clock">{elapsed} min in · beat {spine.currentIndex + 1}/{spine.beats.length} · {PACE_LABEL[pace]}</span>
        )}
        <button type="button" className="spine-advance" disabled={atLastBeat} onClick={() => update(advanceSpineBeat(spine))}>
          Next beat <CaretRight size={12} />
        </button>
      </div>
    </div>
  );
}
