import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, BookOpen, FileText } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function LectureNotesViewer({ notes = "", onClose }) {
    const modalRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    // Escape Key & Focus Trap
    useEffect(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const timer = setTimeout(() => {
            firstElement.focus();
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
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    // Simple markdown-like line parser
    const parseMarkdown = (text) => {
        if (!text || !text.trim()) return null;

        const lines = text.split("\n");
        const elements = [];
        let inCodeBlock = false;
        let codeLines = [];
        let listItems = [];
        let listType = null; // 'bullet' or 'number'

        const flushList = () => {
            if (listItems.length > 0) {
                const key = `list-${elements.length}`;
                if (listType === "bullet") {
                    elements.push(
                        <ul key={key} className="list-disc pl-6 my-3 space-y-1 text-foreground/95">
                            {listItems.map((item, idx) => (
                                <li key={idx} className="text-[15px] leading-relaxed text-left">{item}</li>
                            ))}
                        </ul>
                    );
                } else if (listType === "number") {
                    elements.push(
                        <ol key={key} className="list-decimal pl-6 my-3 space-y-1 text-foreground/95">
                            {listItems.map((item, idx) => (
                                <li key={idx} className="text-[15px] leading-relaxed text-left">{item}</li>
                            ))}
                        </ol>
                    );
                }
                listItems = [];
                listType = null;
            }
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Code blocks
            if (line.trim().startsWith("```")) {
                if (inCodeBlock) {
                    const key = `code-${elements.length}`;
                    elements.push(
                        <pre key={key} className="bg-muted border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto my-4 text-left shadow-xs">
                            <code className="text-foreground">{codeLines.join("\n")}</code>
                        </pre>
                    );
                    codeLines = [];
                    inCodeBlock = false;
                } else {
                    flushList();
                    inCodeBlock = true;
                }
                continue;
            }

            if (inCodeBlock) {
                codeLines.push(line);
                continue;
            }

            // Headings
            if (line.startsWith("### ")) {
                flushList();
                elements.push(
                    <h4 key={`h3-${elements.length}`} className="text-[16px] font-bold mt-5 mb-2 text-foreground/90 flex items-center text-left">
                        {line.substring(4)}
                    </h4>
                );
                continue;
            }
            if (line.startsWith("## ")) {
                flushList();
                elements.push(
                    <h3 key={`h2-${elements.length}`} className="text-lg font-bold mt-6 mb-2.5 text-foreground border-b border-border/40 pb-1 flex items-center text-left">
                        {line.substring(3)}
                    </h3>
                );
                continue;
            }
            if (line.startsWith("# ")) {
                flushList();
                elements.push(
                    <h2 key={`h1-${elements.length}`} className="text-xl font-extrabold mt-7 mb-3 text-foreground border-b border-border pb-1.5 flex items-center text-left">
                        {line.substring(2)}
                    </h2>
                );
                continue;
            }

            // Bullet Lists
            const bulletMatch = line.match(/^[-*+]\s+(.*)/);
            if (bulletMatch) {
                if (listType !== "bullet") {
                    flushList();
                    listType = "bullet";
                }
                listItems.push(bulletMatch[1]);
                continue;
            }

            // Numbered Lists
            const numberMatch = line.match(/^(\d+)\.\s+(.*)/);
            if (numberMatch) {
                if (listType !== "number") {
                    flushList();
                    listType = "number";
                }
                listItems.push(numberMatch[2]);
                continue;
            }

            // Empty Line
            if (line.trim() === "") {
                flushList();
                continue;
            }

            // Paragraph
            flushList();
            elements.push(
                <p key={`p-${elements.length}`} className="text-[15px] text-muted-foreground my-2 leading-relaxed break-words text-left">
                    {line}
                </p>
            );
        }

        flushList();

        if (codeLines.length > 0) {
            elements.push(
                <pre key={`code-${elements.length}`} className="bg-muted border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto my-4 text-left shadow-xs">
                    <code className="text-foreground">{codeLines.join("\n")}</code>
                </pre>
            );
        }

        return elements;
    };

    const parsedContent = parseMarkdown(notes);

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
                onClick={onClose}
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
                aria-labelledby="viewer-title"
                className="relative bg-card text-card-foreground border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 id="viewer-title" className="text-xl font-bold">
                                Lecture Notes
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Read notes for this lecture session.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full border border-border/40 focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Close notes viewer"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content Box */}
                <div className="flex-1 overflow-y-auto p-6 max-h-[55vh]">
                    {parsedContent ? (
                        <div className="space-y-1">
                            {parsedContent}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="space-y-1 max-w-xs">
                                <h3 className="text-[17px] font-semibold text-foreground">No notes available</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    No notes have been added to this lecture session yet.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/20 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="h-9 px-6 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                    >
                        Close
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
