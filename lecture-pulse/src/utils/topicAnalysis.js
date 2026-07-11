// Topic analysis utilities
/**
 * Analyzes lecture feedback to produce topic-level metrics.
 * All business logic is pure and free of React.
 */
import { TOPIC_KEYWORDS } from "./topicKeywords.js";
import { HEATMAP_CONFIG } from "../config/heatmap.js";

/**
 * Helper to determine if a comment mentions a topic based on keywords.
 * @param {string} comment
 * @param {string[]} keywords
 * @returns {boolean}
 */
const commentMatches = (comment, keywords) => {
  if (!comment) return false;
  const lower = comment.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
};

/**
 * Maps attention string to numeric score (high=5, medium=3, low=1).
 * @param {string} att
 * @returns {number}
 */
const attentionScore = (att) => {
  switch (att) {
    case "high":
      return 5;
    case "medium":
      return 3;
    case "low":
      return 1;
    default:
      return 0;
  }
};

/**
 * Analyzes topics.
 * @param {Array} feedbackArray
 * @returns {Array} Array of topic objects with metrics.
 */
export const analyzeTopics = (feedbackArray = []) => {
  // Initialize map for each topic
  const topicsMap = {};
  Object.keys(TOPIC_KEYWORDS).forEach((topic) => {
    topicsMap[topic] = {
      name: topic,
      feedbacks: [], // feedback items that mention this topic
    };
  });

  // Assign feedback to topics based on comment matching
  feedbackArray.forEach((fb) => {
    const comment = fb.comment || "";
    Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
      if (commentMatches(comment, keywords)) {
        topicsMap[topic].feedbacks.push(fb);
      }
    });
  });

  // Build result array with calculations
  const results = Object.values(topicsMap).map((t) => {
    const total = t.feedbacks.length;
    if (total === 0) {
      return null; // will be filtered out later
    }
    const confusionCount = t.feedbacks.filter((f) => !!f.confusionTime).length;
    const confusionPercent = Math.round((confusionCount / total) * 100);

    const attentionTotal = t.feedbacks.reduce((sum, f) => sum + attentionScore(f.attention), 0);
    const attentionPercent = Math.round((attentionTotal / (total * 5)) * 100);

    // Understanding distribution
    const understandingDist = {
      clear: 0,
      partial: 0,
      confusing: 0,
    };
    t.feedbacks.forEach((f) => {
      const u = f.understanding;
      if (u && Object.prototype.hasOwnProperty.call(understandingDist, u)) {
        understandingDist[u]++;
      }
    });

    // Determine difficulty level based on confusion thresholds
    const { low, medium } = HEATMAP_CONFIG.thresholds;
    let difficulty = "high";
    if (confusionPercent <= low) difficulty = "low";
    else if (confusionPercent <= medium) difficulty = "medium";

    // Collect recent comments (up to 5)
    const recentComments = t.feedbacks
      .filter((f) => f.comment)
      .slice(-5)
      .map((f) => f.comment);

    return {
      name: t.name,
      totalFeedback: total,
      confusionPercent,
      attentionPercent,
      understandingDist,
      difficulty,
      recentComments,
    };
  }).filter(Boolean);

  return results;
};

/**
 * Filters topics based on difficulty level.
 * @param {Array} topics
 * @param {string} filter - one of 'all', 'low', 'medium', 'high'
 * @returns {Array}
 */
export const filterTopics = (topics, filter) => {
  if (!filter || filter === "all") return topics;
  return topics.filter((t) => t.difficulty === filter);
};

/**
 * Sorts topics.
 * @param {Array} topics
 * @param {string} sortKey - 'confusionDesc', 'confusionAsc', 'commentsDesc', 'alphabetical'
 * @returns {Array}
 */
export const sortTopics = (topics, sortKey) => {
  const copy = [...topics];
  switch (sortKey) {
    case "confusionDesc":
      return copy.sort((a, b) => b.confusionPercent - a.confusionPercent);
    case "confusionAsc":
      return copy.sort((a, b) => a.confusionPercent - b.confusionPercent);
    case "commentsDesc":
      return copy.sort((a, b) => b.totalFeedback - a.totalFeedback);
    case "alphabetical":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
};
