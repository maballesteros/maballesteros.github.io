
import React, { useState, useEffect, useRef } from 'react';
import { DownloadIcon, UploadIcon, TrashIcon, CogIcon } from './icons';
import { LOCAL_STORAGE_GEMINI_API_KEY } from '../constants';

interface SettingsViewProps {
  onExportAllJournals: () => void;
  onImportAllJournals: (file: File) => void;
  promptDeleteAllData: () => void; // Changed from onDeleteAllData
  onGoToLibrary: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  onExportAllJournals,
  onImportAllJournals,
  promptDeleteAllData, // Use the new prop
  onGoToLibrary
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_GEMINI_API_KEY);
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey) {
      localStorage.setItem(LOCAL_STORAGE_GEMINI_API_KEY, apiKey);
      alert('Clave API guardada correctamente.');
    } else {
      localStorage.removeItem(LOCAL_STORAGE_GEMINI_API_KEY);
      alert('Clave API eliminada.');
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem(LOCAL_STORAGE_GEMINI_API_KEY);
    alert('Clave API eliminada.');
  };

  const fileInputRefAllJournals = useRef<HTMLInputElement>(null);

  const handleImportAllClick = () => {
    fileInputRefAllJournals.current?.click();
  };

  const handleFileChangeAllJournals = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportAllJournals(file);
    }
    if (event.target) {
      event.target.value = ""; 
    }
  };

  const handleDeleteAllTrigger = () => {
    promptDeleteAllData(); // Call the prop that will trigger the modal(s)
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-3xl font-bold text-sky-800 mb-8 text-center">Configuración de la Aplicación</h2>

      <div className="space-y-6">
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-sky-700 mb-3 flex items-center">
            <CogIcon className="w-6 h-6 mr-2 text-sky-600" />
            Clave de API de Gemini
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Ingresa tu clave de API de Gemini. Si no la estableces, se usará la clave definida en las variables de entorno.
          </p>
          <div className="flex space-x-2">
            <input
              type="password"
              className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-slate-900"
              placeholder="Ingresa tu clave API"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              onClick={handleSaveApiKey}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              Guardar
            </button>
            <button
              onClick={handleClearApiKey}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              Borrar
            </button>
          </div>
        </section>
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-sky-700 mb-3 flex items-center">
            <DownloadIcon className="w-6 h-6 mr-2 text-sky-600" />
            Exportar Todos los Diarios
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Crea una copia de seguridad de todos tus diarios. Esto generará un único archivo JSON
            que podrás guardar en tu dispositivo y usar para importar tus diarios más tarde o en otro navegador.
          </p>
          <button
            onClick={onExportAllJournals}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out inline-flex items-center justify-center"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Exportar Todos a JSON
          </button>
        </section>

        <section className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-sky-700 mb-3 flex items-center">
            <UploadIcon className="w-6 h-6 mr-2 text-sky-600" />
            Importar Diarios desde JSON
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Importa múltiples diarios desde un archivo JSON (previamente exportado con la opción "Exportar Todos los Diarios").
            Los diarios importados se añadirán a tu biblioteca actual. Si existen diarios con el mismo ID, se les asignará un nuevo ID para evitar conflictos.
          </p>
          <input
            type="file"
            accept=".json"
            ref={fileInputRefAllJournals}
            onChange={handleFileChangeAllJournals}
            className="hidden"
            aria-hidden="true"
          />
          <button
            onClick={handleImportAllClick}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out inline-flex items-center justify-center"
          >
            <UploadIcon className="w-5 h-5 mr-2" />
            Seleccionar Archivo JSON para Importar
          </button>
        </section>

        <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-lg">
          <h3 className="text-xl font-semibold text-red-700 mb-3 flex items-center">
            <TrashIcon className="w-6 h-6 mr-2 text-red-600" />
            Zona Peligrosa: Borrar Todos los Datos
          </h3>
          <p className="text-sm text-red-600 mb-4">
            <strong>¡Atención!</strong> Esta acción eliminará permanentemente todos tus diarios y configuraciones
            guardados en este navegador. Esta operación no se puede deshacer.
            Se recomienda exportar tus datos antes de proceder si deseas conservarlos.
          </p>
          <button
            onClick={handleDeleteAllTrigger} // Use the new handler
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out inline-flex items-center justify-center"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Borrar Todos los Datos de la Aplicación
          </button>
        </section>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onGoToLibrary}
          className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Volver a Mis Diarios
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
