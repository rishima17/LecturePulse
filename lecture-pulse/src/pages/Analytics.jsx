import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SmartEngagementScore } from '@/components/charts/SmartEngagementScore';
import TopicCoverageHeatmap from '@/components/charts/TopicCoverageHeatmap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLectureById, getFeedbackByLecture, getCurrentTeacher } from '@/utils/storage';
import { calculateAnalytics, getOverallEffectiveness, getEffectivenessLabel } from '@/utils/analytics';
import { ArrowLeft, Users, TrendingUp, AlertCircle, Lightbulb, RefreshCw, FileText, Eye, Edit, Plus, SlidersHorizontal } from 'lucide-react';
import { ArrowLeft, Users, TrendingUp, AlertCircle, Lightbulb, RefreshCw, FileText, Eye, Edit, Plus } from 'lucide-react';
import UnderstandingChart from '@/components/charts/UnderstandingChart';
import AttentionChart from '@/components/charts/AttentionChart';
import ConfusionChart from '@/components/charts/ConfusionChart';
import LectureReplayTimeline from "@/components/charts/LectureReplayTimeline";
import FeedbackTimeline from '@/components/charts/FeedbackTimeline';
import AISummaryCard from '@/components/AISummaryCard';
import AttendanceParticipationChart from '@/components/charts/AttendanceParticipationChart';
import { generateLecturePDF } from "@/utils/pdfReport";
import { generateLectureCSV } from "@/utils/csvReport";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { socket, joinLectureRoom } from "@/lib/socket";
import LectureNotesEditor from '@/components/LectureNotesEditor';
import LectureNotesViewer from '@/components/LectureNotesViewer';
import { AnimatePresence } from 'framer-motion';

// Dashboard layout preferences customization
import { getDashboardPreferences, saveDashboardPreferences } from '@/utils/dashboardPreferences';
import AnalyticsCustomizationPanel from '@/components/AnalyticsCustomizationPanel';
import SortableAnalyticsWidget from '@/components/SortableAnalyticsWidget';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";


const Analytics = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isViewingNotes, setIsViewingNotes] = useState(false);
  const understandingRef = useRef(null);
  const attentionRef = useRef(null);
  const confusionRef = useRef(null);

  const [preferences, setPreferences] = useState(() => getDashboardPreferences());
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPreferences((prev) => {
      const oldIndex = prev.widgetOrder.indexOf(active.id);
      const newIndex = prev.widgetOrder.indexOf(over.id);
      const newOrder = arrayMove(prev.widgetOrder, oldIndex, newIndex);
      const nextPrefs = { ...prev, widgetOrder: newOrder };
      saveDashboardPreferences(nextPrefs);
      return nextPrefs;
    });
  };

  const captureChart = async (ref) => {
    if (!ref.current) return null;

    const canvas = await html2canvas(ref.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    return canvas.toDataURL('image/png');
  };

  const [feedback, setFeedback] = useState([]);
const clusters = useMemo(() => {
    const comments = feedback.map((f) => f.comment).filter(Boolean);
    if (!comments.length) return [];
    return clusterComments(comments);
  }, [feedback]);
const totalFeedback = feedback.length;
const totalAttendance = lecture?.attendance?.length || 0;
const participationRate = totalAttendance ? Math.round((totalFeedback / totalAttendance) * 100) : 0;
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
    setFeedback(feedback);
    const calculatedAnalytics = calculateAnalytics(feedback);
    setAnalytics(calculatedAnalytics);
  }, [sessionId, navigate]);

useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    // Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === "lecturePulse_feedback") {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadData]);

  useEffect(() => {
    if (sessionId && lecture) {
      joinLectureRoom(sessionId, lecture.code);
      
      const handleRealtimeFeedback = (newFeedback) => {
        console.log("Real-time feedback received:", newFeedback);
        loadData(); // Refresh data from storage
      };

      socket.on('feedback-updated', handleRealtimeFeedback);

      return () => {
        socket.off('feedback-updated', handleRealtimeFeedback);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, loadData]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'lecturePulse_feedback') {
        loadData();
      }
    };

    const onFeedbackUpdated = () => {
      loadData();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('feedback-updated', onFeedbackUpdated);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('feedback-updated', onFeedbackUpdated);
    };
  }, [loadData]);

  // Clusters are computed via useMemo above

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
  const handleDownloadPDF = async () => {
    const teacher = getCurrentTeacher();

    const understandingChart = await captureChart(understandingRef);
    const attentionChart = await captureChart(attentionRef);
    const confusionChart = await captureChart(confusionRef);

    generateLecturePDF({
      lecture,
      analytics: {
        ...analytics,
        effectiveness,
      },
      teacher,
      charts: {
        understandingChart,
        attentionChart,
        confusionChart,
      },
    });
  };

  const handleDownloadCSV = () => {
    const teacher = getCurrentTeacher();

    generateLectureCSV({
      lecture,
      analytics: {
        ...analytics,
        effectiveness,
      },
      teacher,
      feedback,
    });
  };

  const renderNotesCard = () => {
    return (
      <Card className="rounded-xl border border-border/80 shadow-sm bg-white overflow-hidden text-left">
        <CardHeader className="pb-4 flex flex-col space-y-1.5 p-6 border-b border-border bg-muted/20">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Lecture Notes
            </span>
            {lecture.lectureNotes ? (
              <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                Saved
              </span>
            ) : (
              <span className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full border border-border/40 font-normal">
                Empty
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {lecture.lectureNotes ? (
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-lg p-4 border border-border/50 max-h-[220px] overflow-y-auto custom-scrollbar">
                <p className="text-[15px] text-foreground/80 whitespace-pre-wrap leading-relaxed font-sans">
                  {lecture.lectureNotes}
                </p>
              </div>
              <div className="text-xs text-muted-foreground/75 font-mono flex items-center justify-between border-t border-border/40 pt-2">
                <span>Last updated:</span>
                <span>
                  {lecture.updatedAt
                    ? new Date(lecture.updatedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : lecture.createdAt
                    ? new Date(lecture.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "Unknown"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/20 border border-dashed border-border/60 rounded-lg flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground/70 italic">
                No notes attached to this session yet.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-border/20">
            {lecture.lectureNotes ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-9 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setIsViewingNotes(true)}
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Notes
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 text-xs h-9 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setIsEditingNotes(true)}
                >
                  <Edit className="w-4 h-4 mr-1.5" />
                  Edit Notes
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full text-xs h-9 cursor-pointer border border-dashed border-primary/30 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setIsEditingNotes(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Lecture Notes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{lecture.topic}</h1>
                {lecture.bookmarked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    ⭐ Bookmarked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    ☆ Not Bookmarked
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {lecture.subject} • {lecture.duration} minutes
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-border/20">
            {lecture.lectureNotes ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-9 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setIsViewingNotes(true)}
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Notes
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 text-xs h-9 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setIsEditingNotes(true)}
                >
                  <Edit className="w-4 h-4 mr-1.5" />
                  Edit Notes
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full text-xs h-9 cursor-pointer border border-dashed border-primary/30 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setIsEditingNotes(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Lecture Notes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const getWidgetSpanClass = (widgetId) => {
    switch (widgetId) {
      case "summary":
      case "comments":
        return "lg:col-span-3 col-span-1";
      case "understanding":
      case "attention":
      case "confusion":
        return "lg:col-span-1 col-span-1";
      default:
        return "col-span-1";
    }
  };

  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case "summary":
        return (
          <div key="summary" className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full text-left">
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
        );
      case "understanding":
        return (
          <Card key="understanding" className="w-full text-left">
            <CardHeader>
              <CardTitle className="text-base">Understanding Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={understandingRef}>
                <UnderstandingChart data={analytics.understandingDistribution} />
              </div>
            </CardContent>
          </Card>
        );
      case "attention":
        return (
          <Card key="attention" className="w-full text-left">
            <CardHeader>
              <CardTitle className="text-base">Attention Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={attentionRef}>
                <AttentionChart data={analytics.attentionDistribution} />
              </div>
            </CardContent>
          </Card>
        );
      case "confusion":
        return (
          <Card key="confusion" className="w-full text-left">
            <CardHeader>
              <CardTitle className="text-base">Confusion Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={confusionRef}>
                <ConfusionChart data={analytics.confusionPointDistribution} />
              </div>
            </CardContent>
          </Card>
        );
      case "comments":
        return (
          <div key="comments" className="space-y-6 w-full text-left">
            {/* Feedback Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Engagement Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackTimeline data={analytics.timeline} />
              </CardContent>
            </Card>
      <main className="container mx-auto px-4 py-8">
        {analytics.totalResponses === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
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
            </div>
            <div className="lg:col-span-1">
              {renderNotesCard()}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Main Content */}
            <div className="lg:col-span-2 space-y-6">
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
                    <div ref={understandingRef}>
                      <UnderstandingChart data={analytics.understandingDistribution} />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Attention Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div ref={attentionRef}>
                      <AttentionChart data={analytics.attentionDistribution} />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Confusion Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div ref={confusionRef}>
                      <ConfusionChart data={analytics.confusionPointDistribution} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Engagement Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackTimeline data={analytics.timeline} />
                </CardContent>
              </Card>

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

            {/* Right Column Sidebar */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              {renderNotesCard()}
              <AISummaryCard lecture={lecture} analytics={analytics} feedback={feedback} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const visibleWidgets = preferences.widgetOrder.filter(id => !preferences.hiddenWidgets.includes(id));

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
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{lecture.topic}</h1>
                {lecture.bookmarked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    ⭐ Bookmarked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    ☆ Not Bookmarked
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {lecture.subject} • {lecture.duration} minutes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCustomizerOpen(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                Download PDF Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {analytics.totalResponses === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
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
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const visibleWidgets = preferences.widgetOrder.filter(id => !preferences.hiddenWidgets.includes(id));

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
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{lecture.topic}</h1>
                {lecture.bookmarked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    ⭐ Bookmarked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    ☆ Not Bookmarked
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {lecture.subject} • {lecture.duration} minutes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCustomizerOpen(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                Download PDF Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {analytics.totalResponses === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
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
            </div>
            <div className="lg:col-span-1">
              {renderNotesCard()}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {visibleWidgets.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
                  <SlidersHorizontal className="w-12 h-12 text-muted-foreground/60 animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">No analytics widgets selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize Dashboard to display analytics.
                    </p>
                  </div>
                  <Button variant="default" size="sm" onClick={() => setIsCustomizerOpen(true)} className="cursor-pointer">
                    Customize Dashboard
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={visibleWidgets}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {visibleWidgets.map((widgetId) => (
                        <SortableAnalyticsWidget 
                          key={widgetId} 
                          id={widgetId}
                          className={getWidgetSpanClass(widgetId)}
                        >
                          {renderWidget(widgetId)}
                        </SortableAnalyticsWidget>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Right Column Sidebar */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              {renderNotesCard()}
              <AISummaryCard lecture={lecture} analytics={analytics} feedback={feedback} />
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isEditingNotes && (
          <LectureNotesEditor
            lectureId={lecture.id}
            initialNotes={lecture.lectureNotes || ""}
            onClose={() => setIsEditingNotes(false)}
            onSave={() => {
              setIsEditingNotes(false);
              loadData();
            }}
          />
        )}
        {isViewingNotes && (
          <LectureNotesViewer
            notes={lecture.lectureNotes || ""}
            onClose={() => setIsViewingNotes(false)}
          />
        )}
        {isCustomizerOpen && (
          <AnalyticsCustomizationPanel
            isOpen={isCustomizerOpen}
            onClose={() => setIsCustomizerOpen(false)}
            onSave={(newPrefs) => setPreferences(newPrefs)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analytics;
