import React from "react";
import { motion } from "framer-motion";

interface SuccessStateProps {
  message?: string;
  className?: string;
}

export function SuccessState({ message, className = "" }: SuccessStateProps) {
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
        className="text-emerald-500 mb-3"
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
          d="M19 32.5 L28 41.5 L45 22.5"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={draw}
        />
      </motion.svg>
      {message && (
        <p className="font-display font-bold text-sm text-foreground animate-fade-in">{message}</p>
      )}
    </div>
  );
}
