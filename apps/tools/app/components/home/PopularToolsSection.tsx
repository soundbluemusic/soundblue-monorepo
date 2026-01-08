'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { Drum, FileText, QrCode, Timer } from 'lucide-react';
import { useNavigate } from 'react-router';
import m from '~/lib/messages';
import { ALL_TOOLS } from '~/lib/toolCategories';
import type { ToolType } from '~/stores/tool-store';

interface PopularToolsSectionProps {
  onToolClick: (toolId: ToolType) => void;
}

// Map tool IDs to icons and styling
const toolStyles: Record<
  string,
  { icon: React.ReactNode; colorClass: string; bgClass: string; gradient: string; hot: boolean }
> = {
  translator: {
    icon: <FileText className="h-5 w-5" />,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
    gradient: 'from-blue-500 to-cyan-400',
    hot: true,
  },
  metronome: {
    icon: <Timer className="h-5 w-5" />,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-900/30',
    gradient: 'from-purple-500 to-pink-400',
    hot: false,
  },
  drumMachine: {
    icon: <Drum className="h-5 w-5" />,
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-900/30',
    gradient: 'from-red-500 to-orange-400',
    hot: true,
  },
  qr: {
    icon: <QrCode className="h-5 w-5" />,
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-50 dark:bg-green-900/30',
    gradient: 'from-green-500 to-emerald-400',
    hot: false,
  },
};

export function PopularToolsSection({ onToolClick }: PopularToolsSectionProps) {
  const { locale, localizedPath } = useParaglideI18n();
  const navigate = useNavigate();

  const handleCardClick = (id: ToolType) => {
    onToolClick(id);
    const tool = ALL_TOOLS.find((t) => t.id === id);
    navigate(localizedPath(`/${tool?.slug ?? id}`));
  };

  return (
    <section className="pt-6">
      <div className="flex items-center justify-between px-4 pb-3 md:max-w-7xl md:mx-auto">
        <h2 className="text-lg font-bold leading-tight text-(--foreground) md:text-2xl">
          {m['home_popularTools']?.() ?? (locale === 'ko' ? '인기 도구' : 'Popular Tools')}
        </h2>
        <button
          type="button"
          className="text-sm font-medium text-(--primary) hover:text-(--primary)/80 transition-colors md:hidden"
        >
          {m['home_viewAll']?.() ?? (locale === 'ko' ? '모두 보기' : 'View All')}
        </button>
      </div>
      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 px-4 gap-4 snap-x md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:max-w-7xl md:mx-auto md:gap-6">
        {ALL_TOOLS.map((tool) => {
          const style = toolStyles[tool.id] ?? toolStyles.translator;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleCardClick(tool.id)}
              className="snap-start flex-none w-[280px] md:w-full rounded-2xl bg-(--card) shadow-sm ring-1 ring-(--border) overflow-hidden group cursor-pointer relative text-left hover:shadow-xl hover:ring-(--primary)/50 transition-all duration-300"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="h-24 md:h-32 w-full relative flex items-center justify-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${style.bgClass} ${style.colorClass} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {style.icon}
                </div>
                {style.hot && (
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white uppercase tracking-wider">
                    Hot
                  </div>
                )}
              </div>
              <div className="p-4 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-(--foreground) mb-1 md:text-lg">
                      {tool.name[locale]}
                    </h3>
                    <p className="text-sm text-(--muted-foreground)">{tool.description[locale]}</p>
                  </div>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${style.bgClass} ${style.colorClass}`}
                  >
                    {style.icon}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
