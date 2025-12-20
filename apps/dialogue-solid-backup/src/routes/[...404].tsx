import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { useI18n } from '~/i18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <>
      <Title>404 | Dialogue</Title>
      <main class="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-bg-primary">
        <p class="text-[6rem] font-bold text-text-muted leading-none mb-4">{t.notFoundCode}</p>
        <h1 class="text-2xl font-semibold text-text-primary mb-4">{t.notFoundTitle}</h1>
        <p class="text-base text-text-secondary mb-8 max-w-[400px]">{t.notFoundMessage}</p>
        <A
          href="/"
          class="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-accent rounded-lg transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
        >
          {t.notFoundBackHome}
        </A>
      </main>
    </>
  );
}
