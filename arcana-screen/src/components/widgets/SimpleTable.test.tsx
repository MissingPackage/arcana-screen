import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useWidgetStore, type Widget } from '../../store/useWidgetStore';
import { createToolInstance } from './toolRegistry';
import SimpleTable from './SimpleTable';

// Seed a table widget with explicit columns/rows so the component's
// "initialize defaults" effect never fires (deterministic starting state).
function seedTable(rows?: Widget['rows']): Widget {
  const widget = {
    ...createToolInstance('simple-table'),
    columns: [
      { id: 1, key: 'name', label: 'Name', type: 'text' as const },
      { id: 2, key: 'value', label: 'Value', type: 'text' as const },
    ],
    rows: rows ?? [
      { id: 1, name: '', value: '' },
      { id: 2, name: '', value: '' },
    ],
  };
  useWidgetStore.setState({ widgets: [widget], structuralHistory: [] });
  return widget;
}

function renderTable(widget: Widget) {
  return render(
    <DndProvider backend={HTML5Backend}>
      <SimpleTable id={widget.id} updateWidget={useWidgetStore.getState().updateWidget} />
    </DndProvider>,
  );
}

const storedWidget = () => useWidgetStore.getState().widgets[0];

describe('SimpleTable', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
  });

  it('adds a row', async () => {
    const user = userEvent.setup();
    renderTable(seedTable());
    expect(storedWidget().rows).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: '+ Row' }));

    expect(storedWidget().rows).toHaveLength(3);
  });

  it('adds a column and backfills existing rows with its key', async () => {
    const user = userEvent.setup();
    renderTable(seedTable());

    await user.click(screen.getByRole('button', { name: '+ Column' }));

    const columns = storedWidget().columns ?? [];
    const rows = storedWidget().rows ?? [];
    expect(columns).toHaveLength(3);
    const newKey = columns[2].key;
    expect(rows.every((row) => newKey in row)).toBe(true);
  });

  it('removes a column and drops its data from every row', async () => {
    const user = userEvent.setup();
    renderTable(seedTable([{ id: 1, name: 'Aria', value: 'keep' }]));

    await user.click(screen.getByRole('button', { name: 'Remove column Value' }));

    const columns = storedWidget().columns ?? [];
    const rows = storedWidget().rows ?? [];
    expect(columns.map((c) => c.key)).toEqual(['name']);
    expect(rows[0]).not.toHaveProperty('value');
    expect(rows[0].name).toBe('Aria');
  });

  it('applies a template, replacing columns', async () => {
    const user = userEvent.setup();
    renderTable(seedTable());

    await user.selectOptions(screen.getByLabelText('Template'), 'initiative');

    expect((storedWidget().columns ?? []).map((c) => c.key)).toEqual(['name', 'initiative', 'hp']);
  });

  it('filters visible rows by query', async () => {
    const user = userEvent.setup();
    renderTable(
      seedTable([
        { id: 1, name: 'Goblin', value: 'x' },
        { id: 2, name: 'Orc', value: 'y' },
      ]),
    );
    expect(screen.getByLabelText('Row 1, Name')).toHaveValue('Goblin');
    expect(screen.getByLabelText('Row 2, Name')).toHaveValue('Orc');

    await user.type(screen.getByLabelText('Filter'), 'Goblin');

    // Only the matching row stays rendered (labels use the original row index).
    expect(screen.getByLabelText('Row 1, Name')).toHaveValue('Goblin');
    expect(screen.queryByLabelText('Row 2, Name')).not.toBeInTheDocument();
  });
});
