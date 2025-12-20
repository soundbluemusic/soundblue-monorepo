import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';
import { useLanguage } from '~/components/providers';
import { buttonVariants } from '~/components/ui';

export default function NotFound(): JSX.Element {
  const { t, localizedPath } = useLanguage();

  return (
    <>
      <Title>404 | Sound Blue</Title>
      <main class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 text-center">
        <p class="text-[6rem] font-bold text-content-subtle leading-none mb-4">
          {t().notFound.code}
        </p>
        <h1 class="text-2xl font-semibold text-content mb-4">{t().notFound.title}</h1>
        <p class="text-base text-content-muted mb-8 max-w-[400px]">{t().notFound.message}</p>
        <A href={localizedPath('/')} class={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {t().notFound.backHome}
        </A>
      </main>
    </>
  );
}
