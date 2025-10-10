import { useState, type ChangeEvent } from 'react';

import { useAppStore } from '@/store/appStore';
import type { BackupPayload } from '@/types';

function formatCount(label: string, count: number) {
  return (
    <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
      <span>{label}</span>
      <span className="font-semibold text-white">{count}</span>
    </div>
  );
}

export default function BackupsView() {
  const exportBackup = useAppStore((state) => state.exportBackup);
  const importBackup = useAppStore((state) => state.importBackup);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importSummary, setImportSummary] = useState<BackupPayload | null>(null);

  const handleExport = () => {
    try {
      const payload = exportBackup();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `sport-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', text: 'Backup exportado correctamente.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', text: 'No se pudo exportar el backup.' });
    }
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const payload = JSON.parse(raw) as BackupPayload;
      importBackup(payload);
      setImportSummary(payload);
      setFeedback({ type: 'success', text: 'Datos importados correctamente.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', text: 'No se pudo importar el archivo. Revisa que sea un JSON válido.' });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Backups</h1>
            <p className="text-white/60">
              Exporta e importa toda tu información en JSON versionado para compartir o restaurar en cualquier momento.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn-primary" onClick={handleExport}>
              Descargar backup
            </button>
            <label className="btn-secondary cursor-pointer">
              Importar backup
              <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>
        {feedback && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </header>

      {importSummary && (
        <section className="glass-panel space-y-4 p-6">
          <h2 className="text-xl font-semibold text-white">Última importación</h2>
          <p className="text-sm text-white/60">Versión del backup: {importSummary.version}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {formatCount('Objetivos', importSummary.objetivos?.length ?? 0)}
            {formatCount('Trabajos', importSummary.trabajos?.length ?? 0)}
            {formatCount('Sesiones', importSummary.sesiones?.length ?? 0)}
            {formatCount('Asistentes', importSummary.asistentes?.length ?? 0)}
            {formatCount('Sesiones · Trabajos', importSummary.sesiones_trabajos?.length ?? 0)}
            {formatCount('Sesiones · Asistencias', importSummary.sesiones_asistencias?.length ?? 0)}
          </div>
        </section>
      )}

      <section className="glass-panel space-y-3 p-6 text-sm text-white/70">
        <h2 className="text-lg font-semibold text-white">Consejos</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Guarda tus backups en un servicio en la nube para poder restaurarlos desde cualquier dispositivo.</li>
          <li>
            Antes de importar, realiza una exportación por seguridad. La restauración sobrescribe los datos actuales sin
            posibilidad de deshacer.
          </li>
          <li>Los backups mantienen los IDs, así que puedes sincronizar manualmente varias instalaciones si lo necesitas.</li>
        </ul>
      </section>
    </div>
  );
}
