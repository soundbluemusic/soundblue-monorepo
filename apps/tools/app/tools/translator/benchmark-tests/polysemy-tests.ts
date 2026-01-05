/**
 * 다의어 테스트 데이터 (Polysemy Tests)
 * 다의어 처리 번역 테스트
 */

import type { TestLevel } from '../types';

export const polysemyTests: TestLevel[] = [
  {
    id: 'polysemy-beginner',
    name: 'Beginner Polysemy',
    nameKo: '초급 다의어',
    categories: [
      {
        id: 'poly-beg-ko-en',
        name: 'Korean → English (Beginner)',
        nameKo: '한→영 초급',
        tests: [
          // 일 (work / day)
          {
            id: 'poly-beg-1a',
            input: '나는 일을 해요.',
            expected: 'I work.',
            direction: 'ko-en',
          },
          {
            id: 'poly-beg-1b',
            input: '오늘은 좋은 일이에요.',
            expected: 'Today is a good day.',
            direction: 'ko-en',
          },
          // 밤 (night / chestnut)
          {
            id: 'poly-beg-2a',
            input: '밤에 잠을 자요.',
            expected: 'I sleep at night.',
            direction: 'ko-en',
          },
          {
            id: 'poly-beg-2b',
            input: '밤을 구워 먹었어요.',
            expected: 'I roasted and ate chestnuts.',
            direction: 'ko-en',
          },
          // 눈 (eye / snow)
          {
            id: 'poly-beg-3a',
            input: '눈이 아파요.',
            expected: 'My eyes hurt.',
            direction: 'ko-en',
          },
          {
            id: 'poly-beg-3b',
            input: '눈이 와요.',
            expected: "It's snowing.",
            direction: 'ko-en',
          },
          // 말 (horse / speech)
          {
            id: 'poly-beg-4a',
            input: '말을 타요.',
            expected: 'I ride a horse.',
            direction: 'ko-en',
          },
          {
            id: 'poly-beg-4b',
            input: '말을 해요.',
            expected: 'I speak.',
            direction: 'ko-en',
          },
          // 배 (stomach / pear / ship)
          {
            id: 'poly-beg-5a',
            input: '배가 고파요.',
            expected: "I'm hungry.",
            direction: 'ko-en',
          },
          {
            id: 'poly-beg-5b',
            input: '배가 달아요.',
            expected: 'The pear is sweet.',
            direction: 'ko-en',
          },
          {
            id: 'poly-beg-5c',
            input: '배를 타요.',
            expected: 'I take a boat.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'poly-beg-en-ko',
        name: 'English → Korean (Beginner)',
        nameKo: '영→한 초급',
        tests: [
          // Date (날짜 / 데이트 / 대추야자)
          {
            id: 'poly-beg-6a',
            input: "What's the date today?",
            expected: '오늘 날짜가 뭐예요?',
            direction: 'en-ko',
          },
          {
            id: 'poly-beg-6b',
            input: 'I have a date tonight.',
            expected: '오늘 밤 데이트가 있어요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-beg-6c',
            input: 'I like eating dates.',
            expected: '대추야자 먹는 거 좋아해요.',
            direction: 'en-ko',
          },
          // Light (빛 / 가볍다 / 밝은)
          {
            id: 'poly-beg-7a',
            input: 'Turn on the light.',
            expected: '불을 켜세요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-beg-7b',
            input: 'This box is light.',
            expected: '이 상자는 가벼워요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-beg-7c',
            input: 'I like light colors.',
            expected: '밝은 색 좋아해요.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'polysemy-intermediate',
    name: 'Intermediate Polysemy',
    nameKo: '중급 다의어',
    categories: [
      {
        id: 'poly-int-ko-en',
        name: 'Korean → English (Intermediate)',
        nameKo: '한→영 중급',
        tests: [
          // 보다 (see / watch / meet / look / take exam)
          {
            id: 'poly-int-1a',
            input: '멀리서 산을 봤어요.',
            expected: 'I saw the mountain from afar.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-1b',
            input: '어제 영화를 봤어요.',
            expected: 'I watched a movie yesterday.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-1c',
            input: '내일 친구를 봐요.',
            expected: "I'm meeting my friend tomorrow.",
            direction: 'ko-en',
          },
          {
            id: 'poly-int-1d',
            input: '이거 좀 봐봐.',
            expected: 'Look at this.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-1e',
            input: '내일 시험을 봐요.',
            expected: "I'm taking an exam tomorrow.",
            direction: 'ko-en',
          },
          // 차다 (kick / cold / full / wear)
          {
            id: 'poly-int-2a',
            input: '공을 세게 찼어요.',
            expected: 'I kicked the ball hard.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-2b',
            input: '물이 너무 차요.',
            expected: 'The water is too cold.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-2c',
            input: '버스가 사람들로 가득 찼어요.',
            expected: 'The bus is full of people.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-2d',
            input: '시계를 차고 있어요.',
            expected: "I'm wearing a watch.",
            direction: 'ko-en',
          },
          // 잡다 (catch / book / hold / fix / set)
          {
            id: 'poly-int-3a',
            input: '도둑을 잡았어요.',
            expected: 'I caught the thief.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-3b',
            input: '호텔 방을 잡았어요.',
            expected: 'I booked a hotel room.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-3c',
            input: '손잡이를 꽉 잡으세요.',
            expected: 'Hold the handle tightly.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-3d',
            input: '기계 고장을 잡았어요.',
            expected: 'I fixed the machine breakdown.',
            direction: 'ko-en',
          },
          {
            id: 'poly-int-3e',
            input: '회의 시간을 잡았어요.',
            expected: 'I set the meeting time.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'poly-int-en-ko',
        name: 'English → Korean (Intermediate)',
        nameKo: '영→한 중급',
        tests: [
          // Run (달리다 / 운영하다 / 작동하다 / 출마하다)
          {
            id: 'poly-int-4a',
            input: 'I run 5km every morning.',
            expected: '매일 아침 5km를 달려요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-int-4b',
            input: 'She runs a restaurant.',
            expected: '그녀는 식당을 운영해요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-int-4c',
            input: 'This program runs on Windows.',
            expected: '이 프로그램은 윈도우에서 작동해요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-int-4d',
            input: "He's running for president.",
            expected: '그는 대통령 선거에 출마 중이에요.',
            direction: 'en-ko',
          },
          // Bank (은행 / 강둑 / 비축)
          {
            id: 'poly-int-5a',
            input: 'I need to go to the bank to withdraw money.',
            expected: '돈 찾으러 은행에 가야 해요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-int-5b',
            input: 'We sat on the bank of the river.',
            expected: '강둑에 앉았어요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-int-5c',
            input: 'I need to build up a bank of vacation days.',
            expected: '휴가를 좀 모아둬야 해요.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'polysemy-advanced',
    name: 'Advanced Polysemy',
    nameKo: '고급 다의어',
    categories: [
      {
        id: 'poly-adv-ko-en',
        name: 'Korean → English (Advanced)',
        nameKo: '한→영 고급',
        tests: [
          // 들다 (hold / hear / like / age / develop habit / lift)
          {
            id: 'poly-adv-1a',
            input: '가방을 들고 있어요.',
            expected: "I'm holding a bag.",
            direction: 'ko-en',
          },
          {
            id: 'poly-adv-1b',
            input: '소리가 들려요.',
            expected: 'I can hear a sound.',
            direction: 'ko-en',
          },
          {
            id: 'poly-adv-1c',
            input: '이 옷이 마음에 들어요.',
            expected: 'I like these clothes.',
            direction: 'ko-en',
          },
          {
            id: 'poly-adv-1d',
            input: '나이가 드니까 피곤해요.',
            expected: "I'm tired as I'm getting older.",
            direction: 'ko-en',
          },
          {
            id: 'poly-adv-1e',
            input: '운동하는 습관이 들었어요.',
            expected: "I've developed an exercise habit.",
            direction: 'ko-en',
          },
          {
            id: 'poly-adv-1f',
            input: '이 상자 좀 들어줄래요?',
            expected: 'Can you lift this box for me?',
            direction: 'ko-en',
          },
          // 밝다 (bright / cheerful / promising / smart)
          {
            id: 'poly-adv-2a',
            input: '이 방은 밝아요.',
            expected: 'This room is bright.',
            direction: 'ko-en',
          },
          {
            id: 'poly-adv-2b',
            input: '그 아이는 성격이 밝아요.',
            expected: 'That child has a cheerful personality.',
            direction: 'ko-en',
          },
          {
            id: 'poly-adv-2c',
            input: '미래가 밝아요.',
            expected: 'The future is promising.',
            direction: 'ko-en',
          },
          {
            id: 'poly-adv-2d',
            input: '그 학생은 머리가 밝아요.',
            expected: 'That student is smart.',
            direction: 'ko-en',
          },
          // 복합 다의어 문장
          {
            id: 'poly-adv-3',
            input: '배를 타고 가다가 배가 고파서 배를 먹었어요.',
            expected: 'While riding on the ship, I got hungry so I ate a pear.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'poly-adv-en-ko',
        name: 'English → Korean (Advanced)',
        nameKo: '영→한 고급',
        tests: [
          // Get (얻다 / 이해하다 / 도착하다 / 되다 / 사다 / 받다)
          {
            id: 'poly-adv-4a',
            input: 'I got a new job.',
            expected: '새 직장을 얻었어요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-4b',
            input: "I don't get what you mean.",
            expected: '무슨 말인지 이해가 안 돼요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-4c',
            input: 'What time did you get home?',
            expected: '몇 시에 집에 도착했어요?',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-4d',
            input: "It's getting cold.",
            expected: '추워지고 있어요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-4e',
            input: 'Can you get some milk?',
            expected: '우유 좀 사올래?',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-4f',
            input: 'I got your message.',
            expected: '메시지 받았어요.',
            direction: 'en-ko',
          },
          // Spring (봄 / 스프링 / 온천 / 뛰어오르다)
          {
            id: 'poly-adv-5a',
            input: 'Spring is my favorite season.',
            expected: '봄이 제일 좋아하는 계절이에요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-5b',
            input: 'The spring in my mattress is broken.',
            expected: '매트리스 스프링이 망가졌어요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-5c',
            input: 'We visited a natural hot spring.',
            expected: '천연 온천에 다녀왔어요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-5d',
            input: 'The cat sprang onto the table.',
            expected: '고양이가 테이블 위로 뛰어올랐어요.',
            direction: 'en-ko',
          },
          // Match (성냥 / 경기 / 어울리다 / 일치하다)
          {
            id: 'poly-adv-6a',
            input: 'Strike the match.',
            expected: '성냥을 그으세요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-6b',
            input: 'We won the match.',
            expected: '우리가 경기에서 이겼어요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-6c',
            input: 'These colors match well.',
            expected: '이 색들은 잘 어울려요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-adv-6d',
            input: 'The fingerprints match.',
            expected: '지문이 일치해요.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// SVO↔SOV 어순 변환 테스트 (Word Order Conversion)
// 4단계 길이별 테스트 - 짧은/중간/긴/매우 긴 문장
// ========================================
