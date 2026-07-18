import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ReactionButton = React.forwardRef(
  ({ emoji, label, ariaLabel, onClick, disabled, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.12, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          "flex flex-col items-center justify-center p-2 rounded-xl transition-colors duration-200 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-muted disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          className
        )}
        {...props}
      >
        <span className="text-2xl select-none" role="img" aria-hidden="true">
          {emoji}
        </span>
        <span className="text-[10px] md:text-xs mt-1 text-muted-foreground font-medium select-none text-center leading-tight max-w-[75px]">
          {label}
        </span>
      </motion.button>
    );
  }
);
ReactionButton.displayName = "ReactionButton";

export default ReactionButton;
