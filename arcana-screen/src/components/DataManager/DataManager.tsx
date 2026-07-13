import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import type { ScreenImportStrategy } from '../../store/useScreenStore';
import { useTrustStore } from '../../store/trustStore';
import {
  exportBackup,
  exportRawLocalData,
  importBackup,
  listRecoverySnapshots,
  parseBackup,
  resetArcanaData,
  restoreRecoverySnapshot,
  type ImportPreview,
} from '../../utils/dataPortability';
import { verifyStorageHealth } from '../../utils/safeStorage';

export default function DataManager() {
  const trustStatus = useTrustStore((state) => state.status);
  const trustMessage = useTrustStore((state) => state.message);
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<ScreenImportStrategy>('merge');
  const [pastedBackup, setPastedBackup] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [, setSnapshotRevision] = useState(0);
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  const snapshots = listRecoverySnapshots();

  useEffect(() => {
    if (!isOpen) return;
    if (navigator.storage?.estimate) {
      void navigator.storage.estimate().then((estimate) => setStorageEstimate({
        usage: estimate.usage ?? 0,
        quota: estimate.quota ?? 0,
      }));
    }
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    ) ?? []).filter((element) => !element.hidden);
    focusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        window.setTimeout(() => triggerRef.current?.focus());
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = parseBackup(await file.text());
    if (result.ok) {
      setPreview(result.preview);
      setImportError(null);
    } else {
      setPreview(null);
      setImportError(result.error);
    }
    event.target.value = '';
  };

  const handleImport = () => {
    if (!preview) return;
    const count = importBackup(preview, strategy);
    toast.success(`${count} screen${count === 1 ? '' : 's'} imported`);
    setPreview(null);
    setSnapshotRevision((value) => value + 1);
  };

  const handlePastedPreview = () => {
    const result = parseBackup(pastedBackup);
    if (result.ok) {
      setPreview(result.preview);
      setImportError(null);
    } else {
      setPreview(null);
      setImportError(result.error);
    }
  };

  const handleRestore = (snapshotId: string) => {
    const snapshot = snapshots.find((item) => item.id === snapshotId);
    if (!snapshot) return;
    const result = restoreRecoverySnapshot(snapshot);
    if (result.ok) {
      toast.success(`Recovered ${result.count} screen${result.count === 1 ? '' : 's'}`);
      setSnapshotRevision((value) => value + 1);
    } else {
      toast.error(result.error);
    }
  };

  const handleStorageCheck = () => {
    const result = verifyStorageHealth();
    if (result.ok) toast.success('Local storage is available');
    else toast.error(result.message);
  };

  const handleBackupExport = () => {
    exportBackup();
    toast.success('Backup download started');
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetArcanaData();
    window.location.reload();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="screen-action-button screen-action-button--quiet"
        onClick={() => setIsOpen(true)}
      >
        Data & recovery
      </button>

      {isOpen && (
        <div className="data-manager__backdrop" role="presentation">
          <section ref={dialogRef} className="surface data-manager" role="dialog" aria-modal="true" aria-label="Data and recovery">
            <header className="data-manager__header">
              <div>
                <h2>Data & recovery</h2>
                <p>Export, validate, import or restore your local workspace.</p>
              </div>
              <button
                type="button"
                className="screen-action-button screen-action-button--quiet"
                onClick={() => {
                  setIsOpen(false);
                  window.setTimeout(() => triggerRef.current?.focus());
                }}
              >
                Close
              </button>
            </header>

            <div className={`data-status data-status--${trustStatus}`} role="status">
              <strong>{trustStatus === 'error' ? 'Storage needs attention' : 'Local data is available'}</strong>
              <span>{trustMessage ?? 'Changes are saved in this browser.'}</span>
              <button
                type="button"
                className="screen-action-button screen-action-button--quiet"
                onClick={handleStorageCheck}
              >
                Check storage
              </button>
            </div>

            <div className="data-manager__grid">
              <section className="data-card">
                <h3>Storage quota</h3>
                {storageEstimate?.quota ? (
                  <>
                    <p>{(storageEstimate.usage / 1024 / 1024).toFixed(2)} MB used of {(storageEstimate.quota / 1024 / 1024).toFixed(0)} MB available to this origin.</p>
                    <progress max={storageEstimate.quota} value={storageEstimate.usage}>{(storageEstimate.usage / storageEstimate.quota * 100).toFixed(1)}%</progress>
                  </>
                ) : (
                  <p>This browser does not expose a storage estimate.</p>
                )}
                <button
                  type="button"
                  className="screen-action-button screen-action-button--quiet"
                  onClick={() => void navigator.storage?.persist?.().then((granted) => toast(granted ? 'Persistent storage granted' : 'Browser kept its current storage policy'))}
                >
                  Request persistent storage
                </button>
              </section>
              <section className="data-card">
                <h3>Portable backup</h3>
                <p>Download all screens, tool state and current preferences as JSON.</p>
                <button type="button" className="screen-action-button" onClick={handleBackupExport}>
                  Export backup
                </button>
              </section>

              <section className="data-card">
                <h3>Import backup</h3>
                <p>Select an ArcanaScreen backup. Nothing changes until you confirm.</p>
                <label className="data-manager__file">
                  <span>Backup file</span>
                  <input type="file" accept="application/json,.json" onChange={handleFile} />
                </label>
                <details className="data-manager__paste">
                  <summary>Paste backup JSON</summary>
                  <label>
                    <span>Backup JSON</span>
                    <textarea
                      value={pastedBackup}
                      onChange={(event) => setPastedBackup(event.target.value)}
                      placeholder="Paste an ArcanaScreen backup here"
                    />
                  </label>
                  <button
                    type="button"
                    className="screen-action-button screen-action-button--quiet"
                    onClick={handlePastedPreview}
                  >
                    Preview pasted backup
                  </button>
                </details>
                {importError && <p className="data-manager__error" role="alert">{importError}</p>}
                {preview && (
                  <div className="import-preview">
                    <strong>{preview.screenNames.length} screens ready</strong>
                    <ul>
                      {preview.screenNames.map((name, index) => (
                        <li key={`${name}-${index}`}>{name}</li>
                      ))}
                    </ul>
                    {preview.warnings.map((warning) => (
                      <p className="data-manager__warning" key={warning}>{warning}</p>
                    ))}
                    <fieldset>
                      <legend>Import behavior</legend>
                      <label>
                        <input
                          type="radio"
                          name="import-strategy"
                          checked={strategy === 'merge'}
                          onChange={() => setStrategy('merge')}
                        />
                        Merge with current screens
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="import-strategy"
                          checked={strategy === 'replace'}
                          onChange={() => setStrategy('replace')}
                        />
                        Replace current screens
                      </label>
                    </fieldset>
                    <button type="button" className="screen-action-button" onClick={handleImport}>
                      Confirm import
                    </button>
                  </div>
                )}
              </section>

              <section className="data-card data-card--wide">
                <h3>Recovery snapshots</h3>
                <p>Restore a recent known local state. Restoring creates another recovery point.</p>
                {snapshots.length === 0 ? (
                  <p>No recovery snapshots yet.</p>
                ) : (
                  <ul className="recovery-list">
                    {snapshots.map((snapshot) => (
                      <li key={snapshot.id}>
                        <span>{new Date(snapshot.createdAt).toLocaleString()}</span>
                        <button
                          type="button"
                          className="screen-action-button screen-action-button--quiet"
                          onClick={() => handleRestore(snapshot.id)}
                        >
                          Restore
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="data-card data-card--danger">
                <h3>Advanced recovery</h3>
                <p>Export raw local payloads before resetting this browser.</p>
                <div className="data-card__actions">
                  <button
                    type="button"
                    className="screen-action-button screen-action-button--quiet"
                    onClick={exportRawLocalData}
                  >
                    Export raw data
                  </button>
                  <button
                    type="button"
                    className="screen-action-button screen-action-button--danger"
                    onClick={handleReset}
                  >
                    {confirmReset ? 'Confirm local reset' : 'Reset local data'}
                  </button>
                </div>
                {confirmReset && (
                  <p className="data-manager__warning" role="alert">
                    This removes ArcanaScreen data from this browser. Export first if needed.
                  </p>
                )}
              </section>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
