import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWidgetStore } from '../../store/useWidgetStore';
import { createToolInstance } from './toolRegistry';
import DiceRoller from './DiceRoller';
import CountdownTimer from './CountdownTimer';
import Counter from './Counter';

describe('M4 tool evolution', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
  });

  it('saves reusable dice formulas', async () => {
    const user = userEvent.setup();
    const widget = createToolInstance('dice-roller');
    useWidgetStore.setState({ widgets: [widget], structuralHistory: [] });
    render(<DiceRoller id={widget.id} updateWidget={useWidgetStore.getState().updateWidget} />);

    await user.type(screen.getByLabelText('Dice preset name'), 'Fireball');
    await user.type(screen.getByLabelText('Formula (optional; overrides quantity, die and modifier)'), '8d6');
    await user.click(screen.getByRole('button', { name: 'Save preset' }));
    expect(useWidgetStore.getState().widgets[0].dicePresets?.[0]).toMatchObject({ name: 'Fireball', formula: '8d6' });
  });

  it('applies and saves timer presets', async () => {
    const user = userEvent.setup();
    const widget = createToolInstance('countdown-timer');
    useWidgetStore.setState({ widgets: [widget], structuralHistory: [] });
    render(<CountdownTimer id={widget.id} updateWidget={useWidgetStore.getState().updateWidget} />);

    await user.click(screen.getByRole('button', { name: '5 min' }));
    expect(useWidgetStore.getState().widgets[0].timerDurationSeconds).toBe(300);
    await user.type(screen.getByLabelText('Timer preset name'), 'Break');
    await user.click(screen.getByRole('button', { name: 'Save duration' }));
    expect(useWidgetStore.getState().widgets[0].timerPresets?.some((preset) => preset.name === 'Break' && preset.seconds === 300)).toBe(true);
  });

  it('keeps counters inside their limits and exposes threshold state', async () => {
    const user = userEvent.setup();
    const widget = createToolInstance('counter');
    useWidgetStore.setState({ widgets: [{ ...widget, counterValue: 6, counterThreshold: 5 }], structuralHistory: [] });
    render(<Counter id={widget.id} updateWidget={useWidgetStore.getState().updateWidget} />);

    await user.click(screen.getByRole('button', { name: '-1' }));
    expect(screen.getByText('Threshold reached')).toBeInTheDocument();
    expect(useWidgetStore.getState().widgets[0].counterValue).toBe(5);
  });
});
