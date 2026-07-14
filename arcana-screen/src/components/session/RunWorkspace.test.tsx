import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultFocusWorkspace, switchFocus, type FocusWorkspace } from '../../domain/focusModel';
import RunWorkspace from './RunWorkspace';

function StatefulRun({ initial }: { initial: FocusWorkspace }) {
  const [workspace, setWorkspace] = useState(initial);
  return (
    <RunWorkspace
      workspace={workspace}
      onFocusChange={(focus) => setWorkspace((current) => switchFocus(current, focus))}
      onWorkspaceChange={setWorkspace}
    />
  );
}

describe('RunWorkspace', () => {
  afterEach(() => vi.restoreAllMocks());
  it('renders the note-first Social source hierarchy and universal utilities', () => {
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'social';
    render(
      <RunWorkspace
        workspace={workspace}
        onFocusChange={vi.fn()}
        onWorkspaceChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Session Notebook' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Social Focus' })).toBeVisible();
    expect(screen.getByLabelText('Quick capture')).toBeVisible();
    expect(screen.getByLabelText('Dice roller')).toBeVisible();
    expect(screen.getByLabelText('Session timer')).toBeVisible();
  });

  it('keeps encounter setup out of the default Combat Run viewport', () => {
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'combat';
    render(
      <RunWorkspace
        workspace={workspace}
        onFocusChange={vi.fn()}
        onWorkspaceChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Initiative Tracker' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next Turn' })).toBeVisible();
    // The add-combatant on-ramp is a collapsed toggle — the setup form stays out of the live view until asked for.
    expect(screen.getByRole('button', { name: 'Add combatant' })).toBeVisible();
    expect(screen.queryByLabelText('New combatant name')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    expect(screen.getByText('Charmed')).toBeVisible();
    expect(screen.getByText('Frightened')).toBeVisible();
    expect(screen.getByText('Total Cover')).toBeVisible();
    expect(screen.getByRole('link', { name: /Monster Manual/ })).toHaveAttribute('href', 'https://www.dndbeyond.com/sources/dnd/free-rules');
  });

  it('mints a role-pinned NPC to the top of the scene and confirms removal', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'social';
    const { container } = render(<StatefulRun initial={workspace} />);

    const npcNames = () => Array.from(container.querySelectorAll('.npc-list article h3')).map((el) => el.textContent);
    expect(npcNames()).toHaveLength(3); // three seeded NPCs

    await user.type(screen.getByLabelText('Role for a new NPC'), 'Bartender');
    await user.click(screen.getByRole('button', { name: 'Mint NPC' }));
    expect(npcNames()).toHaveLength(4);
    // Prepended (newest first) with the role the DM pinned
    expect(container.querySelector('.npc-list article p')?.textContent).toBe('Bartender');

    // Removal needs a confirming second tap — the ✕ sits beside the attitude toggle
    await user.click(screen.getAllByRole('button', { name: /Remove .+ from the scene/ })[0]);
    expect(npcNames()).toHaveLength(4); // armed, not yet gone
    await user.click(screen.getByRole('button', { name: /Confirm removing/ }));
    expect(npcNames()).toHaveLength(3);
  });

  it('captures once and retains the result while changing Focus', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'social';
    render(<StatefulRun initial={workspace} />);

    await user.type(screen.getByLabelText('Quick capture'), 'The warden recognized Kael');
    await user.click(screen.getByRole('button', { name: 'Save capture' }));
    await user.click(screen.getByRole('button', { name: 'Exploration' }));

    expect(screen.getByText('The warden recognized Kael')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Exploration Focus' })).toBeVisible();
  });

  it('reviews, edits, promotes and deletes universal captures from Run', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'narrative';
    render(<StatefulRun initial={workspace} />);

    await user.type(screen.getByLabelText('Quick capture'), 'A rough consequence');
    await user.click(screen.getByRole('button', { name: 'Save capture' }));
    await user.click(screen.getByRole('button', { name: 'Review captures' }));

    const editor = screen.getByLabelText('Capture text');
    await user.clear(editor);
    await user.type(editor, 'The ward answers to Kael');
    await user.click(screen.getByRole('button', { name: 'Promote capture' }));
    expect(screen.getByText('The ward answers to Kael', { selector: '.narrative-document li' })).toBeVisible();
    expect(screen.getByText('Promoted')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Delete capture' }));
    expect(screen.queryByLabelText('Capture text')).not.toBeInTheDocument();
  });

  it('advances the Social scene clock without changing Focus', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'social';
    render(<StatefulRun initial={workspace} />);

    expect(screen.getByLabelText('Scene Clock: 3 of 8')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Advance' }));
    expect(screen.getByLabelText('Scene Clock: 4 of 8')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Social' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('completes Exploration and advances the persistent counter', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'exploration';
    render(<StatefulRun initial={workspace} />);

    await user.click(screen.getByRole('button', { name: /Complete moment/ }));
    expect(screen.getByText('The Sunken Archive', { selector: '.saved-note' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Increase counter' }));
    expect(screen.getByLabelText('Counter value')).toHaveTextContent('4');
  });

  it('adds Exploration clues and chronological log entries from Run', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'exploration';
    render(<StatefulRun initial={workspace} />);

    await user.type(screen.getByLabelText('New clue'), 'Ash points toward the lower vault');
    await user.click(screen.getByRole('button', { name: 'Add clue' }));
    expect(screen.getByText('Ash points toward the lower vault')).toBeVisible();

    await user.type(screen.getByLabelText('New log entry'), 'The party opened the hidden stair');
    await user.click(screen.getByRole('button', { name: 'Add log entry' }));
    expect(screen.getByText('The party opened the hidden stair')).toBeVisible();
  });

  it('wraps Combat to a new round from the last combatant', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'combat';
    workspace.contexts.combat.currentIndex = workspace.contexts.combat.combatants.length - 1;
    render(<StatefulRun initial={workspace} />);

    await user.click(screen.getByRole('button', { name: 'Next Turn' }));
    expect(screen.getByText('Round 4')).toBeVisible();
    expect(screen.getByText('Ser Kael', { selector: '.combatant-identity strong' })).toBeVisible();
  });

  it('keeps compact Combat HP controls on demand and supports reset undo', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'combat';
    render(<StatefulRun initial={workspace} />);

    await user.click(screen.getByRole('button', { name: 'Manage Ser Kael' }));
    await user.click(screen.getByRole('button', { name: '−5 HP' }));
    expect(screen.getByRole('region', { name: 'Live controls for Ser Kael' })).toHaveTextContent('HP 19 / 24');
    await user.click(screen.getByRole('button', { name: '+1 Temp' }));
    expect(screen.getByRole('region', { name: 'Live controls for Ser Kael' })).toHaveTextContent('Temp 1');
    await user.clear(screen.getByLabelText('Conditions for Ser Kael'));
    await user.type(screen.getByLabelText('Conditions for Ser Kael'), 'Blessed, Prone');
    expect(screen.getByText('Prone', { selector: '.condition-chips span' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Reset encounter' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Clear the encounter');
    await user.click(screen.getByRole('button', { name: 'Confirm reset' }));
    expect(screen.queryByRole('button', { name: 'Manage Ser Kael' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo encounter change' }));
    expect(screen.getByRole('button', { name: 'Manage Ser Kael' })).toBeVisible();
  });

  it('re-sorts the tracker when a combatant initiative is edited in place', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'combat';
    const { container } = render(<StatefulRun initial={workspace} />);

    const order = () =>
      Array.from(container.querySelectorAll('.combatant-identity strong')).map((el) => el.textContent);
    const before = order();
    const lastName = before[before.length - 1];
    if (!lastName) throw new Error('expected seeded combatants');
    expect(before[0]).not.toBe(lastName);

    await user.click(screen.getByRole('button', { name: `Initiative for ${lastName}` }));
    const input = screen.getByRole('spinbutton', { name: `Initiative for ${lastName}` });
    await user.clear(input);
    await user.type(input, '999');
    await user.tab();

    expect(order()[0]).toBe(lastName);
    expect(screen.queryByRole('spinbutton', { name: `Initiative for ${lastName}` })).not.toBeInTheDocument();
  });

  it('sets every initiative at once and sorts only on apply', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'combat';
    const { container } = render(<StatefulRun initial={workspace} />);

    const order = () =>
      Array.from(container.querySelectorAll('.combatant-identity strong')).map((el) => el.textContent);
    const before = order();
    const lastName = before[before.length - 1];
    if (!lastName) throw new Error('expected seeded combatants');

    await user.click(screen.getByRole('button', { name: /Set initiative/ }));
    // The batch panel swaps in for the list, so no row can reflow under the DM mid-entry
    expect(screen.getByRole('region', { name: 'Set initiative order' })).toBeVisible();
    expect(screen.queryByRole('button', { name: `Manage ${lastName}` })).not.toBeInTheDocument();

    const field = screen.getByRole('spinbutton', { name: `Set ${lastName} initiative` });
    await user.clear(field);
    await user.type(field, '99');

    // Only on apply does the list return, sorted once with the bumped combatant on top
    await user.click(screen.getByRole('button', { name: 'Apply order' }));
    expect(order()[0]).toBe(lastName);
    expect(screen.queryByRole('button', { name: 'Apply order' })).not.toBeInTheDocument();
  });

  it('adds an ad-hoc monster to the encounter, including a group by quantity', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'combat';
    render(<StatefulRun initial={workspace} />);

    await user.click(screen.getByRole('button', { name: 'Add combatant' }));
    await user.type(screen.getByLabelText('New combatant name'), 'Bugbear');
    await user.clear(screen.getByLabelText('How many combatants'));
    await user.type(screen.getByLabelText('How many combatants'), '2');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('button', { name: 'Manage Bugbear 1' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manage Bugbear 2' })).toBeVisible();
    // Added with no initiative → flagged unset, editable in place
    expect(screen.getByRole('button', { name: 'Set rolled initiative for Bugbear 1' })).toBeVisible();
    // The form stays open for continuous entry, clears the name, and acknowledges the add
    expect(screen.getByLabelText('New combatant name')).toHaveValue('');
    expect(screen.getByText('Added Bugbear ×2')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByLabelText('New combatant name')).not.toBeInTheDocument();
  });

  it('removes a single combatant from the live editor without resetting the fight', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'combat';
    render(<StatefulRun initial={workspace} />);

    await user.click(screen.getByRole('button', { name: 'Manage Goblin Scout' }));
    await user.click(screen.getByRole('button', { name: 'Remove Goblin Scout from the encounter' }));

    expect(screen.queryByRole('button', { name: 'Manage Goblin Scout' })).not.toBeInTheDocument();
    // The rest of the encounter survives
    expect(screen.getByRole('button', { name: 'Manage Ser Kael' })).toBeVisible();
  });

  it('surfaces the HP editor discoverability hint until a combatant is selected', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'combat';
    render(<StatefulRun initial={workspace} />);

    expect(screen.getByText(/Tap a combatant to adjust HP/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Manage Ser Kael' }));
    expect(screen.queryByText(/Tap a combatant to adjust HP/)).not.toBeInTheDocument();
  });

  it('advances the Narrative beat in the context drawer', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'narrative';
    render(<StatefulRun initial={workspace} />);

    expect(screen.getByText('Current beat · 2 of 4')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Move to next beat/ }));
    expect(screen.getByText('Current beat · 3 of 4')).toBeVisible();
  });

  it('supports standard dice formulae from the compact Run dock', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.5);
    render(<StatefulRun initial={createDefaultFocusWorkspace()} />);

    await user.click(screen.getByRole('button', { name: 'Dice options' }));
    await user.type(screen.getByLabelText('Dice formula'), '2d6+3');
    await user.click(screen.getByRole('button', { name: 'Roll' }));

    expect(screen.getByLabelText('Roll result')).toHaveTextContent('8');
    expect(screen.getByText(/2d6\[1,4\]/)).toBeVisible();
  });

  it('shows an actionable inline dice error without replacing the previous Focus', async () => {
    const user = userEvent.setup();
    render(<StatefulRun initial={createDefaultFocusWorkspace()} />);

    await user.click(screen.getByRole('button', { name: 'Dice options' }));
    await user.type(screen.getByLabelText('Dice formula'), '1d2junk');
    await user.click(screen.getByRole('button', { name: 'Roll' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid dice notation');
    expect(screen.getByRole('button', { name: 'Narrative' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('uses the lower roll for Disadvantage and keeps the raw breakdown', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.999).mockReturnValueOnce(0);
    render(<StatefulRun initial={createDefaultFocusWorkspace()} />);

    await user.click(screen.getByRole('button', { name: 'Dice options' }));
    await user.type(screen.getByLabelText('Dice formula'), 'd20+4');
    await user.click(screen.getByRole('button', { name: 'Disadvantage' }));
    await user.click(screen.getByRole('button', { name: 'Roll' }));

    expect(screen.getByLabelText('Roll result')).toHaveTextContent('5');
    expect(screen.getByText(/disadvantage: 20, 1 → 1/)).toBeVisible();
  });

  it('edits the Social scene and confirms a destructive clock reset', async () => {
    const user = userEvent.setup();
    const workspace = createDefaultFocusWorkspace();
    workspace.currentFocus = 'social';
    render(<StatefulRun initial={workspace} />);

    await user.clear(screen.getByLabelText('Social scene title'));
    await user.type(screen.getByLabelText('Social scene title'), 'Council at Dusk');
    expect(screen.getByDisplayValue('Council at Dusk')).toBeVisible();

    const clock = screen.getByText('Scene Clock').closest('.clock-block');
    if (!(clock instanceof HTMLElement)) throw new Error('Scene Clock region missing');
    await user.click(within(clock).getByRole('button', { name: 'Reset' }));
    expect(within(clock).getByRole('button', { name: 'Confirm reset' })).toBeVisible();
    expect(screen.getByLabelText('Scene Clock: 3 of 8')).toBeVisible();
    await user.click(within(clock).getByRole('button', { name: 'Confirm reset' }));
    expect(screen.getByLabelText('Scene Clock: 0 of 8')).toBeVisible();
  });

  it('answers an oracle question by likelihood and logs it to captures', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.45); // roll 10
    render(<StatefulRun initial={createDefaultFocusWorkspace()} />);

    await user.click(screen.getByRole('button', { name: /Oracle/ }));
    const oracle = screen.getByRole('group', { name: 'Oracle' });

    await user.click(within(oracle).getByRole('button', { name: '50/50' }));
    expect(within(oracle).getByText('No', { exact: true })).toHaveClass('is-no'); // total 10
    expect(within(oracle).getByText('d20 10')).toBeVisible();

    await user.click(within(oracle).getByRole('button', { name: 'Likely' }));
    expect(within(oracle).getByText('Yes', { exact: true })).toHaveClass('is-yes'); // total 14

    // Log routes the answer into the capture pipe so a reload can't lose it
    await user.click(within(oracle).getByRole('button', { name: 'Log' }));
    await user.click(screen.getByRole('button', { name: 'Review captures' }));
    expect(screen.getByDisplayValue('Oracle (Likely): Yes')).toBeVisible();
  });

  it('sets the Timer duration from the Run dock without entering Prepare', async () => {
    const user = userEvent.setup();
    render(<StatefulRun initial={createDefaultFocusWorkspace()} />);

    await user.click(screen.getByRole('button', { name: 'Set time' }));
    await user.clear(screen.getByLabelText('Timer minutes'));
    await user.type(screen.getByLabelText('Timer minutes'), '2');
    await user.clear(screen.getByLabelText('Timer seconds'));
    await user.type(screen.getByLabelText('Timer seconds'), '30');

    expect(screen.getByLabelText('Session timer')).toHaveTextContent('02:30');
  });
});
