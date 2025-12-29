import type { MetaFunction } from 'react-router';
import { HomeLayout } from '~/components/layout/HomeLayout';

export const meta: MetaFunction = () => [
  { title: 'Tools - SoundBlueMusic' },
  {
    name: 'description',
    content:
      'Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators. 음악가와 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구.',
  },
];

export default function Home() {
  return <HomeLayout />;
}
