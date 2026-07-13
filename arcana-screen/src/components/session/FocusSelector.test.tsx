import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FocusSelector from './FocusSelector';

describe('FocusSelector', () => {
  it('names every Focus separately from application mode and changes selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FocusSelector currentFocus="social" onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Social' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Narrative' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Exploration' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Combat' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Exploration' }));
    expect(onChange).toHaveBeenCalledWith('exploration');
  });
});
