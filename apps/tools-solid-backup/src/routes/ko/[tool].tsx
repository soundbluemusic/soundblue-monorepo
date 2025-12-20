import { Link, Meta, Title } from '@solidjs/meta';
import { useNavigate, useParams } from '@solidjs/router';
import { onMount, Show } from 'solid-js';
import { MainLayout } from '~/components/layout';
import { useLanguage } from '~/i18n';
import { ALL_TOOLS, getToolBySlug } from '~/lib/toolCategories';
import { toolActions } from '~/stores/tool-store';

// Import tools to trigger registration
import '~/tools';

const SITE_URL = 'https://tools.soundbluemusic.com';

export default function KoToolPage() {
  const params = useParams<{ tool: string }>();
  const navigate = useNavigate();
  const { locale } = useLanguage();

  const toolInfo = () => getToolBySlug(params.tool);

  onMount(() => {
    const tool = toolInfo();
    if (tool) {
      // Auto-open the tool
      toolActions.openTool(tool.id);
    } else {
      // Invalid tool slug - redirect to Korean home
      navigate('/ko', { replace: true });
    }
  });

  return (
    <Show when={toolInfo()} fallback={null}>
      {(tool) => (
        <>
          <Title>{tool().name[locale()]} - Tools</Title>
          <Meta name="description" content={tool().description[locale()]} />
          <Link rel="canonical" href={`${SITE_URL}/ko/${tool().slug}`} />
          {/* Alternate Languages */}
          <Link rel="alternate" hreflang="en" href={`${SITE_URL}/${tool().slug}`} />
          <Link rel="alternate" hreflang="ko" href={`${SITE_URL}/ko/${tool().slug}`} />
          <Link rel="alternate" hreflang="x-default" href={`${SITE_URL}/${tool().slug}`} />
          {/* Open Graph */}
          <Meta property="og:title" content={`${tool().name[locale()]} - Tools`} />
          <Meta property="og:description" content={tool().description[locale()]} />
          <Meta property="og:type" content="website" />
          <Meta property="og:url" content={`${SITE_URL}/ko/${tool().slug}`} />
          {/* Twitter Card */}
          <Meta name="twitter:card" content="summary_large_image" />
          <Meta name="twitter:title" content={`${tool().name[locale()]} - Tools`} />
          <Meta name="twitter:description" content={tool().description[locale()]} />
          <MainLayout />
        </>
      )}
    </Show>
  );
}

// Pre-render all Korean tool pages for static export
export function prerenderedPaths() {
  return ALL_TOOLS.map((tool) => `/ko/${tool.slug}`);
}
