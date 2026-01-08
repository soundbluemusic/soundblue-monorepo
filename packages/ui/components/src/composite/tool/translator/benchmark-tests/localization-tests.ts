/**
 * 현지화 테스트 데이터 (Localization Tests)
 * 현지화 번역 테스트
 */

import type { TestLevel } from '../types';

export const localizationTests: TestLevel[] = [
  {
    id: 'loc-level-1',
    name: 'Level 1: Idioms (속담/관용구)',
    nameKo: 'Level 1: 속담/관용구',
    categories: [
      {
        id: 'loc-l1-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'loc-l1-1',
            input: '티끌 모아 태산이야',
            expected: 'Every little bit counts',
            direction: 'ko-en',
          },
          {
            id: 'loc-l1-2',
            input: '이번만 눈 감아줄게',
            expected: "I'll let it slide this time",
            direction: 'ko-en',
          },
          {
            id: 'loc-l1-3',
            input: '이제 발 뻗고 잘 수 있겠다',
            expected: 'Now I can finally sleep in peace',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'loc-l1-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'loc-l1-4',
            input: "It's raining cats and dogs outside",
            expected: '밖에 비가 억수같이 쏟아지네',
            direction: 'en-ko',
          },
          {
            id: 'loc-l1-5',
            input: 'Break a leg at your audition!',
            expected: '오디션 대박 나라!',
            direction: 'en-ko',
          },
          {
            id: 'loc-l1-6',
            input: "Don't worry, it'll be a piece of cake",
            expected: '걱정 마, 누워서 떡 먹기야',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'loc-level-2',
    name: 'Level 2: Cultural Expressions (문화적 표현)',
    nameKo: 'Level 2: 문화적 표현',
    categories: [
      {
        id: 'loc-l2-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'loc-l2-1',
            input: '오늘 회식인데 1차만 하고 빠져도 돼?',
            expected: 'We have a work dinner tonight. Can I leave after the first round?',
            direction: 'ko-en',
          },
          {
            id: 'loc-l2-2',
            input: '걔는 눈치가 빠른 편이야',
            expected: "She's good at reading the room",
            direction: 'ko-en',
          },
          {
            id: 'loc-l2-3',
            input: '설날에 세배하고 세뱃돈 받았어',
            expected: 'I bowed to my elders on New Year and got gift money',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'loc-l2-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'loc-l2-4',
            input: "Let's do Thanksgiving at my place this year",
            expected: '올해 추수감사절은 우리 집에서 하자',
            direction: 'en-ko',
          },
          {
            id: 'loc-l2-5',
            input: 'I brought some housewarming gifts for you',
            expected: '집들이 선물 가져왔어',
            direction: 'en-ko',
          },
          {
            id: 'loc-l2-6',
            input: 'She threw a baby shower for her sister',
            expected: '언니 출산 축하 파티 열었어',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'loc-level-3',
    name: 'Level 3: Complex Cultural Context (복잡한 문화적 맥락)',
    nameKo: 'Level 3: 복잡한 문화적 맥락',
    categories: [
      {
        id: 'loc-l3-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'loc-l3-1',
            input: '저 선배 군대 말년에 맨날 짬 타더니 지금도 똑같네',
            expected:
              'That senior was always slacking off near the end of his service, and nothing has changed',
            direction: 'ko-en',
          },
          {
            id: 'loc-l3-2',
            input: '요즘 수저 계급론 때문에 다들 포기가 빠르더라',
            expected:
              'These days people give up quickly because they think wealth determines everything',
            direction: 'ko-en',
          },
          {
            id: 'loc-l3-3',
            input: '워라밸 좋은 회사 찾는다고? 그건 좀 판타지지',
            expected:
              'Looking for a company with good work-life balance? That sounds like a fantasy',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'loc-l3-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'loc-l3-4',
            input: "He's a real trust fund baby who never had to work a day",
            expected: '금수저라 평생 일 안 해도 되는 애야',
            direction: 'en-ko',
          },
          {
            id: 'loc-l3-5',
            input: "That's just keeping up with the Joneses mentality",
            expected: '그건 그냥 남들 따라가려는 허세야',
            direction: 'en-ko',
          },
          {
            id: 'loc-l3-6',
            input: 'He pulled himself up by his bootstraps from nothing',
            expected: '맨땅에서 헤딩으로 성공한 사람이야',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'loc-level-4',
    name: 'Level 4: Subtitle Compression + Creative (자막 압축 + 창의 의역)',
    nameKo: 'Level 4: 자막 압축 + 창의 의역',
    categories: [
      {
        id: 'loc-l4-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'loc-l4-1',
            input:
              '내가 솔직히 지금 일 그만두고 여행 다니고 싶은데, 그렇다고 현실을 무시할 수도 없고, 그냥 답답해 죽겠어',
            expected:
              'I want to quit and travel, but reality keeps holding me back. I feel so stuck',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'loc-l4-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'loc-l4-2',
            input:
              'Well, that escalated quickly. I mean, that really got out of hand fast. Everyone was just fine, and then boom, total chaos',
            expected: '순식간에 개판됐네. 멀쩡하다가 한순간에 난장판',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 안티하드코딩 알고리즘 테스트 (Anti-Hardcoding Algorithm Test)
// 🚫 암기/하드코딩으로는 절대 통과 불가능
// 22가지 핵심 알고리즘 규칙 - 무한 조합 가능
// ========================================
