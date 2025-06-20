
// Define game states/steps
export enum GameStep {
  HOME,
  WORLD_SELECTION,
  CUSTOM_WORLD_INPUT, // Technically handled within WORLD_SELECTION screen
  ONBOARDING_QUESTIONS_GENERATION_LOADING,
  ONBOARDING_QUESTIONS,
  PROTAGONIST_GENDER_SELECTION, // New step for selecting protagonist's gender
  SETUP_GENERATION_LOADING,
  SETUP_DISPLAY,
  STORY_DETAIL,
  CHAPTER_GENERATION_LOADING,
  CHAPTER_VIEW,
  SETTINGS, // New step for settings screen
}

export interface World {
  id: string;
  name: string;
  isCustom?: boolean; // Flag for custom world
}

export interface Answer {
  text: string;
  value: string;
  descriptor?: string; // Still needed for the last AI-generated question
}

export interface Question {
  id: string; // e.g., "q1", "q2", "q3" (will be assigned by AI or during processing)
  text: string;
  answers: Answer[];
}

export interface ChapterEntry {
  id: string;
  entryNumber: number; // 1-indexed chapter number
  date: string; // ISO string
  chapterTitle?: string; // Optional: e.g., "Capítulo 1: El Despertar"
  dreamImageForThisChapter: string | null; // Image based on *previous* reflection, shown at start of *this* chapter (now potentially unused in UI)
  chapterContentImageUrl: string | null; // Image representing the content of *this* chapter
  imageDescription: string | null; // Description used to generate chapterContentImageUrl
  imageCaption: string | null; // New: User-facing caption for the chapterContentImageUrl
  chapterText: string; // Main narrative content
  playerReflectionForNextChapter?: string | null; // Player's input at end of this chapter for next dream
}

export interface Story {
  id: string;
  title: string;
  worldName: string; // This can be the custom world name
  worldId: string; // For predefined worlds, or "custom" for custom ones
  onboardingAnswers: Record<string, string>; // Stores { questionId: answerValue }
  initialDreamDescriptor: string | null; // Descriptor from onboarding Q3 for the initial dream image
  initialDreamImageDescription: string | null; // New: Description for the initial dream image
  initialDreamImageCaption: string | null; // New: Caption for the initial dream image
  dreamImageUrl: string | null; // Initial dream image for the whole story
  protagonistName: string | null; // New: Name of the protagonist
  protagonistGender: string | null; // New: Gender of the protagonist
  protagonistArchetype: string | null;
  centralTheme: string | null;
  preambleText: string | null;
  creationDate: string;
  chapters: ChapterEntry[];
  completedChaptersCount: number;
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  type: 'alert' | 'confirm';
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
}

// For Gemini Service
export interface NarrativeProfileData {
  protagonistName: string; 
  protagonistArchetype: string;
  centralTheme: string;
  preambleText: string;
  initialDreamImageDescription: string; // New: Description for the initial dream image
  initialDreamImageCaption: string; // New: Caption for the initial dream image
}

export interface ExtendedChapterGenerationOutput {
  title: string;
  text: string;
  imageDescription: string;
  imageCaption: string; // New: User-facing caption
}

// Props for ChapterViewScreen
export interface ChapterViewScreenProps {
  story: Story;
  chapter: ChapterEntry;
  chapterIndex: number; // 0-indexed
  imageCaption: string | null; // Caption for the chapter's content image
  onSaveReflection: (storyId: string, chapterIndex: number, reflectionText: string) => void;
  onNavigateBack: () => void;
  isLoading: boolean;
  error: string | null;
  onRegenerateChapterContentImage?: (storyId: string, chapterIndex: number, imageDescription: string) => void; // Updated
}

// For AI-generated onboarding questions
export interface GeneratedQuestion extends Question {}
