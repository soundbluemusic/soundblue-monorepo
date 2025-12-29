/**
 * @fileoverview Onboarding tooltip component
 *
 * A tooltip that highlights elements during onboarding tours.
 *
 * @module @soundblue/shared-react/components/ui/OnboardingTooltip
 */

import { useEffect, useState } from 'react';
import type { OnboardingStep } from '../../hooks/useOnboarding';
import { Button } from './Button';

export interface OnboardingTooltipProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  nextLabel?: string;
  prevLabel?: string;
  skipLabel?: string;
  finishLabel?: string;
}

export function OnboardingTooltip({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  nextLabel = 'Next',
  prevLabel = 'Previous',
  skipLabel = 'Skip',
  finishLabel = 'Finish',
}: OnboardingTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Position the tooltip near the target element
  useEffect(() => {
    if (!step.target) {
      // Center on screen if no target
      setPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 160,
      });
      return;
    }

    const targetEl = document.querySelector(step.target);
    if (!targetEl) {
      setPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 160,
      });
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const placement = step.placement ?? 'bottom';

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top - 140;
        left = rect.left + rect.width / 2 - 160;
        break;
      case 'bottom':
        top = rect.bottom + 16;
        left = rect.left + rect.width / 2 - 160;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - 70;
        left = rect.left - 336;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - 70;
        left = rect.right + 16;
        break;
    }

    // Keep within viewport
    top = Math.max(16, Math.min(top, window.innerHeight - 200));
    left = Math.max(16, Math.min(left, window.innerWidth - 336));

    setPosition({ top, left });

    // Scroll target into view
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [step]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onSkip} aria-hidden="true" />

      {/* Highlight target element */}
      {step.target && <TargetHighlight selector={step.target} />}

      {/* Tooltip */}
      <div
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-content"
        className="
          fixed z-50 w-80 p-4 rounded-(--radius-xl, 16px)
          bg-(--color-bg-elevated, #ffffff)
          shadow-(--shadow-xl, 0 25px 50px rgba(0,0,0,0.25))
          animate-scale-in
        "
        style={{ top: position.top, left: position.left }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-(--color-text-muted, #9ca3af)">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-(--color-text-tertiary, #6b7280) hover:underline"
          >
            {skipLabel}
          </button>
        </div>

        {/* Content */}
        <h3
          id="onboarding-title"
          className="text-base font-semibold text-(--color-text-primary, #111827) mb-2"
        >
          {step.title}
        </h3>
        <p id="onboarding-content" className="text-sm text-(--color-text-secondary, #6b7280) mb-4">
          {step.content}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep
                  ? 'bg-(--color-accent-primary, #3b82f6)'
                  : 'bg-(--color-bg-tertiary, #e2e4e8)'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onPrev} disabled={isFirstStep}>
            {prevLabel}
          </Button>
          <Button variant="primary" size="sm" onClick={onNext}>
            {isLastStep ? finishLabel : nextLabel}
          </Button>
        </div>
      </div>
    </>
  );
}

/**
 * Highlights the target element with a box
 */
function TargetHighlight({ selector }: { selector: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = document.querySelector(selector);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [selector]);

  if (!rect) return null;

  return (
    <div
      className="fixed z-45 pointer-events-none border-2 border-(--color-accent-primary, #3b82f6) rounded-(--radius-md, 6px)"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)',
      }}
    />
  );
}
