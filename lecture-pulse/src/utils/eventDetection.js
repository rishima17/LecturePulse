// src/utils/eventDetection.js
/**
 * Simple event detection based on timeline analytics.
 * Returns an array of event objects for the replay timeline.
 * Types: 'confusion-spike', 'attention-drop', 'recovery', 'high-engagement'
 */

/**
 * Detect events from a timeline array (output of calculateAnalytics timeline).
 * @param {Array} timeline - each item { label, responses, understanding, attention }
 * @returns {Array} events - each { type, timestamp, title, description }
 */
export const detectEvents = (timeline) => {
  const events = [];
  const THRESHOLD = 20; // percent change threshold
  for (let i = 1; i < timeline.length; i++) {
    const prev = timeline[i - 1];
    const cur = timeline[i];
    // Confusion spike approximated by drop in understanding percentage
    const understandingDiff = cur.understanding - prev.understanding;
    if (understandingDiff < -THRESHOLD) {
      events.push({
        type: 'confusion-spike',
        timestamp: cur.label,
        title: '⚠ Confusion Spike',
        description: `Understanding fell ${Math.abs(understandingDiff)}% between ${prev.label} and ${cur.label}`
      });
    }
    // Attention drop
    const attentionDiff = cur.attention - prev.attention;
    if (attentionDiff < -THRESHOLD) {
      events.push({
        type: 'attention-drop',
        timestamp: cur.label,
        title: '⚠ Attention Drop',
        description: `Attention fell ${Math.abs(attentionDiff)}% between ${prev.label} and ${cur.label}`
      });
    }
    // Recovery (understanding rise after a drop)
    if (understandingDiff > THRESHOLD) {
      events.push({
        type: 'recovery',
        timestamp: cur.label,
        title: '✅ Recovery',
        description: `Understanding improved ${understandingDiff}% after previous dip`
      });
    }
    // High engagement (both high understanding & attention)
    if (cur.understanding >= 80 && cur.attention >= 80) {
      events.push({
        type: 'high-engagement',
        timestamp: cur.label,
        title: '🚀 High Engagement',
        description: `Strong understanding (${cur.understanding}%) and attention (${cur.attention}%)`
      });
    }
  }
  return events;
};
