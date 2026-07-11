
import { ENGAGEMENT_CONFIG } from '@/config/engagementScore';

/**
 * Calculates the Smart Student Engagement Score based on analytics data and lecture metadata.
 * @param {object} analytics - Result from calculateAnalytics (contains scores, totals, etc.)
 * @param {object} lecture - Lecture object from storage (contains attendance, id, etc.)
 * @param {Array} feedback - Array of feedback items.
 * @returns {object} Structured score object.
 */
export const calculateEngagementScore = (analytics, lecture, feedback) => {
  if (!analytics || !lecture) {
    return null;
  }

  const { weights } = ENGAGEMENT_CONFIG;

  // Individual factor percentages (0-100)
  const understanding = analytics.understandingScore ?? 0;
  const attention = analytics.attentionScore ?? 0;

  const totalAttendance = lecture.attendance?.length || 0;
  const totalFeedback = analytics.totalResponses || 0;

  const participation = totalAttendance ? Math.round((totalFeedback / totalAttendance) * 100) : 0;

  // Activity: treat raw feedback count as a percentage capped at 100
  const activity = Math.min(totalFeedback, 100);

  const commentCount = (feedback?.filter(f => f.comment)?.length) || 0;
  const comments = totalFeedback ? Math.round((commentCount / totalFeedback) * 100) : 0;

  // Weighted overall score
  const score = Math.round(
    understanding * weights.understanding +
    attention * weights.attention +
    participation * weights.participation +
    activity * weights.activity +
    comments * weights.comments
  );

  // Determine category
  const categoryObj = ENGAGEMENT_CONFIG.categories.find(c => score >= c.min && score <= c.max) || {
    label: 'Unknown',
    icon: ''
  };

  return {
    score,
    category: categoryObj.label,
    icon: categoryObj.icon,
    factors: {
      understanding,
      attention,
      participation,
      activity,
      comments,
    },
  };
};
