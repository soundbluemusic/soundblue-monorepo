import type { MetaFunction } from 'react-router';
import { About } from '~/components';

export const meta: MetaFunction = () => [
  { title: '소개 - Dialogue' },
  { name: 'description', content: 'Dialogue 소개 - 대화형 학습 도구' },
];

export default function AboutKoPage() {
  return <About />;
}
