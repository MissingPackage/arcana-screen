import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createToolInstance } from './toolRegistry';
import { useWidgetStore } from '../../store/useWidgetStore';
import QuickReference from './QuickReference';

describe('QuickReference', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
  });

  it('preserves an invalid draft and adds a normalized HTTPS source only after validation', async () => {
    const user = userEvent.setup();
    const widget = createToolInstance('quick-reference');
    useWidgetStore.setState({ widgets: [widget], structuralHistory: [] });
    render(<QuickReference id={widget.id} />);

    await user.type(screen.getByLabelText('Link address'), '://bad');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid web address');
    expect(screen.getByLabelText('Link address')).toHaveValue('://bad');
    expect(useWidgetStore.getState().widgets[0].referenceLinks).toEqual([]);

    await user.clear(screen.getByLabelText('Link address'));
    await user.type(screen.getByLabelText('Link label'), 'Rules');
    await user.type(screen.getByLabelText('Link address'), 'example.com/rules');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('link', { name: 'Rules' })).toHaveAttribute('href', 'https://example.com/rules');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
