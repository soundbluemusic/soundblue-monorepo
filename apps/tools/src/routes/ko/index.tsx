import { Link, Meta, Title } from '@solidjs/meta';
import { onMount } from 'solid-js';
import { HomeLayout } from '@/components/layout';
import { toolActions } from '@/stores/tool-store';

// Import tools to trigger registration
import '@/tools';

const SITE_URL = 'https://tools.soundbluemusic.com';

// Pre-render Korean home page for static export
export function prerenderedPaths() {
  return ['/ko'];
}

export default function KoHome() {
  // Close any open tool when navigating to home
  onMount(() => {
    toolActions.closeTool();
  });

  return (
    <>
      <Title>Tools - SoundBlueMusic</Title>
      <Meta
        name="description"
        content="음악가와 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구. Pro-grade Web DAW, Rhythm Game & Creative Tools."
      />
      <Link rel="canonical" href={`${SITE_URL}/ko`} />
      {/* Open Graph */}
      <Meta property="og:url" content={`${SITE_URL}/ko`} />
      {/* Alternate Languages */}
      <Link rel="alternate" hreflang="en" href={SITE_URL} />
      <Link rel="alternate" hreflang="ko" href={`${SITE_URL}/ko`} />
      <Link rel="alternate" hreflang="x-default" href={SITE_URL} />
      <HomeLayout />
    </>
  );
}
