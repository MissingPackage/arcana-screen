import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useScreenStore } from '../store/useScreenStore';
import { useWidgetStore } from '../store/useWidgetStore';
import { createToolInstance } from './widgets/toolRegistry';
import WorkspaceSearch from './WorkspaceSearch';

// Create an active screen and give it one searchable Quick Notes widget.
function seedActiveScreen(text: string): string {
  const id = useScreenStore.getState().createScreen('Alpha', 'general');
  useWidgetStore.setState({
    widgets: [{ ...createToolInstance('quick-notes'), title: 'Alpha notes', text }],
    structuralHistory: [],
  });
  return id;
}

async function openSearch() {
  const user = userEvent.setup();
  render(<WorkspaceSearch />);
  await user.click(screen.getByText('Search')); // open the <details> panel
  return user;
}

describe('WorkspaceSearch', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
    useScreenStore.setState({ screens: [], activeScreenId: '' });
  });

  it('requires at least two characters', async () => {
    const user = await openSearch();
    await user.type(screen.getByLabelText('Search every screen'), 'd');
    expect(screen.getByText('Enter at least two characters.')).toBeInTheDocument();
  });

  it('reports when nothing matches', async () => {
    seedActiveScreen('dragon lair');
    const user = await openSearch();
    await user.type(screen.getByLabelText('Search every screen'), 'zzzz');
    expect(screen.getByText('No matching workspace content.')).toBeInTheDocument();
  });

  it('finds matching content on the active screen', async () => {
    seedActiveScreen('dragon lair to the north');
    const user = await openSearch();
    await user.type(screen.getByLabelText('Search every screen'), 'dragon');

    const result = screen.getByRole('button', { name: /Alpha/ });
    expect(result).toHaveTextContent('dragon lair');
  });

  it('opens the owning screen when a result is clicked', async () => {
    const id = seedActiveScreen('dragon lair');
    const openScreen = vi.fn();
    useScreenStore.setState({ openScreen });

    const user = await openSearch();
    await user.type(screen.getByLabelText('Search every screen'), 'dragon');
    await user.click(screen.getByRole('button', { name: /Alpha/ }));

    expect(openScreen).toHaveBeenCalledWith(id);
  });
});
