import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import { MainLayout } from '~/components';
import { getSeoMeta } from '~/lib/seo';

/**
 * 빌드 타임에 실행되는 loader
 * - SSG 환경에서 pre-render 시 데이터를 HTML에 주입
 * - 클라이언트에서 JS 없이도 콘텐츠 표시 가능
 */
export async function loader() {
  return {
    buildTime: new Date().toISOString(),
  };
}

export const meta: MetaFunction = ({ location }) => [
  { title: 'Dialogue - Conversational Learning Tool' },
  { name: 'description', content: 'A conversational learning tool that works 100% offline' },
  {
    name: 'keywords',
    content:
      'offline learning tool, Q&A app, conversational learning, instant answers, no internet learning, education app, learning without internet, 오프라인 학습 도구, Q&A 앱, 대화형 학습, 즉시 답변, 인터넷 없이 학습',
  },
  ...getSeoMeta(location),
];

export default function Home() {
  // 빌드 타임에 주입된 데이터 사용
  const _data = useLoaderData<typeof loader>();

  return (
    <>
      <BreadcrumbStructuredData
        items={[{ name: 'Dialogue', url: 'https://dialogue.soundbluemusic.com' }]}
      />
      <MainLayout />
    </>
  );
}
