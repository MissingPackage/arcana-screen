import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePartyStore } from '../../store/usePartyStore';
import PartySetup from './PartySetup';

const party = () => usePartyStore.getState();

async function openPanel() {
  const user = userEvent.setup();
  render(<PartySetup />);
  await user.click(screen.getByText(/The party/)); // open the <details>
  return user;
}

describe('PartySetup', () => {
  beforeEach(() => {
    localStorage.clear();
    usePartyStore.setState({ members: [] });
  });

  it('shows an empty state and adds a character', async () => {
    const user = await openPanel();
    expect(screen.getByText(/No characters yet/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add character' }));
    expect(party().members).toHaveLength(1);
    expect(party().members[0]).toMatchObject({ name: 'New character', kind: 'pc' });
  });

  it('commits an edit on blur', async () => {
    party().addMember({ name: 'Kael', ac: 10 });
    const user = await openPanel();
    const ac = screen.getByLabelText('Armor Class of Kael');
    await user.clear(ac);
    await user.type(ac, '18');
    await user.tab();
    expect(party().members[0].ac).toBe(18);
  });

  it('removes a character', async () => {
    party().addMember({ name: 'Kael' });
    const user = await openPanel();
    await user.click(screen.getByRole('button', { name: 'Remove Kael' }));
    expect(party().members).toHaveLength(0);
  });
});
