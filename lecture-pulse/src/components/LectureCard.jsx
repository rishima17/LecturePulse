import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Check, QrCode, X, Download, FileText, Eye, Edit, Plus } from "lucide-react";
import { deleteLecture, getFeedbackByLecture } from "@/utils/storage";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import ExitTicketDialog from "@/components/ExitTicket/ExitTicketDialog";
import LectureNotesEditor from "@/components/LectureNotesEditor";
import LectureNotesViewer from "@/components/LectureNotesViewer";
import { AnimatePresence } from "framer-motion";
import BookmarkButton from "@/components/BookmarkButton";

function LectureCard({ lecture, onUpdate }) {
  const navigate = useNavigate();
  const { teacher } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExitTicketOpen, setIsExitTicketOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isViewingNotes, setIsViewingNotes] = useState(false);
  const feedbackCount = getFeedbackByLecture(lecture.id).length;
  const activeLiveSession = getActiveLiveSessionByLectureId(lecture.id);

  const joinUrl = `${window.location.origin}/student?code=${lecture.code}`;

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteLecture(lecture.id);
    toast.success("Lecture deleted successfully");
    onUpdate?.();
    setShowDeleteModal(false);
  };

  const handleNavigate = () => {
    if (!lecture.id) {
      toast.error("Lecture ID not found.");
      return;
    }
    navigate(`/analytics/${lecture.id}`);
  };

  const copyCode = (e) => {
    e.stopPropagation();
    if (!lecture.code) {
      toast.error("No session code available.");
      return;
    }
    navigator.clipboard.writeText(lecture.code);
    toast.success("Code copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQRToggle = (e) => {
    e.stopPropagation();
    setShowQR((prev) => !prev);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-${lecture.id}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `qr-${lecture.code}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleStartLive = (e) => {
    e.stopPropagation();
    const liveSession = startLiveSession(lecture, teacher);
    toast.success("Live session started");
    onUpdate?.();
    navigate(`/live/${liveSession.id}`);
  };

  const handleOpenLive = (e) => {
    e.stopPropagation();
    navigate(`/live/${lecture.id}`);
  };

  const handleEndLive = (e) => {
    e.stopPropagation();
    endLiveSession(lecture.id);
    toast.success("Live session ended");
    onUpdate?.();
  };

  return (
    <Card className="rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden bg-card text-card-foreground">
      <CardContent className="p-5 flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-lg leading-tight text-foreground">
              {lecture.topic}
            </h3>
            <p className="text-sm text-muted-foreground">{lecture.subject}</p>
          </div>
          {lecture.isActive ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-full">
                Active
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExitTicketOpen(true);
                }}
              >
                End
              </Button>
            </div>
          ) : (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
              Completed
            </span>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <BookmarkButton
              lectureId={lecture.id}
              bookmarked={lecture.bookmarked}
              onToggle={onUpdate}
            />
            {lecture.isActive ? (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-full">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                Completed
              </span>
            )}
          </div>
        </div>

        <div
          className={`rounded-lg p-3 flex items-center justify-between group/code cursor-pointer transition-all duration-300 border ${
            copied
              ? "bg-emerald-50 border-emerald-300"
              : "bg-muted/50 border-transparent hover:bg-muted hover:border-border"
          }`}
          onClick={copyCode}
        >
          <code className={`text-xl font-mono font-bold tracking-wider transition-colors duration-300 ${copied ? "text-emerald-700" : "text-emerald-600"}`}>
            {lecture.code}
          </code>
          <div className={`transition-all duration-300 p-1.5 rounded-md ${copied ? "opacity-100 bg-emerald-100" : "opacity-0 group-hover/code:opacity-100 hover:bg-background shadow-sm"}`}>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            )}
          </div>
        </div>

        {showQR && (
          <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scan to Join</span>
              <button onClick={handleQRToggle} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <QRCodeSVG
                id={`qr-${lecture.id}`}
                value={joinUrl}
                size={160}
                bgColor="#ffffff"
                fgColor="#059669"
                level="M"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Points to: <span className="font-mono text-emerald-600">/student?code={lecture.code}</span>
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleDownloadQR}>
              <Download className="w-3 h-3 mr-1" />
              Download QR
            </Button>
          </div>
        )}

        <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
          <span>{feedbackCount} responses</span>
          <span>•</span>
          <span>{lecture.duration} min</span>
          {activeLiveSession && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <Users className="w-4 h-4" />
                {activeLiveSession.participants?.length || 0} online
              </span>
            </>
          )}
        </div>

        {/* Lecture Notes Section */}
        <div className="border-t border-border/50 pt-3 mt-1 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Lecture Notes
            </span>
            {lecture.lectureNotes ? (
              <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Notes Available
              </span>
            ) : (
              <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
                No Notes
              </span>
            )}
          </div>

          {lecture.lectureNotes ? (
            <div className="bg-muted/40 rounded-lg p-2.5 border border-border/50">
              <p className="text-[13px] text-foreground/80 line-clamp-2 leading-relaxed">
                {lecture.lectureNotes}
              </p>
              <div className="text-[10px] text-muted-foreground/75 font-mono mt-1.5 flex items-center justify-between">
                <span>Last updated:</span>
                <span>
                  {lecture.updatedAt
                    ? new Date(lecture.updatedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : lecture.createdAt
                    ? new Date(lecture.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Unknown"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2.5 bg-muted/20 border border-dashed border-border/60 rounded-lg">
              <p className="text-[13px] text-muted-foreground/70 italic">
                No notes attached to this session.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {lecture.lectureNotes ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsViewingNotes(true);
                  }}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View Notes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingNotes(true);
                  }}
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit Notes
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 border-dashed border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingNotes(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Notes
              </Button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium h-9"
            onClick={handleNavigate}
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" x2="18" y1="20" y2="10" />
                <line x1="12" x2="12" y1="20" y2="4" />
                <line x1="6" x2="6" y1="20" y2="14" />
              </svg>
              Analytics
            </div>
          </Button>

          {activeLiveSession ? (
            <Button className="flex-1 h-9" onClick={handleOpenLive}>
              <Radio className="w-4 h-4 mr-2" />
              Open Live
            </Button>
          ) : (
            <Button className="flex-1 h-9" onClick={handleStartLive}>
              <Play className="w-4 h-4 mr-2" />
              Start Live
            </Button>
          )}

          {activeLiveSession && (
            <Button variant="outline" className="h-9" onClick={handleEndLive}>
              <Square className="w-4 h-4 mr-2" />
              End
            </Button>
          )}

          <Button variant="outline" size="icon" className={`h-9 w-9 border-input transition-colors ${showQR ? "text-emerald-600 border-emerald-300 bg-emerald-50" : "text-muted-foreground hover:text-emerald-600"}`} onClick={handleQRToggle}>
            <QrCode className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive border-input" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-xl p-6 shadow-lg max-w-md w-full mx-4 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Lecture?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete "{lecture.topic}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <ExitTicketDialog
          open={isExitTicketOpen}
          onClose={() => setIsExitTicketOpen(false)}
          lecture={lecture}
          onUpdate={onUpdate}
        />
      </CardContent>

      <AnimatePresence>
        {isEditingNotes && (
          <LectureNotesEditor
            lectureId={lecture.id}
            initialNotes={lecture.lectureNotes || ""}
            onClose={() => setIsEditingNotes(false)}
            onSave={() => {
              setIsEditingNotes(false);
              onUpdate();
            }}
          />
        )}
        {isViewingNotes && (
          <LectureNotesViewer
            notes={lecture.lectureNotes || ""}
            onClose={() => setIsViewingNotes(false)}
          />
        )}
      </AnimatePresence>
    </Card>
  );
};

export default LectureCard;
