// src/components/ui/tooltip.jsx

import React, { cloneElement } from "react";
import { cn } from "@/lib/utils";

/**
 * Simple tooltip implementation using Tailwind CSS.
 *
 * Usage:
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <button className="...">Hover me</button>
 *   </TooltipTrigger>
 *   <TooltipContent>Tooltip text</TooltipContent>
 * </Tooltip>
 */
export const Tooltip = ({ children }) => {
  // Ensure children is a single React element
  return <>{children}</>;
};

export const TooltipTrigger = ({ asChild, children }) => {
  // No state needed
  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};

  if (asChild) {
    // Clone the child to attach mouse events
    return cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    });
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </div>
  );
};

export const TooltipContent = ({ children }) => {
  // This component expects to be rendered inside TooltipTrigger's hierarchy.
  // It will be positioned absolutely relative to the nearest positioned ancestor.
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-full mb-2 w-max max-w-xs rounded-md bg-black bg-opacity-80 px-2 py-1 text-xs text-white shadow-lg",
        "transition-opacity duration-200 ease-in-out"
      )}
      style={{ opacity: 1 }}
    >
      {children}
    </div>
  );
};

// Export default for convenience if needed
export default Tooltip;
