/**
 * 어순 변환 테스트 데이터 (Word Order Tests)
 * SVO↔SOV 어순 변환 테스트
 */

import type { TestLevel } from '../types';

export const wordOrderTests: TestLevel[] = [
  {
    id: 'word-order-level1',
    name: 'Level 1: Short Sentences (5-7 words)',
    nameKo: 'Level 1: 짧은 문장 (5-7 단어)',
    categories: [
      {
        id: 'wo-l1-ko-en',
        name: 'Korean(SOV) → English(SVO)',
        nameKo: '한국어(SOV) → 영어(SVO)',
        tests: [
          {
            id: 'wo-l1-1',
            input: '나는 커피를 마셨어.',
            expected: 'I drank coffee.',
            direction: 'ko-en',
          },
          {
            id: 'wo-l1-2',
            input: '그녀는 노래를 불렀어.',
            expected: 'She sang a song.',
            direction: 'ko-en',
          },
          {
            id: 'wo-l1-3',
            input: '너는 영화를 봤어?',
            expected: 'Did you watch the movie?',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'wo-l1-en-ko',
        name: 'English(SVO) → Korean(SOV)',
        nameKo: '영어(SVO) → 한국어(SOV)',
        tests: [
          {
            id: 'wo-l1-4',
            input: 'He bought a car.',
            expected: '그는 차를 샀어.',
            direction: 'en-ko',
          },
          {
            id: 'wo-l1-5',
            input: "I don't eat meat.",
            expected: '나는 고기를 안 먹어.',
            direction: 'en-ko',
          },
          {
            id: 'wo-l1-6',
            input: 'Do you like pizza?',
            expected: '너는 피자를 좋아해?',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'word-order-level2',
    name: 'Level 2: Medium Sentences (10-15 words)',
    nameKo: 'Level 2: 중간 문장 (10-15 단어)',
    categories: [
      {
        id: 'wo-l2-ko-en',
        name: 'Korean(SOV) → English(SVO)',
        nameKo: '한국어(SOV) → 영어(SVO)',
        tests: [
          {
            id: 'wo-l2-1',
            input: '나는 어제 친구와 함께 맛있는 파스타를 먹었어.',
            expected: 'I ate delicious pasta with my friend yesterday.',
            direction: 'ko-en',
          },
          {
            id: 'wo-l2-2',
            input: '우리는 주말에 새로 생긴 카페에서 브런치를 먹었어.',
            expected: 'We had brunch at the new cafe on the weekend.',
            direction: 'ko-en',
          },
          {
            id: 'wo-l2-3',
            input: '그는 생일 선물로 비싼 시계와 예쁜 꽃을 샀어.',
            expected: 'He bought an expensive watch and pretty flowers for a birthday gift.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'wo-l2-en-ko',
        name: 'English(SVO) → Korean(SOV)',
        nameKo: '영어(SVO) → 한국어(SOV)',
        tests: [
          {
            id: 'wo-l2-4',
            input: 'My brother finished his homework before dinner yesterday.',
            expected: '내 동생은 어제 저녁 먹기 전에 숙제를 끝냈어.',
            direction: 'en-ko',
          },
          {
            id: 'wo-l2-5',
            input: 'I met my old friend at the shopping mall last weekend.',
            expected: '나는 지난 주말에 쇼핑몰에서 오랜 친구를 만났어.',
            direction: 'en-ko',
          },
          {
            id: 'wo-l2-6',
            input: 'We studied hard all night to pass the exam.',
            expected: '우리는 시험에 합격하기 위해 밤새도록 열심히 공부했어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'word-order-level3',
    name: 'Level 3: Long Sentences (20-30 words)',
    nameKo: 'Level 3: 긴 문장 (20-30 단어)',
    categories: [
      {
        id: 'wo-l3-ko-en',
        name: 'Korean(SOV) → English(SVO)',
        nameKo: '한국어(SOV) → 영어(SVO)',
        tests: [
          {
            id: 'wo-l3-1',
            input:
              '나는 지난주 화요일 저녁에 회사 근처 새로 생긴 이탈리안 레스토랑에서 동료들과 함께 맛있는 피자와 파스타를 먹으면서 프로젝트에 대해 이야기했어.',
            expected:
              'I ate delicious pizza and pasta with my colleagues at the new Italian restaurant near the office last Tuesday evening while talking about the project.',
            direction: 'ko-en',
          },
          {
            id: 'wo-l3-2',
            input:
              '그녀는 어젯밤에 친구의 생일 파티 준비를 하느라 너무 늦게까지 잠을 못 자서 오늘 아침 회의에 지각했고 상사한테 혼났어.',
            expected:
              "She couldn't sleep until very late last night because she was preparing for her friend's birthday party, so she was late to the meeting this morning and got scolded by her boss.",
            direction: 'ko-en',
          },
          {
            id: 'wo-l3-3',
            input:
              '만약 내일 날씨가 좋으면 나는 친구들과 함께 한강 공원에 가서 자전거를 타고 치킨과 맥주를 먹으면서 저녁 노을을 보고 싶어.',
            expected:
              'If the weather is nice tomorrow, I want to go to Hangang Park with my friends, ride bikes, eat chicken and beer, and watch the sunset.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'wo-l3-en-ko',
        name: 'English(SVO) → Korean(SOV)',
        nameKo: '영어(SVO) → 한국어(SOV)',
        tests: [
          {
            id: 'wo-l3-4',
            input:
              'Last Saturday morning, I woke up early, made fresh coffee, read the newspaper on the balcony, called my parents, and then went to the gym for two hours.',
            expected:
              '지난 토요일 아침에 일찍 일어나서 커피 내리고, 발코니에서 신문 읽고, 부모님께 전화하고, 그러고 나서 두 시간 동안 헬스장에 다녀왔어.',
            direction: 'en-ko',
          },
          {
            id: 'wo-l3-5',
            input:
              'Because I failed my driving test three times, I decided to take professional lessons from next month, practice every weekend, and try again before summer vacation starts.',
            expected:
              '운전 시험에 세 번이나 떨어져서 다음 달부터 전문 학원 다니고, 매주 주말마다 연습하고, 여름 방학 전에 다시 도전하기로 했어.',
            direction: 'en-ko',
          },
          {
            id: 'wo-l3-6',
            input:
              'My younger sister graduated from university last year, found a great job at a tech company, moved to her own apartment downtown, and seems much happier than when she lived with our parents.',
            expected:
              '여동생이 작년에 대학 졸업하고 IT 회사에 취직해서 도심에 자기 집 마련했는데, 부모님이랑 살 때보다 훨씬 행복해 보여.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'word-order-level4',
    name: 'Level 4: Very Long Sentences (40+ words)',
    nameKo: 'Level 4: 매우 긴 문장 (40+ 단어)',
    categories: [
      {
        id: 'wo-l4-ko-en',
        name: 'Korean(SOV) → English(SVO)',
        nameKo: '한국어(SOV) → 영어(SVO)',
        tests: [
          {
            id: 'wo-l4-1',
            input:
              '나는 작년 3월부터 올해 11월까지 거의 9개월 동안 매일 새벽 5시에 일어나서 30분 동안 명상을 하고 1시간 동안 조깅을 하고 건강한 아침 식사를 직접 만들어 먹고 출근 전에 영어 공부를 30분씩 하면서 규칙적인 생활 습관을 만들려고 노력했는데 이제는 완전히 자연스럽게 몸에 배어서 아무 생각 없이도 자동으로 하게 되고 덕분에 건강도 좋아지고 영어 실력도 많이 늘었어.',
            expected:
              'From March last year to November this year, for almost nine months, I woke up every day at 5 AM, meditated for 30 minutes, jogged for one hour, made and ate a healthy breakfast myself, and studied English for 30 minutes before going to work, trying to build regular life habits, and now it has become completely natural and automatic without thinking, and thanks to this, my health has improved and my English skills have increased a lot.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'wo-l4-en-ko',
        name: 'English(SVO) → Korean(SOV)',
        nameKo: '영어(SVO) → 한국어(SOV)',
        tests: [
          {
            id: 'wo-l4-2',
            input:
              'During my three-month backpacking trip through Southeast Asia last summer, I visited twelve different countries, tried countless street foods, learned basic phrases in six languages, made friends from all over the world, got lost in unfamiliar cities multiple times, experienced both amazing kindness and unfortunate scams, ran out of money twice and had to work at hostels, missed my flight once, got food poisoning three times, but looking back now, I realize it was the most valuable and life-changing experience that taught me independence, resilience, and how to appreciate different cultures and perspectives.',
            expected:
              '작년 여름 3개월 동안 동남아 배낭여행하면서 12개국 돌아다녔고, 길거리 음식도 엄청 먹어봤고, 6개 국어로 기본 인사 배웠고, 전 세계에서 온 친구들 사귀었고, 낯선 도시에서 여러 번 길 잃었고, 엄청 친절한 사람도 만났지만 사기도 당했고, 돈 두 번이나 떨어져서 호스텔에서 일했고, 비행기 한 번 놓쳤고, 식중독 세 번 걸렸는데, 지금 돌이켜보면 그게 독립심이랑 회복력, 다양한 문화를 존중하는 법을 가르쳐준 인생 최고의 경험이었어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 띄어쓰기 오류 + 문맥 파악 테스트 (Spacing Error Chaos)
// 극악 난이도 - 모든 혼란 요소 총집합
// ========================================
