import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components';

export const meta: MetaFunction = () => [
  { title: 'Dialogue - Conversational Learning Tool' },
  { name: 'description', content: 'A conversational learning tool that works 100% offline' },
];

export default function Home() {
  return <MainLayout />;
}
