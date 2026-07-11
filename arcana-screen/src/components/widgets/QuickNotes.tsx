import { memo, useEffect } from 'react';
import WidgetHelpButton from '../WidgetHelpButton/WidgetHelpButton';
import { useWidgetStore } from '../../store/useWidgetStore';

interface QuickNotesProps {
  id: string;
}

function QuickNotes({ id }: QuickNotesProps) {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));
  const updateWidget = useWidgetStore(state => state.updateWidget);

  const text = widget?.text || '';

  // Initialize text property if not present
  useEffect(() => {
    if (widget && !widget.text) {
      updateWidget(id, { text: '' });
    }
  }, [id, widget, updateWidget]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateWidget(id, { text: e.target.value });
  };

  const helpText = `Quick Notes is a simple text area for jotting down important information during your session.

Use it for:
• Campaign notes and reminders
• NPC names and details
• Quest objectives
• Random ideas and improvisation notes
• Session planning

Note: Your notes are stored locally in your browser and will persist between sessions.`;

  return (
    <div className="surface p-4 rounded-lg shadow-md w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Quick Notes</h2>
        <WidgetHelpButton helpText={helpText} />
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Write your notes here..."
        className="flex-1 border rounded p-2 resize-none focus:outline-none focus:ring-2"
        style={{ fontSize: '1em' }}
      />
    </div>
  );
}

export default memo(QuickNotes);
