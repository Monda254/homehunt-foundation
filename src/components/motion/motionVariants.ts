import { Variants } from "framer-motion";
import { MOTION_DURATIONS, MOTION_EASINGS } from "./motionTokens";

// Standard Fade-In transition
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: (custom?: { duration?: number }) => ({
    opacity: 1,
    transition: {
      duration: custom?.duration ?? MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.standard,
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// Fade-Up (Slide slightly from bottom)
export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: (custom?: { duration?: number; delay?: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom?.duration ?? MOTION_DURATIONS.medium,
      delay: custom?.delay ?? 0,
      ease: MOTION_EASINGS.enter,
    },
  }),
  exit: {
    opacity: 0,
    y: 8,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// Fade-Down (Slide slightly from top)
export const fadeDownVariants: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: (custom?: { duration?: number; delay?: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom?.duration ?? MOTION_DURATIONS.medium,
      delay: custom?.delay ?? 0,
      ease: MOTION_EASINGS.enter,
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// Scale Entrance
export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.standard,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// Stagger list container wrapper
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: (custom?: { staggerChildren?: number; delayChildren?: number }) => ({
    transition: {
      staggerChildren: custom?.staggerChildren ?? 0.05,
      delayChildren: custom?.delayChildren ?? 0,
    },
  }),
};

// Modal popups transition
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// Dropdown / Popover transition
export const dropdownVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: MOTION_EASINGS.enter,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: {
      duration: MOTION_DURATIONS.instant,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// Slide-In from right (Sidebar filters / Drawers)
export const slideLeftVariants: Variants = {
  initial: { x: "100%", opacity: 0.9 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 28,
    },
  },
  exit: {
    x: "100%",
    opacity: 0.9,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// Accordion Collapse height variants
export const collapseVariants: Variants = {
  initial: { height: 0, opacity: 0, overflow: "hidden" },
  animate: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: MOTION_DURATIONS.normal,
        ease: MOTION_EASINGS.standard,
      },
      opacity: {
        duration: MOTION_DURATIONS.fast,
        delay: 0.05,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: MOTION_DURATIONS.normal,
        ease: MOTION_EASINGS.exit,
      },
      opacity: {
        duration: MOTION_DURATIONS.fast,
      },
    },
  },
};
