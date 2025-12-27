import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components';

export const meta: MetaFunction = () => [
  { title: 'Dialogue - 오프라인 Q&A' },
  { name: 'description', content: '100% 오프라인으로 작동하는 Q&A 도구' },
];

export default function HomeKo() {
  return <MainLayout />;
}
