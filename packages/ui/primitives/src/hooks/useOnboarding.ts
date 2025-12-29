/**
 * @fileoverview useOnboarding hook for managing onboarding tours
 *
 * Provides state management for first-time user onboarding tours.
 * Persists completion status to localStorage.
 *
 * @module @soundblue/shared-react/hooks/useOnboarding
 *
 * @example
 * ```tsx
 * const { isFirstVisit, currentStep, nextStep, prevStep, skip, complete } = useOnboarding('my-app');
 *
 * if (isFirstVisit && currentStep === 0) {
 *   return <OnboardingStep1 onNext={nextStep} onSkip={skip} />;
 * }
 * ```
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface OnboardingStep {
  id: string;
  target?: string; // CSS selector for highlighting
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface UseOnboardingOptions {
  /** Unique key for this onboarding tour */
  tourId: string;
  /** Steps in the tour */
  steps: OnboardingStep[];
  /** Callback when tour completes */
  onComplete?: () => void;
  /** Callback when tour is skipped */
  onSkip?: () => void;
}

export interface UseOnboardingReturn {
  /** Whether this is the first visit (tour not completed) */
  isFirstVisit: boolean;
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Current step index */
  currentStep: number;
  /** Current step data */
  currentStepData: OnboardingStep | null;
  /** Total number of steps */
  totalSteps: number;
  /** Start the tour */
  start: () => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  prevStep: () => void;
  /** Skip the entire tour */
  skip: () => void;
  /** Complete the tour */
  complete: () => void;
  /** Reset the tour (for testing) */
  reset: () => void;
}

const STORAGE_PREFIX = 'onboarding-completed-';

function getStorageKey(tourId: string): string {
  return `${STORAGE_PREFIX}${tourId}`;
}

export function useOnboarding(options: UseOnboardingOptions): UseOnboardingReturn {
  const { tourId, steps, onComplete, onSkip } = options;

  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;

    const completed = localStorage.getItem(getStorageKey(tourId));
    if (completed === 'true') {
      setIsFirstVisit(false);
    } else {
      setIsFirstVisit(true);
      // Auto-start on first visit
      setIsActive(true);
    }
  }, [tourId]);

  const start = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last step - complete
      setIsActive(false);
      setIsFirstVisit(false);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(getStorageKey(tourId), 'true');
      }
      onComplete?.();
    }
  }, [currentStep, steps.length, tourId, onComplete]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsActive(false);
    setIsFirstVisit(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(getStorageKey(tourId), 'true');
    }
    onSkip?.();
  }, [tourId, onSkip]);

  const complete = useCallback(() => {
    setIsActive(false);
    setIsFirstVisit(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(getStorageKey(tourId), 'true');
    }
    onComplete?.();
  }, [tourId, onComplete]);

  const reset = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(getStorageKey(tourId));
    }
    setIsFirstVisit(true);
    setIsActive(true);
    setCurrentStep(0);
  }, [tourId]);

  const currentStepData = useMemo(() => {
    return steps[currentStep] ?? null;
  }, [steps, currentStep]);

  return {
    isFirstVisit,
    isActive,
    currentStep,
    currentStepData,
    totalSteps: steps.length,
    start,
    nextStep,
    prevStep,
    skip,
    complete,
    reset,
  };
}
