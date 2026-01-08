'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { Music, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router';
import m from '~/lib/messages';

export function CategorySection() {
  const { locale, localizedPath } = useParaglideI18n();
  const navigate = useNavigate();

  const categories = [
    {
      id: 'rhythm',
      name: { ko: '리듬', en: 'Rhythm' },
      icon: <Music className="h-7 w-7" />,
      colorClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-100 dark:bg-purple-500/20',
      tools: ['metronome', 'drum-machine'],
    },
    {
      id: 'utility',
      name: { ko: '유틸리티', en: 'Utility' },
      icon: <Wrench className="h-7 w-7" />,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-100 dark:bg-blue-500/20',
      tools: ['qr', 'translator'],
    },
  ];

  return (
    <section className="pt-6 px-4">
      <h2 className="text-lg font-bold leading-tight mb-3 text-(--foreground)">
        {m['home_categories']?.() ?? (locale === 'ko' ? '카테고리' : 'Categories')}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => navigate(localizedPath(`/${cat.tools[0]}`))}
            className="flex flex-col items-center justify-center gap-3 rounded-xl bg-(--card) p-6 shadow-sm ring-1 ring-(--border) active:scale-95 transition-transform hover:bg-(--muted)/50"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${cat.bgClass} ${cat.colorClass}`}
            >
              {cat.icon}
            </div>
            <span className="text-sm font-semibold text-(--foreground)">{cat.name[locale]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
