/**
 * @fileoverview Info panel component for site Q&A chat.
 *
 * Displays relevant page information based on the detected topic from chat.
 * Replaces the previous ToolLinkPanel with site-focused content.
 */

import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { useLanguage } from '~/components/providers';
import {
  AboutIcon,
  BuiltWithIcon,
  HelpIcon,
  HomeIcon,
  SitemapIcon,
  SoundRecordingIcon,
} from '~/constants/icons';
import { EXTERNAL_NAV_ITEMS, NAV_ITEMS } from '~/constants/navigation';

/** Topic types for site Q&A */
export type TopicType =
  | 'about'
  | 'music'
  | 'license'
  | 'soundRecording'
  | 'contact'
  | 'builtWith'
  | 'navigation'
  | 'help'
  | null;

/** Non-null topic type (excludes null) */
type NonNullTopicType = Exclude<TopicType, null>;

/** Topic types that show detailed info (excludes 'help' which shows navigation) */
type DetailedTopicType = Exclude<NonNullTopicType, 'help'>;

/** Topic info structure from translations */
interface TopicInfo {
  title: string;
  summary: string;
}

interface InfoPanelProps {
  selectedTopic: TopicType;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a topic is a detailed topic (not null or 'help').
 * Replaces type assertions with runtime type checking.
 *
 * @param topic - The topic to check
 * @returns true if topic is a DetailedTopicType
 */
function isDetailedTopic(topic: TopicType): topic is DetailedTopicType {
  return topic !== null && topic !== 'help';
}

/**
 * Type guard to check if a topic is a non-null topic.
 *
 * @param topic - The topic to check
 * @returns true if topic is not null
 */
function isNonNullTopic(topic: TopicType): topic is NonNullTopicType {
  return topic !== null;
}

/** Icon mapping for each topic */
const TOPIC_ICONS: Record<NonNullTopicType, () => JSX.Element> = {
  about: () => <AboutIcon class="w-12 h-12" />,
  music: () => <SoundRecordingIcon class="w-12 h-12" />,
  license: () => (
    <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  soundRecording: () => <SoundRecordingIcon class="w-12 h-12" />,
  contact: () => (
    <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  builtWith: () => <BuiltWithIcon class="w-12 h-12" />,
  navigation: () => <SitemapIcon class="w-12 h-12" />,
  help: () => <HelpIcon class="w-12 h-12" />,
};

/** Page path mapping for each topic */
const TOPIC_PAGES: Record<NonNullTopicType, string> = {
  about: '/about',
  music: '/about',
  license: '/license',
  soundRecording: '/sound-recording',
  contact: '/about',
  builtWith: '/built-with',
  navigation: '/sitemap',
  help: '/sitemap',
};

export function InfoPanel(props: InfoPanelProps): JSX.Element {
  const { t, localizedPath } = useLanguage();

  /**
   * Get topic info for the selected topic (excluding help topic).
   * Uses type guard instead of type assertion for type safety.
   * @returns Topic info object with title and summary, or null if no detailed topic is selected
   */
  const topicInfo = (): TopicInfo | null => {
    const topic = props.selectedTopic;
    if (!isDetailedTopic(topic)) return null;
    // Type is now narrowed to DetailedTopicType - no assertion needed
    return t().chat.topics[topic];
  };

  /**
   * Get the localized page path for the selected topic.
   * Uses type guard for type safety.
   * @returns Localized URL path for the topic's page
   */
  const pagePath = (): string => {
    const topic = props.selectedTopic;
    if (!isNonNullTopic(topic)) return '';
    return localizedPath(TOPIC_PAGES[topic]);
  };

  /**
   * Check if the selected topic is the help topic.
   * @returns true if help topic is selected
   */
  const isHelpTopic = (): boolean => props.selectedTopic === 'help';

  return (
    <div class="flex flex-col w-full h-full bg-surface border-l border-line">
      <div class="flex items-center h-14 px-4 border-b border-line shrink-0">
        <h2 class="text-sm font-semibold text-content">{t().chat.infoPanel.title}</h2>
      </div>

      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Show
          when={props.selectedTopic}
          fallback={
            <div class="flex-1 flex items-center justify-center p-6">
              <div class="text-center text-content-muted">
                <HomeIcon class="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p class="text-sm">{t().chat.infoPanel.selectPrompt}</p>
              </div>
            </div>
          }
        >
          <Show
            when={isHelpTopic()}
            fallback={
              <div class="flex-1 flex items-center justify-center p-6">
                <div class="text-center">
                  <div class="inline-flex items-center justify-center w-20 h-20 mb-4 bg-accent/10 text-accent rounded-2xl">
                    {props.selectedTopic && TOPIC_ICONS[props.selectedTopic]()}
                  </div>
                  <h3 class="text-lg font-semibold text-content mb-2">{topicInfo()?.title}</h3>
                  <p class="text-sm text-content-muted mb-6 max-w-xs">{topicInfo()?.summary}</p>
                  <A
                    href={pagePath()}
                    class="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  >
                    {t().chat.infoPanel.viewPage}
                  </A>
                </div>
              </div>
            }
          >
            {/* Help topic: Show all site navigation with descriptions */}
            <div class="flex-1 overflow-y-auto p-4">
              <div class="mb-4">
                <h3 class="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">
                  {t().chat.infoPanel.sitePages}
                </h3>
                <nav class="space-y-2">
                  <For each={NAV_ITEMS}>
                    {(item) => (
                      <A
                        href={localizedPath(item.path)}
                        class="flex items-start gap-3 px-3 py-3 rounded-lg text-content hover:bg-interactive-hover transition-colors duration-150"
                      >
                        <span class="w-5 h-5 text-content-muted mt-0.5 shrink-0">
                          {item.icon()}
                        </span>
                        <div class="flex flex-col gap-0.5 min-w-0">
                          <span class="text-sm font-medium">{t().nav[item.labelKey]}</span>
                          <span class="text-xs text-content-muted">
                            {t().pageDescriptions[item.labelKey]}
                          </span>
                        </div>
                      </A>
                    )}
                  </For>
                </nav>
              </div>

              <Show when={EXTERNAL_NAV_ITEMS.length > 0}>
                <div class="pt-4 border-t border-line">
                  <h3 class="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">
                    {t().chat.infoPanel.externalLinks}
                  </h3>
                  <nav class="space-y-2">
                    <For each={EXTERNAL_NAV_ITEMS}>
                      {(item) => (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex items-start gap-3 px-3 py-3 rounded-lg text-content hover:bg-interactive-hover transition-colors duration-150"
                        >
                          <span class="w-5 h-5 text-content-muted mt-0.5 shrink-0">
                            {item.icon()}
                          </span>
                          <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span class="text-sm font-medium">
                              {t().externalLinks[item.labelKey]}
                            </span>
                          </div>
                          <svg
                            class="w-3.5 h-3.5 text-content-muted mt-0.5 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </For>
                  </nav>
                </div>
              </Show>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}
