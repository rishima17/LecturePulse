import { toast } from "sonner";

/**
 * Gets the storage key for a specific lecture session code.
 * @param {string} sessionCode 
 * @returns {string}
 */
const getStorageKey = (sessionCode) => {
  return `lecturePulse_journal_${sessionCode}`;
};

/**
 * Retrieves all journal notes for a specific lecture session.
 * Handles parsing errors, missing keys, and corrupted storage gracefully.
 * 
 * @param {string} sessionCode 
 * @returns {import("../types/journal").JournalNote[]}
 */
export const getJournalNotes = (sessionCode) => {
  if (!sessionCode) return [];
  try {
    const key = getStorageKey(sessionCode);
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.error("Corrupted journal storage format - expected array");
      return [];
    }
    return parsed;
  } catch (error) {
    console.error("Error parsing journal notes from localStorage:", error);
    return [];
  }
};

/**
 * Saves the list of journal notes to localStorage.
 * Handles QuotaExceededError and other storage failures.
 * 
 * @param {string} sessionCode 
 * @param {import("../types/journal").JournalNote[]} notes 
 * @returns {boolean} True if successful, false otherwise.
 */
export const saveJournalNotes = (sessionCode, notes) => {
  if (!sessionCode) return false;
  try {
    const key = getStorageKey(sessionCode);
    localStorage.setItem(key, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error("Error saving journal notes to localStorage:", error);
    if (error.name === "QuotaExceededError" || error.code === 22) {
      toast.error("Local storage quota exceeded! Please delete some notes to free up space.");
    } else {
      toast.error("Failed to save note. Local storage is unavailable.");
    }
    throw error;
  }
};

/**
 * Creates a new journal note.
 * 
 * @param {string} sessionCode 
 * @param {Object} noteData 
 * @param {string} [noteData.title] 
 * @param {string} noteData.content 
 * @returns {import("../types/journal").JournalNote | null} The created note object.
 */
export const createJournalNote = (sessionCode, { title = "", content }) => {
  const trimmedContent = content?.trim() || "";
  const trimmedTitle = title?.trim() || "";
  
  if (!trimmedContent) {
    toast.error("Note content cannot be empty.");
    return null;
  }
  
  try {
    const notes = getJournalNotes(sessionCode);
    const now = new Date().toISOString();
    
    /** @type {import("../types/journal").JournalNote} */
    const newNote = {
      id: crypto.randomUUID(),
      sessionCode,
      title: trimmedTitle || undefined,
      content: trimmedContent,
      createdAt: now,
      updatedAt: now,
      starred: false,
      reviseLater: false,
    };
    
    const updatedNotes = [newNote, ...notes];
    saveJournalNotes(sessionCode, updatedNotes);
    
    return newNote;
  } catch (error) {
    console.error("Failed to create note:", error);
    return null;
  }
};

/**
 * Updates an existing journal note.
 * 
 * @param {string} sessionCode 
 * @param {string} noteId 
 * @param {Object} updatedFields 
 * @returns {import("../types/journal").JournalNote[] | null} The updated notes list, or null if failed.
 */
export const updateJournalNote = (sessionCode, noteId, updatedFields) => {
  if (!noteId) return null;
  
  try {
    const notes = getJournalNotes(sessionCode);
    const noteExists = notes.some(note => note.id === noteId);
    
    if (!noteExists) {
      toast.error("Note not found.");
      return null;
    }
    
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        const title = updatedFields.title !== undefined ? updatedFields.title?.trim() : note.title;
        const content = updatedFields.content !== undefined ? updatedFields.content?.trim() : note.content;
        
        return {
          ...note,
          ...updatedFields,
          title: title || undefined,
          content: content || note.content,
          updatedAt: new Date().toISOString(),
        };
      }
      return note;
    });
    
    saveJournalNotes(sessionCode, updatedNotes);
    return updatedNotes;
  } catch (error) {
    console.error("Failed to update note:", error);
    return null;
  }
};

/**
 * Deletes a journal note.
 * 
 * @param {string} sessionCode 
 * @param {string} noteId 
 * @returns {import("../types/journal").JournalNote[] | null} The updated notes list, or null if failed.
 */
export const deleteJournalNote = (sessionCode, noteId) => {
  if (!noteId) return null;
  
  try {
    const notes = getJournalNotes(sessionCode);
    const updatedNotes = notes.filter(note => note.id !== noteId);
    
    saveJournalNotes(sessionCode, updatedNotes);
    return updatedNotes;
  } catch (error) {
    console.error("Failed to delete note:", error);
    return null;
  }
};
