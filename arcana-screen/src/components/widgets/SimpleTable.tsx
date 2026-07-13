import { useEffect, memo, useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useWidgetStore, Widget, TableRow, TableColumn } from '../../store/useWidgetStore';
import WidgetHelpButton from '../WidgetHelpButton/WidgetHelpButton';

const ItemTypeRow = 'ROW';
const ItemTypeColumn = 'COLUMN';

const tableTemplates = {
  blank: {
    columns: [{ id: 1, key: 'name', label: 'Name', type: 'text' }, { id: 2, key: 'value', label: 'Value', type: 'text' }],
    rows: [{ id: 1, name: '', value: '' }, { id: 2, name: '', value: '' }],
  },
  initiative: {
    columns: [{ id: 1, key: 'name', label: 'Name', type: 'text' }, { id: 2, key: 'initiative', label: 'Initiative', type: 'number' }, { id: 3, key: 'hp', label: 'HP', type: 'number' }],
    rows: [{ id: 1, name: '', initiative: '', hp: '' }],
  },
  loot: {
    columns: [{ id: 1, key: 'item', label: 'Item', type: 'text' }, { id: 2, key: 'quantity', label: 'Quantity', type: 'number' }, { id: 3, key: 'holder', label: 'Holder', type: 'text' }],
    rows: [{ id: 1, item: '', quantity: '1', holder: '' }],
  },
  travel: {
    columns: [{ id: 1, key: 'stop', label: 'Stop', type: 'text' }, { id: 2, key: 'distance', label: 'Distance', type: 'number' }, { id: 3, key: 'notes', label: 'Notes', type: 'text' }],
    rows: [{ id: 1, stop: '', distance: '', notes: '' }],
  },
} satisfies Record<NonNullable<Widget['tableTemplate']>, { columns: TableColumn[]; rows: TableRow[] }>;

interface TableColumnHeaderProps {
  col: TableColumn;
  index: number;
  columns: TableColumn[];
  setColumns: React.Dispatch<React.SetStateAction<TableColumn[]>>;
  updateColumnLabel: (id: number, newLabel: string) => void;
  updateColumnType: (id: number, type: NonNullable<TableColumn['type']>) => void;
  removeColumn: (id: number) => void;
}
function TableColumnHeader({ col, index, columns, setColumns, updateColumnLabel, updateColumnType, removeColumn }: TableColumnHeaderProps) {
  const [, drag] = useDrag({
    type: ItemTypeColumn,
    item: { index },
  });
  const [, drop] = useDrop({
    accept: ItemTypeColumn,
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        const updatedColumns = [...columns];
        const [movedCol] = updatedColumns.splice(draggedItem.index, 1);
        updatedColumns.splice(index, 0, movedCol);
        setColumns(updatedColumns);
        draggedItem.index = index;
      }
    },
  });
  const moveColumn = (to: number) => {
    if (to < 0 || to >= columns.length || to === index) return;
    const updatedColumns = [...columns];
    const [movedColumn] = updatedColumns.splice(index, 1);
    updatedColumns.splice(to, 0, movedColumn);
    setColumns(updatedColumns);
  };
  return (
    <th
      key={col.id}
      ref={node => { if (node) drag(drop(node)); }}
      className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-t text-center align-middle cursor-move transition-all"
    >
      <div className="flex items-center justify-center gap-1">
        <input
          aria-label={`Column ${index + 1} name`}
          value={col.label}
          onChange={e => updateColumnLabel(col.id, e.target.value)}
          className="text-center px-2 py-1 w-24 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
          style={{ fontWeight: 500 }}
        />
        <select aria-label={`Column ${col.label} type`} value={col.type ?? 'text'} onChange={(event) => updateColumnType(col.id, event.target.value as NonNullable<TableColumn['type']>)}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="checkbox">Checkbox</option>
        </select>
        {columns.length > 1 ? (
          <button
            type="button"
            className="ml-1 text-red-500 hover:bg-red-100 rounded-full p-1 transition"
            onClick={() => removeColumn(col.id)}
            aria-label={`Remove column ${col.label}`}
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
        ) : (
          <button
            type="button"
            className="ml-1 rounded-full p-1 cursor-not-allowed"
            disabled
            aria-label="Cannot remove the last column"
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
        )}
      </div>
      <div className="table-reorder-actions" aria-label={`Reorder column ${col.label}`}>
        <button type="button" disabled={index === 0} onClick={() => moveColumn(index - 1)} aria-label={`Move column ${col.label} left`}>←</button>
        <button type="button" disabled={index === columns.length - 1} onClick={() => moveColumn(index + 1)} aria-label={`Move column ${col.label} right`}>→</button>
      </div>
    </th>
  );
}

interface TableRowItemProps {
  row: TableRow;
  index: number;
  columns: TableColumn[];
  rows: TableRow[];
  setRows: React.Dispatch<React.SetStateAction<TableRow[]>>;
  updateRow: (id: number, key: string, newValue: string | boolean) => void;
  removeRow: (id: number) => void;
}
function TableRowItem({ row, index, columns, rows, setRows, updateRow, removeRow }: TableRowItemProps) {
  const [, drag] = useDrag({
    type: ItemTypeRow,
    item: { index },
  });
  const moveRow = (to: number) => {
    if (to < 0 || to >= rows.length || to === index) return;
    const updatedRows = [...rows];
    const [movedRow] = updatedRows.splice(index, 1);
    updatedRows.splice(to, 0, movedRow);
    setRows(updatedRows);
  };
  const [, drop] = useDrop({
    accept: ItemTypeRow,
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        const updatedRows = [...rows];
        const [movedRow] = updatedRows.splice(draggedItem.index, 1);
        updatedRows.splice(index, 0, movedRow);
        setRows(updatedRows);
        draggedItem.index = index;
      }
    },
  });
  return (
    <tr
      key={row.id}
      ref={node => { if (node) drag(drop(node)); }}
      className="hover:bg-gray-50 transition cursor-move"
    >
      {columns.map(col => (
        <td key={col.id} className="border border-gray-200 px-3 py-2 rounded text-center align-middle max-w-[120px]">
          {col.type === 'checkbox' ? (
            <input
              type="checkbox"
              aria-label={`Row ${index + 1}, ${col.label}`}
              checked={row[col.key] === true || row[col.key] === 'true'}
              onChange={e => updateRow(row.id, col.key, e.target.checked)}
            />
          ) : (
            <input
              type={col.type === 'number' ? 'number' : 'text'}
              aria-label={`Row ${index + 1}, ${col.label}`}
              value={row[col.key] ?? ''}
              onChange={e => updateRow(row.id, col.key, e.target.value)}
              className="text-center px-2 py-1 w-20 max-w-full rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
            />
          )}
        </td>
      ))}
      <td className="border px-3 py-2 rounded text-center align-middle">
        <div className="table-reorder-actions" aria-label={`Reorder row ${index + 1}`}>
          <button type="button" disabled={index === 0} onClick={() => moveRow(index - 1)} aria-label={`Move row ${index + 1} up`}>↑</button>
          <button type="button" disabled={index === rows.length - 1} onClick={() => moveRow(index + 1)} aria-label={`Move row ${index + 1} down`}>↓</button>
        </div>
        <button
          type="button"
          onClick={() => removeRow(row.id)}
          className={`rounded px-3 py-1 text-xs font-semibold transition ${rows.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={rows.length === 1}
          title={rows.length === 1 ? 'Cannot remove last row' : 'Delete row'}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

interface SimpleTableProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  showHeader?: boolean;
}

function SimpleTable({ id, updateWidget, showHeader = true }: SimpleTableProps) {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));

  // Default columns/rows if not present
  useEffect(() => {
    if (!widget?.columns || !widget?.rows) {
      updateWidget(id, {
        columns: [
          { id: 1, key: 'name', label: 'Name', type: 'text' },
          { id: 2, key: 'value', label: 'Value', type: 'text' }
        ],
        rows: [
          { id: 1, name: '', value: '' },
          { id: 2, name: '', value: '' }
        ]
      });
    }
  }, [widget, id, updateWidget]);

  const columns = useMemo(() => widget?.columns ?? [], [widget?.columns]);
  const rows = useMemo(() => widget?.rows ?? [], [widget?.rows]);
  const filter = widget?.tableFilter ?? '';
  const sortColumnKey = widget?.sortColumnKey ?? '';
  const sortDirection = widget?.sortDirection ?? 'asc';
  const visibleRows = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const filtered = query
      ? rows.filter((row) => columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(query)))
      : rows;
    if (!sortColumnKey) return filtered;
    const sortColumn = columns.find((column) => column.key === sortColumnKey);
    return [...filtered].sort((a, b) => {
      const comparison = sortColumn?.type === 'number'
        ? Number(a[sortColumnKey] ?? 0) - Number(b[sortColumnKey] ?? 0)
        : String(a[sortColumnKey] ?? '').localeCompare(String(b[sortColumnKey] ?? ''), undefined, { numeric: true });
      return comparison * (sortDirection === 'asc' ? 1 : -1);
    });
  }, [columns, filter, rows, sortColumnKey, sortDirection]);

  const setColumns: React.Dispatch<React.SetStateAction<TableColumn[]>> = (value) => {
  if (typeof value === 'function') {
    // value is a function: (prev: TableColumn[]) => TableColumn[]
    updateWidget(id, { columns: value(columns) });
  } else {
    // value is a TableColumn[]
    updateWidget(id, { columns: value });
  }
};
  const setRows: React.Dispatch<React.SetStateAction<TableRow[]>> = (value) => {
  if (typeof value === 'function') {
    updateWidget(id, { rows: value(rows) });
  } else {
    updateWidget(id, { rows: value });
  }
};

  const updateRow = (id: number, key: string, newValue: string | boolean) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: newValue } : row)));
  };

  const addRow = () => {
    const newRow: TableRow = { id: Date.now() };
    columns.forEach((col) => {
      newRow[col.key] = '';
    });
    setRows((prev) => [...prev, newRow]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const addColumn = () => {
    const newId = Date.now();
    const newKey = `col${newId}`;
    const newLabel = `Column ${columns.length + 1}`;
    setColumns((prev) => [...prev, { id: newId, key: newKey, label: newLabel, type: 'text' }]);
    setRows((prev) => prev.map((row) => ({ ...row, [newKey]: '' })));
  };

  const updateColumnLabel = (id: number, newLabel: string) => {
    setColumns((prev) => prev.map((col) => (col.id === id ? { ...col, label: newLabel } : col)));
  };

  const updateColumnType = (id: number, type: NonNullable<TableColumn['type']>) => {
    setColumns((prev) => prev.map((col) => (col.id === id ? { ...col, type } : col)));
  };

  const removeColumn = (id: number) => {
    const col = columns.find((c) => c.id === id);
    if (!col) return;
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setRows(rows.map((row) => {
      const newRow = { ...row };
      delete newRow[col.key];
      return newRow;
    }));
  };

  const applyTemplate = (template: NonNullable<Widget['tableTemplate']>) => {
    const next = tableTemplates[template];
    updateWidget(id, {
      tableTemplate: template,
      columns: next.columns.map((column) => ({ ...column })),
      rows: next.rows.map((row) => ({ ...row, id: Date.now() + row.id })),
      sortColumnKey: '',
      tableFilter: '',
    });
  };

  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      columns.map((column) => escape(column.label)).join(','),
      ...rows.map((row) => columns.map((column) => escape(row[column.key])).join(',')),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `arcana-table-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (file: File | undefined) => {
    if (!file) return;
    const lines = (await file.text()).split(/\r?\n/).filter(Boolean);
    if (!lines.length) return;
    const parseLine = (line: string) => line.split(',').map((value) => value.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    const labels = parseLine(lines[0]);
    const importedColumns = labels.map((label, index) => ({ id: Date.now() + index, key: `csv${index}`, label: label || `Column ${index + 1}`, type: 'text' as const }));
    const importedRows = lines.slice(1).map((line, rowIndex) => {
      const values = parseLine(line);
      return Object.fromEntries([['id', Date.now() + rowIndex], ...importedColumns.map((column, index) => [column.key, values[index] ?? ''])]) as TableRow;
    });
    updateWidget(id, { columns: importedColumns, rows: importedRows.length ? importedRows : [{ id: Date.now() }], tableTemplate: 'blank' });
  };

  const helpText = `Create and manage custom data tables for tracking campaign information.

Click on column headers to rename them. Click on any cell to edit its contents.

Drag and drop column headers to reorder columns. Drag and drop rows to reorder them.

Use "+ Row" to add new rows and "+ Column" to add new columns. Click the × button on column headers or the "Delete" button on rows to remove them.

Note: You must keep at least one row and one column in your table.`;

  try {
    // Defensive: if columns/rows are missing, do not render table
    if (!columns.length || !rows.length) return <div>Loading table...</div>;
    return (
      <div className="surface p-2 rounded-lg w-full h-full flex flex-col font-sans max-w-full">
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Simple Table</h2>
            <WidgetHelpButton helpText={helpText} />
          </div>
        )}

        <div className="simple-table__controls">
          <label>
            <span>Template</span>
            <select value={widget?.tableTemplate ?? 'blank'} onChange={(event) => applyTemplate(event.target.value as NonNullable<Widget['tableTemplate']>)}>
              <option value="blank">Blank</option>
              <option value="initiative">Initiative</option>
              <option value="loot">Loot</option>
              <option value="travel">Travel</option>
            </select>
          </label>
          <label>
            <span>Filter</span>
            <input type="search" value={filter} onChange={(event) => updateWidget(id, { tableFilter: event.target.value })} placeholder="Find a row" />
          </label>
          <label>
            <span>Sort</span>
            <select value={sortColumnKey} onChange={(event) => updateWidget(id, { sortColumnKey: event.target.value })}>
              <option value="">Manual order</option>
              {columns.map((column) => <option key={column.id} value={column.key}>{column.label}</option>)}
            </select>
          </label>
          <button type="button" disabled={!sortColumnKey} onClick={() => updateWidget(id, { sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' })}>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</button>
          <button type="button" onClick={exportCsv}>Export CSV</button>
          <label className="screen-action-button screen-action-button--quiet template-import-button">Import CSV<input type="file" accept="text/csv,.csv" onChange={(event) => void importCsv(event.target.files?.[0])} /></label>
        </div>

      <div className="flex-1 overflow-x-auto w-full">
        <table className="min-w-[400px] max-w-full text-left border-separate border-spacing-y-2">
          <caption className="sr-only">Editable custom data table. Each row and column can be reordered with the adjacent arrow buttons.</caption>
          <thead>
            <tr>
                {columns.map((col, index) => (
                  <TableColumnHeader
                    key={col.id}
                    col={col}
                    index={index}
                    columns={columns}
                    setColumns={setColumns}
                    updateColumnLabel={updateColumnLabel}
                    updateColumnType={updateColumnType}
                    removeColumn={removeColumn}
                  />
                ))}
                <th className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-t text-center align-middle">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((row) => (
                <TableRowItem
                  key={row.id}
                  row={row}
                  index={rows.indexOf(row)}
                  columns={columns}
                  rows={rows}
                  setRows={setRows}
                  updateRow={updateRow}
                  removeRow={removeRow}
                />
              ))}
            </tbody>
          </table>
        </div>

        {visibleRows.length === 0 && <p className="tool-empty-state">No rows match this filter.</p>}

        <div className="flex gap-3 mt-6 justify-end">
          <button
            type="button"
            onClick={addRow}
            className="rounded px-2 py-1 text-xs transition font-semibold"
          >
            + Row
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="py-2 px-5 rounded transition font-semibold"
          >
            + Column
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering SimpleTable:', error);
    return (
      <div className="flex items-center justify-center h-full w-full transition">
        <p>There was an error rendering the table. Please reload the page or check the console for details.</p>
      </div>
    );
  }
}

export default memo(SimpleTable);
