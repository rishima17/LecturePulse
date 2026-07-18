/**
 * Mood types constants and details for the End-of-Class Mood Meter.
 */

export const MOOD_TYPES = {
  INSPIRED: "inspired",
  GOOD: "good",
  NEUTRAL: "neutral",
  TIRED: "tired",
  EXHAUSTED: "exhausted",
};

export const MOOD_DETAILS = {
  [MOOD_TYPES.INSPIRED]: {
    label: "Inspired",
    emoji: "😊",
    color: "from-amber-400 to-orange-500",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-500",
    hoverBg: "hover:bg-amber-500/5",
  },
  [MOOD_TYPES.GOOD]: {
    label: "Good",
    emoji: "🙂",
    color: "from-emerald-400 to-green-500",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-500",
    hoverBg: "hover:bg-emerald-500/5",
  },
  [MOOD_TYPES.NEUTRAL]: {
    label: "Neutral",
    emoji: "😐",
    color: "from-blue-400 to-indigo-500",
    borderClass: "border-blue-500/30",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500",
    hoverBg: "hover:bg-blue-500/5",
  },
  [MOOD_TYPES.TIRED]: {
    label: "Tired",
    emoji: "😕",
    color: "from-violet-400 to-purple-500",
    borderClass: "border-violet-500/30",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-500",
    hoverBg: "hover:bg-violet-500/5",
  },
  [MOOD_TYPES.EXHAUSTED]: {
    label: "Exhausted",
    emoji: "😫",
    color: "from-rose-400 to-red-500",
    borderClass: "border-rose-500/30",
    bgClass: "bg-rose-500/10",
    textClass: "text-rose-500",
    hoverBg: "hover:bg-rose-500/5",
  },
};
