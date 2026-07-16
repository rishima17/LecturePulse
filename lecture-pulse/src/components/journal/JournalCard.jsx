import { useState } from "react";
import { Star, Clock, Edit2, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Renders a single journal note card with interactable action buttons,
 * tag toggles, edit triggers, and inline deletion confirmation.
 * 
 * @param {Object} props
 * @param {import("../../types/journal").JournalNote} props.note
 * @param {function} props.onEdit
 * @param {function} props.onDelete
 * @param {function} props.onToggleStar
 * @param {function} props.onToggleRevise
 */
export default function JournalCard({
  note,
  onEdit,
  onDelete,
  onToggleStar,
  onToggleRevise,
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { title, content, createdAt, updatedAt, starred, reviseLater } = note;
  const displayDate = new Date(updatedAt || createdAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isLongContent = content.length > 200 || content.split("\n").length > 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      <Card variant="interactive" className="overflow-hidden border-border/40 backdrop-blur-md bg-card/50">
        <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
          
          {/* Header row: Title, Star, Revise badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className={`text-lg font-semibold truncate ${title ? "text-foreground" : "text-muted-foreground italic"}`}>
                {title || "Untitled Note"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {displayDate}
              </p>
            </div>
            
            {/* Quick action badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Star Button */}
              <button
                onClick={onToggleStar}
                aria-label={starred ? "Unstar note" : "Star note"}
                className={`p-1.5 rounded-lg border transition-all duration-200 ${
                  starred
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-500 scale-110"
                    : "border-border/60 hover:border-amber-500/40 hover:text-amber-500/80 text-muted-foreground/60"
                }`}
              >
                <Star className={`w-4 h-4 ${starred ? "fill-amber-500" : ""}`} />
              </button>

              {/* Revise Later Toggle Button */}
              <button
                onClick={onToggleRevise}
                aria-label={reviseLater ? "Remove from revise later" : "Mark to revise later"}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                  reviseLater
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "border-border/60 hover:border-emerald-500/30 hover:text-emerald-500/80 text-muted-foreground/60"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Later</span>
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="relative text-base text-foreground/80 leading-relaxed break-words whitespace-pre-wrap">
            <div className={!isExpanded && isLongContent ? "line-clamp-3 overflow-hidden text-ellipsis" : ""}>
              {content}
            </div>
            
            {/* Show Read More if content is long */}
            {isLongContent && (
              <div className="mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>Collapse</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Read More</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer Controls: Edit / Delete */}
          <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-1">
            <div className="flex items-center gap-2">
              {/* Star/Later Indicators (static icons for display if desired, but we have interactive badges above) */}
              {starred && (
                <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Important
                </span>
              )}
              {reviseLater && (
                <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Revise
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {!showConfirmDelete ? (
                  <motion.div
                    key="normal-actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onEdit}
                      className="h-8 px-2.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmDelete(true)}
                      className="h-8 px-2.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm-actions"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-1.5 bg-destructive/10 p-1 rounded-lg border border-destructive/20"
                  >
                    <span className="text-xs font-semibold text-destructive px-2">
                      Delete note?
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onDelete();
                        setShowConfirmDelete(false);
                      }}
                      className="h-7 px-2.5 text-xs bg-destructive text-white hover:bg-destructive/90 rounded-md"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmDelete(false)}
                      className="h-7 px-2.5 text-xs hover:bg-background rounded-md text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}
