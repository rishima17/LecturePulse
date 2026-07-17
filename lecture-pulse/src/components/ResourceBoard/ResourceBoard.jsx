import { useState } from "react";
import { 
  getResources, 
  deleteResource, 
  RESOURCE_CATEGORIES 
} from "@/utils/resources";
import ResourceCard from "./ResourceCard";
import AddResourceDialog from "./AddResourceDialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Coordinate and render the entire Lecture Resource Board.
 * 
 * @param {Object} props
 * @param {string} props.sessionCode - The unique 6-digit lecture session code.
 * @param {boolean} props.isTeacher - Indicates if the user is a teacher (renders manager tools).
 */
export default function ResourceBoard({ sessionCode, isTeacher }) {
  const [resources, setResources] = useState(() => getResources(sessionCode));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // Reload handler (passed to dialog save callbacks)
  const handleReload = () => {
    setResources(getResources(sessionCode));
  };

  // Delete handler
  const handleDelete = (resourceId) => {
    const updated = deleteResource(sessionCode, resourceId);
    if (updated !== null) {
      setResources(updated);
    }
  };

  // Edit handler (opens dialog in edit mode)
  const handleEdit = (resource) => {
    setEditingResource(resource);
    setDialogOpen(true);
  };

  // Create handler (opens dialog in create mode)
  const handleCreate = () => {
    setEditingResource(null);
    setDialogOpen(true);
  };

  // Filter resources based on query and category
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === "all" || resource.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="border-border/50 shadow-2xl backdrop-blur-xl bg-card/70 relative overflow-visible w-full mt-8">
      {/* Visual pulse glow effect */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <CardHeader className="pb-4 border-b border-border/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Lecture Resource Board</span>
            <span className="text-xs bg-primary/15 text-primary-foreground font-semibold px-2 py-0.5 rounded-full dark:bg-primary/20 dark:text-foreground">
              {resources.length} {resources.length === 1 ? "item" : "items"}
            </span>
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-primary/70 animate-pulse" />
            <span>
              {isTeacher
                ? "Provide your students with slides, readings, videos, or homework links."
                : "Access learning materials and links recommended by your teacher for this session."}
            </span>
          </CardDescription>
        </div>

        {isTeacher && (
          <Button
            onClick={handleCreate}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 h-9 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </Button>
        )}
      </CardHeader>

      {/* Filter / Content Area */}
      <CardContent className="pt-6 pb-8">
        <div className="space-y-6">
          
          {/* Search & Category Pills (Rendered only if there are resources in storage) */}
          {resources.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search resources by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50 border-border/50 focus:bg-background"
                  />
                </div>

                {/* Clear Filter Indicator */}
                {(searchQuery || activeCategory !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    className="text-xs font-semibold px-3 py-1.5 h-9 border-border/60 hover:bg-muted self-start lg:self-auto"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Category Filter Scrollable List */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                    activeCategory === "all"
                      ? "bg-card text-foreground border border-border shadow-sm font-bold scale-105"
                      : "text-muted-foreground hover:bg-card/45"
                  }`}
                >
                  All
                </button>
                {RESOURCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                      activeCategory === cat
                        ? "bg-primary/10 border border-primary/20 text-primary font-bold scale-105"
                        : "text-muted-foreground hover:bg-card/45"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid View of Cards */}
          {filteredResources.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredResources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    isTeacher={isTeacher}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed border-border bg-background/30 backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 animate-bounce" style={{ animationDuration: "3s" }}>
                <BookOpen className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-bold mb-1 text-foreground">
                {resources.length > 0 
                  ? "No matching resources found" 
                  : "Start your Resource Board"}
              </h4>
              <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
                {resources.length > 0
                  ? "Try adjusting your search terms or selecting another category filter."
                  : isTeacher
                    ? "Upload external resources like document links, PDFs, presentations, slides, and websites to assist your students."
                    : "Your teacher hasn't published any learning resources for this lecture session yet."}
              </p>

              {resources.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="border-border/60 hover:bg-muted"
                >
                  Clear Filters
                </Button>
              ) : (
                isTeacher && (
                  <Button
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Resource
                  </Button>
                )
              )}
            </motion.div>
          )}

        </div>
      </CardContent>

      {/* Editor Modal */}
      <AddResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sessionCode={sessionCode}
        resource={editingResource}
        onSave={handleReload}
      />
    </Card>
  );
}
