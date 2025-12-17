import { Link, Meta, Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { Activity, Drum, Languages, QrCode } from 'lucide-solid';
import type { Component, JSX } from 'solid-js';
import { Footer } from '@soundblue/shared';
import { Header } from '~/components/layout/Header';
import { useLanguage } from '~/i18n';

const SITE_URL = 'https://tools.soundbluemusic.com';

// ========================================
// About Page - 소개 페이지
// ========================================

interface ToolInfo {
  id: string;
  nameKey: 'metronome' | 'drumMachine' | 'qrGenerator' | 'translator';
  descKey: 'metronomeDesc' | 'drumMachineDesc' | 'qrGeneratorDesc' | 'translatorDesc';
  icon: () => JSX.Element;
  href: string;
}

const TOOLS: ToolInfo[] = [
  {
    id: 'metronome',
    nameKey: 'metronome',
    descKey: 'metronomeDesc',
    icon: () => <Activity class="h-6 w-6" />,
    href: '/metronome',
  },
  {
    id: 'drum-machine',
    nameKey: 'drumMachine',
    descKey: 'drumMachineDesc',
    icon: () => <Drum class="h-6 w-6" />,
    href: '/drum-machine',
  },
  {
    id: 'qr-generator',
    nameKey: 'qrGenerator',
    descKey: 'qrGeneratorDesc',
    icon: () => <QrCode class="h-6 w-6" />,
    href: '/qr-generator',
  },
  {
    id: 'translator',
    nameKey: 'translator',
    descKey: 'translatorDesc',
    icon: () => <Languages class="h-6 w-6" />,
    href: '/translator',
  },
];

interface AboutTranslations {
  title: string;
  intro: string;
  mission: string;
  missionText: string;
  toolsSection: string;
  toolsIntro: string;
  metronomeDesc: string;
  drumMachineDesc: string;
  qrGeneratorDesc: string;
  translatorDesc: string;
  logoSection: string;
  logoStory: string;
  logoColor: string;
  logoColorDesc: string;
  logoDesign: string;
  logoDesignDesc: string;
  openSource: string;
  openSourceText: string;
}

interface ToolTranslations {
  metronome: string;
  drumMachine: string;
  qrGenerator: string;
  translator: string;
}

const ToolCard: Component<{
  tool: ToolInfo;
  toolNames: ToolTranslations;
  about: AboutTranslations;
  basePath: string;
}> = (props) => {
  const toolName = () => props.toolNames[props.tool.nameKey];
  const toolDesc = () => props.about[props.tool.descKey];
  const toolHref = () => `${props.basePath}${props.tool.href}`;

  return (
    <A
      href={toolHref()}
      class="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
    >
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {props.tool.icon()}
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-foreground group-hover:text-primary transition-colors">
            {toolName()}
          </h3>
          <p class="text-sm text-muted-foreground mt-1">{toolDesc()}</p>
        </div>
      </div>
    </A>
  );
};

export default function AboutPage() {
  const { t, locale } = useLanguage();

  const about = (): AboutTranslations => t().about as AboutTranslations;
  const tools = (): ToolTranslations => ({
    metronome: t().tools.metronome,
    drumMachine: t().tools.drumMachine,
    qrGenerator: t().tools.qrGenerator,
    translator: t().tools.translator,
  });
  const isKorean = () => locale() === 'ko';
  const basePath = () => (isKorean() ? '/ko' : '');
  const currentUrl = () => (isKorean() ? `${SITE_URL}/ko/about` : `${SITE_URL}/about`);

  return (
    <>
      <Title>{about().title} - Tools</Title>
      <Meta name="description" content={about().intro} />
      <Link rel="canonical" href={currentUrl()} />
      {/* Alternate Languages */}
      <Link rel="alternate" hreflang="en" href={`${SITE_URL}/about`} />
      <Link rel="alternate" hreflang="ko" href={`${SITE_URL}/ko/about`} />
      <Link rel="alternate" hreflang="x-default" href={`${SITE_URL}/about`} />
      {/* Open Graph */}
      <Meta property="og:title" content={`${about().title} - Tools`} />
      <Meta property="og:description" content={about().intro} />
      <Meta property="og:url" content={currentUrl()} />

      <div class="flex h-screen flex-col bg-background">
        {/* Shared Header */}
        <Header />

        {/* Content */}
        <main class="flex-1 overflow-auto px-4 py-8">
          <div class="mx-auto max-w-2xl">
            {/* Intro */}
            <p class="text-muted-foreground mb-8 text-lg">{about().intro}</p>

            {/* Mission */}
            <section class="mb-10">
              <h2 class="text-xl font-semibold mb-3 text-foreground">{about().mission}</h2>
              <p class="text-muted-foreground">{about().missionText}</p>
            </section>

            {/* Tools */}
            <section class="mb-10">
              <h2 class="text-xl font-semibold mb-3 text-foreground">{about().toolsSection}</h2>
              <p class="text-muted-foreground mb-4">{about().toolsIntro}</p>
              <div class="grid gap-3">
                {TOOLS.map((tool) => (
                  <ToolCard tool={tool} toolNames={tools()} about={about()} basePath={basePath()} />
                ))}
              </div>
            </section>

            {/* Logo Section */}
            <section class="mb-10">
              <h2 class="text-xl font-semibold mb-3 text-foreground">{about().logoSection}</h2>
              <p class="text-muted-foreground mb-4">{about().logoStory}</p>

              {/* Logo Color */}
              <div class="p-4 rounded-lg border border-border mb-4">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-10 h-10 rounded-md"
                    style={{ 'background-color': '#3B82F6' }}
                    role="img"
                    aria-label="Sound Blue color swatch"
                  />
                  <h3 class="font-medium text-foreground">{about().logoColor}</h3>
                </div>
                <p class="text-sm text-muted-foreground">{about().logoColorDesc}</p>
              </div>

              {/* Design Philosophy */}
              <div class="p-4 rounded-lg border border-border">
                <h3 class="font-medium text-foreground mb-2">{about().logoDesign}</h3>
                <p class="text-sm text-muted-foreground">{about().logoDesignDesc}</p>
              </div>
            </section>

            {/* Open Source */}
            <section class="mb-10">
              <h2 class="text-xl font-semibold mb-3 text-foreground">{about().openSource}</h2>
              <p class="text-muted-foreground">
                {about().openSourceText}{' '}
                <a
                  href="https://github.com/soundbluemusic/tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline"
                >
                  GitHub
                </a>
              </p>
            </section>

            {/* Footer note */}
            <div class="mt-12 pt-8 border-t text-center">
              <p class="text-sm text-muted-foreground">
                Made with ❤️ by{' '}
                <a
                  href="https://soundbluemusic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline"
                >
                  SoundBlueMusic
                </a>
              </p>
            </div>
          </div>
        </main>

        {/* Shared Footer */}
        <Footer appName="Tools" tagline="UI/UX based on web standards" />
      </div>
    </>
  );
}
