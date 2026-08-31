import React from "react";
import { motion } from "framer-motion";

interface ErrorStateProps {
  message?: string;
  className?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, className = "", onRetry }: ErrorStateProps) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 0.8, bounce: 0 },
        opacity: { duration: 0.1 },
      },
    },
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <motion.svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        initial="hidden"
        animate="visible"
        className="text-destructive mb-3"
      >
        <motion.circle
          cx="32"
          cy="32"
          r="30"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          variants={draw}
        />
        <motion.path
          d="M22 22 L42 42"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          variants={draw}
        />
        <motion.path
          d="M42 22 L22 42"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          variants={draw}
        />
      </motion.svg>
      {message && (
        <p className="font-display font-semibold text-xs text-muted-foreground mb-4">{message}</p>
      )}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary text-[11px] py-1.5 px-3">
          Try Again
        </button>
      )}
    </div>
  );
}
