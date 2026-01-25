/**
 * Blog Categories
 *
 * 블로그 카테고리 정의
 * 음악, 사운드, 오디오, 효과음 관련 콘텐츠
 */

export interface BlogCategory {
  id: string;
  name: { en: string; ko: string };
  description: { en: string; ko: string };
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
}

export interface BlogPost {
  id: string;
  slug: string;
  categoryId: string;
  title: { en: string; ko: string };
  description: { en: string; ko: string };
  date: string; // ISO date
  author?: string;
  tags?: string[];
  thumbnail?: string;
}

/**
 * Blog Categories
 */
export const blogCategories: BlogCategory[] = [
  {
    id: 'mixing',
    name: { en: 'Mixing', ko: '믹싱' },
    description: {
      en: 'Balance, EQ, compression, and spatial techniques',
      ko: '밸런스, EQ, 컴프레서, 공간감 테크닉',
    },
    icon: 'Sliders',
    color: 'blue',
  },
  {
    id: 'mastering',
    name: { en: 'Mastering', ko: '마스터링' },
    description: {
      en: 'Final polish and loudness optimization',
      ko: '최종 사운드 완성 및 라우드니스 최적화',
    },
    icon: 'Gauge',
    color: 'purple',
  },
  {
    id: 'sound-design',
    name: { en: 'Sound Design', ko: '사운드 디자인' },
    description: {
      en: 'Synth programming and sound creation',
      ko: '신스 프로그래밍 및 음색 제작',
    },
    icon: 'AudioLines',
    color: 'cyan',
  },
  {
    id: 'plugins',
    name: { en: 'Plugins & VSTi', ko: '플러그인/가상악기' },
    description: {
      en: 'Software instruments and effects',
      ko: '소프트웨어 악기 및 이펙트',
    },
    icon: 'Puzzle',
    color: 'green',
  },
  {
    id: 'recording',
    name: { en: 'Recording', ko: '녹음' },
    description: {
      en: 'Microphones, interfaces, and recording techniques',
      ko: '마이크, 인터페이스, 녹음 테크닉',
    },
    icon: 'Mic',
    color: 'red',
  },
  {
    id: 'production',
    name: { en: 'Music Production', ko: '음악 제작' },
    description: {
      en: 'Workflow, arrangement, and production tips',
      ko: '워크플로우, 편곡, 프로덕션 팁',
    },
    icon: 'Music',
    color: 'orange',
  },
  {
    id: 'tutorial',
    name: { en: 'Tutorial', ko: '튜토리얼' },
    description: {
      en: 'Step-by-step guides and how-tos',
      ko: '단계별 가이드 및 사용법',
    },
    icon: 'GraduationCap',
    color: 'yellow',
  },
  {
    id: 'review',
    name: { en: 'Review', ko: '리뷰' },
    description: {
      en: 'Gear and software reviews',
      ko: '장비 및 소프트웨어 리뷰',
    },
    icon: 'Star',
    color: 'pink',
  },
];

/**
 * Blog Posts (placeholder - will be populated later)
 */
export const blogPosts: BlogPost[] = [];

/**
 * Helper functions
 */
export function getCategoryById(id: string): BlogCategory | undefined {
  return blogCategories.find((cat) => cat.id === id);
}

export function getPostsByCategory(categoryId: string): BlogPost[] {
  return blogPosts.filter((post) => post.categoryId === categoryId);
}

export function getCategoryColor(color: string): string {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    pink: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  };
  const defaultColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  return colors[color] ?? defaultColor;
}
