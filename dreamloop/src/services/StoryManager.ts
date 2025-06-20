
import type { Story } from '../types';
// ONBOARDING_QUESTIONS_DATA is no longer used as questions are AI-generated.

const STORAGE_KEY = 'dreamloop_stories';

export const sanitizeStory = (story: Partial<Story>): Story => {
  return {
    id: story.id || Date.now().toString(),
    title: story.title || "Historia sin título",
    worldName: story.worldName || "Mundo desconocido",
    worldId: story.worldId || "unknown",
    onboardingAnswers: story.onboardingAnswers || {},
    initialDreamDescriptor: story.initialDreamDescriptor || null,
    initialDreamImageDescription: story.initialDreamImageDescription || null, // Initialize new field
    initialDreamImageCaption: story.initialDreamImageCaption || null, // Initialize new field
    dreamImageUrl: story.dreamImageUrl || null,
    protagonistName: story.protagonistName || null, // Initialize new field
    protagonistGender: story.protagonistGender || null, // Initialize new field
    protagonistArchetype: story.protagonistArchetype || null,
    centralTheme: story.centralTheme || null,
    preambleText: story.preambleText || null,
    creationDate: story.creationDate || new Date().toISOString(),
    chapters: Array.isArray(story.chapters) ? story.chapters.map(ch => ({
        id: ch.id || Date.now().toString() + Math.random(),
        entryNumber: typeof ch.entryNumber === 'number' ? ch.entryNumber : 0,
        date: ch.date || new Date().toISOString(),
        chapterTitle: ch.chapterTitle || undefined,
        dreamImageForThisChapter: ch.dreamImageForThisChapter || null,
        chapterContentImageUrl: ch.chapterContentImageUrl || null,
        imageDescription: ch.imageDescription || null, 
        imageCaption: ch.imageCaption || null, // Initialize new field
        chapterText: ch.chapterText || "",
        playerReflectionForNextChapter: ch.playerReflectionForNextChapter || null,
    })) : [],
    completedChaptersCount: typeof story.completedChaptersCount === 'number' ? story.completedChaptersCount : 0,
  };
};

export const loadStories = (): Story[] => {
  const savedStories = localStorage.getItem(STORAGE_KEY);
  if (savedStories) {
    try {
      const parsed = JSON.parse(savedStories) as Partial<Story>[];
      return parsed.map(sanitizeStory);
    } catch (e) {
      console.error("Error parsing stories from localStorage:", e);
      return [];
    }
  }
  return [];
};

export const saveStories = (stories: Story[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
};

// getAnswerTextForPrompt is removed as static ONBOARDING_QUESTIONS_DATA is no longer used.
// App.tsx uses getLocalAnswerText with dynamic generatedOnboardingQuestions.