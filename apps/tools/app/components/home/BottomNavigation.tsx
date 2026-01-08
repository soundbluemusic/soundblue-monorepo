'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { Grid, Home, Settings, Star } from 'lucide-react';

export function BottomNavigation() {
  const { locale } = useParaglideI18n();

  const labels = {
    home: locale === 'ko' ? '홈' : 'Home',
    favorites: locale === 'ko' ? '즐겨찾기' : 'Favorites',
    allTools: locale === 'ko' ? '모든 도구' : 'All Tools',
    settings: locale === 'ko' ? '설정' : 'Settings',
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-(--background)/80 backdrop-blur-xl border-t border-(--border) safe-area-inset">
      <div className="flex items-center justify-around h-16 pb-2">
        <button
          type="button"
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-(--primary)"
        >
          <Home className="h-6 w-6 fill-current" />
          <span className="text-[10px] font-medium">{labels.home}</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
        >
          <Star className="h-6 w-6" />
          <span className="text-[10px] font-medium">{labels.favorites}</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
        >
          <Grid className="h-6 w-6" />
          <span className="text-[10px] font-medium">{labels.allTools}</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
        >
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-medium">{labels.settings}</span>
        </button>
      </div>
    </nav>
  );
}
