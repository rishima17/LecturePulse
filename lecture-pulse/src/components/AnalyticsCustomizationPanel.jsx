import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, CheckSquare, Square, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  getDashboardPreferences, 
  saveDashboardPreferences, 
  getDefaultPreferences 
} from "@/utils/dashboardPreferences";

/**
 * AnalyticsCustomizationPanel component displays a modal allowing teachers to
 * toggle widget visibility and restore defaults.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the panel is open
 * @param {function} props.onClose - Callback to close the panel
 * @param {function} props.onSave - Callback triggered after preferences are successfully saved
 * @returns {React.JSX.Element|null} The rendered component
 */
export default function AnalyticsCustomizationPanel({ isOpen, onClose, onSave }) {
  const shouldReduceMotion = useReducedMotion();
  const [prefs, setPrefs] = useState(() => getDashboardPreferences());
  const [confirmRestore, setConfirmRestore] = useState(false);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Keep track of the active element before the modal opens to restore focus when it closes
  useEffect(() => {
    triggerRef.current = document.activeElement;
    
    // Wait for animation frame then focus modal container or first input
    requestAnimationFrame(() => {
      const firstInput = modalRef.current?.querySelector("input[type='checkbox']");
      if (firstInput) {
        firstInput.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    });

    return () => {
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, []);

  // Handle keyboard interaction (Escape to close, Tab trapping)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widgetDefinitions = [
    { id: "summary", label: "Session Summary", desc: "Key metrics like overall effectiveness and response count." },
    { id: "understanding", label: "Understanding", desc: "Visual distribution of student comprehension levels." },
    { id: "confusion", label: "Confusion Timeline", desc: "Identifies concepts and specific moments of confusion." },
    { id: "attention", label: "Attention", desc: "Tracks visual engagement level breakdown." },
    { id: "comments", label: "Comments", desc: "Common keywords, detailed suggestions, and timeline." }
  ];

  const handleToggle = (id) => {
    setPrefs(prev => {
      const hidden = [...prev.hiddenWidgets];
      const isHidden = hidden.includes(id);
      
      const newHidden = isHidden
        ? hidden.filter(wId => wId !== id)
        : [...hidden, id];
      
      return {
        ...prev,
        hiddenWidgets: newHidden
      };
    });
  };

  const handleSave = () => {
    const success = saveDashboardPreferences(prefs);
    if (success) {
      toast.success("Dashboard preferences saved");
      onSave(prefs);
      onClose();
    } else {
      toast.error("Unable to save preferences (Storage full)");
    }
  };

  const handleRestore = () => {
    if (!confirmRestore) {
      setConfirmRestore(true);
      return;
    }

    const defaults = getDefaultPreferences();
    const success = saveDashboardPreferences(defaults);
    if (success) {
      toast.success("Dashboard layout restored to default");
      setPrefs(defaults);
      setConfirmRestore(false);
      onSave(defaults);
      onClose();
    } else {
      toast.error("Unable to restore defaults");
    }
  };

  // Modal animations
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const panelVariants = {
    hidden: { scale: shouldReduceMotion ? 1 : 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: { 
      scale: shouldReduceMotion ? 1 : 0.95, 
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customization-title"
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div 
        ref={modalRef}
        tabIndex="-1"
        className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-2xl overflow-hidden focus:outline-none"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="customization-title" className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Customize Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose which analytics widgets to show on this page.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close customization panel"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
          {widgetDefinitions.map((widget) => {
            const isVisible = !prefs.hiddenWidgets.includes(widget.id);
            return (
              <div 
                key={widget.id}
                onClick={() => handleToggle(widget.id)}
                className={`
                  flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none
                  ${isVisible 
                    ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40" 
                    : "bg-transparent border-slate-100 dark:border-slate-900 opacity-60 hover:opacity-80"
                  }
                `}
              >
                <div className="mt-0.5" tabIndex="0" role="checkbox" aria-checked={isVisible} aria-label={`Toggle ${widget.label}`}>
                  {isVisible ? (
                    <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">
                    {widget.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    {widget.desc}
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => {}}
                  className="sr-only"
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 px-6 py-5 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            {confirmRestore ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRestore}
                className="text-xs font-semibold cursor-pointer animate-in fade-in zoom-in-95 duration-150"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                Confirm Reset?
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestore}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                Restore Defaults
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs font-semibold px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="text-xs font-semibold px-4 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Save Layout
              </Button>
            </div>
          </div>
          
          {confirmRestore && (
            <p className="text-[10px] text-destructive font-medium leading-none animate-in slide-in-from-top-1 duration-150">
              * This will reset both widget order and visibility options instantly.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
