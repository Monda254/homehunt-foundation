import { HTMLMotionProps, motion } from "framer-motion";
import { fadeUpVariants } from "./motionVariants";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function AnimatedCard({ children, className = "", delay = 0, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      variants={fadeUpVariants}
      custom={{ delay }}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`will-change-transform ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
