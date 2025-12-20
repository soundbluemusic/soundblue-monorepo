import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'Tools | SoundBlueMusic' },
  { name: 'description', content: 'Free music tools - Metronome, Drum Machine, QR Generator' },
];

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">{t.brand}</h1>
        <p className="text-lg text-muted-foreground mb-8">{t.tools.placeholder.title}</p>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <ToolCard href="/metronome" title={t.tools.metronome} />
          <ToolCard href="/drumMachine" title={t.tools.drumMachine} />
          <ToolCard href="/qr" title={t.tools.qrGenerator} />
          <ToolCard href="/translator" title={t.tools.translator} />
        </div>
      </div>
    </div>
  );
}

function ToolCard({ href, title }: { href: string; title: string }) {
  return (
    <a
      href={href}
      className="p-4 rounded-lg border border-border bg-card hover:bg-accent/10 transition-colors text-center"
    >
      <span className="font-medium">{title}</span>
    </a>
  );
}
