import type { MetaFunction } from 'react-router';
import { About } from '~/components';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'About - Dialogue' },
  { name: 'description', content: 'About Dialogue - A conversational learning tool' },
  ...getSeoMeta(location),
];

export default function AboutPage() {
  return <About />;
}
