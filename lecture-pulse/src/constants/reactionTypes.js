export const REACTION_TYPES = {
  CLAP: "clap",
  IDEA: "idea",
  GOT_IT: "gotIt",
  MIND_BLOWN: "mindBlown",
  TOO_FAST: "tooFast",
};

export const REACTION_DETAILS = {
  [REACTION_TYPES.CLAP]: {
    emoji: "👏",
    label: "Great Explanation",
    ariaLabel: "Clap: Great Explanation",
  },
  [REACTION_TYPES.IDEA]: {
    emoji: "💡",
    label: "Interesting",
    ariaLabel: "Idea: Interesting",
  },
  [REACTION_TYPES.GOT_IT]: {
    emoji: "🎉",
    label: "Got It",
    ariaLabel: "Celebration: Got It",
  },
  [REACTION_TYPES.MIND_BLOWN]: {
    emoji: "🤯",
    label: "Mind Blown",
    ariaLabel: "Mind Blown",
  },
  [REACTION_TYPES.TOO_FAST]: {
    emoji: "😅",
    label: "Too Fast",
    ariaLabel: "Too Fast",
  },
};

export const REACTION_LIMITS = {
  ALLOW_REPEATED: true,
  COOLDOWN_MS: 300, // Cooldown between student clicks in ms
  TOAST_THROTTLE_MS: 2000, // Throttle duration for showing success toasts
};
