
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import type { Story, ChapterEntry, ModalState, Question as GameQuestion, Answer, World, ExtendedChapterGenerationOutput, NarrativeProfileData } from './types';
import { GameStep } from './types';
import { WORLDS } from './constants'; 

import Header from './components/Header';
import ModalComponent from './components/ModalComponent';
import HomeScreen from './components/HomeScreen';
import WorldSelectionScreen from './components/WorldSelectionScreen';
import OnboardingQuestionsLoadingScreen from './components/OnboardingQuestionsLoadingScreen';
import OnboardingQuestionsScreen from './components/OnboardingQuestionsScreen';
import ProtagonistGenderSelectionScreen from './components/ProtagonistGenderSelectionScreen'; // New screen
import SetupLoadingScreen from './components/SetupLoadingScreen';
import SetupDisplayScreen from './components/SetupDisplayScreen';
import StoryDetailScreen from './components/StoryDetailScreen';
import ChapterGenerationLoadingScreen from './components/ChapterGenerationLoadingScreen';
import ChapterViewScreen from './components/ChapterViewScreen';
import SettingsScreen from './components/SettingsScreen'; // New settings screen

import * as StoryManager from './services/StoryManager';
import * as GeminiTextService from './services/GeminiTextService';
import * as GeminiImageService from './services/GeminiImageService';
import * as ApiKeyManager from './services/ApiKeyManager'; // New API Key Manager

const initialModalState: ModalState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'alert',
  onConfirm: () => {},
  onCancel: () => {},
};

function App() {
  const [currentStep, setCurrentStep] = useState<GameStep>(GameStep.HOME);
  const [stories, setStories] = useState<Story[]>(StoryManager.loadStories());
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);

  // States for world selection and onboarding
  const [selectedWorldInternal, setSelectedWorldInternal] = useState<World | null>(null); 
  const [customWorldUserInput, setCustomWorldUserInput] = useState<string>(""); 
  const [generatedOnboardingQuestions, setGeneratedOnboardingQuestions] = useState<GameQuestion[]>([]);
  const [onboardingQuestionsError, setOnboardingQuestionsError] = useState<string | null>(null);
  
  // States for current story generation process (setup)
  const [currentOnboardingAnswers, setCurrentOnboardingAnswers] = useState<Record<string, string>>({});
  const [selectedProtagonistGender, setSelectedProtagonistGender] = useState<string | null>(null); 
  const [generatedStoryTitle, setGeneratedStoryTitle] = useState<string | null>(null);
  const [generatedProtagonistName, setGeneratedProtagonistName] = useState<string | null>(null); 
  const [initialDreamImageUrl, setInitialDreamImageUrl] = useState<string | null>(null);
  const [currentInitialDreamDescriptor, setCurrentInitialDreamDescriptor] = useState<string | null>(null); 
  const [currentInitialDreamImageDescription, setCurrentInitialDreamImageDescription] = useState<string | null>(null); 
  const [currentInitialDreamImageCaption, setCurrentInitialDreamImageCaption] = useState<string | null>(null); 
  const [protagonistArchetype, setProtagonistArchetype] = useState<string | null>(null);
  const [centralTheme, setCentralTheme] = useState<string | null>(null);
  const [preambleText, setPreambleText] = useState<string | null>(null);
  
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedChapterToViewIndex, setSelectedChapterToViewIndex] = useState<number | null>(null);

  const [isGeneratingSetup, setIsGeneratingSetup] = useState<boolean>(false);
  const [setupGenerationError, setSetupGenerationError] = useState<string | null>(null);
  
  const [isGeneratingChapter, setIsGeneratingChapter] = useState<boolean>(false);
  const [chapterGenerationError, setChapterGenerationError] = useState<string | null>(null);

  const fileImportInputRef = useRef<HTMLInputElement>(null);

  const showModal = (config: Omit<ModalState, 'isOpen' | 'onClose'>) => {
    setModalState({ ...initialModalState, ...config, isOpen: true });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const initializeServicesWithKey = (apiKeyToUse: string | null): boolean => {
    if (apiKeyToUse && apiKeyToUse.trim() !== "") {
      const textServiceOk = GeminiTextService.initialize(apiKeyToUse);
      const imageServiceOk = GeminiImageService.initialize(apiKeyToUse);
      if (textServiceOk && imageServiceOk) {
        setCurrentApiKey(apiKeyToUse);
        console.log("Servicios Gemini inicializados con API Key.");
        return true;
      } else {
        console.error("Fallo al inicializar uno o ambos servicios Gemini con la API Key.");
        // Clear partially initialized services if one failed
        GeminiTextService.initialize(""); 
        GeminiImageService.initialize("");
        setCurrentApiKey(null);
        return false;
      }
    } else {
      GeminiTextService.initialize("");
      GeminiImageService.initialize("");
      setCurrentApiKey(null);
      console.log("Servicios Gemini desinicializados (sin API Key).");
      return false; // No key, so services are not "successfully" initialized with a key
    }
  };
  
  useEffect(() => {
    let keyToTry = ApiKeyManager.loadApiKey(); // Try localStorage first
    if (!keyToTry) {
      keyToTry = ApiKeyManager.getApiKeyFromEnv(); // Then try env.js
      if (keyToTry) {
        // If from env.js, also save it to localStorage for consistency with settings screen
        ApiKeyManager.saveApiKey(keyToTry);
      }
    }
    
    const servicesInitialized = initializeServicesWithKey(keyToTry);

    if (!servicesInitialized) {
      showModal({
        title: "Advertencia de API Key",
        message: <>
          <p>No se ha encontrado o configurado una API Key de Gemini válida.</p>
          <p>La generación de contenido no funcionará hasta que se configure una API Key en la pantalla de <strong>Configuración</strong>.</p>
        </>,
        type: "alert", confirmText: "Ir a Configuración", 
        onConfirm: () => {
          hideModal();
          setCurrentStep(GameStep.SETTINGS);
        },
      });
    }
  }, []);


  useEffect(() => {
    StoryManager.saveStories(stories);
  }, [stories]);

  const handleApiKeyUpdate = (newKey: string) => {
    const trimmedKey = newKey.trim();
    ApiKeyManager.saveApiKey(trimmedKey); // Save (or clear if empty)
    const success = initializeServicesWithKey(trimmedKey);
    if (trimmedKey && success) {
      showModal({title: "API Key Guardada", message: "La API Key se ha guardado y los servicios de IA se han actualizado.", type:"alert", confirmText:"OK", onConfirm: hideModal});
    } else if (trimmedKey && !success) {
      showModal({title: "Error de API Key", message: "La API Key proporcionada no es válida o no se pudieron inicializar los servicios. Verifica la clave.", type:"alert", confirmText:"OK", onConfirm: hideModal});
    } else { // Key was cleared
      showModal({title: "API Key Limpiada", message: "La API Key guardada ha sido eliminada. Los servicios de IA están desactivados.", type:"alert", confirmText:"OK", onConfirm: hideModal});
    }
  };

  const handleApiKeyClearFromSettings = () => {
    ApiKeyManager.clearApiKey();
    initializeServicesWithKey(null); // This will set currentApiKey to null
    showModal({title: "API Key Limpiada", message: "La API Key guardada ha sido eliminada. Los servicios de IA están desactivados.", type:"alert", confirmText:"OK", onConfirm: hideModal});
  };


  const resetStorySetupStates = () => {
    setSelectedWorldInternal(null);
    setCustomWorldUserInput("");
    setGeneratedOnboardingQuestions([]);
    setOnboardingQuestionsError(null);
    setCurrentOnboardingAnswers({});
    setSelectedProtagonistGender(null); 
    setGeneratedProtagonistName(null); 
    setGeneratedStoryTitle(null);
    setInitialDreamImageUrl(null);
    setProtagonistArchetype(null);
    setCentralTheme(null);
    setPreambleText(null);
    setCurrentInitialDreamDescriptor(null);
    setCurrentInitialDreamImageDescription(null); 
    setCurrentInitialDreamImageCaption(null); 
    setSetupGenerationError(null);
  };

  const navigateHome = () => {
    setCurrentStep(GameStep.HOME);
    resetStorySetupStates();
    setSelectedStoryId(null); 
    setSelectedChapterToViewIndex(null);
    setChapterGenerationError(null);
  };

  const handleNavigateSettings = () => {
    setCurrentStep(GameStep.SETTINGS);
  };

  const handleStartNewStoryCreation = () => {
    if (!GeminiTextService.isApiAvailable() || !GeminiImageService.isApiAvailable()) {
      showModal({
        title: "API no disponible",
        message: "La creación de nuevas historias no está disponible. Por favor, configura tu API Key en la pantalla de Configuración.",
        type: "alert", confirmText: "Ir a Configuración", 
        onConfirm: () => { 
          hideModal();
          setCurrentStep(GameStep.SETTINGS);
        }
      });
      return;
    }
    resetStorySetupStates();
    setCurrentStep(GameStep.WORLD_SELECTION);
  };

  const currentWorldNameForDisplay = selectedWorldInternal?.isCustom ? customWorldUserInput : selectedWorldInternal?.name;

  const handleWorldSelected = async (world: World) => {
    setSelectedWorldInternal(world);
    setCustomWorldUserInput(""); 
    setOnboardingQuestionsError(null); 
    setGeneratedOnboardingQuestions([]); 

    if (world.isCustom) {
      // WorldSelectionScreen handles conditional rendering of input form
    } else {
      if (!GeminiTextService.isApiAvailable()) {
        setOnboardingQuestionsError("La API de Gemini para texto no está disponible (verifica API Key en Configuración).");
        setCurrentStep(GameStep.ONBOARDING_QUESTIONS);
        return;
      }
      setCurrentStep(GameStep.ONBOARDING_QUESTIONS_GENERATION_LOADING);
      try {
        const questions = await GeminiTextService.generateOnboardingQuestions(world.name);
        setGeneratedOnboardingQuestions(questions || []); 
        setCurrentStep(GameStep.ONBOARDING_QUESTIONS);
      } catch (error) {
        console.error("Error generando preguntas de onboarding:", error);
        setOnboardingQuestionsError(error instanceof Error ? error.message : "Error desconocido al generar preguntas.");
        setCurrentStep(GameStep.ONBOARDING_QUESTIONS); 
      }
    }
  };
  
  const handleCustomWorldSubmitted = async (customName: string) => {
    setCustomWorldUserInput(customName); 
    if (selectedWorldInternal && selectedWorldInternal.isCustom) {
      if (!GeminiTextService.isApiAvailable()) {
        setOnboardingQuestionsError("La API de Gemini para texto no está disponible (verifica API Key en Configuración).");
        setCurrentStep(GameStep.ONBOARDING_QUESTIONS);
        return;
      }
      setCurrentStep(GameStep.ONBOARDING_QUESTIONS_GENERATION_LOADING);
      try {
        const questions = await GeminiTextService.generateOnboardingQuestions(customName, customName);
        setGeneratedOnboardingQuestions(questions || []); 
        setCurrentStep(GameStep.ONBOARDING_QUESTIONS);
      } catch (error) {
        console.error("Error generando preguntas para mundo personalizado:", error);
        setOnboardingQuestionsError(error instanceof Error ? error.message : "Error desconocido al generar preguntas personalizadas.");
        setCurrentStep(GameStep.ONBOARDING_QUESTIONS); 
      }
    }
  };

  const handleOnboardingQuestionsSubmit = (answers: Record<string, string>) => {
    setCurrentOnboardingAnswers(answers);
    setCurrentStep(GameStep.PROTAGONIST_GENDER_SELECTION); 
  };

  const handleGenderSelected = (gender: string) => {
    setSelectedProtagonistGender(gender);
    if (selectedWorldInternal && currentOnboardingAnswers) {
        generateSetupDetails(selectedWorldInternal, customWorldUserInput, currentOnboardingAnswers, gender);
    } else {
        setSetupGenerationError("Faltan datos de mundo o respuestas para continuar con la selección de género.");
        setCurrentStep(GameStep.SETUP_DISPLAY); 
    }
  };

  const generateSetupDetails = async (
    worldToUse: World, 
    customWorldNameFromInput: string, 
    answers: Record<string, string>,
    protagonistGender: string 
  ) => {
    if (!GeminiTextService.isApiAvailable() || !GeminiImageService.isApiAvailable()) {
      setSetupGenerationError("La API de Gemini no está configurada o disponible. Revisa la Configuración.");
      setCurrentStep(GameStep.SETUP_DISPLAY); 
      return;
    }

    setIsGeneratingSetup(true);
    setSetupGenerationError(null);
    let tempTitle: string | null = null;
    let tempImageUrl: string | null = null;
    let tempProtagonistName: string | null = null;
    let tempArchetype: string | null = null;
    let tempTheme: string | null = null;
    let tempPreamble: string | null = null;
    let tempDreamDescriptorForProfile: string | null = null; 
    let tempInitialDreamImageDescription: string | null = null; 
    let tempInitialDreamImageCaption: string | null = null; 
    
    setGeneratedStoryTitle(null);
    setGeneratedProtagonistName(null);
    setInitialDreamImageUrl(null);
    setProtagonistArchetype(null);
    setCentralTheme(null);
    setPreambleText(null);
    setCurrentInitialDreamDescriptor(null); 
    setCurrentInitialDreamImageDescription(null);
    setCurrentInitialDreamImageCaption(null);
    
    setCurrentStep(GameStep.SETUP_GENERATION_LOADING);

    const finalWorldName = worldToUse.isCustom ? customWorldNameFromInput : worldToUse.name;

    let profileData: NarrativeProfileData | null = null;
    let profileSuccess = false;
    let imageSuccess = false;
    let titleSuccess = false;
    
    let combinedErrorMessage = "";

    if (generatedOnboardingQuestions.length > 0) {
        const lastQuestion = generatedOnboardingQuestions[generatedOnboardingQuestions.length - 1];
        const lastAnswerValue = answers[lastQuestion.id];
        const lastAnswerDetails = lastQuestion.answers.find(a => a.value === lastAnswerValue);
        if (lastAnswerDetails?.descriptor) {
            tempDreamDescriptorForProfile = lastAnswerDetails.descriptor;
        } else {
            tempDreamDescriptorForProfile = "un misterio profundo"; 
        }
    } else {
        tempDreamDescriptorForProfile = "un misterio profundo"; 
    }
    setCurrentInitialDreamDescriptor(tempDreamDescriptorForProfile); 
    
    const answeredQuestionsForProfile = Object.entries(answers).map(([qId, ansVal]) => {
        const question = generatedOnboardingQuestions.find(q => q.id === qId);
        const answer = question?.answers.find(a => a.value === ansVal);
        return { questionText: question?.text || '', answerText: answer?.text || '' };
    }).filter(qa => qa.questionText && qa.answerText); 

    try {
      try {
        if (answeredQuestionsForProfile.length > 0 && finalWorldName && tempDreamDescriptorForProfile) {
            profileData = await GeminiTextService.generateNarrativeProfile(finalWorldName, answeredQuestionsForProfile, tempDreamDescriptorForProfile, protagonistGender);
            if (profileData) {
              tempProtagonistName = profileData.protagonistName;
              tempArchetype = profileData.protagonistArchetype;
              tempTheme = profileData.centralTheme;
              tempPreamble = profileData.preambleText;
              tempInitialDreamImageDescription = profileData.initialDreamImageDescription;
              tempInitialDreamImageCaption = profileData.initialDreamImageCaption;
              profileSuccess = true;
            } else { 
                 throw new Error("La generación de perfil no devolvió datos completos.");
            }
        } else {
            console.warn("No hay respuestas/datos suficientes para generar el perfil narrativo completo.");
            combinedErrorMessage += `Faltan datos para perfil completo (respuestas, mundo o descriptor). `;
        }
      } catch (error) {
        console.error("Error generando perfil narrativo, descripción/leyenda de imagen inicial:", error);
        combinedErrorMessage += `Error perfil/img_desc: ${error instanceof Error ? error.message : "Desconocido"}. `;
      }

      if (profileSuccess && tempInitialDreamImageDescription && finalWorldName) {
        try {
            tempImageUrl = await GeminiImageService.generateImageFromDescription(
                tempInitialDreamImageDescription, 
                finalWorldName,
                "sueño inicial para la historia"
            );
            if (tempImageUrl) imageSuccess = true;
            else {
                console.warn("[App generateSetupDetails] La generación de imagen inicial devolvió null.");
                combinedErrorMessage += `Error imagen: No se pudo generar la imagen del sueño inicial a partir de su descripción. `;
            }
        } catch (imgError) { 
            console.error("[App generateSetupDetails] Error generando imagen del sueño inicial:", imgError);
            combinedErrorMessage += `Error imagen: ${imgError instanceof Error ? imgError.message : "Desconocido"}. `;
        }
      } else if (profileSuccess && !tempInitialDreamImageDescription) {
        combinedErrorMessage += `Advertencia imagen: No se generó descripción para la imagen inicial en el perfil, por lo tanto no se puede generar la imagen. `;
      }

      if (profileSuccess && tempArchetype && tempTheme && finalWorldName) { 
        try {
          tempTitle = await GeminiTextService.generateStoryTitle(finalWorldName, tempArchetype, tempTheme);
          if (tempTitle) titleSuccess = true;
          else  throw new Error("La generación de título no devolvió texto.");
        } catch (error) {
          console.error("Error generando título:", error);
          combinedErrorMessage += `Error título: ${error instanceof Error ? error.message : "Desconocido"}. `;
        }
      }
      
      if (!tempTitle && finalWorldName) { 
        tempTitle = `Aventura en ${finalWorldName}`;
      }

      setInitialDreamImageUrl(tempImageUrl);
      setCurrentInitialDreamImageDescription(tempInitialDreamImageDescription);
      setCurrentInitialDreamImageCaption(tempInitialDreamImageCaption);
      setGeneratedProtagonistName(tempProtagonistName); 
      setProtagonistArchetype(tempArchetype);
      setCentralTheme(tempTheme);
      setPreambleText(tempPreamble);
      setGeneratedStoryTitle(tempTitle); 

      let errorMessagesForDisplay = [];
      if (!profileSuccess) errorMessagesForDisplay.push("No se pudo generar el perfil del héroe (nombre, arquetipo, descripción de sueño, etc).");
      if (profileSuccess && !imageSuccess) errorMessagesForDisplay.push("No se pudo generar la imagen del sueño inicial.");
      if (profileSuccess && !titleSuccess && tempTitle && tempTitle.startsWith("Aventura en")) { 
          errorMessagesForDisplay.push("No se pudo generar un título único (se usó uno por defecto).");
      }
      
      if (errorMessagesForDisplay.length > 0) {
          setSetupGenerationError(errorMessagesForDisplay.join(" ") + (combinedErrorMessage.trim() ? " Detalles: " + combinedErrorMessage.trim() : ""));
      } else if (combinedErrorMessage.trim()) {
          setSetupGenerationError("Algunos elementos no se generaron correctamente o faltaban datos. Detalles: " + combinedErrorMessage.trim());
      }

    } catch (error) { 
      console.error("Error mayor en generateSetupDetails:", error);
      const mainErrorMsg = error instanceof Error ? error.message : "Error desconocido.";
      setSetupGenerationError(mainErrorMsg + (combinedErrorMessage.trim() ? " Detalles adicionales: " + combinedErrorMessage.trim() : ""));
    } finally {
      setIsGeneratingSetup(false);
      setCurrentStep(GameStep.SETUP_DISPLAY);
    }
  };


  const handleRegenerateInitialDreamImage = async () => {
    const finalWorldName = currentWorldNameForDisplay;
    const descriptionToUse = currentInitialDreamImageDescription; 

    if (!finalWorldName || !descriptionToUse) {
        showModal({
            title: "Faltan Datos para Regenerar",
            message: "No se puede regenerar la imagen porque falta información esencial (mundo o la descripción generada para la imagen).",
            type: "alert",
            confirmText: "Entendido",
            onConfirm: hideModal,
        });
        return;
    }

    if (!GeminiImageService.isApiAvailable()) {
      setSetupGenerationError("La API de Gemini para imágenes no está configurada o disponible. Revisa la Configuración.");
      return;
    }

    setIsGeneratingSetup(true); 
    let oldErrorWasImageRelated = setupGenerationError && (setupGenerationError.toLowerCase().includes("imagen") || setupGenerationError.toLowerCase().includes("image"));
    if (oldErrorWasImageRelated) {
        const errors = (setupGenerationError || "").split('.').map(e => e.trim()).filter(Boolean);
        const nonImageErrors = errors.filter(e => !e.toLowerCase().includes("imagen") && !e.toLowerCase().includes("image"));
        setSetupGenerationError(nonImageErrors.length > 0 ? nonImageErrors.join(". ") + "." : null);
    }
    setInitialDreamImageUrl(null); 
    
    try {
        const newImageUrl = await GeminiImageService.generateImageFromDescription(
            descriptionToUse, 
            finalWorldName,
            "sueño inicial para la historia (regenerado)"
        );
        setInitialDreamImageUrl(newImageUrl);
        if (!newImageUrl) {
             const newImgError = "No se pudo regenerar la imagen del sueño inicial.";
             setSetupGenerationError(prevError => prevError ? `${prevError} ${newImgError}` : newImgError);
        } else {
             if (oldErrorWasImageRelated && (!setupGenerationError || setupGenerationError.trim() === '')) {
                 setSetupGenerationError(null);
             }
        }
    } catch (error) { 
        const newErrorMsg = `Error al regenerar la imagen del sueño: ${error instanceof Error ? error.message : "Desconocido"}.`;
        setInitialDreamImageUrl(null);
        setSetupGenerationError(prevError => prevError ? `${prevError} ${newErrorMsg}` : newErrorMsg);
    } finally {
        setIsGeneratingSetup(false);
    }
  };


  const handleSaveStoryAndGoHome = () => {
    const finalWorldName = currentWorldNameForDisplay;

    if (!finalWorldName || !selectedWorldInternal) {
        setSetupGenerationError("Faltan datos del mundo para guardar la historia.");
        setCurrentStep(GameStep.SETUP_DISPLAY);
        return;
    }
    if (!selectedProtagonistGender) { 
        setSetupGenerationError("Falta el género del protagonista para guardar la historia.");
        setCurrentStep(GameStep.SETUP_DISPLAY); 
        return;
    }
    
    const newStory = StoryManager.sanitizeStory({
      id: Date.now().toString(),
      title: generatedStoryTitle || `Aventura en ${finalWorldName}`,
      worldName: finalWorldName,
      worldId: selectedWorldInternal.id, 
      onboardingAnswers: currentOnboardingAnswers, 
      initialDreamDescriptor: currentInitialDreamDescriptor, 
      initialDreamImageDescription: currentInitialDreamImageDescription, 
      initialDreamImageCaption: currentInitialDreamImageCaption, 
      dreamImageUrl: initialDreamImageUrl, 
      protagonistName: generatedProtagonistName, 
      protagonistGender: selectedProtagonistGender, 
      protagonistArchetype: protagonistArchetype,
      centralTheme: centralTheme,
      preambleText: preambleText,
      creationDate: new Date().toISOString(),
      chapters: [],
      completedChaptersCount: 0,
    });
    setStories(prevStories => [newStory, ...prevStories]);
    navigateHome();
  };
  
  const handleStorySelect = (storyId: string) => {
    setSelectedStoryId(storyId);
    setCurrentStep(GameStep.STORY_DETAIL);
    setSelectedChapterToViewIndex(null);
    setChapterGenerationError(null);
  };

  const handleViewSpecificChapter = (storyId: string, chapterIndex: number) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) {
        showModal({ title: "Error", message: "Historia no encontrada.", type: "alert", confirmText:"OK", onConfirm: hideModal});
        return;
    }
    setSelectedStoryId(storyId);
    setSelectedChapterToViewIndex(chapterIndex);
    setChapterGenerationError(null); 
    setCurrentStep(GameStep.CHAPTER_VIEW);
  };

  const generateChapterContent = async (storyToUpdate: Story, chapterIndexToGenerate: number) => {
    if (!GeminiTextService.isApiAvailable() || !GeminiImageService.isApiAvailable()) {
      setChapterGenerationError("La API de Gemini no está configurada o disponible. Revisa la Configuración.");
      return false;
    }

    setIsGeneratingChapter(true);
    setChapterGenerationError(null);
    setCurrentStep(GameStep.CHAPTER_GENERATION_LOADING);

    let newDreamImageForChapter: string | null = null; 
    let newChapterContentImageUrl: string | null = null; 
    let generatedChapterOutput: ExtendedChapterGenerationOutput | null = null;
    let combinedError = "";
    let chapterContentSuccess = false;

    try {
      if (chapterIndexToGenerate === 0) {
        newDreamImageForChapter = storyToUpdate.dreamImageUrl; 
        try {
            generatedChapterOutput = await GeminiTextService.generateFirstChapterText(storyToUpdate); 
            if (generatedChapterOutput && generatedChapterOutput.text && generatedChapterOutput.title && generatedChapterOutput.imageDescription && generatedChapterOutput.imageCaption) {
                chapterContentSuccess = true;
            } else {
                 throw new Error("La IA no devolvió el contenido completo (título, texto, descripción de imagen, leyenda) para el primer capítulo.");
            }
        } catch(e) {
            console.error("Error generando contenido del primer capítulo:", e);
            combinedError += `Error contenido Cap 1: ${e instanceof Error ? e.message : "Desconocido"}. `;
        }
      } else { 
        const previousChapter = storyToUpdate.chapters[chapterIndexToGenerate - 1];
        const playerReflection = previousChapter?.playerReflectionForNextChapter;

        if (!playerReflection) {
            combinedError += "No se encontró la reflexión del jugador para generar el sueño de este capítulo. ";
            newDreamImageForChapter = storyToUpdate.dreamImageUrl; 
        } else {
            newDreamImageForChapter = await GeminiImageService.generateChapterDreamImage(playerReflection, storyToUpdate.worldName);
            if (!newDreamImageForChapter) {
                console.warn(`[App generateChapterContent] La generación de imagen de sueño para Cap ${chapterIndexToGenerate + 1} devolvió null.`);
                combinedError += `Error imagen sueño Cap ${chapterIndexToGenerate + 1}: No se pudo generar. `;
                newDreamImageForChapter = storyToUpdate.dreamImageUrl;
            }
        }
        
        const previousChaptersSummary = storyToUpdate.chapters
            .slice(0, chapterIndexToGenerate)
            .map((ch, i) => `--- Inicio Capítulo ${i + 1} (${ch.chapterTitle || 'Sin título'}) ---\n${ch.chapterText}\n--- Fin Capítulo ${i + 1} ---\nReflexión del jugador que llevó a este capítulo (Cap ${i+1}): ${ch.playerReflectionForNextChapter || "Sin reflexión específica."}\n\n`)
            .join('\n');
        try {
            generatedChapterOutput = await GeminiTextService.generateSubsequentChapterText(storyToUpdate, chapterIndexToGenerate, playerReflection, previousChaptersSummary);
            if (generatedChapterOutput && generatedChapterOutput.text && generatedChapterOutput.title && generatedChapterOutput.imageDescription && generatedChapterOutput.imageCaption) {
                chapterContentSuccess = true;
            } else {
                throw new Error(`La IA no devolvió el contenido completo (título, texto, descripción de imagen, leyenda) para el capítulo ${chapterIndexToGenerate + 1}.`);
            }
        } catch(e) {
             console.error(`Error generando contenido del capítulo ${chapterIndexToGenerate + 1}:`, e);
            combinedError += `Error contenido Cap ${chapterIndexToGenerate + 1}: ${e instanceof Error ? e.message : "Desconocido"}. `;
        }
      }

      if (!chapterContentSuccess || !generatedChapterOutput) { 
        throw new Error("No se pudo generar el texto, título, descripción de imagen o leyenda del capítulo. " + (combinedError || "Razón desconocida."));
      }
      
      if (generatedChapterOutput.imageDescription) {
        newChapterContentImageUrl = await GeminiImageService.generateImageFromDescription(
            generatedChapterOutput.imageDescription,
            storyToUpdate.worldName,
            `contenido del Capítulo ${chapterIndexToGenerate + 1}`
        );
        if (!newChapterContentImageUrl) {
            console.warn(`[App generateChapterContent] La generación de imagen de contenido para Cap ${chapterIndexToGenerate + 1} devolvió null.`);
            combinedError += `Error imagen contenido Cap ${chapterIndexToGenerate + 1}: No se pudo generar. `;
        }
      } else {
         combinedError += `Advertencia: No se generó descripción de imagen para Cap ${chapterIndexToGenerate + 1}, por lo tanto no se generó imagen de contenido. `;
      }

      const newChapterEntry: ChapterEntry = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        entryNumber: chapterIndexToGenerate + 1,
        date: new Date().toISOString(),
        chapterTitle: generatedChapterOutput.title || `Capítulo ${chapterIndexToGenerate + 1}`,
        dreamImageForThisChapter: newDreamImageForChapter, 
        chapterContentImageUrl: newChapterContentImageUrl, 
        imageDescription: generatedChapterOutput.imageDescription, 
        imageCaption: generatedChapterOutput.imageCaption, 
        chapterText: generatedChapterOutput.text, 
        playerReflectionForNextChapter: null,
      };

      setStories(prevStories => 
        prevStories.map(s => 
          s.id === storyToUpdate.id 
            ? { ...s, chapters: [...s.chapters.slice(0, chapterIndexToGenerate), newChapterEntry, ...s.chapters.slice(chapterIndexToGenerate + 1)] }
            : s
        )
      );
      
      if (combinedError.trim()) { 
        setChapterGenerationError("El contenido principal del capítulo se generó, pero algunos elementos (como imágenes) pueden haber fallado: " + combinedError.trim());
      }
      return true; 

    } catch (error) { 
      console.error("Error catastrófico en generateChapterContent:", error);
      const mainErrorMsg = error instanceof Error ? error.message : "Error desconocido al generar capítulo.";
      setChapterGenerationError(mainErrorMsg + (combinedError.trim() ? " Detalles adicionales: " + combinedError.trim() : ""));
      return false; 
    } finally {
      setIsGeneratingChapter(false);
    }
  };

  const handleStartOrContinueChapter = async (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) {
      showModal({ title: "Error", message: "Historia no encontrada.", type: "alert", confirmText:"OK", onConfirm: hideModal});
      return;
    }

    if (!GeminiTextService.isApiAvailable() || !GeminiImageService.isApiAvailable()) {
      showModal({ title: "API no disponible", message: "La generación de capítulos no está disponible. Revisa la Configuración.", type: "alert", confirmText:"Ir a Configuración", onConfirm: () => { hideModal(); setCurrentStep(GameStep.SETTINGS); }});
      return;
    }
    
    const chapterIndexToProcess = story.completedChaptersCount;

    if (chapterIndexToProcess >= 30) { 
        showModal({title: "Fin de la Aventura", message: "¡Has completado todos los capítulos! Próximamente: Epílogo.", type: "alert", confirmText: "Genial", onConfirm: hideModal});
        return;
    }
    
    setSelectedStoryId(storyId);

    if (chapterIndexToProcess < story.chapters.length) { 
        setSelectedChapterToViewIndex(chapterIndexToProcess);
        setCurrentStep(GameStep.CHAPTER_VIEW);
    } else { 
        const success = await generateChapterContent(story, chapterIndexToProcess);
        if (success) {
            setSelectedChapterToViewIndex(chapterIndexToProcess);
            setCurrentStep(GameStep.CHAPTER_VIEW);
        } else {
            setCurrentStep(GameStep.STORY_DETAIL); 
             showModal({
                title: "Error de Generación",
                message: `No se pudo generar el capítulo ${chapterIndexToProcess + 1}. ${chapterGenerationError || "Inténtalo de nuevo."}`,
                type: "alert", 
                confirmText:"Entendido", 
                onConfirm: hideModal
            });
        }
    }
  };


  const handleRegenerateChapterContentImage = async (storyId: string, chapterIndexForImage: number, imageDescription: string) => {
    const storyToUpdate = stories.find(s => s.id === storyId);
    if (!storyToUpdate) {
        showModal({ title: "Error", message: "Historia no encontrada para regenerar imagen.", type: "alert", confirmText:"OK", onConfirm: hideModal});
        return;
    }

    if (!GeminiImageService.isApiAvailable()) {
        const errorMsg = "La API de Gemini para imágenes no está configurada o disponible. Revisa la Configuración.";
        setChapterGenerationError(errorMsg); 
        showModal({ title: "API no disponible", message: errorMsg, type: "alert", confirmText:"OK", onConfirm: hideModal});
        return;
    }

    if (!imageDescription) {
        showModal({
            title: "Falta Descripción de Imagen",
            message: "No se puede regenerar la imagen del contenido del capítulo porque falta la descripción original.",
            type: "alert", confirmText: "Entendido", onConfirm: hideModal
        });
        return;
    }

    setIsGeneratingChapter(true);
    let oldErrorWasImageRelated = chapterGenerationError && (chapterGenerationError.toLowerCase().includes("imagen") || chapterGenerationError.toLowerCase().includes("image"));
    if (oldErrorWasImageRelated && chapterGenerationError?.includes(`Cap ${chapterIndexForImage + 1}`)) {
         setChapterGenerationError(null);
    }

    try {
        const newImageUrl = await GeminiImageService.generateImageFromDescription(
            imageDescription, 
            storyToUpdate.worldName, 
            `contenido del Capítulo ${chapterIndexForImage + 1} (regenerada)`
        );

        setStories(prevStories =>
            prevStories.map(s => {
                if (s.id === storyId) {
                    const updatedChapters = s.chapters.map((ch, idx) => {
                        if (idx === chapterIndexForImage) {
                            return { ...ch, chapterContentImageUrl: newImageUrl }; 
                        }
                        return ch;
                    });
                    return { ...s, chapters: updatedChapters };
                }
                return s;
            })
        );
        
        if (newImageUrl) {
            if (oldErrorWasImageRelated && chapterGenerationError?.includes(`Cap ${chapterIndexForImage + 1}`)) {
                 setChapterGenerationError(null); 
            }
            showModal({title: "Imagen Regenerada", message: `La imagen de contenido para el Capítulo ${chapterIndexForImage + 1} se ha ${newImageUrl ? 'regenerado' : 'intentado regenerar (pero falló)'}.`, type: "alert", confirmText:"OK", onConfirm: hideModal});
        } else {
             const errorMsg = `No se pudo regenerar la imagen de contenido para Cap. ${chapterIndexForImage + 1}. Descripción usada: "${imageDescription}"`;
             setChapterGenerationError(errorMsg);
             showModal({title: "Fallo al Regenerar Imagen", message: errorMsg, type: "alert", confirmText:"OK", onConfirm: hideModal});
        }

    } catch (error) { 
        const errorMsg = `Error extremo regenerando imagen de contenido para Cap. ${chapterIndexForImage + 1}: ${error instanceof Error ? error.message : "Desconocido"}.`;
        setChapterGenerationError(errorMsg); 
    } finally {
        setIsGeneratingChapter(false);
    }
};


  const handleSaveReflection = (storyId: string, chapterIndex: number, reflectionText: string) => {
    setStories(prevStories =>
      prevStories.map(s => {
        if (s.id === storyId) {
          const updatedChapters = s.chapters.map((ch, idx) => 
            idx === chapterIndex ? { ...ch, playerReflectionForNextChapter: reflectionText } : ch
          );
          const newCompletedChaptersCount = (chapterIndex === s.completedChaptersCount) 
                                              ? s.completedChaptersCount + 1 
                                              : s.completedChaptersCount;
          return { ...s, chapters: updatedChapters, completedChaptersCount: newCompletedChaptersCount };
        }
        return s;
      })
    );
    showModal({
        title: "Reflexión Guardada",
        message: "Tu sueño ha sido enviado al héroe.",
        type: "alert",
        confirmText: "Continuar",
        onConfirm: () => {
            hideModal();
            setCurrentStep(GameStep.STORY_DETAIL); 
            setSelectedChapterToViewIndex(null); 
        }
    });
  };

  const handleExportStories = () => {
    if (stories.length === 0) {
      showModal({ title: "Sin Historias", message: "No hay historias para exportar.", type: "alert", confirmText: "OK", onConfirm: hideModal });
      return;
    }
    try {
      const jsonString = JSON.stringify(stories, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dreamloop_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showModal({ title: "Exportación Exitosa", message: "Historias exportadas.", type: "alert", confirmText: "OK", onConfirm: hideModal });
    } catch (error) {
      console.error("Error exportando historias:", error);
      showModal({ title: "Error de Exportación", message: `Error al exportar: ${error instanceof Error ? error.message : "Desconocido"}`, type: "alert", confirmText: "OK", onConfirm: hideModal });
    }
  };

  const handleImportStories = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const currentInput = event.target; 

    if (!file) {
      if (currentInput) currentInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e_reader) => {
      try {
        const text = e_reader.target?.result as string;
        if (!text || text.trim() === "") {
          showModal({ title: "Error de Importación", message: "El archivo parece estar vacío.", type: "alert", confirmText: "OK", onConfirm: hideModal }); return; }
        let parsedJson;
        try { parsedJson = JSON.parse(text); } catch (parseError) {
          showModal({ title: "Error de Importación", message: `El archivo no contiene JSON válido. ${parseError instanceof Error ? parseError.message : ""}`, type: "alert", confirmText: "OK", onConfirm: hideModal }); return; }
        const importedStoriesData = parsedJson as Partial<Story>[];
        if (!Array.isArray(importedStoriesData)) {
          showModal({ title: "Error de Importación", message: "El JSON no es un array de historias.", type: "alert", confirmText: "OK", onConfirm: hideModal }); return; }
        
        const isValidFormat = importedStoriesData.every(s => 
            typeof s.id === 'string' && 
            typeof s.title === 'string' &&
            typeof s.worldName === 'string' &&
            typeof s.worldId === 'string' &&
            (typeof s.initialDreamDescriptor === 'string' || s.initialDreamDescriptor === null) &&
            (typeof s.initialDreamImageDescription === 'string' || s.initialDreamImageDescription === null) && 
            (typeof s.initialDreamImageCaption === 'string' || s.initialDreamImageCaption === null) && 
            (typeof s.protagonistName === 'string' || s.protagonistName === null) && 
            (typeof s.protagonistGender === 'string' || s.protagonistGender === null) && 
            (Array.isArray(s.chapters)) &&
            (typeof s.completedChaptersCount === 'number') &&
            (!s.chapters || s.chapters.every(ch => 
                (typeof ch.chapterContentImageUrl === 'string' || ch.chapterContentImageUrl === null) &&
                (typeof ch.imageDescription === 'string' || ch.imageDescription === null) &&
                (typeof ch.imageCaption === 'string' || ch.imageCaption === null) 
            )) 
        );
        if (!isValidFormat) {
             showModal({ title: "Error de Importación", message: "Algunas historias en el archivo no tienen el formato esperado o faltan campos esenciales (incluyendo nombre/género del protagonista, descripciones/leyendas de imagen inicial, y datos de capítulo como imageCaption).", type: "alert", confirmText: "OK", onConfirm: hideModal }); return; }
        showModal({
          title: "Confirmar Importación", message: `¿Reemplazar ${stories.length} historia(s) con ${importedStoriesData.length} del archivo?`,
          type: "confirm", confirmText: "Reemplazar",
          onConfirm: () => {
            const sanitizedImportedStories = importedStoriesData.map(StoryManager.sanitizeStory);
            setStories(sanitizedImportedStories); hideModal(); 
            showModal({ title: "Importación Exitosa", message: `Se importaron ${sanitizedImportedStories.length} historias.`, type: "alert", confirmText: "OK", onConfirm: hideModal });
          },
          cancelText: "Cancelar", onCancel: hideModal
        });
      } catch (error) { 
        showModal({ title: "Error Inesperado", message: `Error al importar: ${error instanceof Error ? error.message : "Desconocido"}`, type: "alert", confirmText: "OK", onConfirm: hideModal });
      } finally { if (currentInput) currentInput.value = ''; }
    };
    reader.onerror = () => {
        showModal({ title: "Error de Lectura", message: "No se pudo leer el archivo.", type: "alert", confirmText: "OK", onConfirm: hideModal });
        if (currentInput) currentInput.value = ''; 
    }
    reader.readAsText(file);
  };

  const storyToView = stories.find(s => s.id === selectedStoryId);
  const chapterToDisplay = storyToView && typeof selectedChapterToViewIndex === 'number' 
                           ? storyToView.chapters[selectedChapterToViewIndex] 
                           : null;

  let imageCaptionForView: string | null = null;
  if (chapterToDisplay) { 
    if (chapterToDisplay.imageCaption) { 
      imageCaptionForView = chapterToDisplay.imageCaption;
    } else if (chapterToDisplay.imageDescription) { 
      imageCaptionForView = chapterToDisplay.imageDescription;
    } else if (chapterToDisplay.chapterTitle) { 
      imageCaptionForView = `Visualización para: ${chapterToDisplay.chapterTitle}`;
    } else {
      imageCaptionForView = `Visualización para el Capítulo ${chapterToDisplay.entryNumber}`;
    }
  }


  return (
    <>
      <Header 
        onNavigateHome={navigateHome}
        onNavigateSettings={handleNavigateSettings} // Pass new handler
      />
      <input type="file" ref={fileImportInputRef} style={{ display: 'none' }} accept=".json" onChange={handleImportStories} aria-hidden="true" />
      <ModalComponent {...modalState} onClose={hideModal} />
      <div className="app-container" role="application">
        <main className="app-main">
          {currentStep === GameStep.HOME && (
            <HomeScreen stories={stories} onCreateNew={handleStartNewStoryCreation} onSelectStory={handleStorySelect} />
          )}
          {currentStep === GameStep.SETTINGS && (
            <SettingsScreen
              currentApiKey={currentApiKey}
              onApiKeySubmit={handleApiKeyUpdate}
              onApiKeyClear={handleApiKeyClearFromSettings}
              onExport={handleExportStories}
              onImportTrigger={() => fileImportInputRef.current?.click()}
              onNavigateHome={navigateHome}
            />
          )}
          {currentStep === GameStep.WORLD_SELECTION && (
            <WorldSelectionScreen 
              onSelectWorld={handleWorldSelected} 
              onCustomWorldSubmit={handleCustomWorldSubmitted}
              selectedWorldId={selectedWorldInternal?.id}
            />
          )}
          {currentStep === GameStep.ONBOARDING_QUESTIONS_GENERATION_LOADING && (
            <OnboardingQuestionsLoadingScreen worldName={currentWorldNameForDisplay || "el mundo elegido"} />
          )}
          {currentStep === GameStep.ONBOARDING_QUESTIONS && (
            <OnboardingQuestionsScreen
              worldName={currentWorldNameForDisplay || "este mundo"}
              questions={generatedOnboardingQuestions}
              onSubmit={handleOnboardingQuestionsSubmit}
              error={onboardingQuestionsError}
              onRetry={() => selectedWorldInternal && (selectedWorldInternal.isCustom && customWorldUserInput ? handleCustomWorldSubmitted(customWorldUserInput) : handleWorldSelected(selectedWorldInternal))}
            />
          )}
          {currentStep === GameStep.PROTAGONIST_GENDER_SELECTION && (
            <ProtagonistGenderSelectionScreen
                worldName={currentWorldNameForDisplay || "este mundo"}
                onSubmit={handleGenderSelected}
            />
          )}
          {currentStep === GameStep.SETUP_GENERATION_LOADING && (
            <SetupLoadingScreen worldName={currentWorldNameForDisplay || "este mundo"} />
          )}
          {currentStep === GameStep.SETUP_DISPLAY && (
            <SetupDisplayScreen
              storyTitle={generatedStoryTitle}
              worldName={currentWorldNameForDisplay || "este mundo"}
              imageUrl={initialDreamImageUrl}
              initialDreamImageCaption={currentInitialDreamImageCaption}
              protagonistName={generatedProtagonistName}
              archetype={protagonistArchetype}
              theme={centralTheme}
              preambleText={preambleText}
              error={setupGenerationError}
              onContinue={handleSaveStoryAndGoHome}
              onRegenerateInitialDreamImage={handleRegenerateInitialDreamImage}
              isGenerating={isGeneratingSetup}
              canSave={!!selectedWorldInternal && !!selectedProtagonistGender && (!!generatedStoryTitle || !!setupGenerationError || !!initialDreamImageUrl || !!preambleText || !!generatedProtagonistName || !!currentInitialDreamDescriptor)} 
            />
          )}
          {currentStep === GameStep.STORY_DETAIL && storyToView && (
            <StoryDetailScreen 
              story={storyToView} 
              onNavigateHome={navigateHome}
              onContinueChapter={handleStartOrContinueChapter}
              onViewChapter={handleViewSpecificChapter}
            />
          )}
          {currentStep === GameStep.CHAPTER_GENERATION_LOADING && storyToView && (
            <ChapterGenerationLoadingScreen 
                storyTitle={storyToView.title} 
                chapterNumber={(storyToView?.completedChaptersCount ?? 0) + 1} 
            />
          )}
          {currentStep === GameStep.CHAPTER_VIEW && storyToView && chapterToDisplay && typeof selectedChapterToViewIndex === 'number' && (
             <ChapterViewScreen
                story={storyToView}
                chapter={chapterToDisplay}
                chapterIndex={selectedChapterToViewIndex}
                imageCaption={imageCaptionForView}
                onSaveReflection={handleSaveReflection}
                onNavigateBack={() => {
                    setCurrentStep(GameStep.STORY_DETAIL);
                    setSelectedChapterToViewIndex(null); 
                }}
                isLoading={isGeneratingChapter}
                error={chapterGenerationError}
                onRegenerateChapterContentImage={handleRegenerateChapterContentImage}
            />
          )}
        </main>
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} DreamLoop. La aventura de tu héroe te espera.</p>
        </footer>
      </div>
    </>
  );
}

export default App;
