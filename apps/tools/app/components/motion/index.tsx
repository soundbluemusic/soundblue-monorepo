/**
 * @fileoverview Framer Motion Animation Components
 *
 * Reusable animation primitives for consistent UI transitions.
 */

'use client';

import { AnimatePresence, type HTMLMotionProps, motion, type Variants } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

// Animation presets
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.8 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// Beat pulse for metronome/drum machine
export const beatPulse: Variants = {
  idle: { scale: 1 },
  beat: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

// Tap animation for buttons
export const tapScale = {
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

// Hover animation
export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
};

// Motion wrapper components
interface MotionDivProps extends HTMLMotionProps<'div'> {
  children?: ReactNode;
}

export const FadeIn = forwardRef<HTMLDivElement, MotionDivProps>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeIn}
    {...props}
  >
    {children}
  </motion.div>
));
FadeIn.displayName = 'FadeIn';

export const SlideUp = forwardRef<HTMLDivElement, MotionDivProps>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={slideUp}
    {...props}
  >
    {children}
  </motion.div>
));
SlideUp.displayName = 'SlideUp';

export const ScaleIn = forwardRef<HTMLDivElement, MotionDivProps>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={scaleIn}
    {...props}
  >
    {children}
  </motion.div>
));
ScaleIn.displayName = 'ScaleIn';

export const PopIn = forwardRef<HTMLDivElement, MotionDivProps>(({ children, ...props }, ref) => (
  <motion.div ref={ref} initial="initial" animate="animate" exit="exit" variants={popIn} {...props}>
    {children}
  </motion.div>
));
PopIn.displayName = 'PopIn';

interface StaggerContainerProps extends MotionDivProps {
  staggerDelay?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, staggerDelay = 0.1, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
StaggerContainer.displayName = 'StaggerContainer';

export const StaggerItem = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={staggerItem} {...props}>
      {children}
    </motion.div>
  ),
);
StaggerItem.displayName = 'StaggerItem';

// Beat indicator for rhythm tools
interface BeatIndicatorProps extends MotionDivProps {
  isActive?: boolean;
  isAccent?: boolean;
}

export const BeatIndicator = forwardRef<HTMLDivElement, BeatIndicatorProps>(
  ({ isActive = false, isAccent = false, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      animate={isActive ? 'beat' : 'idle'}
      variants={beatPulse}
      style={{
        backgroundColor: isActive
          ? isAccent
            ? 'hsl(var(--primary))'
            : 'hsl(var(--foreground))'
          : 'hsl(var(--secondary))',
      }}
      {...props}
    />
  ),
);
BeatIndicator.displayName = 'BeatIndicator';

// Animated button with tap effect
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children?: ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  ),
);
AnimatedButton.displayName = 'AnimatedButton';

// Page transition wrapper
interface PageTransitionProps extends MotionDivProps {
  children?: ReactNode;
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
PageTransition.displayName = 'PageTransition';

// Collapsible panel animation
interface CollapsibleProps extends MotionDivProps {
  isOpen: boolean;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ isOpen, children, ...props }, ref) => (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  ),
);
Collapsible.displayName = 'Collapsible';

// Re-export motion and AnimatePresence for direct use
export { motion, AnimatePresence };
