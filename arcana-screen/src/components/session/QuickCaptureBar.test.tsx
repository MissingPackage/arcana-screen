import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import QuickCaptureBar from './QuickCaptureBar';

describe('QuickCaptureBar', () => {
  it('ignores whitespace and submits trimmed text exactly once', async () => {
    const user = userEvent.setup();
    const onCapture = vi.fn();
    render(<QuickCaptureBar onCapture={onCapture} />);

    await user.type(screen.getByLabelText('Quick capture'), '   ');
    await user.click(screen.getByRole('button', { name: 'Save capture' }));
    expect(onCapture).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Quick capture'), '  The gate opened  ');
    await user.click(screen.getByRole('button', { name: 'Save capture' }));
    expect(onCapture).toHaveBeenCalledOnce();
    expect(onCapture).toHaveBeenCalledWith('The gate opened');
  });

  it('focuses the capture field with the slash shortcut outside an editor', async () => {
    render(<QuickCaptureBar onCapture={vi.fn()} />);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    expect(screen.getByLabelText('Quick capture')).toHaveFocus();
  });
});
