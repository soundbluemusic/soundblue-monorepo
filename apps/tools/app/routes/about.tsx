import type { MetaFunction } from 'react-router';
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
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{m['about.title']?.()}</h1>
        <p className="text-muted-foreground mb-8">{m['about.intro']?.()}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['about.mission']?.()}</h2>
          <p className="text-muted-foreground">{m['about.missionText']?.()}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{m['about.toolsSection']?.()}</h2>
          <p className="text-muted-foreground mb-4">{m['about.toolsIntro']?.()}</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• {m['tools.metronome']?.()}</li>
            <li>• {m['tools.drumMachine']?.()}</li>
            <li>• {m['tools.qrGenerator']?.()}</li>
            <li>• {m['tools.translator']?.()}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
