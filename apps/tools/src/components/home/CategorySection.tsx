'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { useNavigate } from '@tanstack/react-router';
import { Megaphone, Music, Paintbrush, PenTool } from 'lucide-react';
import m from '~/lib/messages';
import { TOOL_CATEGORIES } from '~/lib/toolCategories';

// Category icons and colors
const CATEGORY_STYLES: Record<
  string,
  { icon: React.ReactNode; colorClass: string; bgClass: string }
> = {
  musicians: {
    icon: <Music className="h-7 w-7" />,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-100 dark:bg-purple-500/20',
  },
  writers: {
    icon: <PenTool className="h-7 w-7" />,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-500/20',
  },
  designers: {
    icon: <Paintbrush className="h-7 w-7" />,
    colorClass: 'text-pink-600 dark:text-pink-400',
    bgClass: 'bg-pink-100 dark:bg-pink-500/20',
  },
  marketers: {
    icon: <Megaphone className="h-7 w-7" />,
    colorClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-100 dark:bg-orange-500/20',
  },
};

export function CategorySection() {
  const { locale, localizedPath } = useParaglideI18n();
  const navigate = useNavigate();

  return (
    <section className="pt-6 px-4">
      <h2 className="text-lg font-bold leading-tight mb-3 text-foreground">
        {m['home_categories']?.() ?? (locale === 'ko' ? '카테고리' : 'Categories')}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {TOOL_CATEGORIES.map((category) => {
          const style = CATEGORY_STYLES[category.id] ?? CATEGORY_STYLES.musicians;
          const firstTool = category.tools[0];

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => navigate({ to: localizedPath(`/${firstTool.slug}`) })}
              className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border active:scale-95 transition-transform hover:bg-muted/50"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${style.bgClass} ${style.colorClass}`}
              >
                {style.icon}
              </div>
              <span className="text-sm font-semibold text-foreground text-center">
                {category.name[locale]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
