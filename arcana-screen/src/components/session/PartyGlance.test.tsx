import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import PartyGlance from './PartyGlance';
import { usePartyStore } from '../../store/usePartyStore';

const seed = () => usePartyStore.getState().setMembers([
  { name: 'Kael', playerName: 'Sam', ac: 18, hp: 24, maxHp: 24, passiveInsight: 14, passivePerception: 15, spellSaveDc: 15 },
  { name: 'Vex', ac: 15, hp: 5, maxHp: 24, passiveInsight: 11, passivePerception: 17, passiveInvestigation: 13 },
]);

describe('PartyGlance', () => {
  afterEach(() => usePartyStore.setState({ members: [] }));

  it('renders nothing when the roster is empty', () => {
    const { container } = render(<PartyGlance focus="social" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing in Combat, where the party is already inline in the tracker', () => {
    seed();
    const { container } = render(<PartyGlance focus="combat" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens Social passives + Save DC, highlights the best value, and closes on Escape', async () => {
    const user = userEvent.setup();
    seed();
    render(<PartyGlance focus="social" />);

    expect(screen.queryByRole('region', { name: 'Party at a glance' })).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Show the party at a glance' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(screen.getByRole('region', { name: 'Party at a glance' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Ins' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Perc' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Save' })).toBeVisible();
    expect(screen.getByRole('rowheader', { name: /Kael/ })).toBeVisible();
    // The top Insight (Kael 14) and top Perception (Vex 17) are marked
    expect(screen.getByText('14')).toHaveClass('is-max');
    expect(screen.getByText('17')).toHaveClass('is-max');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('region', { name: 'Party at a glance' })).not.toBeInTheDocument();
  });

  it('flags a bloodied combatant in the HP column', async () => {
    const user = userEvent.setup();
    seed();
    render(<PartyGlance focus="social" />);
    await user.click(screen.getByRole('button', { name: 'Show the party at a glance' }));
    expect(screen.getByText('5/24')).toHaveClass('hp-cell', 'hp--critical');
  });

  it('closes from the panel close button (and does not close on outside clicks)', async () => {
    const user = userEvent.setup();
    seed();
    render(<div><PartyGlance focus="social" /><button type="button">Elsewhere</button></div>);
    await user.click(screen.getByRole('button', { name: 'Show the party at a glance' }));

    // Pinnable: clicking a control outside the panel must NOT close it
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(screen.getByRole('region', { name: 'Party at a glance' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Close party glance' }));
    expect(screen.queryByRole('region', { name: 'Party at a glance' })).not.toBeInTheDocument();
  });

  it('swaps the passive columns to Perception + Investigation in Exploration', async () => {
    const user = userEvent.setup();
    seed();
    render(<PartyGlance focus="exploration" />);
    await user.click(screen.getByRole('button', { name: 'Show the party at a glance' }));
    expect(screen.getByRole('columnheader', { name: 'Perc' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Inv' })).toBeVisible();
    expect(screen.queryByRole('columnheader', { name: 'Ins' })).not.toBeInTheDocument();
  });
});
