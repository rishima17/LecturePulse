import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { saveLectureNotes } from "@/utils/storage";
import { toast } from "sonner";
import { X, Loader2, Save, FileText, AlertTriangle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function LectureNotesEditor({ lectureId, initialNotes = "", onClose, onSave }) {
    const [notes, setNotes] = useState(initialNotes);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const textareaRef = useRef(null);
    const modalRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    const isModified = notes !== initialNotes;
    const trimmedLength = notes.trim().length;
    const isValid = notes.length <= 10000;
    const isEmpty = trimmedLength === 0;
    const canSave = isModified && isValid && !isEmpty;

    // Autosize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [notes]);

    // Keep references to event handlers to prevent stale closures and excess re-binding
    const handleCloseAttemptRef = useRef(null);
    const handleSaveRef = useRef(null);
    const canSaveRef = useRef(null);
    const isSavingRef = useRef(null);
    const notesRef = useRef(null);

    // Update refs on each render
    const handleCloseAttempt = () => {
        if (isModified) {
            if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleSave = async () => {
        if (isEmpty) {
            setError("Notes cannot be empty");
            toast.error("Validation failed: Notes cannot be empty");
            return;
        }
        if (notes.length > 10000) {
            setError("Notes cannot exceed 10000 characters");
            toast.error("Validation failed: Notes cannot exceed 10000 characters");
            return;
        }
        if (!isModified) return;

        setIsSaving(true);
        setError("");

        // Simulate save loading state for visual feedback
        setTimeout(() => {
            try {
                saveLectureNotes(lectureId, notes);
                toast.success("Notes saved successfully");
                if (onSave) onSave();
            } catch (err) {
                console.error("Save error:", err);
                setError(err.message || "Failed to save notes");
                toast.error(`Validation failed: ${err.message || "Failed to save"}`);
            } finally {
                setIsSaving(false);
            }
        }, 600);
    };

    handleCloseAttemptRef.current = handleCloseAttempt;
    handleSaveRef.current = handleSave;
    canSaveRef.current = canSave;
    isSavingRef.current = isSaving;
    notesRef.current = notes;

    // Escape Key & Focus Trap
    useEffect(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const timer = setTimeout(() => {
            textareaRef.current?.focus();
        }, 100);

        const handleKeyDown = (e) => {
            if (e.key === "Tab") {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                handleCloseAttemptRef.current?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Ctrl+S / Cmd+S Keyboard Shortcut
    useEffect(() => {
        const handleShortcut = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                if (canSaveRef.current && !isSavingRef.current) {
                    handleSaveRef.current?.();
                } else if (notesRef.current?.trim().length === 0) {
                    toast.error("Validation failed: Notes cannot be empty");
                } else if (notesRef.current?.length > 10000) {
                    toast.error("Validation failed: Notes cannot exceed 10000 characters");
                }
            }
        };
        window.addEventListener("keydown", handleShortcut);
        return () => {
            window.removeEventListener("keydown", handleShortcut);
        };
    }, []);

    const modalVariants = shouldReduceMotion
        ? {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              transition: { duration: 0.15 }
          }
        : {
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.95 },
              transition: { type: "spring", duration: 0.3 }
          };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Background Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={handleCloseAttempt}
            />

            {/* Modal Body */}
            <motion.div
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="editor-title"
                className="relative bg-card text-card-foreground border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 id="editor-title" className="text-xl font-bold flex items-center gap-2">
                                Edit Lecture Notes
                                {isModified && (
                                    <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        Unsaved
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Add notes for this session. Markdown lists, headings, and code blocks are supported.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCloseAttempt}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full border border-border/40 focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Close notes editor"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content Box */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[55vh]">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center gap-2 text-[15px] font-medium animate-in fade-in duration-200">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="notes-textarea" className="sr-only">Lecture Notes Content</label>
                        <textarea
                            id="notes-textarea"
                            ref={textareaRef}
                            value={notes}
                            onChange={(e) => {
                                setNotes(e.target.value);
                                if (e.target.value.length <= 10000) {
                                    setError("");
                                }
                            }}
                            placeholder="Write your notes here... Use # Heading, - Bullet point, 1. Numbered item, or ``` code block."
                            className="w-full min-h-[220px] bg-transparent text-[16px] text-foreground placeholder:text-muted-foreground/60 border-0 focus:ring-0 focus:outline-none resize-none font-sans leading-relaxed focus-visible:ring-0"
                            aria-invalid={notes.length > 10000 ? "true" : "false"}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:items-start gap-0.5 w-full sm:w-auto text-left">
                        <div className={`text-xs font-mono ${notes.length > 10000 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                            {notes.length.toLocaleString()} / 10,000 characters
                        </div>
                        {notes.length > 10000 && (
                            <span className="text-xs text-destructive font-semibold">Exceeds limit by {(notes.length - 10000).toLocaleString()} characters</span>
                        )}
                        <div className="text-xs text-muted-foreground/60 font-mono hidden sm:block">
                            Press <kbd className="px-1.5 py-0.5 bg-muted border border-border/70 rounded text-[10px] font-semibold text-foreground select-none">Ctrl+S</kbd> to save
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                            variant="outline"
                            onClick={handleCloseAttempt}
                            disabled={isSaving}
                            className="w-full sm:w-auto h-9"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!canSave || isSaving}
                            className="w-full sm:w-auto h-9 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Notes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
