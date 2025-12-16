import type { JSX } from 'solid-js';
import { NavigationLayout, PageSeo } from '~/components';
import { HomeContent } from '~/components/home';

export default function Home(): JSX.Element {
  return (
    <NavigationLayout>
      <PageSeo page="home" />
      <HomeContent />
    </NavigationLayout>
  );
}
