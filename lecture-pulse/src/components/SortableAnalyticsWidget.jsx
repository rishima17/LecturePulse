import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SortableAnalyticsWidget wraps any widget card to enable sorting via dnd-kit.
 *
 * @param {Object} props
 * @param {string} props.id - Unique ID of the widget
 * @param {React.ReactNode} props.children - Widget card element to render
 * @param {string} [props.className] - Extra tailwind classes for layout grid
 * @returns {React.JSX.Element} The sortable widget container
 */
export default function SortableAnalyticsWidget({ id, children, className = "" }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
  };

  const getWidgetLabel = (widgetId) => {
    switch (widgetId) {
      case "summary":
        return "Session Summary";
      case "understanding":
        return "Understanding Distribution";
      case "attention":
        return "Attention Levels";
      case "confusion":
        return "Confusion Timeline";
      case "comments":
        return "Comments & Timeline";
      default:
        return "Widget";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-xl transition-shadow duration-200",
        isDragging ? "opacity-40 z-50 ring-2 ring-primary/40 shadow-xl" : "opacity-100",
        className
      )}
    >
      {/* Floating Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag handle for ${getWidgetLabel(id)}. Press Space to grab, Arrow keys to reorder, Space to release.`}
        className="
          absolute top-3 right-3 z-10
          opacity-0 group-hover:opacity-100 focus-visible:opacity-100
          transition-opacity duration-200
          w-7 h-7 flex items-center justify-center rounded-md
          border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-sm
          text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800
          cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary
        "
      >
        <GripVertical className="w-4 h-4 shrink-0" />
      </button>

      {children}
    </div>
  );
}
