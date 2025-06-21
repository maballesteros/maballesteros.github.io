
import { StoredJournal, JournalEntry } from '../types';

const JOURNALS_STORAGE_KEY = 'aiPersonalizedJournals';

// Helper to get all journals from localStorage
const getAllStoredJournals = (): StoredJournal[] => {
  try {
    const storedJournals = localStorage.getItem(JOURNALS_STORAGE_KEY);
    return storedJournals ? JSON.parse(storedJournals) : [];
  } catch (error) {
    console.error("Error reading journals from localStorage:", error);
    return [];
  }
};

// Helper to save all journals to localStorage
const saveAllStoredJournals = (journals: StoredJournal[]): void => {
  try {
    localStorage.setItem(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
  } catch (error) {
    console.error("Error saving journals to localStorage:", error);
  }
};

export const storageService = {
  async getAllJournals(): Promise<StoredJournal[]> {
    return getAllStoredJournals();
  },

  async getJournal(journalId: string): Promise<StoredJournal | null> {
    const journals = getAllStoredJournals();
    return journals.find(j => j.id === journalId) || null;
  },

  async saveJournal(journal: StoredJournal): Promise<void> {
    let journals = getAllStoredJournals();
    const existingIndex = journals.findIndex(j => j.id === journal.id);
    if (existingIndex > -1) {
      journals[existingIndex] = journal; // Update existing
    } else {
      journals.push(journal); // Add new
    }
    saveAllStoredJournals(journals);
  },

  async deleteJournal(journalId: string): Promise<void> {
    let journals = getAllStoredJournals();
    journals = journals.filter(j => j.id !== journalId);
    saveAllStoredJournals(journals);
  },
  
  async deleteAllData(): Promise<void> {
    try {
      localStorage.removeItem(JOURNALS_STORAGE_KEY);
    } catch (error) {
      console.error("Error deleting all data from localStorage:", error);
    }
  },

  // Used to update notes or challenge status, or add full entry content
  async updateJournalEntry(journalId: string, entryId: string, entryData: Partial<JournalEntry>): Promise<void> {
    const journal = await this.getJournal(journalId);
    if (journal) {
      journal.entries[entryId] = { 
        ...(journal.entries[entryId] || {}), // Keep existing data if any (e.g. notes if only content is new)
        ...entryData // Apply new data
      } as JournalEntry; // Assert type as we are building it up
      await this.saveJournal(journal);
    } else {
      console.warn(`Journal with id ${journalId} not found for updating entry ${entryId}`);
    }
  },

  // Specifically for saving the full generated content of an entry
  async saveFullJournalEntry(journalId: string, entry: JournalEntry): Promise<void> {
    const journal = await this.getJournal(journalId);
    if (journal) {
        // Ensure existing notes and challenge status are preserved if the entry object
        // passed to this function doesn't already include them.
        const existingEntryState = journal.entries[entry.id] || {};
        journal.entries[entry.id] = {
            ...entry, // This is the new full content from Gemini
            notes: existingEntryState.notes || entry.notes, // Prefer existing notes if available
            challengeCompleted: existingEntryState.challengeCompleted !== undefined ? existingEntryState.challengeCompleted : entry.challengeCompleted, // Prefer existing status
        };
        await this.saveJournal(journal);
    } else {
        console.warn(`Journal with id ${journalId} not found for saving full entry ${entry.id}`);
    }
  }
};