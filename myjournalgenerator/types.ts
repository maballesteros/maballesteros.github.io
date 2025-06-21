

export enum Tradition {
  STOICISM = "Estoicismo",
  ZEN_BUDDHISM = "Budismo Zen",
  CONTEMPLATIVE_CHRISTIANITY = "Cristianismo Contemplativo",
  POSITIVE_PSYCHOLOGY = "Psicología Positiva",
  SUFISM = "Sufismo",
}

export enum LifeRole {
  NEW_PARENT = "Madre/padre primerizo",
  EDUCATOR = "Educador",
  CHILDLESS_COUPLE = "Pareja sin hijos",
  SENIOR_GRANDPARENT = "Senior cuidando nietos",
  ENTREPRENEUR = "Emprendedor/a",
  STUDENT = "Estudiante",
  ARTIST_CREATIVE = "Artista / Creativo/a",
  CAREGIVER_ADULT = "Cuidador/a de adultos",
  PROFESSIONAL_TRANSITION = "Profesional en transición",
  MARTIAL_ARTIST="Artista marcial",
}

export enum JournalFormat {
  DAILY_MICRO = "Reflexión diaria (30 días)",
  WEEKLY_LONG = "Entrada semanal (12 semanas)", // Corrected from 52 weeks to match implementation
  YEARLY_FULL_365_DAYS = "Diario Anual Completo (365 días)",
  HERO_JOURNEY = "Camino del Héroe (30 días narrativos)",
}

export enum CentralObjective {
  STRESS_MANAGEMENT = "Manejo del estrés",
  CULTIVATE_PATIENCE = "Cultivo de la paciencia",
  FAMILY_GRATITUDE = "Gratitud familiar",
  DISCIPLINE_NO_GUILT = "Disciplina sin culpa",
  FINDING_PURPOSE = "Encontrar propósito vital",
  IMPROVING_RELATIONSHIPS = "Mejorar relaciones interpersonales",
  CREATIVITY_INSPIRATION = "Fomentar la creatividad e inspiración",
  MINDFULNESS_PRESENCE = "Cultivar mindfulness y presencia",
  PERSONAL_GROWTH = "Desarrollo personal y autoconocimiento",
  LEADERSHIP_IMPACT = "Desarrollar liderazgo e impacto positivo",
}

export enum EntryContentType {
  CONCISE_COMMENTARY = "Comentario Conciso",
  INSPIRATIONAL_NARRATIVE = "Narrativa Inspiradora (Fábula, Cuento)",
  HISTORICAL_ANECDOTE = "Anécdota Histórica Relevante",
  PHILOSOPHICAL_EXPLORATION = "Exploración Filosófica Profunda",
}

export interface PersonalizationOptions {
  traditions: (Tradition | string)[];
  lifeRole: LifeRole | string;
  journalFormat: JournalFormat;
  centralObjectives: (CentralObjective | string)[];
  defaultEntryContentType: EntryContentType;
  generateIllustrations?: boolean;
  heroProfile?: string; // For Hero's Journey format
}

export interface JournalSubChapter {
  title: string;
  description?: string;
}

export interface JournalTheme {
  theme: string;
  subChapters: JournalSubChapter[];
}

export interface JournalIndex {
  title: string;
  themes: JournalTheme[];
  cadence: string; 
}

export interface JournalEntryContent {
  spark: {
    quote: string;
    author?: string;
  };
  entryContentType: EntryContentType; 
  mainContent: string; 
  commentary?: string; 
  journalQuestion: string;
  miniChallenge: string;
  illustrationUrl?: string;
  isFallbackContent?: boolean; 
}

export interface JournalEntry extends JournalEntryContent {
  id: string; 
  themeTitle: string;
  subChapterTitle: string;
  notes?: string;
  challengeCompleted?: boolean;
}

export interface StoredJournal {
  id: string;
  personalizationOptions: PersonalizationOptions;
  journalIndex: JournalIndex;
  entries: Record<string, JournalEntry>; 
  coverImageUrl?: string; 
}

export type AppView = "library" | "config" | "index" | "entry" | "settings";