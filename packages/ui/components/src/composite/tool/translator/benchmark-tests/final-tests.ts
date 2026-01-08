/**
 * 종합 테스트 데이터 (Final Tests)
 * 종합 번역 테스트
 */

import type { TestLevel } from '../types';

export const finalTests: TestLevel[] = [
  {
    id: 'final-level1',
    name: 'Level 1: Short (Extreme)',
    nameKo: 'Level 1: 짧은 문장 (극악 난이도)',
    categories: [
      {
        id: 'final-l1-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'final-l1-1',
            input: '밥 먹었어?',
            expected: 'Did you eat?',
            direction: 'ko-en',
          },
          {
            id: 'final-l1-2',
            input: '학교 안 갔어.',
            expected: "I didn't go to school.",
            direction: 'ko-en',
          },
          {
            id: 'final-l1-3',
            input: '사과 좀 줘.',
            expected: 'Give me an apple.',
            direction: 'ko-en',
          },
          {
            id: 'final-l1-4',
            input: '친구들 만났어.',
            expected: 'I met my friends.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'final-l1-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'final-l1-5',
            input: 'Did you eat?',
            expected: '밥 먹었어?',
            direction: 'en-ko',
          },
          {
            id: 'final-l1-6',
            input: "I didn't go to school.",
            expected: '학교 안 갔어.',
            direction: 'en-ko',
          },
          {
            id: 'final-l1-7',
            input: 'Give me an apple.',
            expected: '사과 좀 줘.',
            direction: 'en-ko',
          },
          {
            id: 'final-l1-8',
            input: 'I met my friends.',
            expected: '친구들 만났어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'final-level2',
    name: 'Level 2: Medium (Extreme++)',
    nameKo: 'Level 2: 중간 문장 (극악++)',
    categories: [
      {
        id: 'final-l2-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'final-l2-1',
            input: '어제 영화 봤는데 재밌었어.',
            expected: 'I watched a movie yesterday and it was fun.',
            direction: 'ko-en',
          },
          {
            id: 'final-l2-2',
            input: '지금 뭐 해? 같이 밥 먹을래?',
            expected: 'What are you doing now? Do you want to eat together?',
            direction: 'ko-en',
          },
          {
            id: 'final-l2-3',
            input: '비가 와서 우산 챙겼어.',
            expected: "It's raining, so I brought an umbrella.",
            direction: 'ko-en',
          },
          {
            id: 'final-l2-4',
            input: '그 책 못 읽었어. 시간 없었거든.',
            expected: "I couldn't read the book. I didn't have time.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'final-l2-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'final-l2-5',
            input: 'I watched a movie yesterday and it was fun.',
            expected: '어제 영화 봤는데 재밌었어.',
            direction: 'en-ko',
          },
          {
            id: 'final-l2-6',
            input: 'What are you doing now? Do you want to eat together?',
            expected: '지금 뭐 해? 같이 밥 먹을래?',
            direction: 'en-ko',
          },
          {
            id: 'final-l2-7',
            input: "It's raining, so I brought an umbrella.",
            expected: '비가 와서 우산을 챙겼어.',
            direction: 'en-ko',
          },
          {
            id: 'final-l2-8',
            input: "I couldn't read the book. I didn't have time.",
            expected: '그 책 못 읽었어. 시간이 없었어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'final-level3',
    name: 'Level 3: Long (Extreme+++)',
    nameKo: 'Level 3: 긴 문장 (극악+++)',
    categories: [
      {
        id: 'final-l3-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'final-l3-1',
            input: '어제 친구랑 카페 갔다가 서점 들렀는데, 좋은 책 발견해서 샀어.',
            expected:
              'Yesterday, I went to a cafe with a friend and stopped by a bookstore, found a good book, and bought it.',
            direction: 'ko-en',
          },
          {
            id: 'final-l3-2',
            input: '회의 끝나고 저녁 먹자. 근데 너무 늦으면 안 돼, 내일 출장이야.',
            expected:
              "Let's eat dinner after the meeting. But we can't be too late, I have a business trip tomorrow.",
            direction: 'ko-en',
          },
          {
            id: 'final-l3-3',
            input: '프로젝트 마감이 다가오는데 아직 버그가 많아서 야근 중이야.',
            expected:
              "The project deadline is approaching, but there are still many bugs, so I'm working overtime.",
            direction: 'ko-en',
          },
          {
            id: 'final-l3-4',
            input: '운동 시작한 지 한 달 됐는데, 아직 효과를 못 느끼겠어.',
            expected:
              "It's been a month since I started exercising, but I still can't feel the effects.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'final-l3-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'final-l3-5',
            input:
              'Yesterday, I went to a cafe with a friend and stopped by a bookstore, found a good book, and bought it.',
            expected: '어제 친구랑 카페에 갔다가 서점에 들렀는데, 좋은 책을 발견해서 샀어.',
            direction: 'en-ko',
          },
          {
            id: 'final-l3-6',
            input:
              "Let's eat dinner after the meeting. But we can't be too late, I have a business trip tomorrow.",
            expected: '회의 끝나고 저녁 먹자. 근데 너무 늦으면 안 돼, 내일 출장이야.',
            direction: 'en-ko',
          },
          {
            id: 'final-l3-7',
            input:
              "The project deadline is approaching, but there are still many bugs, so I'm working overtime.",
            expected: '프로젝트 마감이 다가오는데 아직 버그가 많아서 야근 중이야.',
            direction: 'en-ko',
          },
          {
            id: 'final-l3-8',
            input:
              "It's been a month since I started exercising, but I still can't feel the effects.",
            expected: '운동 시작한 지 한 달 됐는데, 아직 효과를 못 느끼겠어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'final-level4',
    name: 'Level 4: Very Long (Final Boss - Extreme++++)',
    nameKo: 'Level 4: 매우 긴 문장 (최종 보스 - 극악++++)',
    categories: [
      {
        id: 'final-l4-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'final-l4-1',
            input:
              '오늘 회사에서 발표했는데 준비를 못해서 망했어. 상사가 화났고, 동료들 앞에서 창피당했어. 집에 오는 길에 비까지 맞았는데, 우산도 안 챙겨서 완전 젖었어. 그래도 내일 다시 해보려고. 포기 안 할 거야.',
            expected:
              "I gave a presentation at work today, but I wasn't prepared, so it went badly. My boss got angry, and I was embarrassed in front of my colleagues. On the way home, I even got caught in the rain, and I didn't bring an umbrella, so I got completely soaked. Still, I'm going to try again tomorrow. I'm not going to give up.",
            direction: 'ko-en',
          },
          {
            id: 'final-l4-2',
            input:
              '지난 주말에 가족들이랑 여행 갔었는데, 날씨가 안 좋아서 계획했던 걸 다 못 했어. 근데 오히려 숙소에서 보드게임하고 이야기하면서 더 재밌었어. 역시 누구랑 가느냐가 중요한 것 같아.',
            expected:
              "Last weekend, I went on a trip with my family, but the weather was bad, so we couldn't do everything we planned. But instead, we had more fun playing board games and talking at the accommodation. After all, I think who you go with is what matters.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'final-l4-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'final-l4-3',
            input:
              "I gave a presentation at work today, but I wasn't prepared, so it went badly. My boss got angry, and I was embarrassed in front of my colleagues. On the way home, I even got caught in the rain, and I didn't bring an umbrella, so I got completely soaked. Still, I'm going to try again tomorrow. I'm not going to give up.",
            expected:
              '오늘 회사에서 발표했는데 준비를 못해서 망했어. 상사가 화났고, 동료들 앞에서 창피당했어. 집에 오는 길에 비까지 맞았는데, 우산도 안 챙겨서 완전 젖었어. 그래도 내일 다시 해보려고. 포기 안 할 거야.',
            direction: 'en-ko',
          },
          {
            id: 'final-l4-4',
            input:
              "Last weekend, I went on a trip with my family, but the weather was bad, so we couldn't do everything we planned. But instead, we had more fun playing board games and talking at the accommodation. After all, I think who you go with is what matters.",
            expected:
              '지난 주말에 가족들이랑 여행 갔었는데, 날씨가 안 좋아서 계획했던 걸 다 못 했어. 근데 오히려 숙소에서 보드게임하고 이야기하면서 더 재밌었어. 역시 누구랑 가느냐가 중요한 것 같아.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 전문 번역가 수준 테스트 (Professional Translator Level Test)
// 🎬 넷플릭스 즉시 사용 가능 수준
// ========================================
