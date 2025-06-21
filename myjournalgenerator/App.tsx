

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PersonalizationOptions,
  JournalIndex,
  JournalEntry,
  JournalEntryContent,
  AppView,
  StoredJournal,
  EntryContentType, 
  Tradition, 
  LifeRole, 
  CentralObjective,
  JournalFormat,
} from './types';
import { generateJournalIndex, generateJournalEntry, generateCoverImageForJournal, CoverImageDetails, generateIllustrationFromEntryContent } from './services/geminiService';
import { storageService } from './services/storageService';
import { epubService } from './services/epubService';
import PersonalizationForm from './components/PersonalizationForm';
import JournalIndexView from './components/JournalIndexView';
import JournalEntryView from './components/JournalEntryView';
import JournalLibraryView from './components/JournalLibraryView';
import SettingsView from './components/SettingsView';
import LoadingSpinner from './components/LoadingSpinner';
import ProgressBar from './components/ProgressBar'; 
import ConfirmationModal from './components/ConfirmationModal'; // Import ConfirmationModal
import { SparklesIcon, PlusIcon, DownloadIcon as AppDownloadIcon, UploadIcon, CogIcon } from './components/icons';
import { AVAILABLE_TRADITIONS, AVAILABLE_LIFE_ROLES, AVAILABLE_JOURNAL_FORMATS, AVAILABLE_CENTRAL_OBJECTIVES, MAX_CONCURRENT_EPUB_GENERATION_REQUESTS, AVAILABLE_ENTRY_CONTENT_TYPES } from './constants';

interface EpubGenerationTask {
  themeTitle: string;
  subChapterTitle: string;
  subChapterDescription?: string; 
  themeIndex: number;
  subChapterIndex: number;
  entryId: string;
}

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirmAction: () => void | Promise<void>;
  onCancelAction?: () => void;
  isDestructive?: boolean;
}


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [allStoredJournals, setAllStoredJournals] = useState<StoredJournal[]>([]);
  const [activeJournal, setActiveJournal] = useState<StoredJournal | null>(null);
  const [activeJournalEntry, setActiveJournalEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isGeneratingEpub, setIsGeneratingEpub] = useState<boolean>(false);
  const [epubError, setEpubError] = useState<string | null>(null);
  const [epubStatusMessage, setEpubStatusMessage] = useState<string | null>(null); 
  const [epubProgress, setEpubProgress] = useState<number>(0); 

  const [isRegeneratingEntryContent, setIsRegeneratingEntryContent] = useState<boolean>(false);
  const [isManagingIllustration, setIsManagingIllustration] = useState<boolean>(false);
  
  const [importExportStatus, setImportExportStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);


  const defaultInitialPersonalizationOptions: PersonalizationOptions = {
    traditions: [AVAILABLE_TRADITIONS[0] as Tradition | string],
    lifeRole: AVAILABLE_LIFE_ROLES[0] as LifeRole | string,
    journalFormat: AVAILABLE_JOURNAL_FORMATS[0],
    centralObjectives: [AVAILABLE_CENTRAL_OBJECTIVES[0] as CentralObjective | string],
    defaultEntryContentType: AVAILABLE_ENTRY_CONTENT_TYPES[0], 
    generateIllustrations: false,
    heroProfile: '', 
  };

  const migrateEntryStructure = useCallback((entry: any, defaultContentType: EntryContentType): JournalEntry => {
    let migratedEntry = { ...entry };
    if (migratedEntry.commentary && !migratedEntry.mainContent) {
      migratedEntry.mainContent = migratedEntry.commentary;
      migratedEntry.commentary = undefined; 
    }
    if (!migratedEntry.entryContentType){
        migratedEntry.entryContentType = defaultContentType;
    }
    
    if (migratedEntry.isFallbackContent === undefined) {
      const contentToCheck = migratedEntry.mainContent || migratedEntry.commentary || "";
      if (typeof contentToCheck === 'string' && 
          (contentToCheck.includes("(Contenido de respaldo") || 
           contentToCheck.includes("Contenido no disponible temporalmente.") ||
           contentToCheck.includes("Error al generar contenido.")
          )) {
        migratedEntry.isFallbackContent = true;
      } else {
        migratedEntry.isFallbackContent = false;
      }
    }
    return migratedEntry as JournalEntry;
  }, []);


  useEffect(() => {
    const loadJournals = async () => {
      setIsLoading(true);
      try {
        let journals = await storageService.getAllJournals();
        journals = journals.map(journal => {
          const updatedPersonalizationOptions = {
            ...defaultInitialPersonalizationOptions, 
            ...journal.personalizationOptions,
            defaultEntryContentType: journal.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY,
            heroProfile: journal.personalizationOptions.heroProfile || '',
          };
          const updatedEntries: Record<string, JournalEntry> = {};
          for (const entryId in journal.entries) {
            updatedEntries[entryId] = migrateEntryStructure(journal.entries[entryId], updatedPersonalizationOptions.defaultEntryContentType);
          }
          return {
            ...journal,
            personalizationOptions: updatedPersonalizationOptions,
            entries: updatedEntries,
          };
        });
        setAllStoredJournals(journals);
      } catch (err) {
        console.error("Failed to load journals:", err);
        setError("No se pudieron cargar los diarios guardados.");
      } finally {
        setIsLoading(false);
      }
    };
    loadJournals();
  }, [migrateEntryStructure]);

  const clearMessages = () => {
    setError(null);
    setEpubError(null);
    setImportExportStatus(null);
  }

  const handleCreateNewJournalFlow = () => {
    setActiveJournal(null); 
    setActiveJournalEntry(null);
    clearMessages();
    setCurrentView('config');
  };
  
  const actuallyDeleteJournal = useCallback(async (journalId: string) => {
    setIsLoading(true);
    clearMessages();
    try {
      await storageService.deleteJournal(journalId);
      setAllStoredJournals(prev => prev.filter(j => j.id !== journalId));
      if (activeJournal?.id === journalId) {
        setActiveJournal(null);
        setCurrentView('library'); 
      }
      setImportExportStatus({ message: "Diario eliminado con éxito.", type: "success"});
    } catch (err) {
      console.error("Failed to delete journal:", err);
      setError("No se pudo eliminar el diario.");
    } finally {
      setIsLoading(false);
    }
  }, [activeJournal]);

  const promptDeleteJournal = (journalId: string) => {
    const journalToDelete = allStoredJournals.find(j => j.id === journalId);
    if (!journalToDelete) return;

    setModalConfig({
      isOpen: true,
      title: "Confirmar Eliminación",
      message: (
        <p>
          ¿Estás seguro de que quieres eliminar el diario "<strong>{journalToDelete.journalIndex.title}</strong>"? 
          <br />
          Esta acción no se puede deshacer.
        </p>
      ),
      confirmText: "Eliminar Diario",
      onConfirmAction: () => actuallyDeleteJournal(journalId),
      isDestructive: true,
    });
  };


  const handlePersonalizationSubmit = useCallback(async (options: PersonalizationOptions) => {
    setIsLoading(true);
    clearMessages();
    try {
      const index: JournalIndex = await generateJournalIndex(options);
      
      const newJournalId = Date.now().toString();
      let coverImageUrl: string | undefined = undefined;
      
      try {
          const coverImageDetails: CoverImageDetails = {
              title: index.title,
              traditions: options.traditions as (Tradition | string)[], 
              lifeRole: options.lifeRole as (LifeRole | string),       
              centralObjectives: options.centralObjectives as (CentralObjective | string)[], 
              heroProfile: options.heroProfile,
              journalFormat: options.journalFormat,
          };
          coverImageUrl = await generateCoverImageForJournal(coverImageDetails);
      } catch (coverError) {
          console.error("Failed to generate cover image, proceeding without it:", coverError);
      }

      const newStoredJournal: StoredJournal = {
        id: newJournalId,
        personalizationOptions: options, 
        journalIndex: index,
        entries: {},
        coverImageUrl: coverImageUrl,
      };
      await storageService.saveJournal(newStoredJournal);
      setAllStoredJournals(prev => [newStoredJournal, ...prev]); 
      setActiveJournal(newStoredJournal);
      setCurrentView('index');

    } catch (err: any) {
      console.error("Error en handlePersonalizationSubmit detallado:", err);
      let displayMessage = "Ocurrió un error al generar el índice.";
      if (err && err.message) {
        displayMessage = err.message;
      } else if (typeof err === 'string') {
        displayMessage = err;
      }
      const knownErrorPrefixes = [
        "La respuesta de la IA para el índice no pudo ser interpretada",
        "El índice generado por la IA no tiene un título válido",
        "El índice generado por la IA está incompleto o mal estructurado",
        "El diario anual debe tener 12 temas",
        "El índice generado por la IA tiene un número incorrecto de entradas"
      ];
      if (knownErrorPrefixes.some(prefix => displayMessage.startsWith(prefix))) {
        // Use the message as is
      } else {
         displayMessage += " Por favor, revisa los detalles e inténtalo de nuevo, o ajusta tu configuración si el error persiste.";
      }
      setError(displayMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectJournal = useCallback(async (journalId: string) => {
    setIsLoading(true);
    clearMessages();
    try {
      let journal = await storageService.getJournal(journalId);
      if (journal) {
        const updatedPersonalizationOptions: PersonalizationOptions = {
          ...defaultInitialPersonalizationOptions, 
          ...journal.personalizationOptions,
          defaultEntryContentType: journal.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY,
          heroProfile: journal.personalizationOptions.heroProfile || '',
        };
        const updatedEntries: Record<string, JournalEntry> = {};
        for (const entryId in journal.entries) {
          updatedEntries[entryId] = migrateEntryStructure(journal.entries[entryId], updatedPersonalizationOptions.defaultEntryContentType);
        }
        journal = {
          ...journal,
          personalizationOptions: updatedPersonalizationOptions,
          entries: updatedEntries,
        };
        
        setActiveJournal(journal);
        setActiveJournalEntry(null);
        setCurrentView('index');
      } else {
        setError("No se pudo encontrar el diario seleccionado.");
        setCurrentView('library'); 
      }
    } catch (err) {
      console.error("Error loading journal:", err);
      setError("Ocurrió un error al cargar el diario.");
    } finally {
      setIsLoading(false);
    }
  }, [migrateEntryStructure]);


  const handleSelectEntry = useCallback(async (themeIndex: number, subChapterIndex: number, themeTitle: string, subChapterTitle: string) => {
    if (!activeJournal) return;
    
    setIsLoading(true);
    clearMessages();
    const entryId = `${themeIndex}-${subChapterIndex}`;
    const subChapterDescription = activeJournal.journalIndex.themes[themeIndex]?.subChapters[subChapterIndex]?.description;

    try {
      let finalEntry: JournalEntry;
      let currentJournal = activeJournal; 
      const journalDefaultContentType = currentJournal.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY;
      
      let storedEntryData = currentJournal.entries[entryId];
      if (storedEntryData) {
         storedEntryData = migrateEntryStructure(storedEntryData, journalDefaultContentType);
      }

      let shouldRegenerate = false;
      if (!storedEntryData || !storedEntryData.mainContent || storedEntryData.isFallbackContent) {
        shouldRegenerate = true;
      } 
      
      if (storedEntryData?.isFallbackContent) {
          console.log(`Entry ${entryId} is a fallback. Attempting regeneration via initial load.`);
      }

      if (shouldRegenerate) {
        const content: JournalEntryContent | null = await generateJournalEntry(
          currentJournal.personalizationOptions, 
          themeTitle,
          subChapterTitle,
          subChapterDescription 
        );

        finalEntry = {
          id: entryId,
          themeTitle,
          subChapterTitle,
          ...(content || { 
            spark: { quote: "Contenido no disponible temporalmente.", author: "Sistema" },
            mainContent: "Intenta recargar o generar esta entrada más tarde.",
            entryContentType: journalDefaultContentType,
            journalQuestion: "¿Qué puedes aprender de esta situación?",
            miniChallenge: "Toma una pausa y reflexiona.",
            isFallbackContent: true, 
          }),
          notes: storedEntryData?.notes || '',
          challengeCompleted: storedEntryData?.challengeCompleted || false,
        };
        if (content && content.isFallbackContent !== undefined) {
            finalEntry.isFallbackContent = content.isFallbackContent;
        } else if (content && content.isFallbackContent === undefined) {
            finalEntry.isFallbackContent = false; 
        }


        const updatedEntries = { ...currentJournal.entries, [entryId]: finalEntry };
        const updatedJournal = { ...currentJournal, entries: updatedEntries };
        await storageService.saveJournal(updatedJournal);
        setActiveJournal(updatedJournal); 
      } else {
        finalEntry = storedEntryData!; 
      }
      
      setActiveJournalEntry(finalEntry);
      setCurrentView('entry');
    } catch (err: any) {
      console.error("Error en handleSelectEntry:", err);
      setError(err.message || "Ocurrió un error al generar o cargar la entrada.");
    } finally {
      setIsLoading(false);
    }
  }, [activeJournal, setActiveJournal, migrateEntryStructure]); 
  
  const handleSaveNotes = useCallback(async (entryId: string, notes: string) => {
    if (!activeJournal) return;
    clearMessages();
    const journalDefaultContentType = activeJournal.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY;

    let entryToUpdate = activeJournal.entries[entryId] || (activeJournalEntry?.id === entryId ? activeJournalEntry : null) ;
    if (!entryToUpdate) return;
    entryToUpdate = migrateEntryStructure(entryToUpdate, journalDefaultContentType);
    
    const updatedEntry = { ...entryToUpdate, notes };
    const updatedEntries = { ...activeJournal.entries, [entryId]: updatedEntry };
    const updatedJournal = { ...activeJournal, entries: updatedEntries };
    
    try {
        await storageService.saveJournal(updatedJournal); 
        setActiveJournal(updatedJournal);
        if (activeJournalEntry?.id === entryId) {
            setActiveJournalEntry(updatedEntry);
        }
    } catch (err) {
        console.error("Error saving notes:", err);
        setError("No se pudieron guardar las notas.");
    }
  }, [activeJournal, activeJournalEntry, setActiveJournal, migrateEntryStructure]); 

  const handleToggleChallenge = useCallback(async (entryId: string, completed: boolean) => {
    if (!activeJournal) return;
    clearMessages();
    const journalDefaultContentType = activeJournal.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY;
    
    let entryToUpdate = activeJournal.entries[entryId] || (activeJournalEntry?.id === entryId ? activeJournalEntry : null);
    if (!entryToUpdate) return;
    entryToUpdate = migrateEntryStructure(entryToUpdate, journalDefaultContentType);

    const updatedEntry = { ...entryToUpdate, challengeCompleted: completed };
    const updatedEntries = { ...activeJournal.entries, [entryId]: updatedEntry };
    const updatedJournal = { ...activeJournal, entries: updatedEntries };

    try {
        await storageService.saveJournal(updatedJournal);
        setActiveJournal(updatedJournal);
        if (activeJournalEntry?.id === entryId) {
            setActiveJournalEntry(updatedEntry);
        }
    } catch (err) {
        console.error("Error toggling challenge:", err);
        setError("No se pudo actualizar el estado del reto.");
    }
  }, [activeJournal, activeJournalEntry, setActiveJournal, migrateEntryStructure]);

  const handleRegenerateEntryContent = useCallback(async (entryId: string) => {
    if (!activeJournal || !activeJournal.entries[entryId]) {
        setError("No se puede regenerar: entrada o diario no activo.");
        return;
    }
    setIsRegeneratingEntryContent(true);
    clearMessages();

    const entryToRegenerate = activeJournal.entries[entryId];
    const [themeIndexStr, subChapterIndexStr] = entryId.split('-');
    const themeIndex = parseInt(themeIndexStr, 10);
    const subChapterIndex = parseInt(subChapterIndexStr, 10);
    const subChapterDescription = activeJournal.journalIndex.themes[themeIndex]?.subChapters[subChapterIndex]?.description;

    try {
        const content = await generateJournalEntry(
            activeJournal.personalizationOptions,
            entryToRegenerate.themeTitle,
            entryToRegenerate.subChapterTitle,
            subChapterDescription
        );

        if (content) {
            const newEntryData: JournalEntry = {
                ...entryToRegenerate, 
                ...content, 
            };
            const updatedEntries = { ...activeJournal.entries, [entryId]: newEntryData };
            const updatedJournal = { ...activeJournal, entries: updatedEntries };
            
            await storageService.saveJournal(updatedJournal);
            setActiveJournal(updatedJournal);
            setActiveJournalEntry(newEntryData); 
        } else {
            setError("No se pudo regenerar el contenido de la entrada. Se mantuvo la versión anterior.");
        }
    } catch (err: any) {
        console.error("Error regenerating entry content:", err);
        setError(err.message || "Ocurrió un error al regenerar el contenido de la entrada.");
    } finally {
        setIsRegeneratingEntryContent(false);
    }
}, [activeJournal]);

const handleGenerateOrRegenerateIllustration = useCallback(async (entryId: string) => {
    if (!activeJournal || !activeJournal.entries[entryId]) {
        setError("No se puede gestionar la ilustración: entrada o diario no activo.");
        return;
    }
    setIsManagingIllustration(true);
    clearMessages();

    let currentJournal = { ...activeJournal };
    const entryToIllustrate = currentJournal.entries[entryId];

    try {
        if (!currentJournal.personalizationOptions.generateIllustrations) {
            currentJournal = {
                ...currentJournal,
                personalizationOptions: {
                    ...currentJournal.personalizationOptions,
                    generateIllustrations: true,
                }
            };
        }

        const illustrationResult = await generateIllustrationFromEntryContent(
            { 
              mainContent: entryToIllustrate.mainContent, 
              subChapterTitle: entryToIllustrate.subChapterTitle,
              themeTitle: entryToIllustrate.themeTitle 
            },
            currentJournal.personalizationOptions 
        );

        if (illustrationResult.illustrationUrl) {
            const updatedEntryData: JournalEntry = {
                ...entryToIllustrate,
                illustrationUrl: illustrationResult.illustrationUrl,
                isFallbackContent: entryToIllustrate.isFallbackContent || false, 
            };
            const finalJournalToSave = {
                ...currentJournal, 
                entries: { ...currentJournal.entries, [entryId]: updatedEntryData }
            };

            await storageService.saveJournal(finalJournalToSave);
            setActiveJournal(finalJournalToSave);
            setActiveJournalEntry(updatedEntryData);
        } else {
            setError("No se pudo generar o regenerar la ilustración.");
        }
    } catch (err: any) {
        console.error("Error managing illustration:", err);
        setError(err.message || "Ocurrió un error al gestionar la ilustración.");
    } finally {
        setIsManagingIllustration(false);
    }
}, [activeJournal]);


  const handleDownloadEpub = useCallback(async () => {
    if (!activeJournal) {
      setEpubError("No hay un diario activo para descargar.");
      return;
    }
    
    setIsGeneratingEpub(true);
    setEpubStatusMessage("Iniciando generación de EPUB...");
    setEpubProgress(0);
    clearMessages();
    let currentActiveJournal = activeJournal; 

    try {
      setEpubStatusMessage("Verificando entradas existentes...");
      const entriesToFetch: EpubGenerationTask[] = [];
      const fullyLoadedEntries: JournalEntry[] = [];
      
      const journalDefaultContentType = currentActiveJournal.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY;

      for (let i = 0; i < currentActiveJournal.journalIndex.themes.length; i++) {
        const theme = currentActiveJournal.journalIndex.themes[i];
        for (let j = 0; j < theme.subChapters.length; j++) {
          const subChapter = theme.subChapters[j];
          const entryId = `${i}-${j}`;
          let storedEntry = currentActiveJournal.entries[entryId];
          if (storedEntry) {
            storedEntry = migrateEntryStructure(storedEntry, journalDefaultContentType);
          }

          if (storedEntry && storedEntry.mainContent && !storedEntry.isFallbackContent) {
            fullyLoadedEntries.push(storedEntry);
          } else { 
            if (!storedEntry) {
                console.log(`EPUB: Entry ${entryId} (${theme.theme} - ${subChapter.title}) is missing entirely, queueing for generation.`);
            } else if (!storedEntry.mainContent) {
                console.log(`EPUB: Entry ${entryId} (${theme.theme} - ${subChapter.title}) is missing mainContent, queueing for regeneration.`);
            } else if (storedEntry.isFallbackContent) {
                console.log(`EPUB: Entry ${entryId} (${theme.theme} - ${subChapter.title}) is fallback, queueing for regeneration.`);
            }
            
            entriesToFetch.push({ 
              themeTitle: theme.theme, 
              subChapterTitle: subChapter.title, 
              subChapterDescription: subChapter.description,
              themeIndex: i, 
              subChapterIndex: j,
              entryId: entryId
            });
          }
        }
      }
      
      const totalEntriesToGenerate = entriesToFetch.length;
      let generatedEntriesCount = 0;

      if (totalEntriesToGenerate === 0) {
        setEpubStatusMessage("Todas las entradas están listas. Ensamblando EPUB...");
        setEpubProgress(100);
      } else {
        setEpubStatusMessage(`Generando 0 de ${totalEntriesToGenerate} entradas...`);
      }
      
      const generatedEntriesMap: Record<string, JournalEntry> = {}; 
      const batchSize = MAX_CONCURRENT_EPUB_GENERATION_REQUESTS;

      for (let i = 0; i < totalEntriesToGenerate; i += batchSize) {
        const batch = entriesToFetch.slice(i, i + batchSize);
        
        const promises = batch.map(task => 
          generateJournalEntry(currentActiveJournal!.personalizationOptions, task.themeTitle, task.subChapterTitle, task.subChapterDescription)
            .then(content => {
              let entry: JournalEntry;
              if (content) {
                entry = {
                  id: task.entryId,
                  themeTitle: task.themeTitle,
                  subChapterTitle: task.subChapterTitle,
                  ...content, 
                  notes: currentActiveJournal!.entries[task.entryId]?.notes || '',
                  challengeCompleted: currentActiveJournal!.entries[task.entryId]?.challengeCompleted || false,
                };
              } else { 
                entry = {
                  id: task.entryId, themeTitle: task.themeTitle, subChapterTitle: task.subChapterTitle,
                  spark: { quote: "Error al generar contenido.", author: "Sistema" },
                  entryContentType: journalDefaultContentType,
                  mainContent: "Este contenido no pudo ser generado para el EPUB.",
                  journalQuestion: "¿Qué lección puedes extraer de los imprevistos?",
                  miniChallenge: "Toma un momento para respirar profundamente.",
                  illustrationUrl: undefined,
                  isFallbackContent: true, 
                  notes: currentActiveJournal!.entries[task.entryId]?.notes || '',
                  challengeCompleted: currentActiveJournal!.entries[task.entryId]?.challengeCompleted || false,
                };
              }
              generatedEntriesMap[task.entryId] = entry; 
              return entry; 
            })
        );
        await Promise.all(promises); 
        
        setActiveJournal(prevJournal => {
            if (!prevJournal) return null;
            const updatedEntries = { ...prevJournal.entries, ...generatedEntriesMap };
            const updatedJournalWithBatch = { ...prevJournal, entries: updatedEntries };
            storageService.saveJournal(updatedJournalWithBatch); 
            currentActiveJournal = updatedJournalWithBatch; 
            return updatedJournalWithBatch;
        });

        generatedEntriesCount += batch.length; 
        const progress = totalEntriesToGenerate > 0 ? (generatedEntriesCount / totalEntriesToGenerate) * 100 : 100;
        setEpubProgress(Math.round(progress));
        setEpubStatusMessage(`Generando ${generatedEntriesCount} de ${totalEntriesToGenerate} entradas...`);
      }
      
      const allEntriesForEpub: JournalEntry[] = [];
      currentActiveJournal.journalIndex.themes.forEach((theme, themeIdx) => {
          theme.subChapters.forEach((subChapter, subChapterIdx) => {
              const entryId = `${themeIdx}-${subChapterIdx}`;
              if(currentActiveJournal!.entries[entryId]){
                allEntriesForEpub.push(currentActiveJournal!.entries[entryId]);
              } else {
                console.warn(`EPUB Assembly: Entry ${entryId} not found in journal after generation phase. Creating placeholder.`);
                allEntriesForEpub.push({
                  id: entryId, themeTitle: theme.theme, subChapterTitle: subChapter.title,
                  spark: { quote: "Contenido no encontrado.", author: "Sistema" },
                  entryContentType: journalDefaultContentType, mainContent: "Este contenido no se pudo incluir.",
                  journalQuestion: "", miniChallenge: "", isFallbackContent: true,
                });
              }
          });
      });
      allEntriesForEpub.sort((a,b) => { 
         const [aThemeIdx, aSubIdx] = a.id.split('-').map(Number);
         const [bThemeIdx, bSubIdx] = b.id.split('-').map(Number);
         if (aThemeIdx !== bThemeIdx) return aThemeIdx - bThemeIdx;
         return aSubIdx - bSubIdx;
      });

      setEpubStatusMessage("Ensamblando archivo EPUB...");
      if (totalEntriesToGenerate > 0 && generatedEntriesCount === totalEntriesToGenerate) {
        setEpubProgress(100); 
      } else if (totalEntriesToGenerate === 0) {
        setEpubProgress(100);
      }

      const epubBlob = await epubService.generateEpub(currentActiveJournal!, allEntriesForEpub);
      const url = URL.createObjectURL(epubBlob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = currentActiveJournal!.journalIndex.title.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      a.download = `${safeTitle || 'diario_personalizado'}.epub`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setEpubStatusMessage("¡EPUB generado y descargado con éxito!");

    } catch (err: any) {
      console.error("Error generating EPUB:", err);
      setEpubError(err.message || "Ocurrió un error desconocido al generar el EPUB.");
    } finally {
      setIsGeneratingEpub(false);
       if (!epubError) { 
          setTimeout(() => {
            setEpubStatusMessage(null);
            setEpubProgress(0);
          }, 5000);
        } else { 
          setEpubProgress(0);
        }
    }
  }, [activeJournal, setActiveJournal, migrateEntryStructure]); 

  const handleExportJournalJson = useCallback(async () => {
    if (!activeJournal) {
      setImportExportStatus({ message: "No hay un diario activo para exportar.", type: "error" });
      return;
    }
    clearMessages();
    try {
      const jsonString = JSON.stringify(activeJournal, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = activeJournal.journalIndex.title.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      a.download = `${safeTitle || 'diario'}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImportExportStatus({ message: "Diario exportado como JSON con éxito.", type: "success" });
    } catch (err) {
      console.error("Error exporting journal to JSON:", err);
      setImportExportStatus({ message: "Error al exportar el diario como JSON.", type: "error" });
    }
  }, [activeJournal]);

  const handleExportAllJournals = useCallback(async () => {
    if (allStoredJournals.length === 0) {
      setImportExportStatus({ message: "No hay diarios para exportar.", type: "error" });
      return;
    }
    clearMessages();
    try {
      const jsonString = JSON.stringify(allStoredJournals, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todos_los_diarios_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImportExportStatus({ message: "Todos los diarios exportados como JSON con éxito.", type: "success" });
    } catch (err) {
      console.error("Error exporting all journals to JSON:", err);
      setImportExportStatus({ message: "Error al exportar todos los diarios como JSON.", type: "error" });
    }
  }, [allStoredJournals]);

  const handleImportJournalJson = useCallback(async (file: File) => {
    if (!file) return;
    setIsLoading(true);
    clearMessages();

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        if (!jsonString) {
            throw new Error("El archivo está vacío o no se pudo leer.");
        }
        let importedData = JSON.parse(jsonString);

        if (Array.isArray(importedData)) {
            setImportExportStatus({ message: "Este archivo parece contener múltiples diarios. Por favor, use la opción 'Importar Todos los Diarios' en la página de Configuración.", type: "error"});
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        let importedJournal = importedData as StoredJournal;

        if (!importedJournal.id || !importedJournal.personalizationOptions || !importedJournal.journalIndex || typeof importedJournal.entries !== 'object') {
          throw new Error("El archivo JSON no tiene la estructura de un diario válido.");
        }
        
        const existingJournal = await storageService.getJournal(importedJournal.id);
        if (existingJournal) {
          console.warn(`Journal with ID ${importedJournal.id} already exists. Assigning a new ID to the imported journal.`);
          importedJournal.id = `imported_single_${Date.now().toString()}`;
        }
        
        const defaultContentType = importedJournal.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY;
        const migratedEntries: Record<string, JournalEntry> = {};
        for (const entryId in importedJournal.entries) {
          migratedEntries[entryId] = migrateEntryStructure(importedJournal.entries[entryId], defaultContentType);
        }
        importedJournal.entries = migratedEntries;
        importedJournal.personalizationOptions = {
          ...defaultInitialPersonalizationOptions,
          ...importedJournal.personalizationOptions,
          defaultEntryContentType: defaultContentType, 
          heroProfile: importedJournal.personalizationOptions.heroProfile || '',
        };


        await storageService.saveJournal(importedJournal);
        setAllStoredJournals(prev => [importedJournal, ...prev.filter(j => j.id !== importedJournal.id)].sort((a,b) => (b.id.localeCompare(a.id))));
        setImportExportStatus({ message: `Diario "${importedJournal.journalIndex.title}" importado con éxito.`, type: "success"});
        setActiveJournal(importedJournal);
        setCurrentView('index'); 

      } catch (err: any) {
        console.error("Error importing journal from JSON:", err);
        setImportExportStatus({ message: err.message || "Error al importar el diario. Asegúrate de que el archivo JSON sea válido y no sea una lista de múltiples diarios.", type: "error" });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) { 
            fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
        console.error("Error reading file for import.");
        setImportExportStatus({ message: "Error al leer el archivo seleccionado.", type: "error"});
        setIsLoading(false);
    };
    reader.readAsText(file);
  }, [migrateEntryStructure, defaultInitialPersonalizationOptions]);

  const handleImportAllJournals = useCallback(async (file: File) => {
    if (!file) return;
    setIsLoading(true);
    clearMessages();
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const jsonString = event.target?.result as string;
            if (!jsonString) throw new Error("El archivo está vacío o no se pudo leer.");

            const importedData = JSON.parse(jsonString);
            if (!Array.isArray(importedData)) {
                throw new Error("El archivo no contiene una lista de diarios. Para importar un solo diario, use la opción 'Importar Diario (Individual)' en la vista de biblioteca.");
            }

            const journalsToImport = importedData as StoredJournal[];
            if (journalsToImport.length === 0) {
                setImportExportStatus({ message: "El archivo no contiene diarios para importar.", type: "success" });
                setIsLoading(false);
                return;
            }

            let importedCount = 0;
            let currentJournalsList = await storageService.getAllJournals(); 

            for (const journal of journalsToImport) {
                if (!journal.id || !journal.personalizationOptions || !journal.journalIndex || typeof journal.entries !== 'object') {
                    console.warn("Se omitió un diario durante la importación masiva debido a una estructura no válida:", journal);
                    continue; 
                }

                let journalToSave = { ...journal };
                const existingJournalIndex = currentJournalsList.findIndex(j => j.id === journalToSave.id);
                if (existingJournalIndex !== -1) {
                    console.warn(`Conflicto de ID durante la importación masiva: ${journalToSave.id}. Se asignará un nuevo ID.`);
                    journalToSave.id = `imported_all_${journalToSave.id.substring(0,10)}_${Date.now()}`;
                }

                const defaultContentType = journalToSave.personalizationOptions.defaultEntryContentType || EntryContentType.CONCISE_COMMENTARY;
                const migratedEntries: Record<string, JournalEntry> = {};
                for (const entryId in journalToSave.entries) {
                    migratedEntries[entryId] = migrateEntryStructure(journalToSave.entries[entryId], defaultContentType);
                }
                journalToSave.entries = migratedEntries;
                journalToSave.personalizationOptions = {
                    ...defaultInitialPersonalizationOptions,
                    ...journalToSave.personalizationOptions,
                    defaultEntryContentType: defaultContentType,
                    heroProfile: journalToSave.personalizationOptions.heroProfile || '',
                };

                await storageService.saveJournal(journalToSave); 
                
                const idxInCurrentList = currentJournalsList.findIndex(j => j.id === journalToSave.id);
                if (idxInCurrentList !== -1) {
                    currentJournalsList[idxInCurrentList] = journalToSave;
                } else {
                    currentJournalsList.push(journalToSave);
                }
                importedCount++;
            }
            
            currentJournalsList.sort((a,b) => (b.id.localeCompare(a.id)));
            setAllStoredJournals(currentJournalsList);

            if (importedCount === 0 && journalsToImport.length > 0) {
                 setImportExportStatus({ message: "No se importaron diarios. Todos los diarios en el archivo tenían una estructura no válida.", type: "error" });
            } else if (importedCount < journalsToImport.length) {
                 setImportExportStatus({ message: `${importedCount} de ${journalsToImport.length} diarios importados con éxito. Algunos fueron omitidos debido a errores de formato.`, type: "success" });
            } else {
                 setImportExportStatus({ message: `${importedCount} diarios importados con éxito.`, type: "success" });
            }
            setCurrentView('library');
        } catch (err: any) {
            console.error("Error importando todos los diarios desde JSON:", err);
            setImportExportStatus({ message: err.message || "Error al importar los diarios. Asegúrate de que el archivo JSON sea válido y contenga una lista de diarios.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };
    reader.onerror = () => {
        console.error("Error leyendo archivo para importación masiva.");
        setImportExportStatus({ message: "Error al leer el archivo seleccionado.", type: "error"});
        setIsLoading(false);
    };
    reader.readAsText(file);
  }, [migrateEntryStructure, defaultInitialPersonalizationOptions]);

  const actuallyDeleteAllData = useCallback(async () => {
    setIsLoading(true);
    clearMessages();
    try {
        await storageService.deleteAllData();
        setAllStoredJournals([]);
        setActiveJournal(null);
        setActiveJournalEntry(null);
        setImportExportStatus({ message: "Todos los datos de la aplicación han sido eliminados con éxito.", type: "success"});
        setCurrentView('library');
    } catch (err) {
        console.error("Error deleting all data:", err);
        setImportExportStatus({ message: "Ocurrió un error al intentar eliminar todos los datos.", type: "error"});
    } finally {
        setIsLoading(false);
    }
  }, []);

  const promptDeleteAllData = () => {
    setModalConfig({
      isOpen: true,
      title: "Confirmar Borrado Total (Paso 1 de 2)",
      message: (
        <>
          <p className="font-semibold text-red-600">¿Estás SEGURO de que quieres borrar TODOS los diarios y datos de la aplicación?</p>
          <p className="mt-2">Esta acción es irreversible y no se podrá deshacer. Considera exportar tus datos primero.</p>
        </>
      ),
      confirmText: "Sí, continuar al paso 2",
      onConfirmAction: () => {
        // Show second confirmation
        setModalConfig({
          isOpen: true,
          title: "Confirmar Borrado Total (Paso 2 de 2)",
          message: (
            <>
              <p className="font-bold text-red-700 text-lg">¡ÚLTIMA ADVERTENCIA!</p>
              <p className="mt-2">¿Realmente quieres proceder con el borrado completo de todos tus datos? Esto no se puede revertir.</p>
            </>
          ),
          confirmText: "Sí, Borrar Todo Definitivamente",
          onConfirmAction: actuallyDeleteAllData,
          onCancelAction: () => setModalConfig(null),
          isDestructive: true,
        });
      },
      onCancelAction: () => setModalConfig(null),
      isDestructive: true, // First step is also destructive in nature
    });
  };


  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportJournalJson(file);
    }
    if (event.target) {
      event.target.value = "";
    }
  }, [handleImportJournalJson]);


  const renderContent = () => {
    if (isGeneratingEpub) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center">
                <h2 className="text-2xl font-semibold text-sky-700 mb-4">Generando EPUB</h2>
                {epubStatusMessage && <p className="text-sky-600 mb-3 text-lg">{epubStatusMessage}</p>}
                <ProgressBar progress={epubProgress} />
                 <button 
                    onClick={() => { 
                        setIsGeneratingEpub(false); 
                        setEpubStatusMessage(null); 
                        setEpubProgress(0); 
                    }}
                    className="mt-6 bg-slate-400 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
                >
                    Cancelar (Ocultar Progreso)
                </button>
            </div>
        );
    }
    
    if (isLoading && !(currentView === 'library' && allStoredJournals.length > 0)) { // Avoid full page load spinner if library has content
        let message = "Cargando...";
        if (isRegeneratingEntryContent) message = "Regenerando contenido de la entrada...";
        if (isManagingIllustration) message = "Gestionando ilustración...";

        if (currentView === 'library' && allStoredJournals.length === 0 && !activeJournal) {
            message = "Cargando diarios...";
        } else if (currentView === 'entry' && !activeJournalEntry && !isRegeneratingEntryContent && !isManagingIllustration) {
            message = "Generando entrada...";
        } else if (currentView === 'index' && !activeJournal) {
            message = "Generando índice del diario...";
        } else if (currentView === 'config' && !activeJournal) {
            message = "Procesando configuración...";
        }
        return <LoadingSpinner message={message} />;
    }
    if (isRegeneratingEntryContent || isManagingIllustration) { // Show spinner for these specific actions without full page block
        let message = "Cargando...";
        if (isRegeneratingEntryContent) message = "Regenerando contenido de la entrada...";
        if (isManagingIllustration) message = "Gestionando ilustración...";
        return <LoadingSpinner message={message} />;
    }


    switch (currentView) {
        case 'library':
            return <JournalLibraryView 
                        journals={allStoredJournals} 
                        onSelectJournal={handleSelectJournal} 
                        onCreateNewJournal={handleCreateNewJournalFlow}
                        promptDeleteJournal={promptDeleteJournal}
                    />;
        case 'config':
            return <PersonalizationForm 
                        onSubmit={handlePersonalizationSubmit} 
                        defaultOptions={activeJournal ? activeJournal.personalizationOptions : defaultInitialPersonalizationOptions}
                    />;
        case 'index':
            if (activeJournal) {
                return <JournalIndexView 
                            journalIndex={activeJournal.journalIndex} 
                            onSelectEntry={handleSelectEntry}
                            onGoToLibrary={() => { setActiveJournal(null); setCurrentView('library'); clearMessages();}}
                            onDownloadEpub={handleDownloadEpub}
                            isGeneratingEpub={isGeneratingEpub} 
                            onExportJson={handleExportJournalJson}
                        />;
            }
            break; 
        case 'entry':
            if (activeJournalEntry && activeJournal) {
                return <JournalEntryView 
                            entry={activeJournalEntry} 
                            journalPersonalizationOptions={activeJournal.personalizationOptions}
                            onBackToIndex={() => {setCurrentView('index'); clearMessages();}} 
                            onSaveNotes={handleSaveNotes}
                            onToggleChallenge={handleToggleChallenge}
                            onRegenerateContent={() => handleRegenerateEntryContent(activeJournalEntry.id)}
                            onGenerateOrRegenerateIllustration={() => handleGenerateOrRegenerateIllustration(activeJournalEntry.id)}
                            isRegeneratingEntryContent={isRegeneratingEntryContent}
                            isManagingIllustration={isManagingIllustration}
                        />;
            }
            break;
        case 'settings':
            return <SettingsView
                        onExportAllJournals={handleExportAllJournals}
                        onImportAllJournals={handleImportAllJournals}
                        promptDeleteAllData={promptDeleteAllData}
                        onGoToLibrary={() => { setCurrentView('library'); clearMessages();}}
                    />;
    }
    
    console.warn("RenderContent reached an unexpected state. Redirecting to library.", { currentView, isLoading: false, activeJournal, activeJournalEntry });
    setCurrentView('library');
    return <LoadingSpinner message="Redirigiendo..." />;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <input
            type="file"
            accept=".json"
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
        />
      <header className="bg-sky-700 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <SparklesIcon className="w-8 h-8 mr-3" />
            <h1 className="text-2xl font-bold">Diario IA Personalizado</h1>
          </div>
          <nav className="space-x-2 flex items-center">
            {currentView !== 'library' && currentView !== 'settings' && !isGeneratingEpub && (
              <button 
                onClick={() => { setActiveJournal(null); setActiveJournalEntry(null); setCurrentView('library'); clearMessages(); }} 
                className="hover:text-sky-200 transition px-3 py-1.5 rounded-md text-sm font-medium"
                title="Ver mis diarios">
                  Mis Diarios
              </button>
            )}
             {currentView !== 'settings' && !isGeneratingEpub && (
              <button 
                onClick={() => { setCurrentView('settings'); clearMessages(); }} 
                className="hover:text-sky-200 transition px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
                title="Configuración de la aplicación">
                  <CogIcon className="w-5 h-5 mr-1 sm:mr-0" /> <span className="hidden sm:inline ml-1">Configuración</span>
              </button>
            )}
             {currentView === 'library' && !isGeneratingEpub && (
                 <>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-md shadow transition text-sm font-medium inline-flex items-center"
                        title="Importar Diario desde archivo JSON (Individual)"
                    >
                        <UploadIcon className="w-4 h-4 mr-1.5" />
                        Importar (Individual)
                    </button>
                    <button 
                        onClick={handleCreateNewJournalFlow}
                        className="bg-white text-sky-700 px-3 py-1.5 rounded-md shadow hover:bg-sky-50 transition text-sm font-medium inline-flex items-center"
                        title="Crear un nuevo diario">
                        <PlusIcon className="w-4 h-4 mr-1.5" />
                        Nuevo Diario
                    </button>
                 </>
             )}
          </nav>
        </div>
      </header>
      
      {(error || epubError || importExportStatus) && !isGeneratingEpub && ( 
        <div className={`p-4 m-4 rounded-md shadow-md border-l-4 ${
            error ? 'bg-red-100 border-red-500 text-red-700' 
            : epubError ? 'bg-yellow-100 border-yellow-500 text-yellow-700' 
            : importExportStatus?.type === 'error' ? 'bg-red-100 border-red-500 text-red-700'
            : 'bg-green-100 border-green-500 text-green-700'
        }`} role="alert">
          <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold">{
                    error ? 'Error Aplicación:' 
                    : epubError ? 'Aviso EPUB:' 
                    : importExportStatus?.type === 'error' ? 'Error Import/Export:'
                    : 'Éxito:'
                }</p>
                <p className="text-sm">{error || epubError || importExportStatus?.message}</p>
            </div>
            <button 
                onClick={clearMessages} 
                className={`ml-4 text-sm font-medium ${
                    error || epubError || importExportStatus?.type === 'error' ? 'text-red-700 hover:text-red-900' : 'text-green-700 hover:text-green-900'
                } underline`}
                aria-label="Descartar mensaje"
            >
                Descartar
            </button>
          </div>
        </div>
      )}

      {modalConfig && modalConfig.isOpen && (
        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={() => {
            modalConfig.onConfirmAction();
            if (!(modalConfig.title.includes("Paso 1 de 2") && modalConfig.confirmText?.includes("paso 2"))) { // Avoid closing for first step of multi-step
                 setModalConfig(null);
            }
          }}
          onCancel={() => {
            if (modalConfig.onCancelAction) {
              modalConfig.onCancelAction();
            }
            setModalConfig(null);
          }}
          isDestructive={modalConfig.isDestructive}
        />
      )}

      <main className="flex-grow container mx-auto p-4 sm:p-6">
        {renderContent()}
      </main>

      <footer className="bg-sky-700 text-white p-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Diario IA Personalizado. Creado con IA.</p>
      </footer>
    </div>
  );
};

export default App;
