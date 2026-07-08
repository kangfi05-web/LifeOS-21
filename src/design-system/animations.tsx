// Animation System - Design System

import { motion, Variants, Transition } from 'framer-motion';

// ============================================
// ANIMATION VARIANTS
// ============================================

// Fade animations
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Slide animations
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

// Scale animations
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// Pop animations (for notifications, badges)
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

// Stagger container
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// ============================================
// PAGE TRANSITION
// ============================================
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const pageTransitionConfig: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
};

// Page Transition Wrapper
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={pageTransitionConfig}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// HOVER ANIMATIONS
// ============================================
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
    transition: { duration: 0.2 }
  },
};

// ============================================
// LIST ANIMATIONS
// ============================================
export function animatedList(_itemCount: number, delay: number = 0.05) {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
  };
}

export const animatedListItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// ============================================
// NUMBER COUNTER ANIMATION
// ============================================
export const counterVariants: Variants = {
  hidden: { opacity: 0.5 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

// ============================================
// PROGRESS ANIMATIONS
// ============================================
export const progressVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.5, ease: 'easeOut' },
  }),
};

export const circleProgressVariants = {
  initial: { strokeDashoffset: 283 }, // 2 * PI * 45
  animate: (progress: number) => ({
    strokeDashoffset: 283 - (progress / 100) * 283,
    transition: { duration: 0.8, ease: 'easeOut' },
  }),
};

// ============================================
// SKELETON SHIMMER
// ============================================
export const shimmerVariants: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================
// CONFETTI/PARTICLE ANIMATIONS
// ============================================
export const confettiVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0
  },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    y: [0, -100 - Math.random() * 100],
    x: [(Math.random() - 0.5) * 200],
    scale: [0, 1, 0],
    rotate: [0, Math.random() * 360],
    transition: {
      duration: 1 + Math.random(),
      delay: i * 0.02,
    },
  }),
};

// ============================================
// GLOW ANIMATION
// ============================================
export const glowVariants: Variants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================
// FLOATING ANIMATION
// ============================================
export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================
// PULSE ANIMATION
// ============================================
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================
// SUCCESS CHECKMARK
// ============================================
export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeOut' },
      opacity: { duration: 0.2 },
    },
  },
};

// Export motion components with presets
export { motion };
