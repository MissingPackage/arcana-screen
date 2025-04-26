import { useState } from 'react';

export default function QuickNotes() {
  const [text, setText] = useState('');

  return (
    <div className="bg-yellow-100 text-gray-900 p-4 rounded-lg shadow-md w-full h-full flex flex-col">
      <h2 className="text-lg font-bold mb-2">Quick Notes</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your notes here..."
        className="flex-1 border border-gray-400 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
        style={{ color: '#222', background: '#fff', fontSize: '1em' }}
      />
    </div>
  );
}