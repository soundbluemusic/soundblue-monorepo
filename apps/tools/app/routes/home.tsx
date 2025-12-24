import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import { HomeLayout } from '~/components/layout/HomeLayout';
import { useToolStore } from '~/stores/tool-store';

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

export const meta: MetaFunction = () => [
  { title: 'Tools - SoundBlueMusic' },
  {
    name: 'description',
    content:
      'Pro-grade Web DAW, Rhythm Game & Creative Tools for musicians and creators. 음악가와 크리에이터를 위한 웹 DAW, 리듬 게임 및 창작 도구.',
  },
];

export default function Home() {
  // 빌드 타임에 주입된 데이터 사용
  const _data = useLoaderData<typeof loader>();
  const { closeTool } = useToolStore();

  // Close any open tool when navigating to home
  useEffect(() => {
    closeTool();
  }, [closeTool]);

  return <HomeLayout />;
}
