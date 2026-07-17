import { useState } from "react";
import { 
  Plus, 
  Search, 
  Download, 
  BookOpen, 
  Star, 
  Clock, 
  FileText, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  getJournalNotes, 
  createJournalNote, 
  updateJournalNote, 
  deleteJournalNote 
} from "@/utils/journal";
import { exportToTxt, exportToPdf } from "@/utils/journalExport";
import JournalCard from "./JournalCard";
import JournalEditor from "./JournalEditor";

/**
 * Main coordinator component for the Student's Personal Learning Journal.
 * Displayed below the feedback forms on the student landing.
 * 
 * @param {Object} props
 * @param {string} props.sessionCode - The active lecture's 6-digit code.
 * @param {Object} props.activeSession - The active session detail object.
 */
export default function JournalSection({ sessionCode, activeSession }) {
  const [notes, setNotes] = useState(() => getJournalNotes(sessionCode));
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(null); // null (list), 'new' (create), or noteObject (edit)
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'starred', 'revise'
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Handle Note Save (Create or Update)
  const handleSaveNote = (noteData) => {
    try {
      if (isEditingNote === "new") {
        const newNote = createJournalNote(sessionCode, noteData);
        if (newNote) {
          setNotes(prev => [newNote, ...prev]);
          toast.success("Learning note saved successfully.");
        }
      } else if (isEditingNote && isEditingNote.id) {
        const updatedNotes = updateJournalNote(sessionCode, isEditingNote.id, noteData);
        if (updatedNotes) {
          setNotes(updatedNotes);
          toast.success("Learning note updated successfully.");
        }
      }
      setIsEditingNote(null);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save note due to an error.");
    }
  };

  // Handle Note Delete
  const handleDeleteNote = (noteId) => {
    const updatedNotes = deleteJournalNote(sessionCode, noteId);
    if (updatedNotes !== null) {
      setNotes(updatedNotes);
      toast.success("Note deleted successfully.");
    }
  };

  // Toggle Star Status
  const handleToggleStar = (note) => {
    const updatedNotes = updateJournalNote(sessionCode, note.id, { starred: !note.starred });
    if (updatedNotes) {
      setNotes(updatedNotes);
      if (!note.starred) {
        toast.success("Marked note as Important.", { icon: "★" });
      } else {
        toast.info("Removed important marker from note.");
      }
    }
  };

  // Toggle Revise Later Status
  const handleToggleRevise = (note) => {
    const updatedNotes = updateJournalNote(sessionCode, note.id, { reviseLater: !note.reviseLater });
    if (updatedNotes) {
      setNotes(updatedNotes);
      if (!note.reviseLater) {
        toast.success("Marked for Revision Later.", { icon: "⏳" });
      } else {
        toast.info("Removed revision reminder.");
      }
    }
  };

  // Filter notes based on searchQuery and activeFilter
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      (note.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "starred") {
      return matchesSearch && note.starred;
    }
    if (activeFilter === "revise") {
      return matchesSearch && note.reviseLater;
    }
    return matchesSearch;
  });

  // Sort notes: Starred notes pinned at top, all notes sorted newest first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  // Export handlers
  const handleExportTxt = () => {
    try {
      exportToTxt(sessionCode, activeSession, notes);
      toast.success("TXT journal exported successfully.");
      setShowExportMenu(false);
    } catch (error) {
      toast.error("Failed to export TXT: " + error.message);
    }
  };

  const handleExportPdf = () => {
    try {
      exportToPdf(sessionCode, activeSession, notes);
      toast.success("PDF journal exported successfully.");
      setShowExportMenu(false);
    } catch (error) {
      toast.error("Failed to export PDF: " + error.message);
    }
  };

  return (
    <Card className="border-border/50 shadow-2xl backdrop-blur-xl bg-card/70 mt-8 w-full relative overflow-visible">
      {/* Background Pulse Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      
      <CardHeader className="pb-4 border-b border-border/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Personal Learning Journal</span>
            <span className="text-xs bg-primary/15 text-primary-foreground font-semibold px-2 py-0.5 rounded-full dark:bg-primary/20 dark:text-foreground">
              Private
            </span>
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Notes are saved strictly to your browser storage and never shared.</span>
          </CardDescription>
        </div>

        {/* Add Note & Export Controls */}
        <div className="flex items-center gap-2 shrink-0 relative">
          <Button
            onClick={() => setIsEditingNote("new")}
            disabled={isEditingNote !== null}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1 h-9"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </Button>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={notes.length === 0}
              className="border-border/60 hover:bg-muted text-foreground flex items-center gap-1 h-9"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExportMenu ? "rotate-180" : ""}`} />
            </Button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showExportMenu && (
                <>
                  {/* Backdrop overlay to close menu */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1.5 w-44 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden"
                  >
                    <button
                      onClick={handleExportTxt}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/80 text-left transition-colors"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Export as TXT</span>
                    </button>
                    <button
                      onClick={handleExportPdf}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/80 text-left transition-colors border-t border-border/40"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span>Export as PDF</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-8">
        <AnimatePresence mode="wait">
          {/* Main Editing View */}
          {isEditingNote !== null ? (
            <JournalEditor
              key="editor"
              note={isEditingNote === "new" ? undefined : isEditingNote}
              onSave={handleSaveNote}
              onCancel={() => setIsEditingNote(null)}
            />
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Search & Filter Toolbar */}
              {notes.length > 0 && (
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search note titles or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background/50 border-border/50 focus:bg-background"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 self-start md:self-auto bg-muted/30 p-1 rounded-xl border border-border/30">
                    <button
                      onClick={() => setActiveFilter("all")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeFilter === "all"
                          ? "bg-card text-foreground shadow-sm font-bold scale-105"
                          : "text-muted-foreground hover:bg-card/45"
                      }`}
                    >
                      All ({notes.length})
                    </button>
                    <button
                      onClick={() => setActiveFilter("starred")}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeFilter === "starred"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold scale-105"
                          : "text-muted-foreground hover:bg-card/45"
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Important</span>
                    </button>
                    <button
                      onClick={() => setActiveFilter("revise")}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeFilter === "revise"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                          : "text-muted-foreground hover:bg-card/45"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Revise</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Notes List */}
              {sortedNotes.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {sortedNotes.map((note) => (
                      <JournalCard
                        key={note.id}
                        note={note}
                        onEdit={() => setIsEditingNote(note)}
                        onDelete={() => handleDeleteNote(note.id)}
                        onToggleStar={() => handleToggleStar(note)}
                        onToggleRevise={() => handleToggleRevise(note)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                /* Empty state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-border/80 bg-background/30 backdrop-blur-sm"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 animate-bounce" style={{ animationDuration: "3s" }}>
                    <BookOpen className="w-8 h-8" />
                  </div>
                  
                  <h4 className="text-xl font-bold mb-1">
                    {searchQuery || activeFilter !== "all" 
                      ? "No matching notes found" 
                      : "Start your Learning Journal"}
                  </h4>
                  <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
                    {searchQuery || activeFilter !== "all"
                      ? "Try adjusting your search keywords or clearing active filters."
                      : "Write down key formulas, insights, or points to revise later during this lecture."}
                  </p>
                  
                  {searchQuery || activeFilter !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveFilter("all");
                      }}
                      className="border-input hover:bg-muted"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsEditingNote("new")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Note
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
