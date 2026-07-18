import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

/**
 * Animated individual reaction counter card for the teacher dashboard.
 * @param {{ emoji: string, label: string, count: number }} props 
 */
export default function ReactionCounter({ emoji, label, count }) {
  return (
    <Card className="flex flex-col items-center justify-center p-4 border bg-card border-border/50 rounded-xl shadow-sm text-center relative overflow-hidden">
      {/* Background visual element */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Emoji display */}
      <span className="text-3xl select-none mb-1 filter drop-shadow-sm" role="img" aria-label={label}>
        {emoji}
      </span>
      
      {/* Label */}
      <span className="text-[11px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 select-none">
        {label}
      </span>
      
      {/* Count element with PopLayout Animation */}
      <div className="h-8 flex items-center justify-center overflow-hidden relative w-full select-none">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="text-2xl font-bold text-foreground font-mono"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </div>
    </Card>
  );
}
