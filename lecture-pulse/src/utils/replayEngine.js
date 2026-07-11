// src/utils/replayEngine.js
/**
 * Utility functions for managing lecture replay timing.
 * All timestamps are ISO strings. Functions operate on Date objects.
 */

/**
 * Get the start and end timestamps for a set of feedback entries.
 * If timestamps are missing, generate synthetic ones assuming 30‑second intervals.
 * @param {Array} feedback - Array of feedback objects.
 * @returns {{ start: Date, end: Date, durationMs: number }}
 */
export const getReplayBounds = (feedback) => {
  if (!feedback.length) {
    const now = new Date();
    return { start: now, end: now, durationMs: 0 };
  }
  const withTs = feedback.filter((f) => f.timestamp);
  if (!withTs.length) {
    // generate synthetic timestamps spaced 30s apart
    const start = new Date();
    const entries = feedback.map((_, i) => new Date(start.getTime() + i * 30000));
    return {
      start: entries[0],
      end: entries[entries.length - 1],
      durationMs: entries[entries.length - 1].getTime() - entries[0].getTime()
    };
  }
  const timestamps = withTs.map((f) => new Date(f.timestamp).getTime()).sort((a, b) => a - b);
  const start = new Date(timestamps[0]);
  const end = new Date(timestamps[timestamps.length - 1]);
  return { start, end, durationMs: end.getTime() - start.getTime() };
};

/**
 * Clamp a number between min and max.
 */
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * Calculate the playback step in ms based on speed multiplier.
 * We tick every 250 ms for smooth UI, adjusting the elapsed time accordingly.
 */
export const getTickInterval = (speed) => {
  const base = 250; // real‑time ms per tick
  return base / speed; // faster speed => smaller interval
};
