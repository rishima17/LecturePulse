import { useState, useRef, useEffect } from "react";
import { getTemplates } from "@/utils/templates";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TemplateSelector component.
 * Allows teachers to select an optional template during lecture creation.
 * Offers filtering and quick pre-fill application.
 *
 * @param {Object} props
 * @param {Function} props.onSelectTemplate Callback when a template is selected or cleared.
 */
export default function TemplateSelector({ onSelectTemplate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const dropdownRef = useRef(null);

  const templates = getTemplates();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.topic && t.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedTemplate(null);
    onSelectTemplate(null);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {selectedTemplate ? (
        <div className="flex items-center justify-between w-full border border-primary/45 bg-primary/5 rounded-md px-3 py-2 text-sm">
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-foreground truncate">
              Template: {selectedTemplate.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-transparent"
            aria-label="Clear selected template"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full border border-input bg-background hover:bg-accent/30 rounded-md px-3 py-2.5 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors cursor-pointer text-left font-normal"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            Choose Template (Optional)
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col"
          >
            <div className="relative p-2 border-b border-border bg-card/50">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-md bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex-1 overflow-y-auto py-1">
              {templates.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  <p className="font-semibold">No templates available</p>
                  <p className="mt-1 text-[11px] opacity-75">
                    Create templates in Dashboard first.
                  </p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No matching templates found
                </div>
              ) : (
                filteredTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelect(t)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-accent/40 hover:text-accent-foreground transition-colors flex flex-col gap-0.5 border-b border-border/20 last:border-0 cursor-pointer"
                  >
                    <span className="font-semibold text-foreground text-[13px]">{t.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate font-sans">
                      {[t.subject, t.topic].filter(Boolean).join(" • ") || "No Subject/Topic"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
