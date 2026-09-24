import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WidgetErrorBoundary from './WidgetErrorBoundary';

let shouldThrow = true;
function Flaky() {
  if (shouldThrow) throw new Error('boom');
  return <p>Table ready</p>;
}

describe('WidgetErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('contains a failing tool and lets it retry without touching its siblings', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <>
        <WidgetErrorBoundary toolName="Simple Table"><Flaky /></WidgetErrorBoundary>
        <p>Dice still here</p>
      </>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Simple Table could not render');
    expect(screen.getByText('Dice still here')).toBeVisible();

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Table ready')).toBeVisible();
  });
});
