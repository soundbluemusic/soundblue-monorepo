'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '~/lib/utils';

/**
 * A section within the tool guide
 */
export interface ToolGuideSection {
  /** Section title (e.g., "Usage", "Buttons") */
  title: string;
  /** List of items in this section */
  items: string[];
}

/**
 * Props for the ToolGuide component
 */
export interface ToolGuideProps {
  /** Collapsible header title */
  title: string;
  /** Sections containing guide content */
  sections: ToolGuideSection[];
  /** Additional CSS classes */
  className?: string;
  /** Default open state */
  defaultOpen?: boolean;
}

/**
 * Collapsible tool guide component
 *
 * Displays usage instructions, button descriptions, and tips
 * for each tool in a collapsible accordion format.
 *
 * @example
 * ```tsx
 * <ToolGuide
 *   title="사용 안내"
 *   sections={[
 *     { title: "이 도구는", items: ["BPM 기반 딜레이 계산", "음악 제작 시 유용"] },
 *     { title: "사용 방법", items: ["BPM 입력", "값 클릭하여 복사"] },
 *     { title: "버튼 설명", items: ["TAP: 박자 탭으로 BPM 감지", "Reset: 초기화"] },
 *   ]}
 * />
 * ```
 */
export function ToolGuide({ title, sections, className, defaultOpen = false }: ToolGuideProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('mt-4 border-t border-border pt-3', className)}>
      {/* Collapsible Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-expanded={isOpen}
        aria-controls="tool-guide-content"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          {title}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {/* Collapsible Content */}
      <div
        id="tool-guide-content"
        className={cn(
          'grid transition-all duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 px-3 pb-2 pt-3">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h4 className="mb-1.5 text-xs font-medium text-foreground">{section.title}</h4>
                <ul className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/50" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
