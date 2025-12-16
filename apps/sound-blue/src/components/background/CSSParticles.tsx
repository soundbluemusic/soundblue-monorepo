import type { JSX } from 'solid-js';

/**
 * Pure CSS particle background - no JavaScript, no click blocking issues
 */
export function CSSParticles(): JSX.Element {
  return (
    <div class="css-particles" aria-hidden="true">
      <div class="particle particle-1" />
      <div class="particle particle-2" />
      <div class="particle particle-3" />
      <div class="particle particle-4" />
      <div class="particle particle-5" />
      <div class="particle particle-6" />
      <div class="particle particle-7" />
      <div class="particle particle-8" />
      <div class="particle particle-9" />
      <div class="particle particle-10" />
      <div class="particle particle-11" />
      <div class="particle particle-12" />
    </div>
  );
}
