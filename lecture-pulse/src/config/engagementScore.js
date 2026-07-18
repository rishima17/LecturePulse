export const ENGAGEMENT_CONFIG = {
  weights: {
    understanding: 0.35,
    attention: 0.25,
    participation: 0.20,
    activity: 0.10,
    comments: 0.10,
  },
  categories: [
    { min: 90, max: 100, label: 'Outstanding', icon: '🟢' },
    { min: 75, max: 89, label: 'Excellent', icon: '🟢' },
    { min: 60, max: 74, label: 'Good', icon: '🟡' },
    { min: 40, max: 59, label: 'Fair', icon: '🟠' },
    { min: 0, max: 39, label: 'Needs Improvement', icon: '🔴' },
  ],
};
