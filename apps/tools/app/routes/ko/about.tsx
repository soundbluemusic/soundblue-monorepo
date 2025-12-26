import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';

export const meta: MetaFunction = () => [
  { title: '소개 | Tools' },
  {
    name: 'description',
    content: '뮤지션을 위한 무료 도구. 가입 없이. 추적 없이. 바로 사용.',
  },
];

const tools = [
  { icon: '⏱️', name: 'tools_metronome', href: '/ko/metronome' },
  { icon: '🥁', name: 'tools_drumMachine', href: '/ko/drum-machine' },
  { icon: '📱', name: 'tools_qrGenerator', href: '/ko/qr' },
  { icon: '🌐', name: 'tools_translator', href: '/ko/translator' },
] as const;

export default function AboutKo() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-24">
        {/* Hero - Minimal, centered */}
        <div className="mb-16 text-center sm:mb-24">
          <h1 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            {m['about_title']?.()}
          </h1>
          <p className="mx-auto max-w-md text-lg text-muted-foreground sm:text-xl">
            {m['about_tagline']?.()}
          </p>
        </div>

        {/* Tools Grid - 2x2, generous spacing */}
        <div className="grid w-full max-w-lg grid-cols-2 gap-4 sm:gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-border hover:bg-card sm:gap-4 sm:p-8"
            >
              <span className="text-3xl transition-transform group-hover:scale-110 sm:text-4xl">
                {tool.icon}
              </span>
              <span className="text-sm font-medium text-foreground sm:text-base">
                {m[tool.name]?.()}
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer appName="소개" />
    </div>
  );
}
