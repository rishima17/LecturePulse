import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Check } from "lucide-react";
import { Trash2, Check, QrCode, X, Download } from "lucide-react";
import { deleteLecture, getFeedbackByLecture } from "@/utils/storage";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const LectureCard = ({ lecture, onUpdate }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const feedbackCount = getFeedbackByLecture(lecture.id).length;

  const joinUrl = `${window.location.origin}/student?code=${lecture.code}`;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session?")) {
      deleteLecture(lecture.id);
      toast.success("Lecture deleted successfully");
      onUpdate();
    }
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

  return (
    <Card className="rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden">
      <CardContent className="p-5 flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight text-foreground">
              {lecture.topic}
            </h3>
            <p className="text-sm text-muted-foreground">{lecture.subject}</p>
          </div>
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

        {/* Code Box */}
        <div
          className={`rounded-lg p-3 flex items-center justify-between group/code cursor-pointer transition-all duration-300 border ${
            copied
              ? "bg-emerald-50 border-emerald-300"
              : "bg-muted/50 border-transparent hover:bg-muted hover:border-border"
          }`}
          onClick={copyCode}
        >
          <code
            className={`text-xl font-mono mobile-font font-bold tracking-wider transition-colors duration-300 ${
              copied ? "text-emerald-700" : "text-emerald-600"
            }`}
          >
            {lecture.code}
          </code>
          <div
            className={`transition-all duration-300 p-1.5 rounded-md ${
              copied
                ? "opacity-100 bg-emerald-100"
                : "opacity-0 group-hover/code:opacity-100 hover:bg-background shadow-sm"
            }`}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
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
                className="text-muted-foreground"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            )}
          </div>
        </div>

        {/* QR Code Panel */}
        {showQR && (
          <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scan to Join</span>
              <button onClick={handleQRToggle} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
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
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8"
              onClick={handleDownloadQR}
            >
              <Download className="w-3 h-3 mr-1" />
              Download QR
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="text-sm text-muted-foreground font-medium">
          {feedbackCount} responses • {lecture.duration} min
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2">
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

          <Button
            variant="outline"
            size="icon"
            className={`h-9 w-9 border-input transition-colors ${
              showQR ? "text-emerald-600 border-emerald-300 bg-emerald-50" : "text-muted-foreground hover:text-emerald-600"
            }`}
            onClick={handleQRToggle}
          >
            <QrCode className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive border-input"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default LectureCard;