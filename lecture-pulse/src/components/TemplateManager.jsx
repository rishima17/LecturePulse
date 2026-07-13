import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from "@/utils/templates";
import TemplateCard from "@/components/TemplateCard";
import TemplateDialog from "@/components/TemplateDialog";
import { X, Search, Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TemplateManager component.
 * Rendered inside a glassmorphic modal.
 * Lists all templates alphabetically, allows searching, adding, duplicating, editing, and deleting templates.
 *
 * @param {Object} props
 * @param {boolean} props.open Whether the manager dialog is open.
 * @param {Function} props.onOpenChange Callback to open/close the manager.
 */
export default function TemplateManager({ open, onOpenChange }) {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const fetchTemplates = () => {
    setTemplates(getTemplates());
  };

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTemplates();
    }
  }, [open]);

  // Handle Escape key to close manager dialog (only if templates form is closed)
  useEffect(() => {
    if (!open || isFormOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, isFormOpen]);

  if (!open) return null;

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.topic && t.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Alphabetical sort by template name
  const sortedTemplates = [...filteredTemplates].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDuplicate = (templateId) => {
    try {
      duplicateTemplate(templateId);
      toast.success("Template duplicated");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to duplicate template");
      console.error(error);
    }
  };

  const handleDelete = (templateId) => {
    try {
      deleteTemplate(templateId);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
      console.error(error);
    }
  };

  const handleSave = (formData) => {
    try {
      if (editingTemplate) {
        updateTemplate(editingTemplate.id, formData);
        toast.success("Template updated");
      } else {
        saveTemplate(formData);
        toast.success("Template created");
      }
      setIsFormOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast.error(error.message || "Failed to save template");
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-manager-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="relative bg-card/95 border border-border backdrop-blur-lg w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 id="template-manager-title" className="text-xl font-bold text-foreground">
                Lecture Templates
              </h2>
              <p className="text-xs text-muted-foreground">Manage templates to prefill new lectures</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close templates manager"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Bar */}
        <div className="p-6 border-b border-border bg-card/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background focus-visible:ring-2"
            />
          </div>
          <Button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Scrollable Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-background/30">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-5 h-full">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-lg font-semibold text-foreground">No templates yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Templates save repetitive setup time. Create a template with standard subjects, topics, and notes.
                </p>
              </div>
              <Button onClick={handleCreate} size="sm" className="font-semibold cursor-pointer">
                <Plus className="w-4 h-4 mr-1" />
                Create First Template
              </Button>
            </div>
          ) : sortedTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">No matching templates</h3>
                <p className="text-xs text-muted-foreground">
                  Try checking spelling or search for another topic/subject.
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {sortedTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                  >
                    <TemplateCard
                      template={template}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Template Create/Edit Dialog */}
      <TemplateDialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSave}
        template={editingTemplate}
      />
    </div>
  );
}
