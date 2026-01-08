/**
 * 문맥 테스트 데이터 (Context Tests)
 * 문맥 기반 번역 테스트
 */

import type { TestLevel } from '../types';

export const contextTests: TestLevel[] = [
  {
    id: 'ctx-short',
    name: 'Short Sentences (1-2)',
    nameKo: '짧은 문장 (1-2문장)',
    categories: [
      {
        id: 'ctx-pronoun',
        name: 'Pronoun Context',
        nameKo: '대명사 문맥',
        tests: [
          {
            id: 'ctx-pronoun-ko',
            input: '철수가 영희를 만났다. 그는 그녀에게 꽃을 줬다.',
            expected: 'Cheolsu met Younghee. He gave her flowers.',
            direction: 'ko-en',
          },
          {
            id: 'ctx-pronoun-en',
            input: 'John called Mary. She was happy to hear from him.',
            expected: '존이 메리한테 전화했다. 메리는 연락 받고 기뻤다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-omitted',
        name: 'Omitted Subject',
        nameKo: '생략된 주어',
        tests: [
          {
            id: 'ctx-omit-ko',
            input: '어제 영화 봤어. 정말 재미있었어.',
            expected: 'I watched a movie yesterday. It was really fun.',
            direction: 'ko-en',
          },
          {
            id: 'ctx-omit-en',
            input: 'Got up early. Made breakfast. Went to work.',
            expected: '일찍 일어났다. 아침을 준비했다. 출근했다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-ambiguous',
        name: 'Ambiguous Expression',
        nameKo: '중의적 표현',
        tests: [
          {
            id: 'ctx-ambig-ko',
            input: '나는 뜨거운 커피를 좋아한다.',
            expected: 'I like hot coffee.',
            direction: 'ko-en',
          },
          {
            id: 'ctx-ambig-en',
            input: 'I saw her duck.',
            expected: '나는 그녀의 오리를 봤다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-temporal',
        name: 'Temporal Context',
        nameKo: '시간적 문맥',
        tests: [
          {
            id: 'ctx-temp-ko',
            input: '밥을 먹었다. 그 전에 손을 씻었다.',
            expected: 'I ate. I washed my hands before that.',
            direction: 'ko-en',
          },
          {
            id: 'ctx-temp-en',
            input: 'I arrived late. Traffic was terrible earlier.',
            expected: '늦게 도착했다. 아까 길이 너무 막혔다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'ctx-medium',
    name: 'Medium Sentences (3-5)',
    nameKo: '중간 문장 (3-5문장)',
    categories: [
      {
        id: 'ctx-complex-pronoun',
        name: 'Complex Pronoun',
        nameKo: '복합 대명사',
        tests: [
          {
            id: 'ctx-cpron-ko',
            input:
              '철수와 영희가 카페에 갔다. 철수는 커피를 주문했고, 영희는 차를 주문했다. 그는 그녀의 선택이 마음에 들었다. 그들은 즐거운 시간을 보냈다.',
            expected:
              'Cheolsu and Younghee went to a cafe. Cheolsu ordered coffee, and Younghee ordered tea. He liked her choice. They had a good time.',
            direction: 'ko-en',
          },
          {
            id: 'ctx-cpron-en',
            input:
              "Tom and his brother went fishing. Tom caught a big fish, but his brother didn't catch anything. He was disappointed, but he was happy for him. They decided to share it.",
            expected:
              '톰이랑 형이 낚시 갔다. 톰은 큰 물고기를 잡았는데 형은 아무것도 못 잡았다. 형은 아쉬웠지만 톰 덕에 기뻤다. 둘이 나눠 먹기로 했다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-cause-effect',
        name: 'Cause-Effect',
        nameKo: '인과관계',
        tests: [
          {
            id: 'ctx-cause-ko',
            input:
              '비가 많이 왔다. 도로가 침수되었다. 그래서 회사에 못 갔다. 상사에게 연락했다. 이해해 주셨다.',
            expected:
              "It rained a lot. The roads were flooded. So I couldn't go to work. I contacted my boss. He understood.",
            direction: 'ko-en',
          },
          {
            id: 'ctx-cause-en',
            input:
              "The alarm didn't go off. I woke up late. I skipped breakfast. I rushed to the office. I was still late for the meeting.",
            expected:
              '알람이 안 울렸다. 늦게 일어났다. 아침도 못 먹고 뛰어갔다. 그래도 회의에 늦었다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-inference',
        name: 'Omission & Inference',
        nameKo: '생략과 추론',
        tests: [
          {
            id: 'ctx-infer-ko',
            input:
              '어제 백화점에 갔어. 옷을 많이 봤어. 마음에 드는 게 있었어. 너무 비쌌어. 결국 안 샀어.',
            expected:
              "I went to the department store yesterday. I looked at a lot of clothes. There was something I liked. It was too expensive. I didn't buy it in the end.",
            direction: 'ko-en',
          },
          {
            id: 'ctx-infer-en',
            input:
              'Went to the new restaurant. Ordered the special. Waited forever. Tasted amazing. Worth the wait.',
            expected:
              '새 식당 갔다. 스페셜 시켰다. 한참 기다렸다. 근데 맛이 끝내줬다. 기다린 보람 있었다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-speaker',
        name: 'Speaker Change',
        nameKo: '화자 전환',
        tests: [
          {
            id: 'ctx-speaker-ko',
            input:
              '"오늘 영화 볼래?" 친구가 물었다. "좋아! 무슨 영화?" 내가 대답했다. "액션 영화 어때?" 그가 제안했다. "완벽해!" 나는 동의했다.',
            expected:
              '"Want to watch a movie today?" my friend asked. "Sure! What movie?" I replied. "How about an action movie?" he suggested. "Perfect!" I agreed.',
            direction: 'ko-en',
          },
          {
            id: 'ctx-speaker-en',
            input:
              '"I\'m hungry," she said. "Let\'s order pizza," I suggested. "Great idea!" she exclaimed. "Should we get the usual?" I asked. "Yes, please!" she responded.',
            expected:
              '"배고파." 그녀가 말했다. "피자 시키자." 내가 말했다. "좋아!" 그녀가 말했다. "맨날 먹던 거로 시킬까?" 내가 물었다. "응!" 그녀가 대답했다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'ctx-long',
    name: 'Long Sentences (6-10)',
    nameKo: '긴 문장 (6-10문장)',
    categories: [
      {
        id: 'ctx-complex-char',
        name: 'Complex Characters',
        nameKo: '복합 인물 관계',
        tests: [
          {
            id: 'ctx-char-ko',
            input:
              '철수는 회사 동료인 영희에게 호감이 있었다. 영희는 철수의 친구인 민수를 좋아했다. 민수는 영희의 친구인 지은이와 사귀고 있었다. 철수는 이 사실을 몰랐다. 어느 날 철수가 영희에게 고백했다. 영희는 난처했지만 정중하게 거절했다. 철수는 상처받았지만 이해하려고 노력했다. 나중에 민수에게서 전체 상황을 들었다. 철수는 민수와 지은이를 축복해주기로 했다. 세 사람은 여전히 좋은 친구로 지냈다.',
            expected:
              "Cheolsu had feelings for his coworker Younghee. Younghee liked Cheolsu's friend Minsu. Minsu was dating Younghee's friend Jieun. Cheolsu didn't know this. One day, Cheolsu confessed to Younghee. Younghee was in a difficult position but politely declined. Cheolsu was hurt but tried to understand. Later, he heard the whole situation from Minsu. Cheolsu decided to bless Minsu and Jieun. The three remained good friends.",
            direction: 'ko-en',
          },
          {
            id: 'ctx-char-en',
            input:
              "Sarah worked at a marketing firm. She had a project deadline approaching. Her manager, David, was very demanding. David's boss, the CEO, was even more strict. Sarah asked her colleague Mike for help. Mike agreed but he was also overwhelmed with his own work. Sarah decided to work overtime. She completed the project just in time. David was impressed and praised her. The CEO recognized her dedication and gave her a bonus.",
            expected:
              '사라는 마케팅 회사에 다녔다. 프로젝트 마감이 다가오고 있었다. 매니저 데이비드는 까다로운 사람이었다. 데이비드 위의 대표는 더 까다로웠다. 사라가 동료 마이크한테 도움을 요청했다. 마이크도 자기 일이 밀려 있었지만 그래도 도와주겠다고 했다. 사라는 야근하기로 했다. 간신히 제시간에 끝냈다. 데이비드가 감동받아서 칭찬해줬다. 대표도 노력을 인정해서 보너스를 줬다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-time-sequence',
        name: 'Complex Time Sequence',
        nameKo: '시간 순서 복잡',
        tests: [
          {
            id: 'ctx-time-ko',
            input:
              '지난주에 친구를 만났다. 그 전 주에 그 친구가 전화했었다. 전화에서 그는 중요한 소식이 있다고 했다. 나는 궁금했지만 참았다. 만나서 그가 말하길, 3개월 전부터 이직을 준비했다고 했다. 그리고 드디어 합격했다고 했다. 다음 달부터 새 회사에 출근한다고 했다. 나는 축하해줬다. 우리는 그가 떠나기 전에 다시 만나기로 약속했다. 오늘 그 약속을 지키려고 준비 중이다.',
            expected:
              "I met my friend last week. The week before that, he had called me. On the phone, he said he had important news. I was curious but held back. When we met, he told me he had been preparing to change jobs for three months. And he finally got accepted. He said he would start at the new company next month. I congratulated him. We promised to meet again before he left. Today, I'm preparing to keep that promise.",
            direction: 'ko-en',
          },
          {
            id: 'ctx-time-en',
            input:
              "Yesterday I found an old photo. It was taken five years ago at my graduation. I remembered that day clearly. The morning had been chaotic because I woke up late. I had stayed up the night before celebrating with friends. But I made it to the ceremony on time. My parents were so proud. After the ceremony, we had dinner at a fancy restaurant. Now, looking at the photo, I realize how much has changed. Tomorrow, I'll attend my sister's graduation and the cycle continues.",
            expected:
              '어제 오래된 사진을 발견했다. 5년 전 졸업식 때 찍은 거였다. 그날이 또렷이 기억났다. 늦게 일어나서 아침이 정신없었다. 전날 밤 친구들이랑 축하하느라 늦게까지 안 잤었다. 근데 식에는 제시간에 도착했다. 부모님이 엄청 뿌듯해하셨다. 식 끝나고 좋은 식당에서 저녁 먹었다. 지금 사진 보니까 정말 많이 변했구나 싶다. 내일은 여동생 졸업식이다. 이렇게 반복되는구나.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-implicit',
        name: 'Implicit Meaning',
        nameKo: '암시적 의미',
        tests: [
          {
            id: 'ctx-impl-ko',
            input:
              '회의가 끝났다. 팀장이 나를 불렀다. 사무실로 오라고 했다. 들어가자 표정이 심각했다. 앉으라는 제스처를 했다. 그는 한숨을 쉬었다. "자네 요즘 프로젝트 진행 상황이..." 그가 말을 흐렸다. 나는 무엇을 예상해야 할지 알았다. "죄송합니다. 제가 더 노력하겠습니다." 내가 먼저 말했다.',
            expected:
              'The meeting ended. The team leader called me. He told me to come to his office. When I entered, his expression was serious. He gestured for me to sit. He sighed. "Your recent project progress..." he trailed off. I knew what to expect. "I\'m sorry. I\'ll work harder," I said first.',
            direction: 'ko-en',
          },
          {
            id: 'ctx-impl-en',
            input:
              'The doctor walked in slowly. She looked at the chart. Then she looked at me. She pulled up a chair. "Let\'s talk about your results," she said gently. Her tone was soft. Too soft. I felt my heart sink. "Is it bad?" I asked. She reached for my hand. That\'s when I knew.',
            expected:
              '의사 선생님이 천천히 들어왔다. 차트를 보더니 나를 봤다. 의자를 끌어당겨 앉았다. "검사 결과 얘기 좀 하죠." 부드럽게 말했다. 목소리가 너무 부드러웠다. 가슴이 철렁 내려앉았다. "안 좋은 건가요?" 물었다. 선생님이 내 손을 잡았다. 그 순간 알았다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'ctx-special',
    name: 'Special Context',
    nameKo: '특수 문맥',
    categories: [
      {
        id: 'ctx-cultural',
        name: 'Cultural Context',
        nameKo: '문화적 문맥',
        tests: [
          {
            id: 'ctx-culture-ko',
            input:
              '설날에 할머니 댁에 갔다. 세배를 드렸다. 할머니께서 세배돈을 주셨다. 온 가족이 모여 떡국을 먹었다.',
            expected:
              "I went to my grandmother's house on Lunar New Year. I performed the New Year's bow. Grandmother gave me New Year's money. The whole family gathered and ate rice cake soup.",
            direction: 'ko-en',
          },
          {
            id: 'ctx-culture-en',
            input:
              "On Thanksgiving, we gathered at my parents' house. We carved the turkey. Everyone shared what they were grateful for. Then we watched football together.",
            expected:
              '추수감사절에 부모님 댁에 모였다. 칠면조를 잘라 나눴다. 다들 감사한 것들 얘기했다. 그러고 나서 다 같이 미식축구 봤다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'ctx-metaphor',
        name: 'Metaphors & Analogies',
        nameKo: '은유와 비유',
        tests: [
          {
            id: 'ctx-meta-ko',
            input:
              '그의 말은 비수가 되어 내 가슴을 찔렀다. 세상이 무너지는 것 같았다. 하지만 나는 일어서야 했다. 폭풍이 지나가면 다시 해가 뜬다.',
            expected:
              'His words became daggers and stabbed my heart. It felt like the world was collapsing. But I had to stand up. After the storm passes, the sun rises again.',
            direction: 'ko-en',
          },
          {
            id: 'ctx-meta-en',
            input:
              'She was a ray of sunshine in my dark days. Her smile could light up a room. When she left, winter came to my heart.',
            expected:
              '힘들 때 그녀는 한 줄기 빛이었다. 그녀가 웃으면 분위기가 확 밝아졌다. 그녀가 떠나고 마음이 꽁꽁 얼어붙었다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 오타 처리 테스트 데이터 (Typo Handling Tests)
// ========================================
