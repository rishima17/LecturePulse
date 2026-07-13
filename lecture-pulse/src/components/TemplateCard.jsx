import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Trash2, BookOpen, AlertTriangle } from "lucide-react";

/**
 * TemplateCard component.
 * Displays details of a single lecture template and actions to manage it.
 *
 * @param {Object} props
 * @param {Object} props.template The template object.
 * @param {Function} props.onEdit Callback when the user edits this template.
 * @param {Function} props.onDuplicate Callback when the user duplicates this template.
 * @param {Function} props.onDelete Callback when the user deletes this template.
 */
export default function TemplateCard({ template, onEdit, onDuplicate, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <Card className="rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-card group overflow-hidden flex flex-col justify-between h-full">
      <CardContent className="p-5 flex flex-col h-full gap-4 justify-between">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1">
              <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {template.subject && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                    {template.subject}
                  </span>
                )}
                {template.topic && (
                  <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md">
                    {template.topic}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {template.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {template.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No description provided.
            </p>
          )}

          {/* Default Notes Indicator */}
          {template.defaultNotes && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-auto pt-1 border-t border-border/40">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Includes default notes</span>
            </div>
          )}
        </div>

        {/* Actions or Delete Confirmation */}
        {showConfirmDelete ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2 flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-destructive font-medium text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Confirm permanent deletion?</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5 bg-background cursor-pointer"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs px-2.5 cursor-pointer"
                onClick={() => {
                  onDelete(template.id);
                  setShowConfirmDelete(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8 cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors"
              onClick={() => onEdit(template)}
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8 cursor-pointer hover:bg-secondary/20 hover:text-foreground transition-colors"
              onClick={() => onDuplicate(template.id)}
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => setShowConfirmDelete(true)}
              aria-label="Delete template"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
