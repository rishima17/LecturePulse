import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MoodButton = React.forwardRef(function MoodButton(
  {
    emoji,
    label,
    isSelected,
    disabled,
    color,
    borderClass,
    bgClass,
    textClass,
    hoverBg,
    className,
    ...props
  },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      type="button"
      disabled={disabled}
      aria-label={`Feel ${label}`}
      className={cn(
        "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
        isSelected
          ? `bg-gradient-to-br ${color} text-white border-transparent shadow-lg`
          : cn(
              borderClass || "border-muted",
              bgClass || "bg-card",
              textClass || "text-muted-foreground",
              hoverBg
            ),
        disabled && !isSelected && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "text-4xl transition-transform duration-300 select-none",
          isSelected && "scale-110"
        )}
      >
        {emoji}
      </span>
      <span
        className={cn(
          "font-semibold text-sm tracking-wide select-none",
          isSelected ? "text-white" : "text-foreground/80"
        )}
      >
        {label}
      </span>
    </motion.button>
  );
});

MoodButton.displayName = "MoodButton";

export default MoodButton;
