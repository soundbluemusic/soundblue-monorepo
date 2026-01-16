import type { MetaFunction } from 'react-router';
import { Changelog } from '~/components';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Changelog - Dialogue' },
  { name: 'description', content: 'Version history and updates for Dialogue' },
  ...getSeoMeta(location),
];

export default function ChangelogPage() {
  return <Changelog />;
}
