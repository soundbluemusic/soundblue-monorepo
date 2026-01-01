// ========================================
// Arts Domain Dictionary - 예술/문화 도메인 사전
// 예술/음악/공연/문학 관련 어휘
// ========================================

export const ARTS_KO_EN: Record<string, string> = {
  // === 예술 일반 (General Arts) ===
  예술: 'art',
  파인아트: 'fine art',
  작품: 'artwork',
  걸작: 'masterpiece',

  // === 시각예술 (Visual Arts) ===
  조각: 'sculpture',
  회화: 'painting',
  판화: 'print',
  드로잉: 'drawing',
  일러스트: 'illustration',
  캘리그라피: 'calligraphy',
  사진촬영: 'photography',

  // === 공연예술 (Performing Arts) ===
  연극: 'theater',
  뮤지컬: 'musical',
  오페라: 'opera',
  발레: 'ballet',
  현대무용: 'modern dance',
  콘서트: 'concert',
  공연: 'performance',

  // === 전시 (Exhibition) ===
  전시: 'exhibition',
  전시회: 'exhibition',

  // === 영상 (Video/Film) ===
  영상제작: 'video production',
  필름: 'film',
  다큐멘터리: 'documentary',
  애니메이션: 'animation',
  만화: 'comic',
  웹툰: 'webtoon',

  // === 문학 (Literature) ===
  소설: 'novel',
  시문학: 'poetry',
  에세이: 'essay',
  자서전: 'autobiography',

  // === 음악 장르 (Music Genres) ===
  클래식음악: 'classical music',
  클래식: 'classical music',
  재즈: 'jazz',
  팝: 'pop',
  록: 'rock',
  힙합: 'hip hop',
  랩: 'rap',
  발라드: 'ballad',
  EDM: 'EDM',
  케이팝: 'K-pop',
  트로트: 'trot',
  국악: 'Korean traditional music',
};

export const ARTS_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(ARTS_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
