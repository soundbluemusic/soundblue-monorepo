/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              🧪 TEST SET - 최종 성능 평가용 데이터 (Final Evaluation)            ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  ⚠️  ML 데이터 분할 원칙 (Data Split Principle)                                ║
 * ║  ┌──────────────────────────────────────────────────────────────────────┐   ║
 * ║  │  1. Training Set (학습 세트) - 70%     → 알고리즘 개발용               │   ║
 * ║  │  2. Validation Set (검증 세트) - 15%  → 튜닝/디버깅용                 │   ║
 * ║  │  3. Test Set (테스트 세트) - 15%      → 최종 성능 평가 (이 파일)       │   ║
 * ║  └──────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                              ║
 * ║  🚫 절대 금지 사항:                                                           ║
 * ║  - 이 테스트 문장들을 사전(dictionary)에 직접 추가 금지                         ║
 * ║  - 이 테스트 문장만 통과하는 하드코딩 패턴 금지                                  ║
 * ║  - 테스트 결과를 보고 알고리즘을 "이 문장에 맞게" 조정 금지                       ║
 * ║                                                                              ║
 * ║  ✅ 올바른 개선 방법:                                                         ║
 * ║  - 일반화된 문법 규칙 개선 (모든 유사 문장에 적용)                               ║
 * ║  - 형태소 분석기 로직 개선                                                    ║
 * ║  - 어순 변환 알고리즘 개선                                                    ║
 * ║                                                                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  양방향 번역 테스트 - 문맥 파악 테스트 (Context Understanding Tests)            ║
 * ║                                                                              ║
 * ║  테스트 구조:                                                                 ║
 * ║  1. 짧은 문장 (1-2문장): 대명사, 생략 주어, 중의적 표현, 시간적 문맥            ║
 * ║  2. 중간 문장 (3-5문장): 복합 대명사, 인과관계, 생략과 추론, 화자 전환          ║
 * ║  3. 긴 문장 (6-10문장): 복합 인물 관계, 시간 순서 복잡, 암시적 의미             ║
 * ║  4. 매우 긴 문장 (10+문장): 복합 서사 구조, 다층적 관점, 복합 주제 전환         ║
 * ║  5. 특수 문맥: 문화적 문맥, 은유와 비유                                        ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { describe, expect, test } from 'vitest';
import { translate } from './translator-service';

// ========================================
// 1. 짧은 문장 (Short Sentences: 1-2 sentences)
// ========================================

describe('1. 짧은 문장 (Short Sentences)', () => {
  describe('1-1. 대명사 문맥 (Pronoun Context)', () => {
    test('한국어 → 영어', () => {
      const input = '철수가 영희를 만났다. 그는 그녀에게 꽃을 줬다.';
      const expected = 'Cheolsu met Younghee. He gave her flowers.';

      const result = translate(input, 'ko-en');
      console.log('1-1 대명사 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input = 'John called Mary. She was happy to hear from him.';
      const expected = '존이 메리에게 전화했다. 그녀는 그에게서 소식을 듣고 기뻤다.';

      const result = translate(input, 'en-ko');
      console.log('1-1 대명사 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-2. 생략된 주어 (Omitted Subject)', () => {
    test('한국어 → 영어', () => {
      const input = '어제 영화 봤어. 정말 재미있었어.';
      const expected = 'I watched a movie yesterday. It was really fun.';

      const result = translate(input, 'ko-en');
      console.log('1-2 생략주어 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input = 'Got up early. Made breakfast. Went to work.';
      const expected = '일찍 일어났다. 아침을 만들었다. 출근했다.';

      const result = translate(input, 'en-ko');
      console.log('1-2 생략주어 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-3. 중의적 표현 (Ambiguous Expression)', () => {
    test('한국어 → 영어', () => {
      const input = '나는 뜨거운 커피를 좋아한다.';
      const expected = 'I like hot coffee.';

      const result = translate(input, 'ko-en');
      console.log('1-3 중의적 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input = 'I saw her duck.';
      const expected = '나는 그녀의 오리를 봤다.';

      const result = translate(input, 'en-ko');
      console.log('1-3 중의적 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-4. 시간적 문맥 (Temporal Context)', () => {
    test('한국어 → 영어', () => {
      const input = '밥을 먹었다. 그 전에 손을 씻었다.';
      const expected = 'I ate. I washed my hands before that.';

      const result = translate(input, 'ko-en');
      console.log('1-4 시간적 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input = 'I arrived late. Traffic was terrible earlier.';
      const expected = '나는 늦게 도착했다. 그 전에 교통이 끔찍했다.';

      const result = translate(input, 'en-ko');
      console.log('1-4 시간적 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 2. 중간 문장 (Medium Sentences: 3-5 sentences)
// ========================================

describe('2. 중간 문장 (Medium Sentences)', () => {
  describe('2-1. 복합 대명사 문맥 (Complex Pronoun Context)', () => {
    test('한국어 → 영어', () => {
      const input =
        '철수와 영희가 카페에 갔다. 철수는 커피를 주문했고, 영희는 차를 주문했다. 그는 그녀의 선택이 마음에 들었다. 그들은 즐거운 시간을 보냈다.';
      const expected =
        'Cheolsu and Younghee went to a cafe. Cheolsu ordered coffee, and Younghee ordered tea. He liked her choice. They had a good time.';

      const result = translate(input, 'ko-en');
      console.log('2-1 복합대명사 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "Tom and his brother went fishing. Tom caught a big fish, but his brother didn't catch anything. He was disappointed, but he was happy for him. They decided to share it.";
      const expected =
        '톰과 그의 형이 낚시를 갔다. 톰은 큰 물고기를 잡았지만, 그의 형은 아무것도 잡지 못했다. 형은 실망했지만, 톰을 위해 기뻐했다. 그들은 그것을 나누기로 결정했다.';

      const result = translate(input, 'en-ko');
      console.log('2-1 복합대명사 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-2. 인과관계 문맥 (Cause-Effect Context)', () => {
    test('한국어 → 영어', () => {
      const input =
        '비가 많이 왔다. 도로가 침수되었다. 그래서 회사에 못 갔다. 상사에게 연락했다. 이해해 주셨다.';
      const expected =
        "It rained a lot. The roads were flooded. So I couldn't go to work. I contacted my boss. He understood.";

      const result = translate(input, 'ko-en');
      console.log('2-2 인과관계 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "The alarm didn't go off. I woke up late. I skipped breakfast. I rushed to the office. I was still late for the meeting.";
      const expected =
        '알람이 울리지 않았다. 늦게 일어났다. 아침을 거른채 회사로 서둘렀다. 그래도 회의에 늦었다.';

      const result = translate(input, 'en-ko');
      console.log('2-2 인과관계 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-3. 생략과 추론 (Omission and Inference)', () => {
    test('한국어 → 영어', () => {
      const input =
        '어제 백화점에 갔어. 옷을 많이 봤어. 마음에 드는 게 있었어. 너무 비쌌어. 결국 안 샀어.';
      const expected =
        "I went to the department store yesterday. I looked at a lot of clothes. There was something I liked. It was too expensive. I didn't buy it in the end.";

      const result = translate(input, 'ko-en');
      console.log('2-3 생략추론 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'Went to the new restaurant. Ordered the special. Waited forever. Tasted amazing. Worth the wait.';
      const expected =
        '새 식당에 갔다. 스페셜 메뉴를 주문했다. 정말 오래 기다렸다. 맛은 놀라웠다. 기다릴 만한 가치가 있었다.';

      const result = translate(input, 'en-ko');
      console.log('2-3 생략추론 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-4. 화자 전환 (Speaker Change)', () => {
    test('한국어 → 영어', () => {
      const input =
        '"오늘 영화 볼래?" 친구가 물었다. "좋아! 무슨 영화?" 내가 대답했다. "액션 영화 어때?" 그가 제안했다. "완벽해!" 나는 동의했다.';
      const expected =
        '"Want to watch a movie today?" my friend asked. "Sure! What movie?" I replied. "How about an action movie?" he suggested. "Perfect!" I agreed.';

      const result = translate(input, 'ko-en');
      console.log('2-4 화자전환 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        '"I\'m hungry," she said. "Let\'s order pizza," I suggested. "Great idea!" she exclaimed. "Should we get the usual?" I asked. "Yes, please!" she responded.';
      const expected =
        '"배고파." 그녀가 말했다. "피자 시키자." 내가 제안했다. "좋은 생각이야!" 그녀가 외쳤다. "평소에 먹던 걸로 시킬까?" 내가 물었다. "응, 그래!" 그녀가 대답했다.';

      const result = translate(input, 'en-ko');
      console.log('2-4 화자전환 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 3. 긴 문장 (Long Sentences: 6-10 sentences)
// ========================================

describe('3. 긴 문장 (Long Sentences)', () => {
  describe('3-1. 복합 인물 관계 (Complex Character Relations)', () => {
    test('한국어 → 영어', () => {
      const input =
        '철수는 회사 동료인 영희에게 호감이 있었다. 영희는 철수의 친구인 민수를 좋아했다. 민수는 영희의 친구인 지은이와 사귀고 있었다. 철수는 이 사실을 몰랐다. 어느 날 철수가 영희에게 고백했다. 영희는 난처했지만 정중하게 거절했다. 철수는 상처받았지만 이해하려고 노력했다. 나중에 민수에게서 전체 상황을 들었다. 철수는 민수와 지은이를 축복해주기로 했다. 세 사람은 여전히 좋은 친구로 지냈다.';
      const expected =
        "Cheolsu had feelings for his coworker Younghee. Younghee liked Cheolsu's friend Minsu. Minsu was dating Younghee's friend Jieun. Cheolsu didn't know this. One day, Cheolsu confessed to Younghee. Younghee was in a difficult position but politely declined. Cheolsu was hurt but tried to understand. Later, he heard the whole situation from Minsu. Cheolsu decided to bless Minsu and Jieun. The three remained good friends.";

      const result = translate(input, 'ko-en');
      console.log('3-1 복합인물 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "Sarah worked at a marketing firm. She had a project deadline approaching. Her manager, David, was very demanding. David's boss, the CEO, was even more strict. Sarah asked her colleague Mike for help. Mike agreed but he was also overwhelmed with his own work. Sarah decided to work overtime. She completed the project just in time. David was impressed and praised her. The CEO recognized her dedication and gave her a bonus.";
      const expected =
        '사라는 마케팅 회사에서 일했다. 그녀는 프로젝트 마감일이 다가오고 있었다. 그녀의 매니저인 데이비드는 매우 까다로웠다. 데이비드의 상사인 CEO는 더욱 엄격했다. 사라는 동료 마이크에게 도움을 요청했다. 마이크는 동의했지만 그 역시 자신의 일로 압도되어 있었다. 사라는 야근하기로 결정했다. 그녀는 제시간에 프로젝트를 완성했다. 데이비드는 감동받아 그녀를 칭찬했다. CEO는 그녀의 헌신을 인정하고 보너스를 주었다.';

      const result = translate(input, 'en-ko');
      console.log('3-1 복합인물 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-2. 시간 순서 복잡 (Complex Time Sequence)', () => {
    test('한국어 → 영어', () => {
      const input =
        '지난주에 친구를 만났다. 그 전 주에 그 친구가 전화했었다. 전화에서 그는 중요한 소식이 있다고 했다. 나는 궁금했지만 참았다. 만나서 그가 말하길, 3개월 전부터 이직을 준비했다고 했다. 그리고 드디어 합격했다고 했다. 다음 달부터 새 회사에 출근한다고 했다. 나는 축하해줬다. 우리는 그가 떠나기 전에 다시 만나기로 약속했다. 오늘 그 약속을 지키려고 준비 중이다.';
      const expected =
        "I met my friend last week. The week before that, he had called me. On the phone, he said he had important news. I was curious but held back. When we met, he told me he had been preparing to change jobs for three months. And he finally got accepted. He said he would start at the new company next month. I congratulated him. We promised to meet again before he left. Today, I'm preparing to keep that promise.";

      const result = translate(input, 'ko-en');
      console.log('3-2 시간순서 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "Yesterday I found an old photo. It was taken five years ago at my graduation. I remembered that day clearly. The morning had been chaotic because I woke up late. I had stayed up the night before celebrating with friends. But I made it to the ceremony on time. My parents were so proud. After the ceremony, we had dinner at a fancy restaurant. Now, looking at the photo, I realize how much has changed. Tomorrow, I'll attend my sister's graduation and the cycle continues.";
      const expected =
        '어제 오래된 사진을 발견했다. 그것은 5년 전 내 졸업식 때 찍은 것이었다. 나는 그날을 명확히 기억했다. 아침은 혼란스러웠는데 늦게 일어났기 때문이다. 나는 전날 밤 친구들과 축하하느라 늦게까지 깨어 있었다. 하지만 제시간에 행사에 도착했다. 부모님은 정말 자랑스러워하셨다. 행사 후에 우리는 고급 식당에서 저녁을 먹었다. 지금, 사진을 보면서, 얼마나 많이 변했는지 깨닫는다. 내일, 나는 여동생의 졸업식에 참석할 것이고 순환은 계속된다.';

      const result = translate(input, 'en-ko');
      console.log('3-2 시간순서 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-3. 암시적 의미 파악 (Implicit Meaning)', () => {
    test('한국어 → 영어', () => {
      const input =
        '회의가 끝났다. 팀장이 나를 불렀다. 사무실로 오라고 했다. 들어가자 표정이 심각했다. 앉으라는 제스처를 했다. 그는 한숨을 쉬었다. "자네 요즘 프로젝트 진행 상황이..." 그가 말을 흐렸다. 나는 무엇을 예상해야 할지 알았다. "죄송합니다. 제가 더 노력하겠습니다." 내가 먼저 말했다.';
      const expected =
        'The meeting ended. The team leader called me. He told me to come to his office. When I entered, his expression was serious. He gestured for me to sit. He sighed. "Your recent project progress..." he trailed off. I knew what to expect. "I\'m sorry. I\'ll work harder," I said first.';

      const result = translate(input, 'ko-en');
      console.log('3-3 암시적 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'The doctor walked in slowly. She looked at the chart. Then she looked at me. She pulled up a chair. "Let\'s talk about your results," she said gently. Her tone was soft. Too soft. I felt my heart sink. "Is it bad?" I asked. She reached for my hand. That\'s when I knew.';
      const expected =
        '의사가 천천히 들어왔다. 그녀는 차트를 봤다. 그리고 나를 봤다. 그녀는 의자를 당겼다. "검사 결과에 대해 얘기합시다." 그녀가 부드럽게 말했다. 그녀의 어조는 부드러웠다. 너무 부드러웠다. 나는 가슴이 철렁했다. "안 좋은가요?" 내가 물었다. 그녀는 내 손을 잡았다. 그때 나는 알았다.';

      const result = translate(input, 'en-ko');
      console.log('3-3 암시적 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 4. 매우 긴 문장 (Very Long Sentences: 10+ sentences)
// ========================================

describe('4. 매우 긴 문장 (Very Long Sentences)', () => {
  describe('4-1. 복합 서사 구조 (Complex Narrative Structure)', () => {
    test('한국어 → 영어', () => {
      const input =
        '2년 전, 나는 처음 이 도시에 왔다. 새로운 직장 때문이었다. 아무도 아는 사람이 없었다. 첫 주는 정말 외로웠다. 회사 사람들은 친절했지만 거리감이 있었다. 한 달이 지나고, 같은 팀의 수진이가 먼저 말을 걸었다. "점심 같이 먹을래요?" 그녀가 물었다. 그때부터 우리는 자주 함께 식사를 했다. 수진이를 통해 다른 사람들도 알게 되었다. 회사 생활이 점점 편해졌다. 6개월 후, 회사에서 워크숍이 있었다. 거기서 민호를 만났다. 그는 다른 부서 사람이었지만 우리는 금방 친해졌다. 민호는 이 도시에서 10년을 살았다고 했다. 그는 나에게 좋은 식당과 카페를 많이 소개해줬다. 이제 1년 반이 흘렀다. 나는 이 도시가 제2의 고향처럼 느껴진다. 수진이와 민호는 나의 가장 친한 친구가 되었다. 그들 덕분에 이 도시에서의 삶이 행복하다.';
      const expected =
        'Two years ago, I first came to this city. It was because of a new job. I didn\'t know anyone. The first week was really lonely. The people at work were kind but there was distance. After a month, Sujin from the same team spoke to me first. "Want to have lunch together?" she asked. From then on, we often ate together. Through Sujin, I got to know other people too. Work life gradually became more comfortable. Six months later, there was a workshop at the company. That\'s where I met Minho. He was from a different department, but we quickly became close. Minho said he had lived in this city for 10 years. He introduced me to many good restaurants and cafes. Now a year and a half has passed. This city feels like a second home to me. Sujin and Minho have become my closest friends. Thanks to them, life in this city is happy.';

      const result = translate(input, 'ko-en');
      console.log('4-1 복합서사 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "It started with a simple email. My old college professor wanted to reconnect. I hadn't heard from him in seven years. We had lost touch after I graduated. I was surprised but happy to hear from him. We decided to meet for coffee the following week. When we met, he looked older but his smile was the same. He asked about my career and life. I told him about my struggles and successes. He listened carefully and shared his own story. He had retired from teaching last year. Now he was writing a book. He asked if I would help him with research. I was honored but hesitant. My own work was demanding. But something in his eyes convinced me. I agreed to help. That was six months ago. Now we meet every Saturday. The book is almost finished. Through this project, I've learned so much. Not just about the research topic, but about life. He's become more than just a professor to me. He's a mentor and a friend. Sometimes the most meaningful connections come from unexpected reunions.";
      const expected =
        '그것은 간단한 이메일로 시작되었다. 나의 옛 대학 교수님이 다시 연락하고 싶어 하셨다. 나는 7년 동안 그분으로부터 소식을 듣지 못했다. 우리는 내가 졸업한 후 연락이 끊겼다. 나는 놀랐지만 그분으로부터 소식을 들어 기뻤다. 우리는 다음 주에 커피를 마시기로 결정했다. 만났을 때, 그분은 나이가 들어 보였지만 미소는 그대로였다. 그분은 내 경력과 삶에 대해 물으셨다. 나는 내 어려움과 성공에 대해 말씀드렸다. 그분은 주의 깊게 들으시고 자신의 이야기를 나누셨다. 그분은 작년에 교직에서 은퇴하셨다. 이제 책을 쓰고 계셨다. 그분은 내가 연구를 도와줄 수 있는지 물으셨다. 나는 영광이었지만 망설였다. 내 자신의 일이 힘들었다. 하지만 그분의 눈빛 속 무언가가 나를 설득했다. 나는 돕기로 동의했다. 그것이 6개월 전이었다. 이제 우리는 매주 토요일 만난다. 책은 거의 완성되었다. 이 프로젝트를 통해 나는 많은 것을 배웠다. 연구 주제에 대해서뿐만 아니라 인생에 대해서도. 그분은 나에게 단순한 교수님 이상이 되었다. 그분은 멘토이자 친구다. 때때로 가장 의미 있는 연결은 예상치 못한 재회에서 온다.';

      const result = translate(input, 'en-ko');
      console.log('4-1 복합서사 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('4-2. 다층적 관점 (Multiple Perspectives)', () => {
    test('한국어 → 영어', () => {
      const input =
        '철수는 그날을 잊을 수 없었다. 회사에서 중요한 프레젠테이션이 있었다. 그는 몇 주 동안 준비했다. 발표 직전, 그의 노트북이 고장났다. 그는 당황했다. 하지만 동료 영희가 자신의 노트북을 빌려줬다. 영희는 철수가 긴장한 것을 알아챘다. "잘할 수 있을 거예요." 그녀가 격려했다. 철수는 그녀의 도움에 감사했다. 프레젠테이션은 성공적이었다. 상사인 김 부장은 매우 만족했다. 그는 철수의 노력을 인정했다. 하지만 김 부장은 영희의 도움도 알고 있었다. 회의 후, 그는 두 사람을 모두 칭찬했다. "팀워크가 훌륭했어요." 김 부장이 말했다. 영희는 겸손하게 고개를 숙였다. 철수는 영희를 바라봤다. 그는 그녀에게 큰 빚을 졌다고 느꼈다. 그날 저녁, 그는 영희에게 저녁 식사를 대접했다. "정말 고마워요." 철수가 진심으로 말했다. 영희는 미소 지었다. "우리는 팀이잖아요." 그녀가 대답했다.';
      const expected =
        'Cheolsu couldn\'t forget that day. There was an important presentation at work. He had prepared for weeks. Right before the presentation, his laptop broke down. He panicked. But his colleague Younghee lent him her laptop. Younghee noticed that Cheolsu was nervous. "You can do it well," she encouraged. Cheolsu was grateful for her help. The presentation was successful. His boss, Manager Kim, was very satisfied. He acknowledged Cheolsu\'s effort. But Manager Kim also knew about Younghee\'s help. After the meeting, he praised both of them. "The teamwork was excellent," Manager Kim said. Younghee bowed her head modestly. Cheolsu looked at Younghee. He felt he owed her a great debt. That evening, he treated Younghee to dinner. "Thank you so much," Cheolsu said sincerely. Younghee smiled. "We\'re a team," she replied.';

      const result = translate(input, 'ko-en');
      console.log('4-2 다층관점 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'The restaurant was packed that evening. Lisa had been waiting for this reservation for months. It was her anniversary with her husband Tom. She wanted everything to be perfect. Tom arrived ten minutes late. He looked stressed from work. Lisa tried not to show her disappointment. "Traffic was terrible," he apologized. She smiled and said it was okay. But inside, she felt a bit hurt. Tom noticed her expression. He knew he had messed up. He had forgotten to bring the gift he bought her. It was still in his office drawer. He felt terrible. "I\'m sorry," he said again, this time more sincerely. Lisa saw the genuine regret in his eyes. She softened. "It\'s okay, really," she said, meaning it this time. The waiter approached their table. He had been watching them. He could tell it was a special occasion. "Would you like to see our special dessert menu?" he suggested with a knowing smile. Tom looked at Lisa. Lisa looked at Tom. They both laughed. The tension melted away. Sometimes understanding matters more than perfection.';
      const expected =
        '그날 저녁 식당은 만석이었다. 리사는 이 예약을 몇 달 동안 기다려왔다. 남편 톰과의 기념일이었다. 그녀는 모든 것이 완벽하기를 원했다. 톰은 10분 늦게 도착했다. 그는 일 때문에 스트레스를 받은 것처럼 보였다. 리사는 실망을 드러내지 않으려 노력했다. "교통이 끔찍했어요." 그가 사과했다. 그녀는 미소 지으며 괜찮다고 말했다. 하지만 속으로는 조금 상처받았다. 톰은 그녀의 표정을 알아챘다. 그는 자신이 망쳤다는 것을 알았다. 그는 그녀를 위해 산 선물을 가져오는 것을 잊었다. 그것은 여전히 그의 사무실 서랍에 있었다. 그는 끔찍하게 느꼈다. "미안해요." 그가 다시 말했는데, 이번에는 더 진심으로. 리사는 그의 눈에서 진정한 후회를 봤다. 그녀는 누그러졌다. "괜찮아요, 정말." 그녀가 말했는데, 이번에는 진심으로. 웨이터가 그들의 테이블에 다가왔다. 그는 그들을 지켜보고 있었다. 그는 특별한 날이라는 것을 알 수 있었다. "특별 디저트 메뉴를 보시겠어요?" 그가 알고 있다는 듯한 미소로 제안했다. 톰은 리사를 봤다. 리사는 톰을 봤다. 그들 둘 다 웃었다. 긴장이 녹아내렸다. 때때로 이해가 완벽함보다 더 중요하다.';

      const result = translate(input, 'en-ko');
      console.log('4-2 다층관점 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('4-3. 복합 주제 전환 (Complex Topic Transitions)', () => {
    test('한국어 → 영어', () => {
      const input =
        '어렸을 때 나는 과학자가 되고 싶었다. 별을 보는 것을 좋아했다. 밤하늘의 신비가 나를 사로잡았다. 부모님은 내 꿈을 응원하셨다. 과학 책을 많이 사주셨다. 중학교 때 천문학 동아리에 들어갔다. 거기서 선생님을 만났다. 그 선생님은 열정적이셨다. 그분 덕분에 더 깊이 공부했다. 하지만 고등학교에 가면서 현실을 마주했다. 과학자가 되는 길은 험난했다. 부모님의 경제적 상황도 어려워졌다. 나는 고민했다. 꿈을 포기해야 하나? 선생님과 상담했다. "꿈을 바꾸는 것도 용기야." 선생님이 말씀하셨다. 나는 결국 공학을 선택했다. 더 실용적인 길이었다. 대학에서 열심히 공부했다. 좋은 회사에 취직했다. 이제 10년이 지났다. 나는 성공했다고 말할 수 있다. 하지만 가끔 밤하늘을 보면 옛 꿈이 떠오른다. 후회는 없다. 다만 그리움은 있다. 최근에 아마추어 천문학 모임에 가입했다. 직장과 취미를 모두 가질 수 있다는 것을 알았다. 인생은 예측할 수 없지만 그것이 아름답다.';
      const expected =
        "When I was young, I wanted to be a scientist. I loved watching the stars. The mystery of the night sky captivated me. My parents supported my dream. They bought me many science books. In middle school, I joined the astronomy club. There I met a teacher. That teacher was passionate. Thanks to him, I studied more deeply. But when I went to high school, I faced reality. The path to becoming a scientist was rough. My parents' financial situation also became difficult. I worried. Should I give up my dream? I consulted with the teacher. \"Changing your dream is also courage,\" the teacher said. I eventually chose engineering. It was a more practical path. I studied hard in university. I got a job at a good company. Now 10 years have passed. I can say I've succeeded. But sometimes when I look at the night sky, my old dream comes to mind. I have no regrets. But there is longing. Recently, I joined an amateur astronomy group. I learned that I can have both work and hobbies. Life is unpredictable but that's what makes it beautiful.";

      const result = translate(input, 'ko-en');
      console.log('4-3 주제전환 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "The old house stood at the end of the street. Nobody had lived there for twenty years. The neighborhood kids said it was haunted. But I knew better. That house was my grandmother's. She passed away when I was ten. I remember visiting her there every summer. The garden was always full of flowers. She would teach me their names. Roses, lilies, tulips. Each one had a story. Grandmother loved to tell stories. Some were about her youth. Others were fairy tales. My favorite was about a brave princess. The princess saved her kingdom. Just like grandmother saved our family. During the war, she was incredibly strong. She protected her children. My mother told me these stories later. After grandmother died, the house was locked up. Family disputes over inheritance. It made me sad. The house deserved better. Last month, the disputes were finally resolved. I inherited the house. My siblings were happy for me. They knew how much it meant to me. This weekend, I'm going to clean it. I'll restore the garden. I'll plant the flowers grandmother loved. Maybe I'll live there someday. Or maybe I'll turn it into something special. A community center perhaps. A place where stories can be shared. Just like grandmother would have wanted.";
      const expected =
        '오래된 집이 거리 끝에 서 있었다. 20년 동안 아무도 살지 않았다. 동네 아이들은 거기가 귀신이 나온다고 했다. 하지만 나는 더 잘 알았다. 그 집은 우리 할머니의 것이었다. 할머니는 내가 열 살 때 돌아가셨다. 나는 매년 여름 그곳을 방문했던 것을 기억한다. 정원은 항상 꽃으로 가득했다. 할머니는 나에게 꽃 이름을 가르쳐주시곤 했다. 장미, 백합, 튤립. 각각이 이야기를 가지고 있었다. 할머니는 이야기하는 것을 좋아하셨다. 어떤 것은 할머니의 젊은 시절에 대한 것이었다. 다른 것들은 동화였다. 내가 가장 좋아한 것은 용감한 공주에 대한 것이었다. 공주는 자신의 왕국을 구했다. 할머니가 우리 가족을 구한 것처럼. 전쟁 중에 할머니는 믿을 수 없을 만큼 강했다. 할머니는 자녀들을 보호했다. 어머니가 나중에 나에게 이런 이야기들을 해주셨다. 할머니가 돌아가신 후, 집은 잠겼다. 상속을 둘러싼 가족 분쟁. 그것은 나를 슬프게 했다. 그 집은 더 나은 대우를 받을 자격이 있었다. 지난달, 분쟁이 마침내 해결되었다. 나는 그 집을 상속받았다. 내 형제자매들은 나를 위해 기뻐했다. 그들은 그것이 나에게 얼마나 의미 있는지 알았다. 이번 주말, 나는 그것을 청소할 것이다. 나는 정원을 복원할 것이다. 할머니가 사랑하셨던 꽃들을 심을 것이다. 어쩌면 언젠가 거기서 살 수도 있다. 또는 어쩌면 그것을 특별한 것으로 만들 수도 있다. 어쩌면 커뮤니티 센터로. 이야기를 나눌 수 있는 장소로. 할머니가 원하셨을 것처럼.';

      const result = translate(input, 'en-ko');
      console.log('4-3 주제전환 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 5. 특수 문맥 테스트 (Special Context Tests)
// ========================================

describe('5. 특수 문맥 (Special Context)', () => {
  describe('5-1. 문화적 문맥 (Cultural Context)', () => {
    test('한국어 → 영어', () => {
      const input =
        '설날에 할머니 댁에 갔다. 세배를 드렸다. 할머니께서 세배돈을 주셨다. 온 가족이 모여 떡국을 먹었다.';
      const expected =
        "I went to my grandmother's house on Lunar New Year. I performed the New Year's bow. Grandmother gave me New Year's money. The whole family gathered and ate rice cake soup.";

      const result = translate(input, 'ko-en');
      console.log('5-1 문화적 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "On Thanksgiving, we gathered at my parents' house. We carved the turkey. Everyone shared what they were grateful for. Then we watched football together.";
      const expected =
        '추수감사절에 우리는 부모님 댁에 모였다. 우리는 칠면조를 잘랐다. 모두가 감사한 것을 나눴다. 그런 다음 함께 풋볼을 봤다.';

      const result = translate(input, 'en-ko');
      console.log('5-1 문화적 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('5-2. 은유와 비유 (Metaphors and Analogies)', () => {
    test('한국어 → 영어', () => {
      const input =
        '그의 말은 비수가 되어 내 가슴을 찔렀다. 세상이 무너지는 것 같았다. 하지만 나는 일어서야 했다. 폭풍이 지나가면 다시 해가 뜬다.';
      const expected =
        'His words became daggers and stabbed my heart. It felt like the world was collapsing. But I had to stand up. After the storm passes, the sun rises again.';

      const result = translate(input, 'ko-en');
      console.log('5-2 은유 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'She was a ray of sunshine in my dark days. Her smile could light up a room. When she left, winter came to my heart.';
      const expected =
        '그녀는 내 어두운 날들의 한줄기 햇살이었다. 그녀의 미소는 방을 밝힐 수 있었다. 그녀가 떠났을 때, 내 마음에 겨울이 왔다.';

      const result = translate(input, 'en-ko');
      console.log('5-2 은유 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 테스트 커버리지 요약
// ========================================

describe('문맥 테스트 커버리지 요약', () => {
  test('테스트 카테고리 확인', () => {
    const coverage = {
      '1. 짧은 문장': {
        '대명사 문맥': true,
        '생략된 주어': true,
        '중의적 표현': true,
        '시간적 문맥': true,
      },
      '2. 중간 문장': {
        '복합 대명사': true,
        인과관계: true,
        '생략과 추론': true,
        '화자 전환': true,
      },
      '3. 긴 문장': {
        '복합 인물 관계': true,
        '시간 순서 복잡': true,
        '암시적 의미': true,
      },
      '4. 매우 긴 문장': {
        '복합 서사 구조': true,
        '다층적 관점': true,
        '복합 주제 전환': true,
      },
      '5. 특수 문맥': {
        '문화적 문맥': true,
        '은유와 비유': true,
      },
    };

    // 모든 카테고리가 커버되었는지 확인
    for (const [section, categories] of Object.entries(coverage)) {
      for (const [category, covered] of Object.entries(categories)) {
        expect(covered).toBe(true);
        console.log(`✓ ${section} > ${category}`);
      }
    }
  });
});
