/**
 * 오타 테스트 데이터 (Typo Tests)
 * 오타 처리 번역 테스트
 */

import type { TestLevel } from '../types';

export const typoTests: TestLevel[] = [
  {
    id: 'typo-level-1',
    name: 'Level 1 - Basic Typos',
    nameKo: 'Level 1 - 기본 오타',
    categories: [
      {
        id: 'typo-spelling',
        name: 'Spelling Errors',
        nameKo: '철자 오류',
        tests: [
          {
            id: 'typo-spell-ko',
            input: '오뉘 낭씨가 정말 조아요. 공원에서 산채하기 딱 조은 날씨에요.',
            expected:
              "The weather is really nice today. It's perfect weather for a walk in the park.",
            direction: 'ko-en',
          },
          {
            id: 'typo-spell-en',
            input: 'I realy liek this moive. It was awsome and the actors were grate.',
            expected: '이 영화 진짜 좋아. 완전 대박이었고 배우들 연기 짱이었어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-spacing',
        name: 'Spacing Errors',
        nameKo: '띄어쓰기 오류',
        tests: [
          {
            id: 'typo-space-ko',
            input: '나는어제친구를만나서영화를봤어요. 정말재미있었어요.',
            expected: 'I met my friend yesterday and watched a movie. It was really fun.',
            direction: 'ko-en',
          },
          {
            id: 'typo-space-en',
            input: 'Iwentto thestoreyesterday andbot somegroceries.',
            expected: '어제 마트 가서 장 봤어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-duplicate',
        name: 'Duplicate Characters',
        nameKo: '중복 문자',
        tests: [
          {
            id: 'typo-dup-ko',
            input: '오늘늘 정말말 행복해요요. 친구들과 재미있게 놀았어어요.',
            expected: "I'm really happy today. I had fun playing with my friends.",
            direction: 'ko-en',
          },
          {
            id: 'typo-dup-en',
            input: 'I amm soo happpy todayy. Wee had a greatt timee.',
            expected: '오늘 너무 행복해. 완전 재밌었어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-adjacent',
        name: 'Adjacent Key Typos',
        nameKo: '인접 키 오타',
        tests: [
          {
            id: 'typo-adj-ko',
            input: '안녕하세오. 만나서 반갑습bida. 오늘 좋s 하루 되세요.',
            expected: 'Hello. Nice to meet you. Have a good day today.',
            direction: 'ko-en',
          },
          {
            id: 'typo-adj-en',
            input: 'Hwllo! Hoe are yoi today? I hope ypu are doing wrll.',
            expected: '안녕하세요! 잘 지내시죠? 좋은 하루 보내세요.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'typo-level-2',
    name: 'Level 2 - Intermediate Typos',
    nameKo: 'Level 2 - 중급 오타',
    categories: [
      {
        id: 'typo-homophone',
        name: 'Homophone Confusion',
        nameKo: '동음이의어 혼동',
        tests: [
          {
            id: 'typo-homo-ko',
            input: '그는 회사에 출근하는 길에 커피를 마셨다. 그래서 기분이 좋앗다.',
            expected: 'He drank coffee on his way to work. So he felt good.',
            direction: 'ko-en',
          },
          {
            id: 'typo-homo-en',
            input:
              'Their going too the store too buy some meet for dinner. Its going to be delicious.',
            expected: '저녁 먹으려고 고기 사러 마트 가는 중이야. 맛있겠다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-particle',
        name: 'Particle/Grammar Errors',
        nameKo: '조사/문법 오류',
        tests: [
          {
            id: 'typo-part-ko',
            input: '나을 친구가 만났다. 우리을 영화를 봤다. 영화은 재미있었다.',
            expected: 'I met my friend. We watched a movie. The movie was fun.',
            direction: 'ko-en',
          },
          {
            id: 'typo-part-en',
            input: 'I goes to school everyday. She like ice cream. They was playing soccer.',
            expected: '나 매일 학교 가. 걔는 아이스크림 좋아해. 걔네 축구하고 있었어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-combined',
        name: 'Combined Typos',
        nameKo: '복합 오타',
        tests: [
          {
            id: 'typo-comb-ko',
            input: '어제친구를만나서 맛잇는 음식을먹었어요. 정말즐거웟어요.',
            expected: 'I met my friend yesterday and ate delicious food. It was really enjoyable.',
            direction: 'ko-en',
          },
          {
            id: 'typo-comb-en',
            input: 'Yeserday I whent too thee movies wiht my frend. Wee had an amzing tiem.',
            expected: '어제 친구랑 영화 봤어. 완전 재밌었어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-punctuation',
        name: 'Punctuation Errors',
        nameKo: '문장 부호 오류',
        tests: [
          {
            id: 'typo-punct-ko',
            input: '안녕하세요.오늘 날씨가 정말 좋네요.산책 가실래요.',
            expected: 'Hello. The weather is really nice today. Would you like to go for a walk?',
            direction: 'ko-en',
          },
          {
            id: 'typo-punct-en',
            input: 'Hello,how are you.Im doing great,thank you.What about you,',
            expected: '안녕, 잘 지내? 나 잘 지내, 고마워. 넌?',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'typo-level-3',
    name: 'Level 3 - Advanced Typos',
    nameKo: 'Level 3 - 고급 오타',
    categories: [
      {
        id: 'typo-severe',
        name: 'Severe Grammar + Typo',
        nameKo: '문법+오타 복합',
        tests: [
          {
            id: 'typo-sev-ko',
            input:
              '나 어제를 친구을 만나서 였다 영화 봤다. 정말 재밋었서요 그리고 맛있는것 먹었어.',
            expected:
              'I met my friend yesterday and watched a movie. It was really fun and I ate something delicious.',
            direction: 'ko-en',
          },
          {
            id: 'typo-sev-en',
            input:
              'I yesterday go to store and buyed some thing. It very expensive was but I really need it so I bought.',
            expected: '어제 가게 가서 뭐 샀어. 엄청 비쌌는데 진짜 필요해서 샀어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-difficult',
        name: 'Difficult-to-Parse',
        nameKo: '의미 파악 어려움',
        tests: [
          {
            id: 'typo-diff-ko',
            input: '그 사람이 나한대 말햇든게 그냥 거짖말이엇어. 난 정말 화가 낫었는대 참앗어.',
            expected:
              'What that person told me was just a lie. I was really angry but I held it in.',
            direction: 'ko-en',
          },
          {
            id: 'typo-diff-en',
            input:
              'Wen I was yung, I use to beleive in fairy tails. Now I no that there not reel, but I stil enjoy reeding them.',
            expected: '어렸을 때 동화를 믿었어. 이제 진짜가 아닌 거 알지만 아직도 읽는 건 좋아해.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-extreme',
        name: 'Extreme - No Spaces',
        nameKo: '극단적 - 띄어쓰기 전무',
        tests: [
          {
            id: 'typo-ext-ko',
            input: '오늘낭씨조아서 나친구랑공원갓는대사람만타서 별로엿어요그래서우린카페로갓어요',
            expected:
              "The weather was nice today so I went to the park with my friend, but there were too many people so it wasn't great, so we went to a cafe.",
            direction: 'ko-en',
          },
          {
            id: 'typo-ext-en',
            input:
              'IwenttothebeachyesterdaybutitwasveryhotsoididntstaylongandwenthomeearlybecauseIwasfeelingtired',
            expected: '어제 해변 갔는데 너무 더워서 오래 안 있고 피곤해서 일찍 집에 왔어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-internet',
        name: 'Internet Abbreviations',
        nameKo: '인터넷 줄임말',
        tests: [
          {
            id: 'typo-int-ko',
            input: '나 엊그제 친구 만남. 우리 밥 먹음. 맛있음. 또 가고싶음. 다음주에 갈꺼임.',
            expected:
              "I met my friend the day before yesterday. We ate. It was delicious. I want to go again. I'm going next week.",
            direction: 'ko-en',
          },
          {
            id: 'typo-int-en',
            input:
              'tmrw gonna meet frnd. we r going 2 the mall. gonna buy stuff. prob gonna eat 2. cant w8!',
            expected: '내일 친구 만나. 쇼핑몰 갈 거야. 뭐 좀 사고. 아마 밥도 먹을 듯. 기대돼!',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'typo-level-extra',
    name: 'Level 3-Extra - Real-World',
    nameKo: 'Level 3-Extra - 실전',
    categories: [
      {
        id: 'typo-rushed',
        name: 'Rushed Messages',
        nameKo: '급한 메시지',
        tests: [
          {
            id: 'typo-rush-ko',
            input: '미안 늦었어ㅠㅠ 지하철놓쳐서ㅜㅜ 10분안에도착할게!! 커피사갈까??',
            expected:
              "Sorry I'm late. I missed the subway. I'll arrive in 10 minutes!! Should I buy coffee?",
            direction: 'ko-en',
          },
          {
            id: 'typo-rush-en',
            input: 'omg running late!!! traffic is crazyyy!!! b there in 5 mins!!! srry!!!',
            expected: '헐 늦었어!!! 길 완전 막혀!!! 5분 안에 갈게!!! 미안!!!',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-emotional',
        name: 'Emotional Messages',
        nameKo: '감정적 메시지',
        tests: [
          {
            id: 'typo-emo-ko',
            input:
              '진짜진짜 화나!!!!!! 도대체 왜이러는거야!!!???? 이해할수가없어!!!!! 아ㅏㅏㅏㅏ악!!!',
            expected: "I'm really angry! Why are you doing this!? I can't understand! Ugh!",
            direction: 'ko-en',
          },
          {
            id: 'typo-emo-en',
            input: 'NOOOOO WAYYYYY!!!!!!! THIS IS AMAZINGGGGG!!!!! BEST DAY EVERRRRRR!!!!!!!',
            expected: '헐 진짜!!!!!!! 미쳤다!!!!! 인생 최고의 날!!!!!!!',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'typo-mixed-lang',
        name: 'Mixed Language',
        nameKo: '다국어 혼용',
        tests: [
          {
            id: 'typo-mix-ko',
            input: '오늘 meeting이 cancel됐어. 그래서 나 free해. 같이 dinner 할래?',
            expected: "Today's meeting was cancelled. So I'm free. Want to have dinner together?",
            direction: 'ko-en',
          },
          {
            id: 'typo-mix-en',
            input: "I'm so 피곤해 today. Had way too much 일 at the office. Need some 휴식 asap!",
            expected: '오늘 너무 피곤해. 사무실에서 일이 너무 많았어. 빨리 좀 쉬어야 해!',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 유니크 테스트 데이터 (Unique Tests - 13 Types)
// 알고리즘 기반 번역 시스템의 종합 능력 검증
// 사전 기반으로는 불가능한 13가지 영역을 하나의 세트로 테스트
// ========================================
