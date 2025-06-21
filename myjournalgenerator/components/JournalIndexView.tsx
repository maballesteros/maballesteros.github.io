import React from 'react';
import { JournalIndex, JournalTheme, JournalSubChapter } from '../types';
import { BookOpenIcon, DownloadIcon } from './icons';

interface JournalIndexViewProps {
  journalIndex: JournalIndex;
  onSelectEntry: (themeIndex: number, subChapterIndex: number, themeTitle: string, subChapterTitle: string) => void;
  onGoToLibrary: () => void;
  onDownloadEpub: () => void;
  isGeneratingEpub?: boolean;
  onExportJson: () => void; // New prop
}

const JournalIndexView: React.FC<JournalIndexViewProps> = ({ 
  journalIndex, 
  onSelectEntry, 
  onGoToLibrary, 
  onDownloadEpub, 
  isGeneratingEpub,
  onExportJson 
}) => {
  if (!journalIndex || !journalIndex.themes) {
    return <p className="text-center text-red-500">Error: El índice del diario no está disponible.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-sky-800">{journalIndex.title}</h2>
        <p className="text-md text-slate-600 mt-2">{journalIndex.cadence}</p>
      </div>

      <div className="space-y-6">
        {journalIndex.themes.map((theme: JournalTheme, themeIdx: number) => (
          <div key={themeIdx} className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-sky-700 mb-4 flex items-center">
              <BookOpenIcon className="w-7 h-7 mr-3 text-sky-600" />
              {theme.theme}
            </h3>
            <ul className="space-y-2">
              {theme.subChapters.map((subChapter: JournalSubChapter, subChapterIdx: number) => (
                <li key={subChapterIdx}>
                  <button
                    onClick={() => onSelectEntry(themeIdx, subChapterIdx, theme.theme, subChapter.title)}
                    className="w-full text-left p-3 hover:bg-sky-50 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-300"
                    aria-label={`Abrir entrada: ${subChapter.title}`}
                  >
                    <span className="text-slate-700 font-medium">{subChapter.title}</span>
                    {subChapter.description && <p className="text-sm text-slate-500 mt-1">{subChapter.description}</p>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onGoToLibrary}
          className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
        >
          Ir a Mis Diarios
        </button>
        <button
          onClick={onDownloadEpub}
          disabled={isGeneratingEpub}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center w-full sm:w-auto"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          {isGeneratingEpub ? 'Generando EPUB...' : 'Descargar EPUB'}
        </button>
        <button
          onClick={onExportJson}
          disabled={isGeneratingEpub} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center w-full sm:w-auto"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          Exportar a JSON
        </button>
      </div>
    </div>
  );
};

export default JournalIndexView;