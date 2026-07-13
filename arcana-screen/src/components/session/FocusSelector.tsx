import {
  BookOpenText,
  Compass,
  Sword,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react';
import type { FocusId } from '../../domain/focusModel';

interface FocusSelectorProps {
  currentFocus: FocusId | null;
  onChange: (focus: FocusId) => void;
  compact?: boolean;
}

const focuses: Array<{ id: FocusId; label: string; icon: Icon }> = [
  { id: 'narrative', label: 'Narrative', icon: BookOpenText },
  { id: 'social', label: 'Social', icon: UsersThree },
  { id: 'exploration', label: 'Exploration', icon: Compass },
  { id: 'combat', label: 'Combat', icon: Sword },
];

export default function FocusSelector({ currentFocus, onChange, compact = false }: FocusSelectorProps) {
  return (
    <nav className={`focus-selector${compact ? ' focus-selector--compact' : ''}`} aria-label="Session Focus">
      <span className="focus-selector__label">Focus</span>
      <div className="focus-selector__options">
        {focuses.map(({ id, label, icon: FocusIcon }) => (
          <button
            key={id}
            type="button"
            className="focus-selector__option"
            aria-pressed={currentFocus === id}
            onClick={() => onChange(id)}
          >
            <FocusIcon size={18} weight={currentFocus === id ? 'fill' : 'regular'} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
