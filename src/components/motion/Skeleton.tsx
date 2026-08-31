import React from "react";
import { useMotion } from "./MotionProvider";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

export function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  const { reducedMotion } = useMotion();

  let borderStyle = "";
  if (variant === "circle") borderStyle = "rounded-full";
  else if (variant === "text") borderStyle = "rounded h-3 w-3/4";
  else borderStyle = "rounded-xl";

  const shimmerClass = reducedMotion
    ? "bg-secondary/40"
    : "bg-secondary/30 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-secondary/20 before:to-transparent";

  return <div className={`${shimmerClass} ${borderStyle} ${className}`} />;
}
