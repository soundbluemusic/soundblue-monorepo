import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import { useToolStore } from '~/stores/tool-store';

export const Route = createFileRoute('/ko/about')({
  head: () => ({
    meta: [
      { title: '소개 | Tools - SoundBlue' },
      {
        name: 'description',
        content:
          'SoundBlue가 만드는 창작자를 위한 인터랙티브 도구. 뮤지션을 위한 리듬 도구, 작가를 위한 글쓰기 도구, 비주얼 아티스트를 위한 색상 도구.',
      },
      {
        name: 'keywords',
        content:
          'soundblue 도구, 음악 도구, 창작 도구, 뮤지션 도구, 아티스트 도구, 메트로놈, 드럼머신, 번역기, 컬러 팔레트',
      },
    ],
  }),
  component: KoAboutPage,
});

function KoAboutPage() {
  const { sidebarCollapsed } = useToolStore();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com/ko' },
          { name: '소개', url: 'https://tools.soundbluemusic.com/ko/about' },
        ]}
      />
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <Header />
        <ToolSidebar />
        <main
          className={`main-content-transition pt-[var(--header-height)] pb-4 max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] ${
            sidebarCollapsed ? 'ml-0' : 'ml-[var(--sidebar-width)]'
          } max-md:ml-0`}
        >
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">소개</h1>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">우리는 누구인가</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Tools는 인디 뮤지션이자 창작자인 SoundBlue가 만드는 인터랙티브 도구 모음입니다.
                음악, 예술, 창작 활동에 필요한 모든 것을 한 곳에 모았습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">창작자를 위한 도구</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                여기 있는 모든 도구는 창작자를 위한 목적이 있습니다. 회원가입 없이, 광고 없이, 완전
                무료로 사용하세요.
              </p>

              <div className="space-y-6">
                <div className="border-l-4 border-[var(--color-accent)] pl-4">
                  <h3 className="font-semibold mb-2">🎵 리듬 — 뮤지션을 위한 박자 도구</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    정확한 박자 연습을 위한 메트로놈, 리듬 패턴 실험을 위한 드럼머신, 곡의 BPM을
                    파악하는 탭 템포, 믹싱을 위한 딜레이 계산기.
                  </p>
                </div>

                <div className="border-l-4 border-[var(--color-accent)] pl-4">
                  <h3 className="font-semibold mb-2">✍️ 언어 — 작가와 작사가를 위한 글쓰기 도구</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    다국어 어휘력 향상과 가사 번역을 위한 번역기, 한국어와 영어 글쓰기 품질 향상을
                    위한 맞춤법 검사기.
                  </p>
                </div>

                <div className="border-l-4 border-[var(--color-accent)] pl-4">
                  <h3 className="font-semibold mb-2">
                    🎨 비주얼 — 비주얼 아티스트를 위한 색상 도구
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    배색 이론을 배우고 적용하는 컬러 하모니, 작품의 컬러 스킴을 구성하는 컬러
                    팔레트, 색상 분석 능력을 키우는 색상 분해.
                  </p>
                </div>

                <div className="border-l-4 border-[var(--color-accent)] pl-4">
                  <h3 className="font-semibold mb-2">🔧 유틸 — 모든 창작자를 위한 도구</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    작품과 포트폴리오를 쉽게 공유하는 QR 생성기.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="hidden md:block">
            <Footer />
          </div>
        </main>
        <BottomNavigation />
      </div>
    </>
  );
}
