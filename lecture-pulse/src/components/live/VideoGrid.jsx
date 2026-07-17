import { Card, CardContent } from "@/components/ui/card";
import { Camera, Mic, ScreenShare, VideoOff } from "lucide-react";

function VideoGrid({ participantCount }) {
  const boxes = Math.max(participantCount, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: boxes }).map((_, index) => (
        <Card key={index} className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video relative bg-gradient-to-br from-background via-card to-muted/40 flex items-center justify-center">
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground border border-border backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                Placeholder video
              </div>
              <div className="flex flex-col items-center gap-3 text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-muted/70 flex items-center justify-center border border-border">
                  <VideoOff className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Camera stream ready</p>
                  <p className="text-xs text-muted-foreground">Wire up getUserMedia() when signaling is available.</p>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-background/80 px-3 py-2 text-xs text-muted-foreground border border-border backdrop-blur-sm">
                <span className="inline-flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Mic toggle TODO</span>
                <span className="inline-flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Camera toggle TODO</span>
                <span className="inline-flex items-center gap-1.5"><ScreenShare className="w-3.5 h-3.5" /> Share screen TODO</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default VideoGrid;
