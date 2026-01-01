// ========================================
// Education Domain Dictionary - 교육 도메인 사전
// 학교/교육/학습 관련 어휘
// ========================================

export const EDUCATION_KO_EN: Record<string, string> = {
  // === 시설 (Facilities) ===
  교실: 'classroom',
  강의실: 'lecture room',
  칠판: 'blackboard',
  화이트보드: 'whiteboard',
  프로젝터: 'projector',

  // === 학습자료 (Learning Materials) ===
  교과서: 'textbook',
  참고서: 'reference book',
  문제집: 'workbook',

  // === 평가 (Evaluation) ===
  시험: 'exam',
  퀴즈: 'quiz',
  숙제: 'homework',
  과제: 'assignment',
  레포트: 'report',
  발표: 'presentation',
  토론: 'debate',
  성적: 'grade',
  점수: 'score',
  학점: 'credit',

  // === 학교생활 (School Life) ===
  졸업: 'graduation',
  입학: 'enrollment',
  장학금: 'scholarship',
  등록금: 'tuition',
  방학: 'vacation',
  학기: 'semester',
  수업: 'class',
  강의: 'lecture',

  // === 과목 (Subjects) ===
  과목: 'subject',
  국어: 'Korean',
  영어: 'English',
  수학: 'math',
  과학: 'science',
  사회: 'social studies',
  역사: 'history',
  지리: 'geography',
  음악수업: 'music class',
  미술수업: 'art class',
  체육: 'physical education',
  도덕: 'ethics',
  기술: 'technology',
  가정: 'home economics',
  프로그래밍수업: 'programming class',
  외국어: 'foreign language',

  // === 활동 (Activities) ===
  동아리: 'club',
  학생회: 'student council',
  급식: 'school lunch',
  교복: 'school uniform',
  학교버스: 'school bus',
};

export const EDUCATION_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(EDUCATION_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
