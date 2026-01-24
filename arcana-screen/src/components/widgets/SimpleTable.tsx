import { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useWidgetStore } from '../../store/useWidgetStore';

interface TableRow {
  id: number;
  [key: string]: any;
}

interface TableColumn {
  id: number;
  key: string;
  label: string;
}

const ItemTypeRow = 'ROW';
const ItemTypeColumn = 'COLUMN';

interface TableColumnHeaderProps {
  col: TableColumn;
  index: number;
  columns: TableColumn[];
  setColumns: React.Dispatch<React.SetStateAction<TableColumn[]>>;
  updateColumnLabel: (id: number, newLabel: string) => void;
  removeColumn: (id: number) => void;
}
function TableColumnHeader({ col, index, columns, setColumns, updateColumnLabel, removeColumn }: TableColumnHeaderProps) {
  const [, drag, preview] = useDrag({
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
  return (
    <th
      key={col.id}
      ref={node => { if (node) drag(drop(node)); }}
      className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-t text-center align-middle cursor-move transition-all"
    >
      <div className="flex items-center justify-center gap-1">
        <input
          value={col.label}
          onChange={e => updateColumnLabel(col.id, e.target.value)}
          className="text-center px-2 py-1 w-24 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
          style={{ fontWeight: 500 }}
        />
        {columns.length > 1 ? (
          <button
            className="ml-1 text-red-500 hover:bg-red-100 rounded-full p-1 transition"
            onClick={() => removeColumn(col.id)}
            title="Remove column"
            tabIndex={-1}
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
        ) : (
          <button
            className="ml-1 rounded-full p-1 cursor-not-allowed"
            disabled
            title="Cannot remove last column"
            tabIndex={-1}
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
        )}
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
  updateRow: (id: number, key: string, newValue: string) => void;
  removeRow: (id: number) => void;
}
function TableRowItem({ row, index, columns, rows, setRows, updateRow, removeRow }: TableRowItemProps) {
  const [, drag, preview] = useDrag({
    type: ItemTypeRow,
    item: { index },
  });
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
          <input
            value={row[col.key] || ''}
            onChange={e => updateRow(row.id, col.key, e.target.value)}
            className="text-center px-2 py-1 w-20 max-w-full rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
          />
        </td>
      ))}
      <td className="border px-3 py-2 rounded text-center align-middle">
        <button
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
  updateWidget: (id: string, updates: any) => void;
}

export default function SimpleTable({ id, updateWidget }: SimpleTableProps) {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));

  // Default columns/rows if not present
  useEffect(() => {
    if (!widget?.columns || !widget?.rows) {
      updateWidget(id, {
        columns: [
          { id: 1, key: 'name', label: 'Name' },
          { id: 2, key: 'value', label: 'Value' }
        ],
        rows: [
          { id: 1, name: '', value: '' },
          { id: 2, name: '', value: '' }
        ]
      });
    }
  }, [widget, id, updateWidget]);

  const columns = widget?.columns || [];
  const rows = widget?.rows || [];

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

  const updateRow = (id: number, key: string, newValue: string) => {
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
    setColumns((prev) => [...prev, { id: newId, key: newKey, label: newLabel }]);
    setRows((prev) => prev.map((row) => ({ ...row, [newKey]: '' })));
    setRows(rows.map((row) => ({ ...row, [newKey]: '' })));
  };

  const updateColumnLabel = (id: number, newLabel: string) => {
    setColumns((prev) => prev.map((col) => (col.id === id ? { ...col, label: newLabel } : col)));
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

  try {
    // Defensive: if columns/rows are missing, do not render table
    if (!columns.length || !rows.length) return <div>Loading table...</div>;
    return (
      <div className="bg-white text-gray-800 p-2 rounded-xl shadow-lg w-full h-full flex flex-col font-sans max-w-full">
        <h2 className="text-xl font-bold mb-4 tracking-tight">Simple Table</h2>

      <div className="flex-1 overflow-x-auto w-full">
        <table className="min-w-[400px] max-w-full text-left border-separate border-spacing-y-2">
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
                    removeColumn={removeColumn}
                  />
                ))}
                <th className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-t text-center align-middle">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <TableRowItem
                  key={row.id}
                  row={row}
                  index={index}
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

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={addRow}
            className="rounded px-2 py-1 text-xs transition font-semibold"
          >
            + Row
          </button>
          <button
            onClick={addColumn}
            className="py-2 px-5 rounded transition font-semibold"
          >
            + Column
          </button>
        </div>
      </div>
    );
  } catch (e) {
    return (
      <div className="flex items-center justify-center h-full w-full transition">
        <p>There was an error rendering the table. Please reload the page or check the console for details.</p>
      </div>
    );
  }
}
