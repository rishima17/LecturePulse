import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  createResource, 
  updateResource, 
  RESOURCE_CATEGORIES, 
  RESOURCE_TYPES 
} from "@/utils/resources";

/**
 * Modal dialog for creating or editing a learning resource.
 * 
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function(boolean): void} props.onOpenChange
 * @param {string} props.sessionCode
 * @param {import("../../types/resource").LectureResource} [props.resource] - Null or undefined for create mode, resource object for edit mode.
 * @param {function(any): void} props.onSave - Callback containing updated/new resources list or object.
 */
export default function AddResourceDialog({ open, onOpenChange, sessionCode, resource = null, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: RESOURCE_CATEGORIES[0],
    resourceType: RESOURCE_TYPES[0],
    url: "",
  });

  const isEditMode = !!resource;

  // Initialize form fields when opening dialog or toggling edit target
  useEffect(() => {
    if (open) {
      if (resource) {
        setFormData({
          title: resource.title || "",
          description: resource.description || "",
          category: resource.category || RESOURCE_CATEGORIES[0],
          resourceType: resource.resourceType || RESOURCE_TYPES[0],
          url: resource.url || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          category: RESOURCE_CATEGORIES[0],
          resourceType: RESOURCE_TYPES[0],
          url: "",
        });
      }
    }
  }, [open, resource]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Resource title is required.");
      return;
    }

    if (!formData.url.trim()) {
      toast.error("Resource URL is required.");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        const result = updateResource(sessionCode, resource.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          resourceType: formData.resourceType,
          url: formData.url,
        });
        if (result) {
          onSave(result);
          onOpenChange(false);
        }
      } else {
        const result = createResource(sessionCode, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          resourceType: formData.resourceType,
          url: formData.url,
        });
        if (result) {
          onSave(result);
          onOpenChange(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(isEditMode ? "Failed to update resource." : "Failed to create resource.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <h2 className="text-xl font-bold text-foreground">
            {isEditMode ? "Edit Resource" : "Add Resource"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="resource-title">Title *</Label>
            <Input
              id="resource-title"
              placeholder="e.g. React Docs Tutorial"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="resource-url">URL *</Label>
            <Input
              id="resource-url"
              type="text"
              placeholder="https://react.dev/learn"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="resource-category">Category *</Label>
              <select
                id="resource-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 border border-input rounded-lg px-3 bg-background text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="resource-type">Resource Type *</Label>
              <select
                id="resource-type"
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                className="w-full h-10 border border-input rounded-lg px-3 bg-background text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="resource-description">Description (optional)</Label>
            <textarea
              id="resource-description"
              placeholder="Provide a brief context or notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-input rounded-lg p-3 bg-background text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-2 justify-end border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={loading} className="bg-primary text-primary-foreground">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditMode ? "Save Changes" : "Add Resource"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
