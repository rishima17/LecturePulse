/**
 * Provides recommendation messages based on the engagement score category.
 * @param {object} scoreObj - Output from calculateEngagementScore.
 * @returns {string[]} Array of recommendation strings.
 */
export const getRecommendations = (scoreObj) => {
  if (!scoreObj) return [];
  const { category } = scoreObj;
  switch (category) {
    case 'Outstanding':
    case 'Excellent':
      return [
        'Students remained highly engaged.',
        'Current lecture pacing is effective.',
        'Consider maintaining the current teaching style.'
      ];
    case 'Good':
      return [
        'Engagement is decent but could improve.',
        'Introduce a few more interactive elements.',
        'Check if pacing matches student comprehension.'
      ];
    case 'Fair':
      return [
        'Engagement is moderate.',
        'Pause more frequently to ask comprehension questions.',
        'Encourage student participation through prompts.'
      ];
    case 'Needs Improvement':
      return [
        'Engagement is low.',
        'Increase interaction, such as quick polls or quizzes.',
        'Consider breaking the lecture into smaller segments.',
        'Ask more open‑ended questions to stimulate discussion.'
      ];
    default:
      return [];
  }
};
