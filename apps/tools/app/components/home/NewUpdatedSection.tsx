'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { ChevronRight, Drum, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router';
import m from '~/lib/messages';
import { ALL_TOOLS } from '~/lib/toolCategories';
import type { ToolType } from '~/stores/tool-store';

interface NewUpdatedSectionProps {
  onToolClick: (id: ToolType) => void;
}

// Define which tools are new/updated with their styling
const toolMeta: Record<
  string,
  {
    icon: React.ReactNode;
    bgClass: string;
    textClass: string;
    tag: 'new' | 'updated';
    tagClass: string;
  }
> = {
  drumMachine: {
    icon: <Drum className="h-6 w-6" />,
    bgClass: 'bg-red-100 dark:bg-red-500/20',
    textClass: 'text-red-600 dark:text-red-400',
    tag: 'new',
    tagClass: 'bg-primary/20 text-primary',
  },
  qr: {
    icon: <QrCode className="h-6 w-6" />,
    bgClass: 'bg-green-100 dark:bg-green-500/20',
    textClass: 'text-green-600 dark:text-green-400',
    tag: 'updated',
    tagClass: 'bg-emerald-500/20 text-emerald-500',
  },
};

const featureedToolIds: ToolType[] = ['drumMachine', 'qr'];

export function NewUpdatedSection({ onToolClick }: NewUpdatedSectionProps) {
  const { locale, localizedPath } = useParaglideI18n();
  const navigate = useNavigate();

  const handleClick = (toolId: ToolType, slug: string) => {
    onToolClick(toolId);
    navigate(localizedPath(`/${slug}`));
  };

  const tagLabels = {
    new: locale === 'ko' ? '새로운' : 'New',
    updated: locale === 'ko' ? '업데이트됨' : 'Updated',
  };

  return (
    <section className="pt-6 px-4 mb-24">
      <h2 className="text-lg font-bold leading-tight mb-3 text-foreground">
        {m['home_newUpdated']?.() ??
          (locale === 'ko' ? '새로운 소식 및 업데이트' : 'New & Updated')}
      </h2>
      <div className="flex flex-col gap-3">
        {featureedToolIds.map((toolId) => {
          const tool = ALL_TOOLS.find((t) => t.id === toolId);
          const meta = toolMeta[toolId];
          if (!tool || !meta) return null;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleClick(tool.id, tool.slug)}
              className="flex items-center gap-4 rounded-xl bg-card p-3 shadow-sm ring-1 ring-border hover:bg-muted/50 cursor-pointer transition-colors text-left"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${meta.bgClass} ${meta.textClass}`}
              >
                {meta.icon}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {tool.name[locale]}
                  </h4>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.tagClass}`}
                  >
                    {tagLabels[meta.tag]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{tool.description[locale]}</p>
              </div>
              <div className="text-muted-foreground">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
