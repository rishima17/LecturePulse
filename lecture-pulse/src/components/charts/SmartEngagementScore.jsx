import { useMemo } from 'react';
import { ScoreProgress } from '@/components/charts/ScoreProgress';
import { ScoreBreakdown } from '@/components/charts/ScoreBreakdown';
import { getRecommendations } from '@/utils/engagementRecommendations';
import { calculateEngagementScore } from '@/utils/engagementScore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { toast } from 'sonner';

/**
 * Smart Student Engagement Score card displayed at the top of the Analytics page.
 * @param {object} props
 * @param {object} props.analytics - Analytics object from calculateAnalytics.
 * @param {object} props.lecture - Lecture object from storage.
 * @param {Array} props.feedback - Full feedback array for the lecture.
 */
export const SmartEngagementScore = ({ analytics, lecture, feedback }) => {
  const scoreData = useMemo(() => {
    if (!analytics || !lecture) return null;
    const result = calculateEngagementScore(analytics, lecture, feedback);
    if (!result) {
      toast.error('Failed to calculate engagement score');
    }
    return result;
  }, [analytics, lecture, feedback]);

  if (!scoreData) {
    return (
      <Card variant="glass" className="p-6 text-center">
        <CardContent>
          <p className="text-muted-foreground">Not enough data to calculate an engagement score.</p>
        </CardContent>
      </Card>
    );
  }

  const recommendations = getRecommendations(scoreData);

  return (
    <section
      aria-labelledby="engagement-score-title"
      className="mb-8"
    >
      <Card variant="glass" className="p-6 rounded-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle id="engagement-score-title" className="text-xl font-semibold text-foreground flex items-center gap-2">
            Smart Student Engagement Score {scoreData.icon && <span>{scoreData.icon}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Circular progress */}
          <div className="flex justify-center lg:justify-start">
            <ScoreProgress score={scoreData.score} icon={scoreData.icon} />
          </div>

          {/* Breakdown and recommendations */}
          <div className="space-y-4">
            <ScoreBreakdown scoreData={scoreData} />
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
