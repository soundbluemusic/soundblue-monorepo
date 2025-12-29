import type { MetaFunction } from 'react-router';
import { About } from '~/components';

export const meta: MetaFunction = () => [
  { title: 'About - Dialogue' },
  { name: 'description', content: 'About Dialogue - A conversational learning tool' },
];

export default function AboutPage() {
  return <About />;
}
