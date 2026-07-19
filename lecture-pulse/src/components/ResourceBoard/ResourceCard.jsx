import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  FileText, 
  Video, 
  Globe, 
  Terminal, 
  Presentation, 
  ExternalLink,
  Edit2,
  Trash2
} from "lucide-react";

// Helper function to return category specific badge styles
const getCategoryStyles = (category) => {
  const clean = category.replace(/[\p{Emoji}\s]+/gu, "").toLowerCase();
  
  switch (clean) {
    case "read":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "watch":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "practice":
      return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
    case "challengeyourself":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "notes":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "slides":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    default:
      return "bg-muted text-muted-foreground border-border/40";
  }
};

// Helper function to return resource type icon
const getTypeIcon = (type) => {
  switch (type) {
    case "Documentation":
    case "PDF":
      return <FileText className="w-5 h-5" />;
    case "YouTube":
      return <Video className="w-5 h-5" />;
    case "Website":
      return <Globe className="w-5 h-5" />;
    case "Coding Platform":
      return <Terminal className="w-5 h-5" />;
    case "Presentation":
      return <Presentation className="w-5 h-5" />;
    default:
      return <ExternalLink className="w-5 h-5" />;
  }
};

/**
 * Renders a single lecture resource item.
 * 
 * @param {Object} props
 * @param {import("../../types/resource").LectureResource} props.resource
 * @param {boolean} props.isTeacher
 * @param {function(any): void} props.onEdit
 * @param {function(string): void} props.onDelete
 */
export default function ResourceCard({ resource, isTeacher, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(resource.id);
    setShowDeleteModal(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card overflow-hidden group flex flex-col justify-between">
        <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
          
          <div className="space-y-3">
            {/* Top row: Badges and Actions */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-1.5 items-center flex-wrap">
                {/* Category Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryStyles(resource.category)}`}>
                  {resource.category}
                </span>
                
                {/* Type Badge */}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-border bg-muted/40 text-muted-foreground flex items-center gap-1">
                  {getTypeIcon(resource.resourceType)}
                  <span>{resource.resourceType}</span>
                </span>
              </div>

              {/* Teacher Actions */}
              {isTeacher && (
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(resource)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="Edit resource"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteClick}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Title and Description */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors">
                {resource.title}
              </h4>
              {resource.description && (
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                  {resource.description}
                </p>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 border-t border-border/10 mt-auto">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full"
            >
              <Button
                variant="outline"
                className="w-full text-sm font-medium border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-300 flex items-center justify-center gap-2 h-9"
              >
                <span>Open Resource</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                <h5 className="text-lg font-bold text-foreground mb-1.5">
                  Delete Resource?
                </h5>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                  Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}
