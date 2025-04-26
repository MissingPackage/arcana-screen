import { useState } from 'react';

interface TableRow {
  id: number;
  [key: string]: any;
}

interface TableColumn {
  id: number;
  key: string;
  label: string;
}

export default function SimpleTable() {
  const [columns, setColumns] = useState<TableColumn[]>([
    { id: 1, key: 'name', label: 'Name' },
    { id: 2, key: 'value', label: 'Value' }
  ]);
  const [rows, setRows] = useState<TableRow[]>([
    { id: 1, name: 'Condition', value: 'OK' },
    { id: 2, name: 'Check', value: 'Pass' },
  ]);

  // Update a cell value
  const updateRow = (id: number, key: string, newValue: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: newValue } : row))
    );
  };

  // Add a new row with empty values for all columns
  const addRow = () => {
    const newRow: TableRow = { id: Date.now() };
    columns.forEach((col) => {
      newRow[col.key] = '';
    });
    setRows((prev) => [...prev, newRow]);
  };

  // Remove a row
  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  // Add a new column
  const addColumn = () => {
    const newId = Date.now();
    const newKey = `col${newId}`;
    const newLabel = `Column ${columns.length + 1}`;
    setColumns((prev) => [...prev, { id: newId, key: newKey, label: newLabel }]);
    setRows((prevRows) =>
      prevRows.map((row) => ({ ...row, [newKey]: '' }))
    );
  };

  // Update column label
  const updateColumnLabel = (id: number, newLabel: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, label: newLabel } : col))
    );
  };

  // Remove a column
  const removeColumn = (id: number) => {
    const col = columns.find((c) => c.id === id);
    if (!col) return;
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setRows((prevRows) =>
      prevRows.map((row) => {
        const newRow = { ...row };
        delete newRow[col.key];
        return newRow;
      })
    );
  };


  return (
    <div className="bg-white text-gray-800 p-2 rounded-xl shadow-lg w-full h-full flex flex-col font-sans max-w-full">
      <h2 className="text-xl font-bold mb-4 tracking-tight">Simple Table</h2>

      <div className="flex-1 overflow-x-auto w-full">
        <table className="min-w-[400px] max-w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.id} className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-t text-center align-middle">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      value={col.label}
                      onChange={(e) => updateColumnLabel(col.id, e.target.value)}
                      className="text-center px-2 py-1 w-24 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                      style={{ fontWeight: 500 }}
                    />
                    {columns.length > 1 && (
                      <button
                        className="ml-1 text-red-500 hover:bg-red-100 rounded-full p-1 transition"
                        onClick={() => removeColumn(col.id)}
                        title="Remove column"
                        tabIndex={-1}
                        style={{ lineHeight: 1 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-t text-center align-middle">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={col.id} className="border border-gray-200 px-3 py-2 rounded text-center align-middle max-w-[120px]">
                    <input
                      value={row[col.key] || ''}
                      onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                      className="text-center px-2 py-1 w-20 max-w-full rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                    />
                  </td>
                ))}
                <td className="border border-gray-200 px-3 py-2 rounded text-center align-middle">
                  <button
                    onClick={() => removeRow(row.id)}
                    className="bg-red-100 text-red-600 rounded px-3 py-1 text-xs font-semibold hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={addRow}
          className="bg-blue-600 text-white py-2 px-5 rounded-lg shadow hover:bg-blue-700 font-semibold transition"
        >
          + Row
        </button>
        <button
          onClick={addColumn}
          className="bg-green-600 text-white py-2 px-5 rounded-lg shadow hover:bg-green-700 font-semibold transition"
        >
          + Column
        </button>
      </div>
    </div>
  );
}
