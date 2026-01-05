import type { MetaFunction } from 'react-router';
import { About } from '~/components';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ params }) => [
  { title: 'About - Dialogue' },
  { name: 'description', content: 'About Dialogue - A conversational learning tool' },
  ...getSeoMeta('/about', params),
];

export default function AboutPage() {
  return <About />;
}
