// ========================================
// Web Development - 웹 개발
// ========================================

export const TECH_WEB_DEVELOPMENT_KO_EN: Record<string, string> = {
  // === HTML 기본 (HTML Basics) ===
  태그: 'tag',
  요소: 'element',
  속성: 'attribute',
  '시맨틱 HTML': 'semantic HTML',
  문서: 'document',
  헤드: 'head',
  바디: 'body',
  '메타 태그': 'meta tag',
  타이틀: 'title',
  스크립트: 'script',
  스타일: 'style',

  // === HTML 태그 (HTML Tags) ===
  디브: 'div',
  헤딩: 'heading',
  패러그래프: 'paragraph',
  앵커: 'anchor',
  이미지: 'image',
  인풋: 'input',
  아이프레임: 'iframe',
  캔버스: 'canvas',
  SVG: 'SVG',
  비디오: 'video',
  오디오: 'audio',

  // === DOM (DOM) ===
  DOM: 'Document Object Model',
  '가상 DOM': 'Virtual DOM',
  '섀도우 DOM': 'Shadow DOM',

  // === CSS 기본 (CSS Basics) ===
  셀렉터: 'selector',
  클래스: 'class',
  아이디: 'ID',
  프로퍼티: 'property',
  밸류: 'value',

  // === 박스 모델 (Box Model) ===
  '박스 모델': 'box model',
  보더: 'border',
  콘텐츠: 'content',

  // === CSS 레이아웃 (CSS Layout) ===
  디스플레이: 'display',
  포지션: 'position',
  플렉스박스: 'Flexbox',
  플로트: 'float',
  클리어: 'clear',
  'z-인덱스': 'z-index',
  오버플로우: 'overflow',
  비저빌리티: 'visibility',
  오패시티: 'opacity',

  // === CSS 스타일 (CSS Styling) ===
  백그라운드: 'background',
  폰트: 'font',
  텍스트: 'text',
  컬러: 'color',
  트랜스폼: 'transform',

  // === CSS 고급 (CSS Advanced) ===
  '미디어 쿼리': 'media query',
  '컨테이너 쿼리': 'container query',
  'CSS 변수': 'CSS variables',
  '커스텀 프로퍼티': 'custom properties',
  '의사 클래스': 'pseudo class',
  '의사 요소': 'pseudo element',
  특이성: 'specificity',
  캐스케이드: 'cascade',
  상속: 'inheritance',

  // === CSS 방법론 (CSS Methodologies) ===
  BEM: 'Block Element Modifier',
  'CSS-in-JS': 'CSS-in-JS',
  'CSS 모듈': 'CSS Modules',
  '스코프드 CSS': 'scoped CSS',

  // === JavaScript 이벤트 (JavaScript Events) ===
  이벤트: 'event',
  '이벤트 리스너': 'event listener',
  '이벤트 핸들러': 'event handler',
  '이벤트 버블링': 'event bubbling',
  '이벤트 캡처링': 'event capturing',
  '이벤트 위임': 'event delegation',
  '클릭 이벤트': 'click event',
  '서밋 이벤트': 'submit event',
  '키다운 이벤트': 'keydown event',
  '마우스오버 이벤트': 'mouseover event',
  '스크롤 이벤트': 'scroll event',
  '로드 이벤트': 'load event',
  DOMContentLoaded: 'DOMContentLoaded',
  '커스텀 이벤트': 'custom event',

  // === Web API (Web APIs) ===
  '페치 API': 'Fetch API',
  XMLHttpRequest: 'XMLHttpRequest',
  '로컬 스토리지': 'local storage',
  '세션 스토리지': 'session storage',
  인덱스드DB: 'IndexedDB',
  쿠키: 'cookie',
  '웹 워커': 'web worker',
  '서비스 워커': 'service worker',
  '웹 소켓': 'WebSocket',
  지오로케이션: 'geolocation',
  노티피케이션: 'notification',
  '히스토리 API': 'History API',
  '클립보드 API': 'Clipboard API',

  // === 옵저버 (Observers) ===
  '인터섹션 옵저버': 'Intersection Observer',
  '뮤테이션 옵저버': 'Mutation Observer',
  '리사이즈 옵저버': 'Resize Observer',
  '퍼포먼스 API': 'Performance API',

  // === 최적화 기법 (Optimization Techniques) ===
  디바운스: 'debounce',
  스로틀: 'throttle',
  requestAnimationFrame: 'requestAnimationFrame',

  // === 웹 컴포넌트 (Web Components) ===
  '웹 컴포넌트': 'web component',
  '커스텀 엘리먼트': 'custom element',
  템플릿: 'template',
  슬롯: 'slot',

  // === SEO (SEO) ===
  SEO: 'Search Engine Optimization',
  '오픈 그래프': 'Open Graph',
  '트위터 카드': 'Twitter Card',
  사이트맵: 'sitemap',
  '로봇.txt': 'robots.txt',
  캐노니컬: 'canonical',
  '구조화된 데이터': 'structured data',
  '스키마 마크업': 'schema markup',
  '리치 스니펫': 'rich snippet',
  크롤러: 'crawler',
  인덱싱: 'indexing',
  백링크: 'backlink',
  키워드: 'keyword',

  // === 성능 지표 (Performance Metrics) ===
  '코어 웹 바이탈': 'Core Web Vitals',
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift',
  FCP: 'First Contentful Paint',
  TTFB: 'Time to First Byte',
  TTI: 'Time to Interactive',

  // === 성능 최적화 (Performance Optimization) ===
  '레이지 로딩': 'lazy loading',
  '코드 스플리팅': 'code splitting',
  '트리 쉐이킹': 'tree shaking',
  '번들 사이즈': 'bundle size',
  미니피케이션: 'minification',
  컴프레션: 'compression',
  지집: 'Gzip',
  브로틀리: 'Brotli',
  '이미지 최적화': 'image optimization',
  프리로드: 'preload',
  프리페치: 'prefetch',
  프리커넥트: 'preconnect',
  '크리티컬 CSS': 'critical CSS',

  // === 성능 도구 (Performance Tools) ===
  라이트하우스: 'Lighthouse',
  페이지스피드: 'PageSpeed',
  웹페이지테스트: 'WebPageTest',
};

export const TECH_WEB_DEVELOPMENT_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_WEB_DEVELOPMENT_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
