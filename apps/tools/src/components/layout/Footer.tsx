import type { Component } from 'solid-js';

// ========================================
// Footer Component - 푸터
// ========================================

export const Footer: Component = () => {
  return (
    <footer class="border-t bg-background px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <p class="text-center text-xs text-muted-foreground">UI/UX based on web standards</p>
      <p class="text-center text-xs text-muted-foreground">
        Tools by{' '}
        <a
          href="https://soundbluemusic.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary transition-all duration-200 hover:underline hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          SoundBlueMusic
        </a>
      </p>
    </footer>
  );
};
