Per usare il Profile Manager:

1. Assicurati di avere react-hot-toast tra le dipendenze del progetto:
   npm install react-hot-toast

2. Importa e monta il componente Toaster nel tuo entry point (es. App.tsx):

   import { Toaster } from 'react-hot-toast';
   ...
   <Toaster />

3. Usa <ProfileManager /> dove vuoi gestire i profili.
   Passa onLoadProfile (funzione che aggiorna il layout) e currentLayoutConfig (config attuale da salvare).

Esempio:

<ProfileManager
  onLoadProfile={setLayoutConfig}
  currentLayoutConfig={layoutConfig}
/>

Il componente mostra la lista dei profili, permette di crearne di nuovi, caricarli o eliminarli, e mostra feedback con toast.
