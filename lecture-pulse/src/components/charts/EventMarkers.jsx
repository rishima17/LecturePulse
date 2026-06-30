// src/components/charts/EventMarkers.jsx
import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Assume tooltip component exists
import { AlertCircle, Eye, Zap } from "lucide-react";

/**
 * Render event markers above the replay slider.
 * @param {Array} events - list from eventDetection (type, timestamp, title, description)
 * @param {number} currentProgress - percent (0-100) of current playback
 */
export const EventMarkers = ({ events = [] }) => {
  // Map event type to icon/color
  const typeMap = {
    "confusion-spike": { icon: AlertCircle, color: "text-red-500" },
    "attention-drop": { icon: Eye, color: "text-yellow-500" },
    "recovery": { icon: Zap, color: "text-green-500" },
    "high-engagement": { icon: Zap, color: "text-indigo-500" },
  };

  return (
    <div className="relative w-full h-6 mb-2">
      {events.map((e, idx) => {
        const pct = Number(e.timestamp.replace(/[^0-9]/g, "")) * 5; // rough conversion: each "Min X" where X is minute index, each minute = 5% (assuming 20 min total). Adjust as needed.
        const { icon: Icon, color } = typeMap[e.type] || {};
        return (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "absolute top-0 w-3 h-3 rounded-full",
                  color || "text-foreground",
                  "transform -translate-x-1/2 cursor-pointer"
                )}
                style={{ left: `${pct}%` }}
              >
                {Icon && <Icon className="w-3 h-3" />}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{e.title}</p>
                <p className="text-sm text-muted-foreground">{e.description}</p>
                <p className="text-xs text-muted-foreground">{e.timestamp}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default EventMarkers;
