// ========================================
// Collaboration & Project Management - 협업 / 프로젝트 관리
// ========================================

export const TECH_COLLABORATION_KO_EN: Record<string, string> = {
  // === 방법론 (Methodologies) ===
  애자일: 'Agile',
  스크럼: 'Scrum',
  칸반: 'Kanban',
  워터폴: 'Waterfall',

  // === 스프린트 (Sprint) ===
  스프린트: 'sprint',
  '스프린트 계획': 'sprint planning',
  '스프린트 리뷰': 'sprint review',
  회고: 'retrospective',
  스탠드업: 'standup',
  '데일리 스크럼': 'daily scrum',

  // === 백로그 (Backlog) ===
  백로그: 'backlog',
  '프로덕트 백로그': 'product backlog',
  '스프린트 백로그': 'sprint backlog',
  '유저 스토리': 'user story',
  에픽: 'epic',
  태스크: 'task',
  서브태스크: 'subtask',

  // === 측정 (Metrics) ===
  '스토리 포인트': 'story point',
  벨로시티: 'velocity',
  '번다운 차트': 'burndown chart',

  // === 프로젝트 관리 도구 (Project Management Tools) ===
  지라: 'Jira',
  아사나: 'Asana',
  트렐로: 'Trello',
  노션: 'Notion',
  리니어: 'Linear',

  // === 커뮤니케이션 도구 (Communication Tools) ===
  슬랙: 'Slack',
  팀즈: 'Teams',
  디스코드: 'Discord',
  줌: 'Zoom',
  컨플루언스: 'Confluence',
  위키: 'wiki',

  // === 디자인/기획 (Design/Planning) ===
  플로우차트: 'flowchart',
  와이어프레임: 'wireframe',
  목업: 'mockup',
  프로토타입: 'prototype',

  // === 디자인 도구 (Design Tools) ===
  피그마: 'Figma',
  스케치: 'Sketch',
  '어도비 XD': 'Adobe XD',
};

export const TECH_COLLABORATION_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_COLLABORATION_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
