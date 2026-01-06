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
  ...getSeoMeta(location),
];

export default function Home() {
  // 빌드 타임에 주입된 데이터 사용
  const _data = useLoaderData<typeof loader>();

  return <MainLayout />;
}
