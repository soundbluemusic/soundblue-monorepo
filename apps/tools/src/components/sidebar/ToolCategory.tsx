import { ChevronDown } from 'lucide-solid';
import { type Component, createSignal, For, Show } from 'solid-js';
import { useLanguage } from '~/i18n';
import type { ToolCategory as ToolCategoryType } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import type { ToolType } from '~/stores/tool-store';
import { ToolItem } from './ToolItem';

// ========================================
// ToolCategory Component - 도구 카테고리 (접이식)
// ========================================

interface ToolCategoryProps {
  category: ToolCategoryType;
  onToolClick: (toolId: ToolType) => void;
  collapsed?: boolean;
}

export const ToolCategory: Component<ToolCategoryProps> = (props) => {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = createSignal(true);

  return (
    <div class="space-y-1">
      {/* Category Header */}
      <Show when={!props.collapsed}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen())}
          class={cn(
            'flex w-full items-center justify-between px-3 py-2 rounded-md',
            'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
            'hover:text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <span>{props.category.name[locale()]}</span>
          <ChevronDown class={cn('h-4 w-4 transition-transform', isOpen() && 'rotate-180')} />
        </button>
      </Show>

      {/* Tool List */}
      <Show when={isOpen() || props.collapsed}>
        <div class={cn('space-y-0.5', !props.collapsed && 'pl-1')}>
          <For each={props.category.tools}>
            {(tool) => (
              <ToolItem tool={tool} onClick={props.onToolClick} collapsed={props.collapsed} />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
