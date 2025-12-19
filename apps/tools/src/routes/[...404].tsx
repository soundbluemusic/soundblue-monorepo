import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';
import { buttonVariants } from '~/components/ui/button';
import { useLanguage } from '~/i18n/context';

export default function NotFound(): JSX.Element {
  const { t } = useLanguage();

  return (
    <>
      <Title>404 | Tools - SoundBlueMusic</Title>
      <main class="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
        <p class="text-[6rem] font-bold text-muted-foreground leading-none mb-4">
          {t().notFound.code}
        </p>
        <h1 class="text-2xl font-semibold text-foreground mb-4">{t().notFound.title}</h1>
        <p class="text-base text-muted-foreground mb-8 max-w-[400px]">{t().notFound.message}</p>
        <A href="/" class={buttonVariants({ variant: 'default', size: 'lg' })}>
          {t().notFound.backHome}
        </A>
      </main>
    </>
  );
}
