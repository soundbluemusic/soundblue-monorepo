import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'About | Tools' },
  {
    name: 'description',
    content: 'About SoundBlueMusic Tools - Free browser-based utilities for musicians.',
  },
];

export default function About() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t.about.title}</h1>
        <p className="text-muted-foreground mb-8">{t.about.intro}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.about.mission}</h2>
          <p className="text-muted-foreground">{t.about.missionText}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.about.toolsSection}</h2>
          <p className="text-muted-foreground mb-4">{t.about.toolsIntro}</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• {t.tools.metronome}</li>
            <li>• {t.tools.drumMachine}</li>
            <li>• {t.tools.qrGenerator}</li>
            <li>• {t.tools.translator}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
