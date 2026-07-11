// src/components/charts/LectureReplayTimeline.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getFeedbackByLecture, getLectureById } from "@/utils/storage";
import { getReplayBounds, getTickInterval, clamp } from "@/utils/replayEngine";
import { getSnapshotAnalytics } from "@/utils/replayAnalytics";
import { detectEvents } from "@/utils/eventDetection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReplayControls from "./ReplayControls";
import EventMarkers from "./EventMarkers";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * LectureReplayTimeline
 *
 * Renders an interactive replay of lecture analytics.
 * Utilizes localStorage‑based data without any backend calls.
 */
export const LectureReplayTimeline = ({ lectureId }) => {
  // Lazy‑load lecture and feedback data
  const lecture = useMemo(() => getLectureById(lectureId), [lectureId]);
  const feedback = useMemo(() => getFeedbackByLecture(lectureId), [lectureId]);

  // Derive replay bounds and detected events
  const bounds = useMemo(() => getReplayBounds(feedback), [feedback]);
  const events = useMemo(() => {
    const fullAnalytics = getSnapshotAnalytics(feedback, bounds.end.toISOString());
    return fullAnalytics && fullAnalytics.timeline ? detectEvents(fullAnalytics.timeline) : [];
  }, [feedback, bounds.end]);

  // Current playback position (ms) and controls
  const [currentMs, setCurrentMs] = useState(() => bounds.start.getTime());
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Snapshot for the current position
  const snapshot = useMemo(() => {
    if (!feedback.length) return null;
    return getSnapshotAnalytics(feedback, new Date(currentMs).toISOString());
  }, [feedback, currentMs]);

  // Playback loop – advances currentMs based on speed
  useEffect(() => {
    if (!playing) return undefined;
    const interval = setInterval(() => {
      setCurrentMs(prev => {
        const next = clamp(prev + getTickInterval(speed), bounds.start.getTime(), bounds.end.getTime());
        if (next >= bounds.end.getTime()) setPlaying(false);
        return next;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [playing, speed, bounds]);

  const handleSeek = useCallback(ms => {
    setCurrentMs(clamp(ms, bounds.start.getTime(), bounds.end.getTime()));
  }, [bounds]);

  const handlePlayToggle = () => setPlaying(p => !p);
  const handleRestart = () => {
    setCurrentMs(bounds.start.getTime());
    setPlaying(false);
  };
  const handleSpeedChange = s => setSpeed(s);

  // Guard clauses
  if (!lecture) {
    toast.error("Lecture not found");
    return null;
  }

  if (!feedback.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <img
          src="C:/Users/SAILAJA/.gemini/antigravity-ide/brain/a8a1ca1d-9ebb-418a-af74-a120f033650a/empty_state_placeholder_1782796823966.png"
          alt="No replay data"
          className="w-48 h-48 mb-4"
        />
        <p className="text-muted-foreground text-lg">No replay data available for this lecture.</p>
      </div>
    );
  }

  

  return (
    <div className={cn("space-y-6 p-4 bg-card/30 backdrop-blur-sm rounded-xl")}>
      {/* Session Summary */}
      <Card variant="glass" className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Lecture Replay – {lecture.topic}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Duration</p>
            <p className="font-medium text-foreground">{Math.round(bounds.durationMs / 60000)} min</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Peak Confusion Minute</p>
            <p className="font-medium text-foreground">
              {events.find(e => e.type === "confusion-spike")?.timestamp || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Highest Engagement</p>
            <p className="font-medium text-foreground">
              {events.find(e => e.type === "high-engagement")?.timestamp || "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Replay Controls */}
      <ReplayControls
        durationMs={bounds.durationMs}
        currentMs={currentMs}
        onSeek={handleSeek}
        playing={playing}
        onPlayToggle={handlePlayToggle}
        onRestart={handleRestart}
        speed={speed}
        onSpeedChange={handleSpeedChange}
      />

      {/* Event markers above the slider */}
      <EventMarkers events={events} />

      {/* Animated analytics cards */}
      {snapshot && (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="gradient" className="text-center">
            <CardContent>
              <p className="text-sm text-muted-foreground">Understanding</p>
              <p className="text-2xl font-bold text-chart-understanding">{snapshot.understandingScore}%</p>
            </CardContent>
          </Card>
          <Card variant="gradient" className="text-center">
            <CardContent>
              <p className="text-sm text-muted-foreground">Attention</p>
              <p className="text-2xl font-bold text-chart-attention">{snapshot.attentionScore}%</p>
            </CardContent>
          </Card>
          <Card variant="gradient" className="text-center">
            <CardContent>
              <p className="text-sm text-muted-foreground">Responses</p>
              <p className="text-2xl font-bold text-foreground">{snapshot.totalResponses}</p>
            </CardContent>
          </Card>
          <Card variant="gradient" className="text-center">
            <CardContent>
              <p className="text-sm text-muted-foreground">Active Participants</p>
              <p className="text-2xl font-bold text-foreground">{lecture?.attendance?.length || 0}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default LectureReplayTimeline;
