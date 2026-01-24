import ProfileManager from './ProfileManager';
import { useWidgetStore } from '../../store/useWidgetStore';

import type { Widget } from '../../store/useWidgetStore';

export default function ProfileManagerPanel() {
  const widgets = useWidgetStore((state) => state.widgets);
  const clearWidgets = useWidgetStore((state) => state.clearWidgets);
  const addWidget = useWidgetStore((state) => state.addWidget);

  // Salva la configurazione attuale dei widget
  const currentLayoutConfig = widgets;

  // Carica una configurazione profilo
  const handleLoadProfile = (profileLayout: Widget[]) => {
    clearWidgets();
    profileLayout.forEach((w) => addWidget(w));
  };

  return (
    <div className="mb-8">
      <ProfileManager
        onLoadProfile={handleLoadProfile}
        currentLayoutConfig={currentLayoutConfig}
      />
    </div>
  );
}
