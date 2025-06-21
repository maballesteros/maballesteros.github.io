
import { Tradition, LifeRole, JournalFormat, CentralObjective, EntryContentType } from './types';

export const AVAILABLE_TRADITIONS: Tradition[] = [
  Tradition.STOICISM,
  Tradition.ZEN_BUDDHISM,
  Tradition.CONTEMPLATIVE_CHRISTIANITY,
  Tradition.POSITIVE_PSYCHOLOGY,
  Tradition.SUFISM,
];

export const AVAILABLE_LIFE_ROLES: LifeRole[] = [
  LifeRole.NEW_PARENT,
  LifeRole.EDUCATOR,
  LifeRole.CHILDLESS_COUPLE,
  LifeRole.SENIOR_GRANDPARENT,
  LifeRole.ENTREPRENEUR,
  LifeRole.STUDENT,
  LifeRole.ARTIST_CREATIVE,
  LifeRole.CAREGIVER_ADULT,
  LifeRole.PROFESSIONAL_TRANSITION,
  LifeRole.MARTIAL_ARTIST
];

export const AVAILABLE_JOURNAL_FORMATS: JournalFormat[] = [
  JournalFormat.DAILY_MICRO,
  JournalFormat.WEEKLY_LONG,
  JournalFormat.YEARLY_FULL_365_DAYS,
  JournalFormat.HERO_JOURNEY,
];

export const AVAILABLE_CENTRAL_OBJECTIVES: CentralObjective[] = [
  CentralObjective.STRESS_MANAGEMENT,
  CentralObjective.CULTIVATE_PATIENCE,
  CentralObjective.FAMILY_GRATITUDE,
  CentralObjective.DISCIPLINE_NO_GUILT,
  CentralObjective.FINDING_PURPOSE,
  CentralObjective.IMPROVING_RELATIONSHIPS,
  CentralObjective.CREATIVITY_INSPIRATION,
  CentralObjective.MINDFULNESS_PRESENCE,
  CentralObjective.PERSONAL_GROWTH,
  CentralObjective.LEADERSHIP_IMPACT,
];

export const AVAILABLE_ENTRY_CONTENT_TYPES: EntryContentType[] = [
  EntryContentType.CONCISE_COMMENTARY,
  EntryContentType.INSPIRATIONAL_NARRATIVE,
  EntryContentType.HISTORICAL_ANECDOTE,
  EntryContentType.PHILOSOPHICAL_EXPLORATION,
];

// Updated model name as per guidelines
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const MAX_CONCURRENT_EPUB_GENERATION_REQUESTS = 10; // Max concurrent calls to Gemini during EPUB generation

// LocalStorage key for overriding Gemini API key
export const LOCAL_STORAGE_GEMINI_API_KEY = 'geminiApiKey';