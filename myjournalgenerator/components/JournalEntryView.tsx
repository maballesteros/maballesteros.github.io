
import React, { useState, useEffect } from 'react';
import { JournalEntry, EntryContentType, PersonalizationOptions } from '../types';
import { SparklesIcon, PencilIcon, CheckCircleIcon, ArrowLeftIcon } from './icons';
import { convertMarkdownToHtml } from '../utils/textUtils'; // Import the new utility

interface JournalEntryViewProps {
  entry: JournalEntry;
  journalPersonalizationOptions: PersonalizationOptions; // To know if illustrations are generally enabled
  onBackToIndex: () => void;
  onSaveNotes: (entryId: string, notes: string) => void;
  onToggleChallenge: (entryId: string, completed: boolean) => void;
  onRegenerateContent: () => void;
  onGenerateOrRegenerateIllustration: () => void;
  isRegeneratingEntryContent: boolean;
  isManagingIllustration: boolean;
}

// Helper function to get a user-friendly display name for the content type
const getEntryContentTypeDisplayName = (contentType: EntryContentType): string => {
  switch (contentType) {
    case EntryContentType.CONCISE_COMMENTARY:
      return "Comentario Conciso";
    case EntryContentType.INSPIRATIONAL_NARRATIVE:
      return "Narrativa Inspiradora";
    case EntryContentType.HISTORICAL_ANECDOTE:
      return "Anécdota Histórica";
    case EntryContentType.PHILOSOPHICAL_EXPLORATION:
      return "Exploración Filosófica";
    default:
      return "Contenido Principal";
  }
};

const EntryBlock: React.FC<{ title: string; icon?: React.ReactNode; children?: React.ReactNode; htmlContent?: string; titleColor?: string; className?: string }> = 
  ({ title, icon, children, htmlContent, titleColor = "text-sky-700", className = "" }) => (
  <div className={`mb-6 p-5 bg-white shadow-md rounded-lg ${className}`}>
    <h4 className={`text-xl font-semibold ${titleColor} mb-3 flex items-center`}>
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </h4>
    {htmlContent ? (
      <div className="text-slate-700 leading-relaxed prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    ) : (
      <div className="text-slate-700 leading-relaxed">{children}</div>
    )}
  </div>
);

const JournalEntryView: React.FC<JournalEntryViewProps> = ({ 
    entry, 
    journalPersonalizationOptions,
    onBackToIndex, 
    onSaveNotes, 
    onToggleChallenge,
    onRegenerateContent,
    onGenerateOrRegenerateIllustration,
    isRegeneratingEntryContent,
    isManagingIllustration
}) => {
  const [notes, setNotes] = useState(entry.notes || '');
  const [challengeCompleted, setChallengeCompleted] = useState(entry.challengeCompleted || false);

  useEffect(() => {
    setNotes(entry.notes || '');
    setChallengeCompleted(entry.challengeCompleted || false);
  }, [entry]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = () => {
    onSaveNotes(entry.id, notes);
  };

  const handleToggleChallenge = () => {
    const newStatus = !challengeCompleted;
    setChallengeCompleted(newStatus);
    onToggleChallenge(entry.id, newStatus);
  };

  const mainContentTitle = getEntryContentTypeDisplayName(entry.entryContentType);
  const formattedMainContent = convertMarkdownToHtml(entry.mainContent);
  const generalDisable = isRegeneratingEntryContent || isManagingIllustration;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <button
        onClick={onBackToIndex}
        disabled={generalDisable}
        className="mb-6 flex items-center text-sky-600 hover:text-sky-800 font-semibold transition duration-150 disabled:opacity-50"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al Índice
      </button>

      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-sky-800">{entry.subChapterTitle}</h2>
        <p className="text-md text-slate-500">Parte de: {entry.themeTitle}</p>
      </header>

      {entry.illustrationUrl && (
        <div className="mb-6 p-2 bg-white shadow-md rounded-lg overflow-hidden">
          <img 
            src={entry.illustrationUrl} 
            alt={`Ilustración para ${entry.subChapterTitle}`} 
            className="w-full h-auto object-cover rounded-md max-h-96" 
            aria-describedby="illustration-description"
            />
          <p id="illustration-description" className="sr-only">Ilustración generada por IA relacionada con el tema de la entrada.</p>
        </div>
      )}

      <EntryBlock title="Chispa" icon={<SparklesIcon className="w-5 h-5 text-yellow-500" />} titleColor="text-yellow-600">
        <blockquote className="italic">
          <p>"{entry.spark.quote}"</p>
          {entry.spark.author && <footer className="text-sm text-slate-500 mt-1">- {entry.spark.author}</footer>}
        </blockquote>
      </EntryBlock>

      <EntryBlock title={mainContentTitle} htmlContent={formattedMainContent} />

      <EntryBlock title="Pregunta de Diario">
        <p>{entry.journalQuestion}</p>
      </EntryBlock>

      <EntryBlock title="Mini-Reto">
        <p>{entry.miniChallenge}</p>
        <button
          onClick={handleToggleChallenge}
          disabled={generalDisable}
          className={`mt-3 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            challengeCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-150 disabled:opacity-50`}
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {challengeCompleted ? 'Reto Completado' : 'Marcar como Completado'}
        </button>
      </EntryBlock>

      <EntryBlock title="Mis Notas" icon={<PencilIcon className="w-5 h-5 text-green-600" />} titleColor="text-green-700">
        <textarea
          key="journalEntryNotesTextarea"
          value={notes}
          onChange={handleNotesChange}
          onBlur={handleSaveNotes} // Save on blur
          rows={5}
          placeholder="Escribe tus reflexiones aquí..."
          className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 resize-y disabled:bg-slate-50"
          aria-label="Mis notas sobre la entrada"
          disabled={generalDisable}
        />
        <button
          onClick={handleSaveNotes}
          disabled={generalDisable}
          className="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out text-sm disabled:opacity-50"
        >
          Guardar Notas
        </button>
      </EntryBlock>

      <hr className="my-8 border-slate-300" />

      <div className="p-4 bg-slate-50 rounded-lg shadow space-y-3 sm:space-y-0 sm:flex sm:space-x-3">
        <button
            onClick={onRegenerateContent}
            disabled={generalDisable || isRegeneratingEntryContent}
            className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
            aria-label="Regenerar el contenido principal de esta entrada"
        >
            {isRegeneratingEntryContent ? 'Regenerando Contenido...' : 'Regenerar Contenido'}
        </button>
        
        {entry.illustrationUrl ? (
            <button
                onClick={onGenerateOrRegenerateIllustration}
                disabled={generalDisable || isManagingIllustration}
                className="w-full sm:w-auto flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                aria-label="Regenerar la ilustración de esta entrada"
            >
                {isManagingIllustration ? 'Regenerando Ilustración...' : 'Regenerar Ilustración'}
            </button>
        ) : (
             journalPersonalizationOptions.generateIllustrations && ( // Only show "Generate" if illustrations are generally enabled for the journal
                <button
                    onClick={onGenerateOrRegenerateIllustration}
                    disabled={generalDisable || isManagingIllustration}
                    className="w-full sm:w-auto flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                    aria-label="Generar una ilustración para esta entrada"
                >
                    {isManagingIllustration ? 'Generando Ilustración...' : 'Generar Ilustración'}
                </button>
            )
        )}
      </div>
    </div>
  );
};

export default JournalEntryView;
