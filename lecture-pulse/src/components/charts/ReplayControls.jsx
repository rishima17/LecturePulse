// src/components/charts/ReplayControls.jsx
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { RefreshCw, Play, Pause } from "lucide-react";

// Playback speed options (0.5x, 1x, 2x)
const SPEED_OPTIONS = [0.5, 1, 2];

export const ReplayControls = ({
  durationMs,
  currentMs,
  onSeek,
  playing,
  onPlayToggle,
  onRestart,
  speed,
  onSpeedChange,
}) => {
  const percent = durationMs ? (currentMs / durationMs) * 100 : 0;

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 bg-card/30 backdrop-blur-sm rounded-lg")}>
      {/* Slider */}
      <Slider
        value={[percent]}
        max={100}
        step={0.1}
        onValueChange={([val]) => {
          const ms = (val / 100) * durationMs;
          onSeek(ms);
        }}
        className="w-full"
      />
      {/* Time display */}
      <div className="text-sm text-foreground">
        {new Date(currentMs).toISOString().substr(11, 8)} / {new Date(durationMs).toISOString().substr(11, 8)}
      </div>
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onRestart} aria-label="Restart">
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onPlayToggle} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        {/* Speed selector */}
        <div className="flex items-center gap-1 ml-2">
          {SPEED_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={speed === s ? "default" : "outline"}
              size="sm"
              onClick={() => onSpeedChange(s)}
              aria-label={`Speed ${s}x`}
            >
              {s}x
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReplayControls;
