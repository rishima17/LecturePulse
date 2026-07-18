import { MOOD_TYPES } from "@/constants/moodTypes";

const MOODS_PREFIX = "moods_";
const VOTED_PREFIX = "lecturePulse_voted_mood_";

/**
 * Returns the default initial mood structure.
 * @returns {Object}
 */
export const getInitialMoods = () => ({
  [MOOD_TYPES.INSPIRED]: 0,
  [MOOD_TYPES.GOOD]: 0,
  [MOOD_TYPES.NEUTRAL]: 0,
  [MOOD_TYPES.TIRED]: 0,
  [MOOD_TYPES.EXHAUSTED]: 0,
  totalResponses: 0,
});

/**
 * Gets the localStorage key for a session's mood counts.
 * @param {string} sessionCode
 * @returns {string}
 */
const getMoodsKey = (sessionCode) => `${MOODS_PREFIX}${sessionCode}`;

/**
 * Gets the localStorage key for a browser's voted mood in a session.
 * @param {string} sessionCode
 * @returns {string}
 */
const getVotedKey = (sessionCode) => `${VOTED_PREFIX}${sessionCode}`;

/**
 * Retrieves the aggregated mood counts for a session.
 * Handles missing storage, corrupted JSON, and invalid keys gracefully.
 * @param {string} sessionCode
 * @returns {Object}
 */
export const getMoods = (sessionCode) => {
  if (!sessionCode) return getInitialMoods();

  try {
    const key = getMoodsKey(sessionCode);
    const stored = localStorage.getItem(key);
    if (!stored) {
      return getInitialMoods();
    }

    const parsed = JSON.parse(stored);
    const result = getInitialMoods();

    // Validate and merge keys
    let total = 0;
    Object.keys(MOOD_TYPES).forEach((k) => {
      const type = MOOD_TYPES[k];
      if (parsed && typeof parsed[type] === "number" && !isNaN(parsed[type])) {
        result[type] = Math.max(0, parsed[type]);
        total += result[type];
      }
    });
    result.totalResponses = total;

    return result;
  } catch (error) {
    console.error(`Error reading mood storage for session ${sessionCode}`, error);
    return getInitialMoods();
  }
};

/**
 * Checks if the current browser has already voted for this session's mood.
 * @param {string} sessionCode
 * @returns {string|null} The voted mood type, or null if not voted.
 */
export const getVotedMood = (sessionCode) => {
  if (!sessionCode) return null;

  try {
    const key = getVotedKey(sessionCode);
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error checking voted mood for session ${sessionCode}`, error);
    return null;
  }
};

/**
 * Submits a mood vote for a lecture session.
 * Prevents duplicates, updates counts, and sets the voted flag.
 * @param {string} sessionCode
 * @param {string} moodType
 * @returns {Object} The updated mood counts.
 */
export const submitMood = (sessionCode, moodType) => {
  if (!sessionCode) {
    throw new Error("Invalid session code");
  }

  // Validate mood type
  if (!Object.values(MOOD_TYPES).includes(moodType)) {
    throw new Error(`Invalid mood type: ${moodType}`);
  }

  // Prevent duplicate voting
  const existingVote = getVotedMood(sessionCode);
  if (existingVote) {
    throw new Error("Already submitted a mood for this session");
  }

  try {
    const key = getMoodsKey(sessionCode);
    const current = getMoods(sessionCode);

    current[moodType] += 1;
    current.totalResponses += 1;

    localStorage.setItem(key, JSON.stringify(current));

    // Record the vote locally
    const votedKey = getVotedKey(sessionCode);
    localStorage.setItem(votedKey, moodType);

    // Dispatch a custom event to notify components in the same window (e.g. preview)
    window.dispatchEvent(
      new CustomEvent("mood-updated", {
        detail: { sessionCode, moods: current },
      })
    );

    return current;
  } catch (error) {
    console.error(`Error saving mood vote for session ${sessionCode}`, error);
    throw error;
  }
};
