// TopicLegend.jsx – displays heatmap legend
import React from "react";
import { HEATMAP_CONFIG } from "@/config/heatmap";

/**
 * Legend showing low/medium/high colors with text.
 */
export const TopicLegend = () => {
  const { colors, labels } = HEATMAP_CONFIG;
  const items = [
    { level: "low", color: colors.low, label: labels.low },
    { level: "medium", color: colors.medium, label: labels.medium },
    { level: "high", color: colors.high, label: labels.high },
  ];
  return (
    <div className="flex items-center gap-4 mb-4">
      {items.map((item) => (
        <div key={item.level} className="flex items-center gap-1">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-label={item.label}
          />
          <span className="text-sm text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TopicLegend;
