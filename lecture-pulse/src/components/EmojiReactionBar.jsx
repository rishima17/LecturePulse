import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { REACTION_DETAILS, REACTION_LIMITS } from "@/constants/reactionTypes";
import useReactions from "@/hooks/useReactions";
import ReactionButton from "./ReactionButton";

/**
 * Generates initial data for a floating emoji particle.
 * Declared outside the component to keep the render phase pure.
 * @param {string} emoji 
 * @returns {{ id: string, emoji: string, x: number, rotate: number }}
 */
const generateFloatingEmojiData = (emoji) => {
  return {
    id: `${Date.now()}-${Math.random()}`,
    emoji,
    x: (Math.random() - 0.5) * 50,
    rotate: (Math.random() - 0.5) * 40,
  };
};

/**
 * Student's reaction bar with floating micro-animations.
 * @param {{ sessionCode: string, lectureId: string }} props 
 */
export default function EmojiReactionBar({ sessionCode, lectureId }) {
  const { sendReaction } = useReactions(sessionCode, lectureId, false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const lastClickTimeRef = useRef(0);
  const lastToastTimeRef = useRef(0);

  const handleReactionClick = useCallback(
    (type, emoji, label) => {
      const now = Date.now();
      
      // Check cooldown limit
      if (now - lastClickTimeRef.current < REACTION_LIMITS.COOLDOWN_MS) {
        return;
      }
      lastClickTimeRef.current = now;

      // Trigger state and socket dispatch
      sendReaction(type);

      // Add floating emoji
      const newItem = generateFloatingEmojiData(emoji);
      setFloatingEmojis((prev) => [...prev, newItem]);

      // Cleanup floating emoji item
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 1000);

      // Throttle Sonner toasts to prevent UI noise
      if (now - lastToastTimeRef.current > REACTION_LIMITS.TOAST_THROTTLE_MS) {
        toast.success(`Reaction submitted: ${label}`, {
          duration: 1500,
          position: "bottom-center",
        });
        lastToastTimeRef.current = now;
      }
    },
    [sendReaction]
  );

  return (
    <div className="relative mt-8 max-w-2xl mx-auto w-full px-4">
      {/* Floating Particle Stream */}
      <div className="absolute inset-x-0 bottom-full flex justify-center pointer-events-none h-44 overflow-visible z-50">
        <AnimatePresence>
          {floatingEmojis.map(({ id, emoji, x, rotate }) => (
            <motion.span
              key={id}
              initial={{ opacity: 1, y: 50, scale: 0.6, x, rotate }}
              animate={{
                opacity: 0,
                y: -120,
                scale: 1.5,
                x: x * 1.6,
                rotate: rotate * 1.5,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute text-4xl select-none"
            >
              {emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction Bar Card */}
      <div className="rounded-2xl bg-card/65 dark:bg-card/35 border border-border/50 backdrop-blur-xl shadow-xl p-3 flex items-center justify-around gap-1 overflow-x-auto">
        {Object.entries(REACTION_DETAILS).map(([type, { emoji, label, ariaLabel }]) => (
          <ReactionButton
            key={type}
            emoji={emoji}
            label={label}
            ariaLabel={ariaLabel}
            onClick={() => handleReactionClick(type, emoji, label)}
          />
        ))}
      </div>
    </div>
  );
}

