import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { modalVariants, fadeInVariants } from "./motionVariants";
import { X } from "lucide-react";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedModal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: AnimatedModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`surface-card w-full max-w-lg p-6 shadow-xl border border-border/80 rounded-2xl relative z-10 bg-card ${className}`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
              {title && (
                <h3 className="font-display font-bold text-base text-foreground">{title}</h3>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
