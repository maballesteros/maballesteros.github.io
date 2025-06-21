

import React from 'react';
import { StoredJournal } from '../types';
import { BookOpenIcon, PlusIcon } from './icons'; 

interface JournalLibraryViewProps {
  journals: StoredJournal[];
  onSelectJournal: (journalId: string) => void;
  onCreateNewJournal: () => void;
  onDeleteJournal: (journalId: string) => void;
  // onExportAllJournals prop is no longer needed here as it's handled in SettingsView
}

const JournalLibraryView: React.FC<JournalLibraryViewProps> = ({ 
  journals, 
  onSelectJournal, 
  onCreateNewJournal, 
  onDeleteJournal
}) => {
  
  const handleDelete = (e: React.MouseEvent, journalId: string) => {
    e.stopPropagation(); // Prevent card click when clicking delete
    if (window.confirm("¿Estás seguro de que quieres eliminar este diario? Esta acción no se puede deshacer.")) {
      onDeleteJournal(journalId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-sky-800 text-center sm:text-left mb-4 sm:mb-0">Mis Diarios Personalizados</h2>
        {/* Import and Create New buttons moved to header in App.tsx */}
      </div>
      
      {journals.length === 0 && (
        <div className="text-center p-10 bg-white rounded-lg shadow-md">
          <BookOpenIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 text-lg mb-6">Aún no has creado ningún diario.</p>
          <button
            onClick={onCreateNewJournal}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out text-lg inline-flex items-center"
          >
            <PlusIcon className="w-6 h-6 mr-2" />
            Crear mi Primer Diario
          </button>
        </div>
      )}

      {journals.length > 0 && (
        <>
          {/* "Export All Journals" button removed from here */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {journals.map(journal => (
              <div 
                key={journal.id} 
                onClick={() => onSelectJournal(journal.id)}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer overflow-hidden flex flex-col group"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && onSelectJournal(journal.id)}
                aria-label={`Abrir diario: ${journal.journalIndex.title}`}
              >
                {journal.coverImageUrl ? (
                  <img 
                    src={journal.coverImageUrl} 
                    alt={`Portada del diario: ${journal.journalIndex.title}`}
                    className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity"
                    aria-hidden="true"
                  />
                ) : (
                  <div className="w-full h-40 bg-slate-200 flex items-center justify-center">
                    <BookOpenIcon className="w-16 h-16 text-slate-400" />
                  </div>
                )}
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-sky-700 mb-2">{journal.journalIndex.title}</h3>
                  <div className="text-xs text-slate-500 space-y-0.5 mb-3 mt-auto">
                      <p><strong>Rol:</strong> {journal.personalizationOptions.lifeRole}</p>
                      <p><strong>Objetivos:</strong> {journal.personalizationOptions.centralObjectives.join(', ').substring(0, 40)}{journal.personalizationOptions.centralObjectives.join(', ').length > 40 ? '...' : ''}</p>
                      <p className="text-slate-400">{journal.journalIndex.cadence}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-200">
                   <button
                      onClick={(e) => handleDelete(e, journal.id)}
                      className="w-full text-sm text-red-500 hover:text-red-700 font-medium py-1 px-2 rounded hover:bg-red-100 transition-colors"
                      aria-label={`Eliminar diario: ${journal.journalIndex.title}`}
                    >
                      Eliminar
                    </button>
                </div>
              </div>
            ))}
             {/* Create New Journal Card */}
            <div 
              onClick={onCreateNewJournal}
              className="bg-slate-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col items-center justify-center p-6 min-h-[220px] text-sky-600 hover:text-sky-700 border-2 border-dashed border-sky-300 hover:border-sky-500" // Adjusted min-height to match other cards better
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onCreateNewJournal()}
              aria-label="Crear un nuevo diario"
            >
              <PlusIcon className="w-12 h-12 mb-2" />
              <span className="font-semibold text-center">Crear Nuevo Diario</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JournalLibraryView;