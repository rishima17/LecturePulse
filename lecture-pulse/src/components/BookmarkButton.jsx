import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { toggleBookmark, isBookmarked } from "@/utils/bookmarks";
import { toast } from "sonner";

/**
 * BookmarkButton - Reusable toggle button for bookmarking lectures
 *
 * @param {Object} props
 * @param {string} props.lectureId - Unique ID of the lecture
 * @param {boolean} [props.bookmarked] - Optional pre-fetched bookmarked status
 * @param {function} [props.onToggle] - Callback triggered when status is updated
 * @param {string} [props.className] - Extra Tailwind classes
 * @returns {React.JSX.Element} The rendered button component
 */
export default function BookmarkButton({ lectureId, bookmarked: propBookmarked, onToggle, className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  const [prevPropBookmarked, setPrevPropBookmarked] = useState(propBookmarked);
  const [isBookmarkedState, setIsBookmarkedState] = useState(() => {
    if (propBookmarked !== undefined) return !!propBookmarked;
    return isBookmarked(lectureId);
  });

  if (propBookmarked !== undefined && propBookmarked !== prevPropBookmarked) {
    setPrevPropBookmarked(propBookmarked);
    setIsBookmarkedState(!!propBookmarked);
  }

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const updatedLecture = toggleBookmark(lectureId);
      if (updatedLecture) {
        const nextState = !!updatedLecture.bookmarked;
        setIsBookmarkedState(nextState);
        
        if (nextState) {
          toast.success("Lecture bookmarked");
        } else {
          toast.success("Bookmark removed");
        }

        if (onToggle) {
          onToggle(nextState);
        }
      } else {
        toast.error("Unable to save bookmark");
      }
    } catch (error) {
      console.error("Error in BookmarkButton toggle handler:", error);
      toast.error("Unable to save bookmark");
    }
  };

  const tooltipText = isBookmarkedState ? "Remove Bookmark" : "Bookmark Lecture";

  // Motion variants matching the design guidelines
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: shouldReduceMotion ? 1 : 1.1,
      transition: { duration: 0.2 } 
    },
    tap: { 
      scale: shouldReduceMotion ? 1 : 0.95,
      transition: { duration: 0.1 } 
    }
  };

  const starVariants = {
    initial: { scale: 1 },
    animate: {
      scale: shouldReduceMotion ? 1 : [1, 1.3, 1],
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="relative group/tooltip inline-flex items-center justify-center">
      <motion.button
        type="button"
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleToggle(e);
          }
        }}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        aria-label={tooltipText}
        aria-pressed={isBookmarkedState}
        className={`
          flex items-center justify-center
          w-9 h-9 rounded-full
          border border-border bg-card/65 backdrop-blur-sm
          text-muted-foreground hover:text-amber-500
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
          cursor-pointer
          ${isBookmarkedState ? "text-amber-500 border-amber-300 bg-amber-500/5 hover:bg-amber-500/10" : "hover:border-amber-200"}
          ${className}
        `}
      >
        <motion.div
          variants={starVariants}
          animate={isBookmarkedState ? "animate" : "initial"}
          key={isBookmarkedState ? "bookmarked" : "unbookmarked"}
        >
          <Star
            className={`w-[18px] h-[18px] transition-all duration-200 ${
              isBookmarkedState ? "fill-amber-500 stroke-amber-500" : "fill-none stroke-current"
            }`}
          />
        </motion.div>
      </motion.button>

      {/* CSS-only glassmorphic tooltip */}
      <span
        role="tooltip"
        className="
          pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-2.5 py-1 text-xs font-semibold text-white bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-sm
          rounded-md border border-slate-700/50 shadow-md
          opacity-0 scale-95 transition-all duration-200 origin-bottom whitespace-nowrap z-50
          group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100
        "
      >
        {tooltipText}
      </span>
    </div>
  );
}
