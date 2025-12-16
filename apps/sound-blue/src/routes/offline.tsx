import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';
import { buttonVariants } from '~/components/ui';

export default function OfflinePage(): JSX.Element {
  return (
    <>
      <Title>Offline | Sound Blue</Title>
      <main class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 text-center">
        <p class="text-[6rem] leading-none mb-4">📶</p>
        <h1 class="text-2xl font-semibold text-content mb-4">You're Offline</h1>
        <p class="text-base text-content-muted mb-8 max-w-[400px]">
          Please check your internet connection and try again.
        </p>
        <A href="/" class={buttonVariants({ variant: 'primary', size: 'lg' })}>
          Go Home
        </A>
      </main>
    </>
  );
}
