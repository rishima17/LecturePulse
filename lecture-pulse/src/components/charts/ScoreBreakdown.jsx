import { ENGAGEMENT_CONFIG } from '@/config/engagementScore';


/**
 * Displays a breakdown of the engagement score factors with their percentages and weighted point contributions.
 * @param {object} props
 * @param {object} props.scoreData - Result from calculateEngagementScore.
 */
export const ScoreBreakdown = ({ scoreData }) => {
  if (!scoreData) return null;
  const { factors, score } = scoreData;
  const { weights } = ENGAGEMENT_CONFIG;

  const items = [
    { key: 'understanding', label: 'Understanding', value: factors.understanding, weight: weights.understanding },
    { key: 'attention', label: 'Attention', value: factors.attention, weight: weights.attention },
    { key: 'participation', label: 'Participation', value: factors.participation, weight: weights.participation },
    { key: 'activity', label: 'Feedback Activity', value: factors.activity, weight: weights.activity },
    { key: 'comments', label: 'Comment Activity', value: factors.comments, weight: weights.comments },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Score Breakdown</h3>
      <ul className="space-y-2">
        {items.map(item => {
          const points = Math.round(item.value * item.weight);
          return (
            <li key={item.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground w-32">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.value}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground w-12">{item.weight * 100}%</span>
                <span className="text-sm font-medium text-foreground w-12">{points} pts</span>
              </div>
            </li>
          );
        })}
        <li className="flex items-center justify-between border-t pt-2 mt-2">
          <span className="text-lg font-semibold text-foreground">Final Score</span>
          <span className="text-lg font-semibold text-primary">{score}</span>
        </li>
      </ul>
    </div>
  );
};
