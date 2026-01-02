// ========================================
// UI/UX & Design - UI/UX / 디자인
// ========================================

export const TECH_UI_UX_KO_EN: Record<string, string> = {
  // === 기본 개념 (Basic Concepts) ===
  UI: 'User Interface',
  UX: 'User Experience',
  '디자인 시스템': 'design system',
  '컴포넌트 라이브러리': 'component library',
  '스타일 가이드': 'style guide',
  '브랜드 가이드라인': 'brand guidelines',

  // === 디자인 요소 (Design Elements) ===
  '컬러 팔레트': 'color palette',
  타이포그래피: 'typography',
  아이콘: 'icon',
  일러스트: 'illustration',

  // === 레이아웃 (Layout) ===
  레이아웃: 'layout',
  그리드: 'grid',
  스페이싱: 'spacing',
  마진: 'margin',
  패딩: 'padding',

  // === 반응형 (Responsive) ===
  '반응형 디자인': 'responsive design',
  '적응형 디자인': 'adaptive design',
  '모바일 퍼스트': 'mobile first',
  '데스크톱 퍼스트': 'desktop first',
  브레이크포인트: 'breakpoint',
  뷰포트: 'viewport',

  // === 폴드 (Fold) ===
  폴드: 'fold',
  '어보브 더 폴드': 'above the fold',
  '벨로우 더 폴드': 'below the fold',

  // === 페이지 구조 (Page Structure) ===
  '히어로 섹션': 'hero section',
  헤더: 'header',
  푸터: 'footer',
  내비게이션: 'navigation',
  네브바: 'navbar',
  사이드바: 'sidebar',
  드로어: 'drawer',

  // === 오버레이 (Overlays) ===
  모달: 'modal',
  다이얼로그: 'dialog',
  팝업: 'popup',
  팝오버: 'popover',
  툴팁: 'tooltip',
  토스트: 'toast',
  스낵바: 'snackbar',
  배너: 'banner',

  // === UI 컴포넌트 (UI Components) ===
  카드: 'card',
  버튼: 'button',
  링크: 'link',
  폼: 'form',
  '입력 필드': 'input field',
  '텍스트 에어리어': 'textarea',
  셀렉트: 'select',
  드롭다운: 'dropdown',
  체크박스: 'checkbox',
  '라디오 버튼': 'radio button',
  토글: 'toggle',
  스위치: 'switch',
  슬라이더: 'slider',
  데이트피커: 'date picker',
  타임피커: 'time picker',
  컬러피커: 'color picker',
  '파일 업로드': 'file upload',

  // === 표시 요소 (Display Elements) ===
  아바타: 'avatar',
  배지: 'badge',
  태그: 'tag',
  칩: 'chip',
  '프로그레스 바': 'progress bar',
  스피너: 'spinner',
  로더: 'loader',
  스켈레톤: 'skeleton',
  플레이스홀더: 'placeholder',

  // === 탐색 (Navigation) ===
  탭: 'tab',
  아코디언: 'accordion',
  캐러셀: 'carousel',
  갤러리: 'gallery',
  테이블: 'table',
  리스트: 'list',
  '그리드 뷰': 'grid view',
  '리스트 뷰': 'list view',
  페이지네이션: 'pagination',
  '무한 스크롤': 'infinite scroll',

  // === 제스처 (Gestures) ===
  '풀 투 리프레시': 'pull to refresh',
  스와이프: 'swipe',
  제스처: 'gesture',
  터치: 'touch',
  클릭: 'click',
  호버: 'hover',
  포커스: 'focus',
  액티브: 'active',
  디스에이블드: 'disabled',

  // === 접근성 (Accessibility) ===
  접근성: 'accessibility',
  a11y: 'a11y',
  WCAG: 'Web Content Accessibility Guidelines',
  ARIA: 'Accessible Rich Internet Applications',
  '스크린 리더': 'screen reader',
  '키보드 내비게이션': 'keyboard navigation',
  '컬러 대비': 'color contrast',

  // === 테마 (Theme) ===
  '다크 모드': 'dark mode',
  '라이트 모드': 'light mode',
  테마: 'theme',
  스키마: 'scheme',

  // === 애니메이션 (Animation) ===
  트랜지션: 'transition',
  애니메이션: 'animation',
  이징: 'easing',
  듀레이션: 'duration',
  딜레이: 'delay',
  키프레임: 'keyframe',
  마이크로인터랙션: 'microinteraction',

  // === 상태 (States) ===
  온보딩: 'onboarding',
  '엠프티 스테이트': 'empty state',
  '에러 스테이트': 'error state',
  '로딩 스테이트': 'loading state',
  '성공 스테이트': 'success state',
  CTA: 'Call to Action',

  // === 분석 (Analytics) ===
  히트맵: 'heatmap',
  클릭맵: 'click map',
  스크롤맵: 'scroll map',
  펀넬: 'funnel',
  전환율: 'conversion rate',
  바운스율: 'bounce rate',
  '체류 시간': 'time on page',
  '사용자 여정': 'user journey',
  페르소나: 'persona',
  '사용성 테스트': 'usability testing',
};

export const TECH_UI_UX_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_UI_UX_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
