import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useScreenStore } from '../../store/useScreenStore';
import { useWidgetStore } from '../../store/useWidgetStore';
import FirstRun from './FirstRun';

describe('FirstRun', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
    useScreenStore.setState({ screens: [], activeScreenId: '' });
  });

  it('creates a useful Screen from an outcome preview without requiring a tour', async () => {
    const user = userEvent.setup();
    render(<FirstRun />);

    expect(screen.getByRole('heading', { name: 'Create a useful screen first' })).toBeVisible();
    expect(screen.getByText(/There is no required tour/i)).toBeVisible();
    expect(screen.getByText('Prepare context, capture live changes and keep essential references visible.')).toBeVisible();

    await user.type(screen.getByLabelText(/Screen name/), 'Festival session');
    await user.click(screen.getByRole('button', { name: 'Create General Screen' }));

    const created = useScreenStore.getState().screens[0];
    expect(created.name).toBe('Festival session');
    expect(created.template).toBe('general');
    expect(created.focusWorkspace.currentFocus).toBeNull();
  });
});
