import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components';

export const meta: MetaFunction = () => [
  { title: 'Dialogue - 대화형 학습 도구' },
  { name: 'description', content: '100% 오프라인으로 작동하는 대화형 학습 도구' },
];

export default function HomeKo() {
  return <MainLayout />;
}
