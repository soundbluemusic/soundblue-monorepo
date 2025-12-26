import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import m from '~/lib/messages';

export const meta: MetaFunction = () => [
  { title: 'About | Tools' },
  {
    name: 'description',
    content: 'About SoundBlueMusic Tools - Free browser-based utilities for musicians.',
  },
];

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{m['about_title']?.()}</h1>
          <p className="mb-8 text-muted-foreground">{m['about_intro']?.()}</p>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{m['about_mission']?.()}</h2>
            <p className="text-muted-foreground">{m['about_missionText']?.()}</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{m['about_toolsSection']?.()}</h2>
            <p className="mb-4 text-muted-foreground">{m['about_toolsIntro']?.()}</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• {m['tools_metronome']?.()}</li>
              <li>• {m['tools_drumMachine']?.()}</li>
              <li>• {m['tools_qrGenerator']?.()}</li>
              <li>• {m['tools_translator']?.()}</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer appName="About" />
    </div>
  );
}
