import { REACTION_TYPES } from "@/constants/reactionTypes";

const STORAGE_PREFIX = "lecturePulse_reactions_";

/**
 * Generates the localStorage key for a given session code.
 * @param {string} sessionCode 
 * @returns {string}
 */
export const getReactionKey = (sessionCode) => `${STORAGE_PREFIX}${sessionCode}`;

/**
 * Returns the default initial reaction counts structure.
 * @returns {import("@/types/reaction").ReactionCounts}
 */
export const getInitialReactions = () => ({
  [REACTION_TYPES.CLAP]: 0,
  [REACTION_TYPES.IDEA]: 0,
  [REACTION_TYPES.GOT_IT]: 0,
  [REACTION_TYPES.MIND_BLOWN]: 0,
  [REACTION_TYPES.TOO_FAST]: 0,
});

/**
 * Gets aggregated reaction counts for a session code.
 * Handles missing data, invalid JSON, and errors.
 * @param {string} sessionCode 
 * @returns {import("@/types/reaction").ReactionCounts}
 */
export const getReactions = (sessionCode) => {
  if (!sessionCode) return getInitialReactions();
  
  try {
    const key = getReactionKey(sessionCode);
    const stored = localStorage.getItem(key);
    if (!stored) {
      return getInitialReactions();
    }
    
    const parsed = JSON.parse(stored);
    const reactions = getInitialReactions();
    
    // Ensure all keys exist and are valid numbers
    Object.keys(reactions).forEach((type) => {
      if (typeof parsed[type] === "number" && !isNaN(parsed[type])) {
        reactions[type] = parsed[type];
      }
    });
    
    return reactions;
  } catch (error) {
    console.error(`Error loading reactions for session ${sessionCode}`, error);
    return getInitialReactions();
  }
};

/**
 * Saves reaction counts for a session code to localStorage.
 * @param {string} sessionCode 
 * @param {import("@/types/reaction").ReactionCounts} reactions 
 */
export const saveReactions = (sessionCode, reactions) => {
  if (!sessionCode) return;
  
  try {
    const key = getReactionKey(sessionCode);
    localStorage.setItem(key, JSON.stringify(reactions));
  } catch (error) {
    console.error(`Error saving reactions for session ${sessionCode}`, error);
  }
};

/**
 * Increments the count of a reaction type.
 * @param {string} sessionCode 
 * @param {string} reactionType 
 * @returns {import("@/types/reaction").ReactionCounts} The updated reaction counts
 */
export const addReaction = (sessionCode, reactionType) => {
  if (!sessionCode) return getInitialReactions();
  
  const current = getReactions(sessionCode);
  if (current[reactionType] !== undefined) {
    current[reactionType] += 1;
  } else {
    current[reactionType] = 1;
  }
  
  saveReactions(sessionCode, current);
  return current;
};
