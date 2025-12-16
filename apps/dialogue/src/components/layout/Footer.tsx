import type { Component } from "solid-js";

// ========================================
// Footer Component - 푸터
// ========================================

export const Footer: Component = () => {
  return (
    <footer class="border-t border-border bg-bg-secondary px-4 py-2">
      <p class="text-center text-xs text-text-muted">UI/UX based on web standards</p>
      <p class="text-center text-xs text-text-muted">
        Dialogue by{" "}
        <a
          href="https://soundbluemusic.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent transition-all duration-200 hover:underline hover:opacity-80"
        >
          SoundBlueMusic
        </a>
      </p>
    </footer>
  );
};
