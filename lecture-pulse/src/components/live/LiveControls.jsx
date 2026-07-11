import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Square, LogIn, LogOut, Radio, Users } from "lucide-react";

function LiveControls({
  isLive,
  isTeacher,
  participantCount,
  elapsedLabel,
  onStart,
  onEnd,
  onJoin,
  onLeave,
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isLive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
              {isLive ? "Live" : "Waiting"}
            </span>
            <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {participantCount} participant{participantCount === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Session timer: {elapsedLabel}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isTeacher ? (
            isLive ? (
              <Button variant="destructive" onClick={onEnd}>
                <Square className="w-4 h-4 mr-2" />
                End Live Session
              </Button>
            ) : (
              <Button onClick={onStart}>
                <Play className="w-4 h-4 mr-2" />
                Start Live Session
              </Button>
            )
          ) : isLive ? (
            <>
              <Button onClick={onJoin}>
                <LogIn className="w-4 h-4 mr-2" />
                Join Live
              </Button>
              <Button variant="outline" onClick={onLeave}>
                <LogOut className="w-4 h-4 mr-2" />
                Leave Live
              </Button>
            </>
          ) : (
            <Button variant="outline" disabled>
              <Radio className="w-4 h-4 mr-2" />
              Waiting for teacher
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveControls;
