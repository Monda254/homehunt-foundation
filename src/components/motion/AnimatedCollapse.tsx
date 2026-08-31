import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { collapseVariants } from "./motionVariants";

interface AnimatedCollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCollapse({ isOpen, children, className = "" }: AnimatedCollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          variants={collapseVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`will-change-[height,opacity] ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
