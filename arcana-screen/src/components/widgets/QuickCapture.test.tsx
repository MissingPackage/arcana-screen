import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createToolInstance } from './toolRegistry';
import { useWidgetStore } from '../../store/useWidgetStore';
import QuickCapture from './QuickCapture';

describe('QuickCapture review', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
  });

  it('timestamps a live capture and promotes it into the Session Notebook', async () => {
    const user = userEvent.setup();
    const capture = createToolInstance('quick-capture');
    const notebook = createToolInstance('quick-notes');
    useWidgetStore.setState({ widgets: [capture, notebook], structuralHistory: [] });
    render(<QuickCapture id={capture.id} />);

    await user.type(screen.getByLabelText('Capture what just happened'), 'The eastern ward broke');
    await user.click(screen.getByRole('button', { name: 'Capture' }));
    const stored = useWidgetStore.getState().widgets.find((item) => item.id === capture.id)?.captures?.[0];
    expect(stored).toMatchObject({ text: 'The eastern ward broke', status: 'inbox' });
    expect(new Date(stored?.createdAt ?? '').toString()).not.toBe('Invalid Date');

    await user.click(screen.getByRole('button', { name: 'Review captures' }));
    await user.click(screen.getByRole('button', { name: 'Promote to notebook' }));
    expect(useWidgetStore.getState().widgets.find((item) => item.id === notebook.id)?.text).toContain('- The eastern ward broke');
    expect(useWidgetStore.getState().widgets.find((item) => item.id === capture.id)?.captures?.[0].status).toBe('promoted');
  });
});
