import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Animation variants for page transitions - subtle opacity fade only
// No vertical movement to prevent layout jumps
const pageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * PageTransition - Wraps page content with smooth fade animation.
 * Uses GPU-friendly opacity only (no transform) to prevent layout shifts.
 * Respects prefers-reduced-motion via Framer Motion's built-in support.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}
