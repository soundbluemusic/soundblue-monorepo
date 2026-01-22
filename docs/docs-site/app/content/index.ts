// Content data for all pages in all languages

export type Locale = 'en' | 'ko' | 'ja';

export interface NavItem {
  label: string;
  href: string;
}

export interface ContentData {
  nav: {
    projects: string;
    about: string;
  };
  sidebar: NavItem[];
  home: {
    title: string;
    tagline: string;
    exploreBtn: string;
    projectsTitle: string;
    aboutTitle: string;
    aboutText: string[];
    linksTitle: string;
  };
  soundBlue: {
    title: string;
    description: string;
    quote: string;
    intro: string;
    whatsOnSite: string;
    features: string;
    languages: string;
    aiChat: string;
    links: string;
  };
  tools: {
    title: string;
    description: string;
    intro: string;
    subIntro: string;
    coreValues: string;
    availableTools: string;
    musicTools: string;
    utilityTools: string;
    visualTools: string;
    features: string;
    howItWorks: string;
    links: string;
  };
  dialogue: {
    title: string;
    description: string;
    intro: string;
    subIntro: string;
    keyFeatures: string;
    howItWorks: string;
    useCases: string;
    languages: string;
    installAsApp: string;
    links: string;
  };
  about: {
    title: string;
    quote: string;
    intro: string;
    whatWeDo: string;
    philosophy: string;
    projects: string;
    connect: string;
    copyright: string;
  };
  footer: {
    copyright: string;
  };
}

export const content: Record<Locale, ContentData> = {
  en: {
    nav: {
      projects: 'Projects',
      about: 'About',
    },
    sidebar: [
      { label: 'Sound Blue', href: '/sound-blue' },
      { label: 'Tools', href: '/tools' },
      { label: 'Dialogue', href: '/dialogue' },
      { label: 'About', href: '/about' },
    ],
    home: {
      title: 'SoundBlue Projects',
      tagline: 'Music and creative projects by Sound Blue',
      exploreBtn: 'Explore Projects',
      projectsTitle: 'Projects',
      aboutTitle: 'About',
      aboutText: [
        'Sound Blue is an indie artist from South Korea.',
        'SoundBlueMusic is where all projects live — music, tools, and apps.',
      ],
      linksTitle: 'Links',
    },
    soundBlue: {
      title: 'Sound Blue',
      description: 'Official website of indie artist Sound Blue',
      quote: '"hi, im sound blue, i make music."',
      intro: 'Sound Blue is the official website of the South Korean indie artist.',
      whatsOnSite: "What's on the site?",
      features: 'Features',
      languages: 'Languages',
      aiChat: 'AI Chat Assistant',
      links: 'Links',
    },
    tools: {
      title: 'Tools',
      description: 'Free web tools for all creators',
      intro: 'A free web tools platform for all creators.',
      subIntro: 'Professional online tools for musicians, designers, and developers.',
      coreValues: 'Core Values',
      availableTools: 'Available Tools',
      musicTools: 'Music Tools',
      utilityTools: 'Utility Tools',
      visualTools: 'Visual Tools',
      features: 'Features',
      howItWorks: 'How It Works',
      links: 'Links',
    },
    dialogue: {
      title: 'Dialogue',
      description: 'Q&A tool that works 100% offline',
      intro: 'A Q&A tool that works 100% offline.',
      subIntro: 'Instant answers without internet connection.',
      keyFeatures: 'Key Features',
      howItWorks: 'How It Works',
      useCases: 'Use Cases',
      languages: 'Languages',
      installAsApp: 'Install as App',
      links: 'Links',
    },
    about: {
      title: 'About SoundBlueMusic',
      quote: '"hi, im sound blue, i make music."',
      intro: 'Sound Blue is an indie artist from South Korea. SoundBlueMusic is where all the creative projects live.',
      whatWeDo: 'What We Do',
      philosophy: 'Philosophy',
      projects: 'Projects',
      connect: 'Connect',
      copyright: 'Copyright',
    },
    footer: {
      copyright: '© SoundBlueMusic. All rights reserved.',
    },
  },
  ko: {
    nav: {
      projects: '프로젝트',
      about: '소개',
    },
    sidebar: [
      { label: 'Sound Blue', href: '/ko/sound-blue' },
      { label: 'Tools', href: '/ko/tools' },
      { label: 'Dialogue', href: '/ko/dialogue' },
      { label: '소개', href: '/ko/about' },
    ],
    home: {
      title: 'SoundBlue 프로젝트',
      tagline: 'Sound Blue의 음악과 창작 프로젝트',
      exploreBtn: '프로젝트 탐색',
      projectsTitle: '프로젝트',
      aboutTitle: '소개',
      aboutText: [
        'Sound Blue는 한국의 인디 아티스트입니다.',
        'SoundBlueMusic은 모든 프로젝트가 모여있는 곳입니다 — 음악, 도구, 앱.',
      ],
      linksTitle: '링크',
    },
    soundBlue: {
      title: 'Sound Blue',
      description: '인디 아티스트 Sound Blue의 공식 웹사이트',
      quote: '"안녕, 나는 sound blue, 음악을 만들어."',
      intro: 'Sound Blue는 한국 인디 아티스트의 공식 웹사이트입니다.',
      whatsOnSite: '사이트 구성',
      features: '특징',
      languages: '언어',
      aiChat: 'AI 채팅 어시스턴트',
      links: '링크',
    },
    tools: {
      title: 'Tools',
      description: '모든 크리에이터를 위한 무료 웹 도구',
      intro: '모든 크리에이터를 위한 무료 웹 도구 플랫폼.',
      subIntro: '뮤지션, 디자이너, 개발자를 위한 전문 온라인 도구.',
      coreValues: '핵심 가치',
      availableTools: '사용 가능한 도구',
      musicTools: '음악 도구',
      utilityTools: '유틸리티 도구',
      visualTools: '시각 도구',
      features: '특징',
      howItWorks: '사용 방법',
      links: '링크',
    },
    dialogue: {
      title: 'Dialogue',
      description: '100% 오프라인 작동 Q&A 도구',
      intro: '100% 오프라인으로 작동하는 Q&A 도구.',
      subIntro: '인터넷 연결 없이 즉시 답변.',
      keyFeatures: '주요 기능',
      howItWorks: '작동 방식',
      useCases: '사용 사례',
      languages: '언어',
      installAsApp: '앱으로 설치',
      links: '링크',
    },
    about: {
      title: 'SoundBlueMusic 소개',
      quote: '"안녕, 나는 sound blue, 음악을 만들어."',
      intro: 'Sound Blue는 한국의 인디 아티스트입니다. SoundBlueMusic은 모든 창작 프로젝트가 모여있는 곳입니다.',
      whatWeDo: '하는 일',
      philosophy: '철학',
      projects: '프로젝트',
      connect: '연결',
      copyright: '저작권',
    },
    footer: {
      copyright: '© SoundBlueMusic. 모든 권리 보유.',
    },
  },
  ja: {
    nav: {
      projects: 'プロジェクト',
      about: '紹介',
    },
    sidebar: [
      { label: 'Sound Blue', href: '/ja/sound-blue' },
      { label: 'Tools', href: '/ja/tools' },
      { label: 'Dialogue', href: '/ja/dialogue' },
      { label: '紹介', href: '/ja/about' },
    ],
    home: {
      title: 'SoundBlue プロジェクト',
      tagline: 'Sound Blueの音楽とクリエイティブプロジェクト',
      exploreBtn: 'プロジェクトを見る',
      projectsTitle: 'プロジェクト',
      aboutTitle: '紹介',
      aboutText: [
        'Sound Blueは韓国のインディーアーティストです。',
        'SoundBlueMusicは、すべてのプロジェクトが集まる場所です — 音楽、ツール、アプリ。',
      ],
      linksTitle: 'リンク',
    },
    soundBlue: {
      title: 'Sound Blue',
      description: 'インディーアーティストSound Blueの公式サイト',
      quote: '"こんにちは、sound blueです、音楽を作っています。"',
      intro: 'Sound Blueは韓国のインディーアーティストの公式ウェブサイトです。',
      whatsOnSite: 'サイトの内容',
      features: '特徴',
      languages: '言語',
      aiChat: 'AIチャットアシスタント',
      links: 'リンク',
    },
    tools: {
      title: 'Tools',
      description: 'すべてのクリエイターのための無料ウェブツール',
      intro: 'すべてのクリエイターのための無料ウェブツールプラットフォーム。',
      subIntro: 'ミュージシャン、デザイナー、開発者のためのプロフェッショナルなオンラインツール。',
      coreValues: 'コアバリュー',
      availableTools: '利用可能なツール',
      musicTools: '音楽ツール',
      utilityTools: 'ユーティリティツール',
      visualTools: 'ビジュアルツール',
      features: '特徴',
      howItWorks: '使い方',
      links: 'リンク',
    },
    dialogue: {
      title: 'Dialogue',
      description: '100%オフラインで動作するQ&Aツール',
      intro: '100%オフラインで動作するQ&Aツール。',
      subIntro: 'インターネット接続なしで即座に回答。',
      keyFeatures: '主な機能',
      howItWorks: '仕組み',
      useCases: '使用例',
      languages: '言語',
      installAsApp: 'アプリとしてインストール',
      links: 'リンク',
    },
    about: {
      title: 'SoundBlueMusicについて',
      quote: '"こんにちは、sound blueです、音楽を作っています。"',
      intro: 'Sound Blueは韓国のインディーアーティストです。SoundBlueMusicはすべてのクリエイティブプロジェクトが集まる場所です。',
      whatWeDo: '活動内容',
      philosophy: '哲学',
      projects: 'プロジェクト',
      connect: 'つながる',
      copyright: '著作権',
    },
    footer: {
      copyright: '© SoundBlueMusic. All rights reserved.',
    },
  },
};

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/ko') || pathname.startsWith('/soundblue-monorepo/ko')) return 'ko';
  if (pathname.startsWith('/ja') || pathname.startsWith('/soundblue-monorepo/ja')) return 'ja';
  return 'en';
}

export function getContent(locale: Locale): ContentData {
  return content[locale];
}
