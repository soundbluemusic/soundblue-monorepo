import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';

export const meta: MetaFunction = () => [
  { title: 'About | Tools' },
  {
    name: 'description',
    content: 'We believe powerful tools should be accessible to everyone.',
  },
];

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="max-w-md text-center">
          <blockquote className="mb-12 text-2xl font-light leading-relaxed tracking-tight text-(--foreground) sm:text-3xl">
            "{m['about_missionText']?.()}"
          </blockquote>
          <div className="mx-auto mb-12 h-px w-16 bg-(--border)" />
          <p className="text-base text-(--muted-foreground) sm:text-lg">{m['about_intro']?.()}</p>
        </div>
      </main>
      <Footer appName="About" />
    </div>
  );
}
