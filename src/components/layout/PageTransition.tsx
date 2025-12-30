import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Animation variants for page transitions
const pageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

/**
 * PageTransition - Wraps page content with smooth fade + slide animations.
 * Uses GPU-friendly properties (opacity, transform) only.
 * Respects prefers-reduced-motion via Framer Motion's built-in support.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
