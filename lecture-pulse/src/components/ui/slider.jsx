// src/components/ui/slider.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Simple slider component based on native <input type="range">.
 * Props:
 * - value: array of numbers (single value expected)
 * - onValueChange: callback receives new array
 * - min, max, step
 * - className for custom styling
 */
export const Slider = ({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}) => {
  const handleChange = (e) => {
    const val = Number(e.target.value);
    onValueChange([val]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={cn(
        "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full",
        className
      )}
    />
  );
};

export default Slider;
