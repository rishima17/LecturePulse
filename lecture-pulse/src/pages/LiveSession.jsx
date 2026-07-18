import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentTeacher, getLectureById, getLiveSessionByLectureId, startLiveSession, endLiveSession, joinLiveSession, leaveLiveSession, appendLiveChatMessage, getOrCreateStudentId } from "@/utils/storage";
import { connectSocket, disconnectSocket, startLive, joinLive, leaveLive, sendLiveChat, endLive } from "@/lib/socket";
import LiveControls from "@/components/live/LiveControls";
import LiveChat from "@/components/live/LiveChat";
import ParticipantList from "@/components/live/ParticipantList";
import VideoGrid from "@/components/live/VideoGrid";
import LiveStatusBanner from "@/components/live/LiveStatusBanner";
import { ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";

function formatElapsed(startedAt) {
  if (!startedAt) {
    return "00:00";
  }

  const elapsed = Date.now() - new Date(startedAt).getTime();
  const totalSeconds = Math.max(0, Math.floor(elapsed / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function LiveSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const lecture = getLectureById(sessionId);
  const [liveSession, setLiveSession] = useState(() => getLiveSessionByLectureId(sessionId));
  const [tick, setTick] = useState(0);

  const currentTeacher = getCurrentTeacher();
  const isTeacher = Boolean(currentTeacher && lecture?.teacherId === currentTeacher.id);
  const participantName = isTeacher
    ? currentTeacher?.name || "Teacher"
    : `Student ${getOrCreateStudentId().slice(0, 6)}`;
  const participantId = isTeacher ? currentTeacher?.id : getOrCreateStudentId();
  const elapsedLabel = useMemo(() => {
    tick;
    return formatElapsed(liveSession?.startedAt);
  }, [liveSession?.startedAt, tick]);

  const syncSession = useCallback(() => {
    setLiveSession(getLiveSessionByLectureId(sessionId));
  }, [sessionId]);

  useEffect(() => {
    connectSocket();
    const handleStorage = (event) => {
      if (event.key === "lecturePulse_liveSessions") {
        syncSession();
      }
    };

    const handleCustomUpdate = (event) => {
      if (event.detail?.lectureId === sessionId) {
        syncSession();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("live-session-updated", handleCustomUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("live-session-updated", handleCustomUpdate);
      disconnectSocket();
    };
  }, [sessionId, syncSession]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!lecture) {
      navigate("/dashboard");
    }
  }, [lecture, navigate]);

  const isLive = Boolean(liveSession?.isLive);
  const participants = liveSession?.participants || [];
  const chatMessages = liveSession?.chatMessages || [];

  const refreshAndNotify = () => {
    syncSession();
    window.dispatchEvent(new CustomEvent("live-session-updated", { detail: { lectureId: sessionId } }));
  };

  const handleStart = () => {
    if (!lecture) {
      return;
    }

    const session = startLiveSession(lecture, currentTeacher);
    startLive({ lectureId: session.id, teacherId: session.teacherId });
    toast.success("Live session started");
    setLiveSession(session);
    refreshAndNotify();
  };

  const handleEnd = () => {
    endLiveSession(sessionId);
    endLive({ lectureId: sessionId });
    toast.success("Live session ended");
    refreshAndNotify();
  };

  const handleJoin = () => {
    if (!isLive) {
      toast.error("The teacher has not started the live session yet.");
      return;
    }

    joinLiveSession(sessionId, {
      id: participantId,
      name: participantName,
      role: isTeacher ? "teacher" : "student",
    });
    joinLive({ lectureId: sessionId, participantId, participantName });
    toast.success("Joined live session");
    refreshAndNotify();
  };

  const handleLeave = () => {
    leaveLiveSession(sessionId, participantId);
    leaveLive({ lectureId: sessionId, participantId });
    toast.success("Left live session");
    refreshAndNotify();
  };

  const handleSendMessage = (text) => {
    const message = {
      id: crypto.randomUUID(),
      lectureId: sessionId,
      senderId: participantId,
      senderName: participantName,
      text,
      createdAt: new Date().toISOString(),
    };

    appendLiveChatMessage(sessionId, message);
    sendLiveChat({ lectureId: sessionId, message });
    refreshAndNotify();
  };

  const subtitle = lecture
    ? `${lecture.subject} - ${lecture.topic}`
    : "Lecture not found";

  const header = useMemo(() => {
    return lecture
      ? `${lecture.topic} · ${lecture.subject}`
      : "Live session";
  }, [lecture]);

  if (!lecture) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{header}</h1>
              <p className="text-sm text-muted-foreground">Session ID: {sessionId}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {elapsedLabel}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <LiveStatusBanner
          title={isLive ? "Live session running" : "Waiting for teacher"}
          subtitle={isLive ? subtitle : "The room is ready. Start the session when you are ready."}
        />

        <LiveControls
          isLive={isLive}
          isTeacher={isTeacher}
          participantCount={participants.length}
          elapsedLabel={elapsedLabel}
          onStart={handleStart}
          onEnd={handleEnd}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />

        {!isLive && (
          <Card className="border-dashed border-border bg-card">
            <CardContent className="p-8 text-center space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">Waiting for teacher</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The live session has not started yet. Students can stay on this page and join once the teacher begins the stream.
              </p>
              {isTeacher && (
                <Button onClick={handleStart} className="mt-2">
                  Start Live Session
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
          <div className="space-y-6">
            <VideoGrid participantCount={participants.length} />
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-2">
                <h2 className="font-semibold text-foreground">WebRTC TODOs</h2>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                  <li>getUserMedia() for local camera preview</li>
                  <li>RTCPeerConnection for peer signaling</li>
                  <li>Screen sharing</li>
                  <li>Camera toggle</li>
                  <li>Microphone toggle</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ParticipantList participants={participants} />
            <LiveChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              currentUserName={participantName}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default LiveSession;



