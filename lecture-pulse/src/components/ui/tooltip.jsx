// src/components/ui/tooltip.jsx

import React, { cloneElement } from "react";
import { cn } from "@/lib/utils";

/**
 * Simple tooltip implementation using Tailwind CSS.
 */
export const Tooltip = ({ children }) => {
  return <>{children}</>;
};

export const TooltipTrigger = ({ asChild, children }) => {
  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};

  if (asChild) {
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

export default Tooltip;