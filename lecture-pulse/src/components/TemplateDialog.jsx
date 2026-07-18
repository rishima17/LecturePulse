import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateTemplate } from "@/utils/templates";
import { X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TemplateDialog component for creating and editing lecture templates.
 * Supports keyboard navigation, visible focus state, and unsaved changes warnings.
 *
 * @param {Object} props
 * @param {boolean} props.open Whether the dialog is open.
 * @param {Function} props.onClose Callback when closing the dialog.
 * @param {Function} props.onSave Callback when template is saved.
 * @param {Object} [props.template] The template object to edit (optional).
 */
export default function TemplateDialog({ open, onClose, onSave, template }) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    topic: "",
    description: "",
    defaultNotes: "",
  });

  useEffect(() => {
    if (template) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: template.name || "",
        subject: template.subject || "",
        topic: template.topic || "",
        description: template.description || "",
        defaultNotes: template.defaultNotes || "",
      });
    } else {
      setFormData({
        name: "",
        subject: "",
        topic: "",
        description: "",
        defaultNotes: "",
      });
    }
  }, [template, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const isDirty = (() => {
    if (template) {
      return (
        formData.name !== (template.name || "") ||
        formData.subject !== (template.subject || "") ||
        formData.topic !== (template.topic || "") ||
        formData.description !== (template.description || "") ||
        formData.defaultNotes !== (template.defaultNotes || "")
      );
    } else {
      return (
        formData.name !== "" ||
        formData.subject !== "" ||
        formData.topic !== "" ||
        formData.description !== "" ||
        formData.defaultNotes !== ""
      );
    }
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateTemplate(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative bg-card border border-border w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh] z-10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 id="template-dialog-title" className="text-xl font-semibold text-foreground">
                {template ? "Edit Lecture Template" : "Create Lecture Template"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="template-name">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="template-name"
                  placeholder="e.g. Java OOP Introduction"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background focus-visible:ring-2 focus-visible:ring-primary"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.name.length}/50
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="template-subject">Subject</Label>
                <Input
                  id="template-subject"
                  placeholder="e.g. Computer Science"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-background focus-visible:ring-2 focus-visible:ring-primary"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.subject.length}/100
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="template-topic">Topic</Label>
                <Input
                  id="template-topic"
                  placeholder="e.g. Classes and Objects"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="bg-background focus-visible:ring-2 focus-visible:ring-primary"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.topic.length}/100
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="template-description">Description</Label>
                <textarea
                  id="template-description"
                  placeholder="Brief description of when to use this template..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/500
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="template-notes">Default Lecture Notes</Label>
                <textarea
                  id="template-notes"
                  placeholder="Prefilled outline, syllabus points or key topics..."
                  value={formData.defaultNotes}
                  onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-sans"
                  maxLength={10000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.defaultNotes.length}/10000
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-border mt-6">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 text-xs font-medium min-h-[20px]">
                  {isDirty && (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Unsaved changes</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-9 px-4 text-sm cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="h-9 px-4 text-sm font-semibold cursor-pointer">
                    {template ? "Save Changes" : "Create Template"}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
