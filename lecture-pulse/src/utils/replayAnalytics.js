// src/utils/replayAnalytics.js
/**
 * Functions to calculate analytics snapshot for a given timestamp.
 * Uses existing calculateAnalytics logic but filters feedback up to the given time.
 */
import { calculateAnalytics } from "@/utils/analytics";

/**
 * Get feedback entries up to a certain ISO timestamp (inclusive).
 * @param {Array} feedback - full feedback array
 * @param {Date|string} timestamp - current playback time
 * @returns {Array}
 */
export const filterFeedbackByTime = (feedback, timestamp) => {
  const target = new Date(timestamp).getTime();
  return feedback.filter((f) => {
    if (!f.timestamp) return true; // include entries without timestamp (fallback)
    return new Date(f.timestamp).getTime() <= target;
  });
};

/**
 * Generate analytics snapshot for the current playback time.
 * @param {Array} feedback - full feedback array
 * @param {Date|string} currentTime - current playback time
 * @returns {object} analytics snapshot (same shape as calculateAnalytics output)
 */
export const getSnapshotAnalytics = (feedback, currentTime) => {
  const filtered = filterFeedbackByTime(feedback, currentTime);
  return calculateAnalytics(filtered);
};
