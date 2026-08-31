import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    { children, loading = false, success = false, variant = "primary", className = "", ...props },
    ref,
  ) => {
    let btnStyle = "btn ";
    if (variant === "primary") btnStyle += "btn-primary";
    else if (variant === "secondary") btnStyle += "btn-secondary";
    else if (variant === "danger")
      btnStyle += "btn-primary bg-destructive text-white hover:bg-destructive/95";
    else if (variant === "ghost")
      btnStyle += "bg-transparent hover:bg-secondary/40 text-foreground";

    return (
      <motion.button
        ref={ref as any}
        whileTap={props.disabled || loading ? {} : { scale: 0.98 }}
        whileHover={props.disabled || loading ? {} : { scale: 1.01 }}
        className={`${btnStyle} ${className} relative flex items-center justify-center gap-2 overflow-hidden`}
        {...(props as any)}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />}
        {success && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-emerald-500 mr-1"
          >
            ✓
          </motion.span>
        )}
        <span className={loading ? "opacity-90" : "opacity-100"}>{children}</span>
      </motion.button>
    );
  },
);

AnimatedButton.displayName = "AnimatedButton";
