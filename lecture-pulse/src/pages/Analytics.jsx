import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLectureById, getFeedbackByLecture, getCurrentTeacher } from '@/utils/storage';
import { calculateAnalytics, getOverallEffectiveness, getEffectivenessLabel } from '@/utils/analytics';
import { ArrowLeft, Users, TrendingUp, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import UnderstandingChart from '@/components/charts/UnderstandingChart';
import AttentionChart from '@/components/charts/AttentionChart';
import ConfusionChart from '@/components/charts/ConfusionChart';

const Analytics = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const loadData = useCallback(async () => {
    if (!sessionId) return;
    
    // Simulate network delay to prevent synchronous state update warning
    await new Promise(resolve => setTimeout(resolve, 0));

    const teacher = getCurrentTeacher();
    if (!teacher) {
      navigate('/login');
      return;
    }

    const foundLecture = getLectureById(sessionId);
    if (!foundLecture || foundLecture.teacherId !== teacher.id) {
      navigate('/dashboard');
      return;
    }

    setLecture(foundLecture);
    // Mock feedback data generation if empty, for demonstration purposes in dev
    let feedback = getFeedbackByLecture(sessionId);
    
    // Auto-generate mock feedback if none exists (FOR DEMO ONLY)
    if (feedback.length === 0) {
        // Assume empty for now. Real app would wait for students.
        // Uncomment below to force mock data for specific tests or add a "Generate Mock Data" button
    }

    const calculatedAnalytics = calculateAnalytics(feedback);
    setAnalytics(calculatedAnalytics);
  }, [sessionId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, [loadData]);

  if (!lecture || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const effectiveness = getOverallEffectiveness(analytics);
  const effectivenessInfo = getEffectivenessLabel(effectiveness);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{lecture.topic}</h1>
              <p className="text-sm text-muted-foreground">
                {lecture.subject} • {lecture.duration} minutes
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {analytics.totalResponses === 0 ? (
          <Card variant="glass" className="text-center py-12 border-dashed">
            <CardContent>
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No feedback yet</h3>
              <p className="text-muted-foreground mb-4">
                Share the session code <span className="font-mono font-bold text-primary text-lg">{lecture.code}</span> with your students
              </p>
              {/* Optional: Add a button to simulate student feedback for testing */}
              <Button variant="hero" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check for responses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card variant="gradient">
                <CardContent className="p-6 text-center">
                  <div className={`text-4xl font-bold ${effectivenessInfo.color}`}>
                    {effectiveness}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Overall Effectiveness</p>
                  <p className={`text-xs font-medium mt-1 ${effectivenessInfo.color}`}>
                    {effectivenessInfo.label}
                  </p>
                </CardContent>
              </Card>
              <Card variant="gradient">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-4xl font-bold text-foreground">{analytics.totalResponses}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total Responses</p>
                </CardContent>
              </Card>
              <Card variant="gradient">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-chart-understanding">
                    {analytics.understandingScore}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Understanding Score</p>
                </CardContent>
              </Card>
              <Card variant="gradient">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-chart-attention">
                    {analytics.attentionScore}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Attention Score</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Understanding Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <UnderstandingChart data={analytics.understandingDistribution} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Attention Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <AttentionChart data={analytics.attentionDistribution} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Confusion Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConfusionChart data={analytics.confusionPointDistribution} />
                </CardContent>
              </Card>
            </div>

            {/* Insights & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Common Keywords */}
              {analytics.commonKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      Common Keywords from Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analytics.commonKeywords.map((keyword, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              <Card className={analytics.commonKeywords.length === 0 ? 'lg:col-span-2' : ''}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analytics.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <TrendingUp className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm text-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
