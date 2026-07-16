import { useState } from "react";
import { Save, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * An inline editor card for creating or editing journal notes.
 * 
 * @param {Object} props
 * @param {import("../../types/journal").JournalNote} [props.note] - Note object to edit, or undefined for creating a new note.
 * @param {function} props.onSave - Callback on note save (title, content).
 * @param {function} props.onCancel - Callback on cancel edit.
 */
export default function JournalEditor({
  note,
  onSave,
  onCancel,
}) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setValidationError("Note content cannot be empty.");
      toast.error("Please enter some content for your note.");
      return;
    }
    
    setValidationError("");
    onSave({
      title: title.trim() || undefined,
      content: trimmedContent,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="border-primary/30 shadow-xl bg-card/90 backdrop-blur-xl relative overflow-hidden">
        {/* Top visual gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-primary to-cyan-500" />
        
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {note ? "Edit Journal Note" : "Create Learning Note"}
          </CardTitle>
          <CardDescription>
            {note ? "Update your thoughts or takeaways for this lecture" : "Jot down key takeaways, questions, or ideas. Saved locally."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title field */}
            <div className="space-y-1.5">
              <label htmlFor="note-title" className="text-sm font-semibold text-foreground/80">
                Title <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                id="note-title"
                type="text"
                placeholder="e.g. Key definition, confusion point, question to ask..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="bg-background/40 border-border/50 focus:bg-background/80"
              />
            </div>
            
            {/* Content field */}
            <div className="space-y-1.5">
              <label htmlFor="note-content" className="text-sm font-semibold text-foreground/80 flex justify-between">
                <span>Content <span className="text-destructive">*</span></span>
                <span className="text-xs text-muted-foreground font-normal">
                  {content.length} characters
                </span>
              </label>
              <textarea
                id="note-content"
                placeholder="Write your note content here..."
                rows={6}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (e.target.value.trim()) {
                    setValidationError("");
                  }
                }}
                className="flex w-full rounded-md border border-input bg-background/40 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] focus:bg-background/80"
              />
            </div>

            {validationError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-input hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-md shadow-primary/10"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
