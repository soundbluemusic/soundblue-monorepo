/**
 * 고유 표현 테스트 데이터 (Unique Tests)
 * 고유 표현 번역 테스트
 */

import type { TestLevel } from '../types';

export const uniqueTests: TestLevel[] = [
  {
    id: 'unique-comprehensive',
    name: 'Unique Tests (13 Types)',
    nameKo: '유니크 테스트 (13가지 유형)',
    categories: [
      {
        id: 'unique-1-neologism',
        name: '1. Neologisms & New Expressions',
        nameKo: '1. 신조어/새로운 표현',
        tests: [
          {
            id: 'neo-ko-1',
            input: '나 요즘 갓생 살고 있어. 아침 6시 기상, 운동, 공부 다 해!',
            expected:
              "I'm living my best life these days. Waking up at 6 AM, exercising, studying - doing it all!",
            direction: 'ko-en',
          },
          {
            id: 'neo-ko-2',
            input: '오늘 워라밸 완전 무너졌어. 밤 11시까지 야근했어.',
            expected:
              'My work-life balance completely collapsed today. I worked overtime until 11 PM.',
            direction: 'ko-en',
          },
          {
            id: 'neo-en-1',
            input: "I'm just doomscrolling through social media again. Can't stop.",
            expected: '또 SNS 보면서 우울한 뉴스만 쭉 훑어보고 있어. 멈출 수가 없어.',
            direction: 'en-ko',
          },
          {
            id: 'neo-en-2',
            input: "I'm experiencing major FOMO. Everyone's at the party except me.",
            expected: '완전 뒤처지는 기분이야. 나만 빼고 다 파티 가 있어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-2-compound',
        name: '2. Compound Word Creativity',
        nameKo: '2. 합성어 창의성',
        tests: [
          {
            id: 'comp-ko-1',
            input: '나 완전 먹방 러버야. 먹스타그램 찍어서 올렸어!',
            expected:
              "I'm a total eating show lover. I took food Instagram photos and posted them!",
            direction: 'ko-en',
          },
          {
            id: 'comp-ko-2',
            input: '주말에는 완전 집순이가 돼. 집돌이 남친이랑 집콕해.',
            expected:
              'On weekends, I become a total homebody girl. Staying home with my homebody boyfriend.',
            direction: 'ko-en',
          },
          {
            id: 'comp-en-1',
            input: "I'm such a binge-watcher. Watched entire season in one weekend.",
            expected: '완전 정주행 중독이야. 주말에 시즌 전편 다 봤어.',
            direction: 'en-ko',
          },
          {
            id: 'comp-en-2',
            input: "I'm a plant parent now. I have 30 houseplants and talk to them daily.",
            expected: '이제 완전 식집사야. 화분이 30개나 있고 매일 말 걸어줘.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-3-cultural',
        name: '3. Cultural Nuance',
        nameKo: '3. 문화적 뉘앙스',
        tests: [
          {
            id: 'cult-ko-1',
            input: '우리 사이에는 정이 들었어. 오래 알고 지내다 보니 가족 같은 느낌이야.',
            expected:
              "We've developed a deep emotional bond. Having known each other for a long time, it feels like family.",
            direction: 'ko-en',
          },
          {
            id: 'cult-ko-2',
            input: '눈치 좀 봐라! 분위기 파악 못 해?',
            expected: "Read the room! Can't you sense the atmosphere?",
            direction: 'ko-en',
          },
          {
            id: 'cult-en-1',
            input: 'I need my privacy. Personal space is important.',
            expected: '사생활이 필요해. 혼자만의 공간이 중요하거든.',
            direction: 'en-ko',
          },
          {
            id: 'cult-en-2',
            input: "This is so awkward. I don't know what to say.",
            expected: '이거 너무 어색해. 뭐라고 말해야 할지 모르겠어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-4-structure',
        name: '4. Complete Structure Transformation',
        nameKo: '4. 구조 완전 변환',
        tests: [
          {
            id: 'struct-ko-1',
            input: '나는 어제 친구가 추천한 그 새로운 식당에서 맛있는 파스타를 먹었다.',
            expected:
              'I ate delicious pasta at the new restaurant that my friend recommended yesterday.',
            direction: 'ko-en',
          },
          {
            id: 'struct-ko-2',
            input: '내가 어제 본 그 영화는 정말 재미있었다.',
            expected: 'The movie that I watched yesterday was really fun.',
            direction: 'ko-en',
          },
          {
            id: 'struct-en-1',
            input: 'The book that she gave me last week was very interesting.',
            expected: '지난주에 걔가 준 그 책 진짜 재밌었어.',
            direction: 'en-ko',
          },
          {
            id: 'struct-en-2',
            input: 'I met the person who works at the company that my friend started.',
            expected: '친구가 차린 회사에서 일하는 사람 만났어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-5-implicit',
        name: '5. Implicit & Connotative Meaning',
        nameKo: '5. 암시/함축 의미',
        tests: [
          {
            id: 'impl-ko-1',
            input: '글쎄요... 그게 좀... 생각해볼게요.',
            expected: "I'm not sure that's a good idea.",
            direction: 'ko-en',
          },
          {
            id: 'impl-ko-2',
            input: '여기 좀 덥네요...',
            expected: 'Could you open the window?',
            direction: 'ko-en',
          },
          {
            id: 'impl-en-1',
            input: "That's an interesting idea...",
            expected: '글쎄요, 잘 모르겠네요.',
            direction: 'en-ko',
          },
          {
            id: 'impl-en-2',
            input: "I'll let you know.",
            expected: '연락할게요.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-6-idiomatic',
        name: '6. Idiomatic Expression Variation',
        nameKo: '6. 관용어 응용',
        tests: [
          {
            id: 'idiom-ko-1',
            input: '티끌 모아 태산이라고, 조금씩 모으면 많아져.',
            expected: 'Every little bit adds up. If you save little by little, it becomes a lot.',
            direction: 'ko-en',
          },
          {
            id: 'idiom-ko-2',
            input: '티끌 모아 티끌이야. 아무리 모아봐야 소용없어.',
            expected: "A little is still a little. No matter how much you save, it's useless.",
            direction: 'ko-en',
          },
          {
            id: 'idiom-en-1',
            input: 'The early bird catches the worm. Wake up early!',
            expected: '일찍 일어나는 새가 벌레를 잡는다. 일찍 일어나!',
            direction: 'en-ko',
          },
          {
            id: 'idiom-en-2',
            input: "The early bird can have the worm. I'll sleep in.",
            expected: '일찍 일어나는 새가 벌레를 먹게 해. 나는 늦잠 잘 거야.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-7-irony',
        name: '7. Irony & Sarcasm',
        nameKo: '7. 반어/아이러니',
        tests: [
          {
            id: 'irony-ko-1',
            input: '와, 정말 잘했네!',
            expected: 'Oh great, just great!',
            direction: 'ko-en',
          },
          {
            id: 'irony-ko-2',
            input: '소방서가 불났대. 아이러니하지 않아?',
            expected: "The fire station caught on fire. Isn't that ironic?",
            direction: 'ko-en',
          },
          {
            id: 'irony-en-1',
            input: 'Oh wonderful! Just what I needed!',
            expected: '아 정말 좋다! 딱 필요했던 거야!',
            direction: 'en-ko',
          },
          {
            id: 'irony-en-2',
            input: "Thanks for nothing. You've been a huge help.",
            expected: '도움이 하나도 안 됐어. 정말 고마워.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-8-ellipsis',
        name: '8. Extreme Ellipsis',
        nameKo: '8. 극단적 생략',
        tests: [
          {
            id: 'ellip-ko-1',
            input: '영화? 응. 언제? 내일. 시간? 7시.',
            expected: 'Movie? Yes. When? Tomorrow. What time? 7 PM.',
            direction: 'ko-en',
          },
          {
            id: 'ellip-ko-2',
            input: 'ㅇㅋ ㄱㄱ',
            expected: "OK let's go",
            direction: 'ko-en',
          },
          {
            id: 'ellip-en-1',
            input: 'Coffee? Sure. Where? The usual. When? Now.',
            expected: '커피? 응. 어디? 늘 가던 데. 언제? 지금.',
            direction: 'en-ko',
          },
          {
            id: 'ellip-en-2',
            input: 'Running late. 5 mins. Sorry.',
            expected: '늦고 있어. 5분. 미안.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-9-inference',
        name: '9. Logical Inference',
        nameKo: '9. 논리 추론',
        tests: [
          {
            id: 'infer-ko-1',
            input: '알람이 안 울렸어. 회의에 늦었어.',
            expected: "My alarm didn't go off. I was late for the meeting.",
            direction: 'ko-en',
          },
          {
            id: 'infer-ko-2',
            input: '그는 시험에 떨어졌어. 부모님께 말하지 못했어. 요즘 밤늦게까지 안 들어와.',
            expected: "He failed the exam. Hasn't told his parents. Been coming home late lately.",
            direction: 'ko-en',
          },
          {
            id: 'infer-en-1',
            input: "The lights are off. She's probably asleep.",
            expected: '불이 꺼져 있어. 아마 자고 있을 거야.',
            direction: 'en-ko',
          },
          {
            id: 'infer-en-2',
            input: "He didn't respond. His phone is off. Something must have happened.",
            expected: '답이 없어. 폰도 꺼져 있어. 무슨 일 생긴 거 틀림없어.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-10-polysemy',
        name: '10. Polysemy Disambiguation',
        nameKo: '10. 다의어 구분',
        tests: [
          {
            id: 'poly-ko-1',
            input: '배가 아파요. 병원 가야 할 것 같아요.',
            expected: 'My stomach hurts. I think I need to go to the hospital.',
            direction: 'ko-en',
          },
          {
            id: 'poly-ko-2',
            input: '배가 달고 맛있어요. 제철 과일이에요.',
            expected: "The pear is sweet and delicious. It's seasonal fruit.",
            direction: 'ko-en',
          },
          {
            id: 'poly-ko-3',
            input: '배를 타고 제주도에 갔어요.',
            expected: 'I went to Jeju Island by ship.',
            direction: 'ko-en',
          },
          {
            id: 'poly-ko-4',
            input: '배를 타고 가다가 배가 고파서 배를 먹었어요.',
            expected: 'While riding on the ship, I got hungry so I ate a pear.',
            direction: 'ko-en',
          },
          {
            id: 'poly-en-1',
            input: 'I need to go to the bank to deposit money.',
            expected: '돈을 입금하러 은행에 가야 해요.',
            direction: 'en-ko',
          },
          {
            id: 'poly-en-2',
            input: 'We sat on the bank of the river and had a picnic.',
            expected: '우리는 강둑에 앉아서 소풍을 했어요.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-11-length',
        name: '11. Length Asymmetry',
        nameKo: '11. 길이 불균형',
        tests: [
          {
            id: 'len-ko-1',
            input: '정',
            expected: 'Affection',
            direction: 'ko-en',
          },
          {
            id: 'len-ko-2',
            input: '밥 먹었어?',
            expected: 'Have you eaten?',
            direction: 'ko-en',
          },
          {
            id: 'len-ko-3',
            input: '안물안궁',
            expected: "I didn't ask and I'm not curious.",
            direction: 'ko-en',
          },
          {
            id: 'len-ko-4',
            input: '우리 아버지는 손이 크셔서 손님들에게 음식을 많이 주시고 기부도 많이 하세요.',
            expected: 'My father is generous. He gives guests a lot of food and donates a lot.',
            direction: 'ko-en',
          },
          {
            id: 'len-en-1',
            input: 'Generous',
            expected: '손이 크다',
            direction: 'en-ko',
          },
          {
            id: 'len-en-2',
            input: 'The indescribable feeling of coziness and contentment',
            expected: '포근함',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-12-honorific',
        name: '12. Honorific Nuance',
        nameKo: '12. 존댓말 뉘앙스',
        tests: [
          {
            id: 'honor-ko-1',
            input: '안녕하십니까? 만나 뵙게 되어 영광입니다.',
            expected: "Hello. It's an honor to meet you.",
            direction: 'ko-en',
          },
          {
            id: 'honor-ko-2',
            input: '안녕하세요? 잘 지내세요?',
            expected: 'Hello! How are you?',
            direction: 'ko-en',
          },
          {
            id: 'honor-ko-3',
            input: '안녕? 뭐 해?',
            expected: 'Hi! What are you doing?',
            direction: 'ko-en',
          },
          {
            id: 'honor-ko-4',
            input: '할머니는 진지를 드셨어.',
            expected: 'Grandmother had her meal.',
            direction: 'ko-en',
          },
          {
            id: 'honor-en-1',
            input: 'Yes, that is correct, sir.',
            expected: '네, 그렇습니다.',
            direction: 'en-ko',
          },
          {
            id: 'honor-en-2',
            input: 'Yeah, sure.',
            expected: '응, 그래.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'unique-13-onomatopoeia',
        name: '13. Onomatopoeia & Mimetic Words',
        nameKo: '13. 의성어/의태어',
        tests: [
          {
            id: 'ono-ko-1',
            input: '개가 멍멍 짖고, 고양이가 야옹 울고, 닭이 꼬끼오 해요.',
            expected:
              'The dog barks (woof woof), the cat meows, and the rooster crows (cock-a-doodle-doo).',
            direction: 'ko-en',
          },
          {
            id: 'ono-ko-2',
            input: '문을 똑똑 두드리고, 전화가 따르릉 울리고, 유리가 쨍그랑 깨졌어요.',
            expected:
              'I knocked on the door (knock knock), the phone rang (ring ring), and the glass shattered (crash).',
            direction: 'ko-en',
          },
          {
            id: 'ono-ko-3',
            input: '빙글빙글 돌고, 살금살금 다가가고, 펄쩍펄쩍 뛰어요.',
            expected:
              'It spins round and round, I approach stealthily, and they jump high repeatedly.',
            direction: 'ko-en',
          },
          {
            id: 'ono-ko-4',
            input: '별이 반짝반짝 빛나고, 길이 울퉁불퉁하고, 쿠션이 말랑말랑해요.',
            expected:
              'Stars are twinkling brightly, the road is bumpy and uneven, and the cushion is soft and squishy.',
            direction: 'ko-en',
          },
          {
            id: 'ono-ko-5',
            input: '가슴이 두근두근해요.',
            expected: 'My heart is pounding with excitement.',
            direction: 'ko-en',
          },
          {
            id: 'ono-ko-6',
            input: '화가 부글부글 끓어요.',
            expected: "I'm boiling with anger.",
            direction: 'ko-en',
          },
          {
            id: 'ono-ko-7',
            input: '문을 톡 두드렸어요.',
            expected: 'I tapped the door lightly.',
            direction: 'ko-en',
          },
          {
            id: 'ono-ko-8',
            input: '문을 쾅 닫았어요.',
            expected: 'I slammed the door hard.',
            direction: 'ko-en',
          },
          {
            id: 'ono-ko-9',
            input: '아기가 아장아장 걸어요.',
            expected: 'The baby is toddling.',
            direction: 'ko-en',
          },
          {
            id: 'ono-en-1',
            input: 'The clock goes tick-tock.',
            expected: '시계가 똑딱똑딱 가요.',
            direction: 'en-ko',
          },
          {
            id: 'ono-en-2',
            input: 'The water splashed everywhere.',
            expected: '물이 철벙철벙 튀었어요.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 다의어/동음이의어 테스트 (Polysemy & Homonyms)
// 문맥 기반 의미 구분 테스트 - 초급/중급/고급 3단계
// ========================================
