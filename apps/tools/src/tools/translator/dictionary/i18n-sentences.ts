// ========================================
// i18n Sentences Dictionary - i18n 기반 문장 사전
// ⚠️ 자동 생성 파일 - 직접 수정 금지
// 생성: pnpm generate:i18n-dict
// ========================================

/**
 * i18n 파일에서 추출한 한→영 문장 사전
 * 사이트 UI 문장이 자동으로 번역기에 반영됩니다.
 */
export const i18nKoToEnSentences: Record<string, string> = {
  '사이드바에서 도구를 선택하거나': 'Select a tool from the sidebar',
  '채팅에서 명령어를 입력하세요': 'or type a command in chat',
  '오디오가 재생 중입니다. 정말 나가시겠습니까': 'Audio is playing. Are you sure you want to leave',
  'URL이 복사되었습니다': 'URL copied',
  '다른 도구와 동기화 중': 'Syncing with other tools',
  'QR 코드 생성 실패': 'Failed to generate QR code',
  'URL 또는 텍스트 입력': 'Enter URL or text',
  '이 프로젝트는 다음 기술들로 만들어졌습니다':
    'This project was built with the following technologies',
  '웹 표준 기반 레이아웃': 'Web standards-based layout',
  '메시지 입력': 'Type a message',
  '안녕하세요! 어떤 도구를 열까요': 'Hello! Which tool would you like to open',
  'SoundBlueMusic Tools는 뮤지션, 크리에이터, 그리고 일상을 위한 무료 브라우저 기반 도구 모음입니다':
    'SoundBlueMusic Tools is a collection of free, browser-based utilities for musicians, creators, and everyday use',
  '강력한 도구는 모두에게 접근 가능해야 합니다. 설치 없이, 가입 없이, 추적 없이. 열고 바로 사용하세요':
    'We believe powerful tools should be accessible to everyone. No installation, no signup, no tracking. Just open and use',
  '모든 도구는 단순함과 성능을 염두에 두고 설계되었습니다':
    'Each tool is designed with simplicity and performance in mind',
  '맞춤형 템포, 박자표, 시각적 피드백을 갖춘 정밀 메트로놈. 연습 세션에 완벽합니다':
    'A precision metronome with customizable tempo, time signatures, and visual feedback. Perfect for practice sessions',
  '직관적인 스텝 시퀀서로 비트를 만드세요. 다양한 사운드 킷과 패턴 저장 기능':
    'Create beats with an intuitive step sequencer. Multiple sound kits and pattern storage',
  'QR 코드를 즉시 생성하세요. 색상을 커스터마이즈하고 고해상도로 다운로드할 수 있습니다':
    'Generate QR codes instantly. Customize colors and download in high resolution',
  '자연어 처리 기반 한영 번역기. 문맥과 뉘앙스를 이해합니다':
    'Korean-English translator with natural language processing. Understands context and nuance',
  'SoundBlueMusic 로고는 소리와 기술의 조화를 표현합니다':
    'The SoundBlueMusic logo represents the harmony between sound and technology',
  '컬러: 사운드 블루 (#3B82F6)': 'Color: Sound Blue (#3B82F6)',
  '시그니처 블루는 명확함, 신뢰, 그리고 소리의 무한한 깊이를 나타냅니다. 하늘과 바다의 색—소리가 자유롭게 여행하는 광활한 공간입니다':
    "Our signature blue represents clarity, trust, and the infinite depth of sound. It's the color of the sky and the ocean—vast spaces where sound travels freely",
  '깔끔하고, 미니멀하고, 모던하게. 디자인은 단순함에 대한 우리의 약속을 반영합니다—방해하지 않고 작동하는 도구':
    'Clean, minimal, and modern. The design reflects our commitment to simplicity—tools that work without getting in your way',
  '최신 웹 기술로 제작되었습니다. GitHub에서 기여를 환영합니다':
    'Built with modern web technologies. Contributions welcome on GitHub',
  '번역기 품질 테스트 및 성능 평가 결과입니다':
    'Translator quality test and performance evaluation results',
  '테스트지 v3.0 기준 번역 품질 평가': 'Translation quality evaluation based on Test Suite v3.0',
  '테스트 중': 'Testing',
};

/**
 * 역방향 사전 (영→한) 자동 생성
 */
export const i18nEnToKoSentences: Record<string, string> = Object.fromEntries(
  Object.entries(i18nKoToEnSentences).map(([ko, en]) => [en.toLowerCase(), ko])
);
