import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createToolInstance } from './toolRegistry';
import { useWidgetStore } from '../../store/useWidgetStore';
import QuickNotes from './QuickNotes';

describe('Session Notebook', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
  });

  it('autosaves title and body and renders safe lightweight formatting', async () => {
    const user = userEvent.setup();
    const notebook = createToolInstance('quick-notes');
    useWidgetStore.setState({ widgets: [notebook], structuralHistory: [] });
    render(<QuickNotes id={notebook.id} />);

    await user.clear(screen.getByLabelText('Notebook title'));
    await user.type(screen.getByLabelText('Notebook title'), 'Festival notes');
    fireEvent.change(screen.getByPlaceholderText(/Prepare beats/), { target: { value: '**Ember**\n- Follow the observer\n[Rules](https://example.com)' } });

    const stored = useWidgetStore.getState().widgets[0];
    expect(stored.title).toBe('Festival notes');
    expect(stored.text).toContain('Follow the observer');
    await user.click(screen.getByText('Formatted preview'));
    expect(screen.getByText('Ember', { selector: 'strong' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Rules' })).toHaveAttribute('href', 'https://example.com');
  });
});
