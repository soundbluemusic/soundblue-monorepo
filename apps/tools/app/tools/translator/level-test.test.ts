import { describe, expect, test } from 'vitest';
import { translate } from './translator-service';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    규칙 기반 일반화 (Rule-based Generalization)                  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  핵심 원칙:                                                                    ║
 * ║  각 Level의 문법 규칙을 알고리즘으로 구현하여,                                       ║
 * ║  해당 난이도의 **어떤 문장이든** 번역 가능하게 만드는 것                               ║
 * ║                                                                              ║
 * ║  ┌─────────────────────────────────────────────────────────────────────┐    ║
 * ║  │ Level = 난이도 수준 (특정 테스트 문장 ❌)                                 │    ║
 * ║  │ 테스트 문장 = 규칙이 동작하는지 확인하는 샘플                               │    ║
 * ║  └─────────────────────────────────────────────────────────────────────┘    ║
 * ║                                                                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  🎯 하드코딩 정책: 좋은 로직 설계일 경우에만 허용                                 ║
 * ║                                                                              ║
 * ║  ✅ 허용 (Good Logic):                                                       ║
 * ║  - 일반화된 문법 패턴 (예: "Did + S + V?" → 모든 의문문)                        ║
 * ║  - 언어학적 규칙 (예: 받침 유무 → 조사 선택)                                    ║
 * ║  - 재사용 가능한 구조 패턴 (예: SVO → SOV 변환)                                ║
 * ║                                                                              ║
 * ║  ❌ 금지 (Bad Logic):                                                        ║
 * ║  - 특정 테스트 문장만 매칭하는 정규식                                           ║
 * ║  - 테스트 문장을 사전에 직접 추가                                              ║
 * ║  - 특정 문장만 처리하는 마커 패턴                                              ║
 * ║                                                                              ║
 * ║  판단 기준: 비슷한 다른 문장도 통과하는가?                                       ║
 * ║  → Yes면 좋은 로직 (허용), No면 나쁜 로직 (금지)                                ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * 테스트 목적:
 * - 양방향 번역 시스템의 응용 및 특수문자 처리 능력 검증
 * - 의문문, 감탄문, 부정문, 조건문 등 다양한 문장 유형 테스트
 * - 관용구, 숙어, 철학적 표현 등 고급 표현 테스트
 */

// ========================================
// Level 1: 기본 문장 응용 (Basic Sentences - Variations)
// ========================================

describe('Level 1 응용 - 기본 문장 변형', () => {
  describe('한국어 → 영어', () => {
    test('1-1A. 의문문 (일상 활동)', () => {
      const input =
        '너는 오늘 아침에 일찍 일어났니? 운동을 했니? 샤워는? 그리고 아침은 뭘 먹었어? 회사에는 몇 시에 도착했고, 회의는 어땠어?';
      const expected =
        'Did you wake up early this morning? Did you exercise? How about a shower? And what did you eat for breakfast? What time did you arrive at work, and how was the meeting?';

      const result = translate(input, 'ko-en');
      console.log('1-1A 한→영 (의문문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('1-1B. 감탄문 포함', () => {
      const input =
        '와! 오늘 날씨가 정말 좋네! 나는 아침 일찍 일어나서 공원에서 조깅을 했어. 정말 상쾌했어! 그 후에 집에 돌아와서 샤워를 하고, 맛있는 샌드위치를 만들어 먹었지. 음, 정말 맛있었어!';
      const expected =
        'Wow! The weather is really nice today! I woke up early in the morning and jogged in the park. It was so refreshing! After that, I came home, took a shower, and made a delicious sandwich. Mmm, it was really delicious!';

      const result = translate(input, 'ko-en');
      console.log('1-1B 한→영 (감탄문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('1-1C. 부정문 포함', () => {
      const input =
        '나는 어제 일찍 일어나지 못했어. 운동도 하지 않았고, 아침도 먹지 않았어. 회사에 지각했지만, 다행히 중요한 회의는 없었어. 점심은 동료들과 먹지 않고 혼자 먹었어.';
      const expected =
        "I couldn't wake up early yesterday. I didn't exercise, and I didn't eat breakfast either. I was late for work, but fortunately, there was no important meeting. I didn't eat lunch with my colleagues and ate alone.";

      const result = translate(input, 'ko-en');
      console.log('1-1C 한→영 (부정문):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('영어 → 한국어', () => {
    test('1-2A. 의문문 연속', () => {
      const input =
        'Did you go to the museum yesterday? Was it fun? What paintings did you see? Did you buy any souvenirs? Oh, and where did you eat lunch?';
      const expected =
        '너는 어제 박물관에 갔니? 재미있었어? 어떤 그림들을 봤어? 기념품은 샀어? 아, 그리고 점심은 어디서 먹었어?';

      const result = translate(input, 'en-ko');
      console.log('1-2A 영→한 (의문문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('1-2B. 감탄문과 쉼표 활용', () => {
      const input =
        'Amazing! I visited the new art museum with my family, and wow, it was beautiful! We looked at paintings, bought souvenirs, ate pasta, and yes, the weather was perfect!';
      const expected =
        '놀라워! 나는 가족과 함께 새 미술관을 방문했고, 와우, 정말 아름다웠어! 우리는 그림들을 보고, 기념품을 사고, 파스타를 먹었고, 그래, 날씨는 완벽했어!';

      const result = translate(input, 'en-ko');
      console.log('1-2B 영→한 (감탄문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('1-2C. 부정문과 대조', () => {
      const input =
        "I didn't visit the museum yesterday. I stayed home instead. I didn't see any paintings, didn't buy souvenirs, and didn't eat out. But it was okay, because I needed rest.";
      const expected =
        '나는 어제 박물관에 가지 않았어. 대신 집에 있었어. 그림도 보지 않았고, 기념품도 사지 않았으며, 외식도 하지 않았어. 하지만 괜찮았어, 왜냐하면 나는 휴식이 필요했거든.';

      const result = translate(input, 'en-ko');
      console.log('1-2C 영→한 (부정문):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 2: 중급 문장 응용 (Intermediate Sentences - Variations)
// ========================================

describe('Level 2 응용 - 중급 문장 변형', () => {
  describe('한국어 → 영어', () => {
    test('2-1A. 의문문과 추측', () => {
      const input =
        '그는 정말 대학을 졸업했을까? 취업 준비를 제대로 했을까? 아마 여러 회사에 지원했겠지? 하지만 왜 계속 떨어졌을까? 혹시 면접 준비가 부족했던 건 아닐까? 결국 합격했다고 하던데, 정말일까?';
      const expected =
        'Did he really graduate from university? Did he prepare properly for employment? He probably applied to several companies, right? But why did he keep failing? Could it be that his interview preparation was insufficient? I heard he finally passed, is it true?';

      const result = translate(input, 'ko-en');
      console.log('2-1A 한→영 (의문문/추측):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('2-1B. 감정 표현 강조', () => {
      const input =
        '아! 그는 졸업 후 취업 준비를 하면서 정말 힘들었어! 수십 군데 회사에 떨어졌지만, 포기하지 않았어! 와, 정말 대단하지 않아? 드디어 합격했을 때는 너무너무 기뻤대! 첫 출근 날에는 떨렸겠지만, 선배들 덕분에 잘 적응했다니 다행이야!';
      const expected =
        "Ah! After graduation, he really had a hard time preparing for employment! He failed at dozens of companies, but he didn't give up! Wow, isn't that really amazing? He was so, so happy when he finally passed! He must have been nervous on his first day at work, but it's fortunate that he adapted well thanks to his seniors!";

      const result = translate(input, 'ko-en');
      console.log('2-1B 한→영 (감정 강조):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('2-1C. 조건문과 가정', () => {
      const input =
        '만약 그가 졸업 후 바로 포기했다면 어땠을까? 만약 계속 도전하지 않았다면, 지금의 회사에 합격하지 못했을 거야. 만약 첫 출근 날 선배들이 도와주지 않았다면, 적응하기 정말 어려웠을 텐데, 다행히 모든 게 잘 풀렸어.';
      const expected =
        "What if he had given up right after graduation? If he hadn't kept challenging himself, he wouldn't have passed his current company. If his seniors hadn't helped him on his first day at work, it would have been really difficult to adapt, but fortunately, everything worked out well.";

      const result = translate(input, 'ko-en');
      console.log('2-1C 한→영 (조건문):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('영어 → 한국어', () => {
    test('2-2A. 의문문 연속', () => {
      const input =
        "Had she really been studying English for five years? Was it really that difficult when she arrived? Why couldn't she communicate well? Was it because textbooks are different from real conversations? How did she improve? Did native speakers really help her that much?";
      const expected =
        '그녀는 정말 5년 동안 영어를 공부했을까? 도착했을 때 정말 그렇게 어려웠을까? 왜 잘 소통할 수 없었을까? 교과서가 실제 대화와 다르기 때문일까? 그녀는 어떻게 향상했을까? 원어민들이 정말 그렇게 많이 도와줬을까?';

      const result = translate(input, 'en-ko');
      console.log('2-2A 영→한 (의문문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('2-2B. 감탄문과 강조', () => {
      const input =
        'Wow! She had studied English for five whole years! But oh my, real conversations were so much harder! However, amazing! She practiced every single day! Her pronunciation improved! Her vocabulary expanded! And finally, after six months, she could speak naturally!';
      const expected =
        '와! 그녀는 무려 5년 동안 영어를 공부했어! 그런데 세상에, 실제 대화는 훨씬 더 어려웠어! 하지만 놀랍게도! 그녀는 매일 매일 연습했어! 발음이 향상됐어! 어휘가 늘어났어! 그리고 마침내, 6개월 후에, 그녀는 자연스럽게 말할 수 있었어!';

      const result = translate(input, 'en-ko');
      console.log('2-2B 영→한 (감탄문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('2-2C. 부정문과 대조', () => {
      const input =
        "She hadn't studied English for just one or two years, but for five years. However, real conversations weren't as easy as textbook exercises. She didn't give up. She didn't practice just once or twice, but every single day. She didn't see results immediately, but after six months, finally, she could communicate naturally.";
      const expected =
        '그녀는 단지 1년이나 2년 동안 영어를 공부한 것이 아니라, 5년 동안 공부했어. 하지만, 실제 대화는 교과서 연습만큼 쉽지 않았어. 그녀는 포기하지 않았어. 한두 번만 연습한 게 아니라, 매일 매일 연습했어. 즉시 결과를 보지는 못했지만, 6개월 후에, 마침내, 그녀는 자연스럽게 소통할 수 있었어.';

      const result = translate(input, 'en-ko');
      console.log('2-2C 영→한 (부정문):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 3: 고급 문장 응용 (Advanced Sentences - Variations)
// ========================================

describe('Level 3 응용 - 고급 문장 변형', () => {
  describe('한국어 → 영어', () => {
    test('3-1A. 의문문과 반론', () => {
      const input =
        '정말 인공지능이 일자리를 빼앗을까? 전문가들은 새로운 일자리가 생긴다고 하는데, 과연 그럴까? 변화에 적응하는 능력이 중요하다고? 하지만 모든 사람이 쉽게 적응할 수 있을까? 정부의 재교육 프로그램이 충분할까? 기업들의 투자가 과연 실질적인 도움이 될까?';
      const expected =
        "Will AI really take away jobs? Experts say new jobs will be created, but will that really happen? The ability to adapt to change is important? But can everyone adapt easily? Will the government's retraining programs be sufficient? Will corporate investments really provide practical help?";

      const result = translate(input, 'ko-en');
      console.log('3-1A 한→영 (의문문/반론):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('3-1B. 강한 주장과 감탄', () => {
      const input =
        '놀랍게도, 인공지능 기술이 엄청나게 발전하고 있어! 사람들이 걱정하는 건 당연해! 하지만 전문가들의 주장을 들어봐! 오히려 더 많은 기회가 생긴다니까! 중요한 건, 바로 이거야, 적응 능력이야! 정부도 발 벗고 나섰어! 재교육 프로그램을 확 늘렸다고! 기업들도 가만있지 않아! 투자를 아끼지 않고 있어!';
      const expected =
        "Amazingly, AI technology is developing tremendously! It's natural for people to worry! But listen to what the experts say! More opportunities will be created instead! The important thing is, this is it, adaptability! The government has also stepped up! They've greatly expanded retraining programs! Companies aren't just sitting either! They're sparing no investment!";

      const result = translate(input, 'ko-en');
      console.log('3-1B 한→영 (주장/감탄):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('3-1C. 가정과 조건', () => {
      const input =
        '만약 인공지능이 정말로 일자리를 대체한다면? 만약 새로운 일자리가 생기지 않는다면? 만약 사람들이 변화에 적응하지 못한다면? 그렇다면 정부는 어떻게 대응해야 할까? 재교육만으로 충분할까? 기업들이 투자를 하지 않는다면?';
      const expected =
        "What if AI really replaces jobs? What if new jobs aren't created? What if people can't adapt to change? Then how should the government respond? Will retraining alone be enough? What if companies don't invest?";

      const result = translate(input, 'ko-en');
      console.log('3-1C 한→영 (가정/조건):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('영어 → 한국어', () => {
    test('3-2A. 의문문 연속', () => {
      const input =
        'Is climate change really the most pressing issue? Are countries actually reluctant to act? Is it because of economic concerns? Do scientists really warn of catastrophic consequences? Is international cooperation truly crucial? Should developed nations really take the lead? Must they provide support to developing countries?';
      const expected =
        '기후 변화가 정말 가장 시급한 문제일까? 국가들이 실제로 행동을 꺼리고 있을까? 경제적 우려 때문일까? 과학자들이 정말 재앙적인 결과를 경고하고 있을까? 국제 협력이 진정 중요할까? 선진국들이 정말 앞장서야 할까? 그들은 개발도상국에 지원을 제공해야만 할까?';

      const result = translate(input, 'en-ko');
      console.log('3-2A 영→한 (의문문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('3-2B. 강조와 감탄', () => {
      const input =
        "Climate change! Yes, it's become THE most pressing issue! But look! Many countries are still reluctant! Why? Economic growth! Scientists are warning us! Listen! The consequences will be catastrophic! Irreversible! Therefore, international cooperation! More crucial than ever! Developed nations! Take the lead! Provide support! Financial! Technological! Do it now!";
      const expected =
        '기후 변화! 그래, 가장 시급한 문제가 됐어! 하지만 봐! 많은 국가들이 여전히 꺼리고 있어! 왜? 경제 성장! 과학자들이 경고하고 있어! 들어봐! 결과는 재앙적일 거야! 돌이킬 수 없어! 따라서, 국제 협력! 그 어느 때보다 중요해! 선진국들! 앞장서! 지원을 제공해! 재정적! 기술적! 지금 당장!';

      const result = translate(input, 'en-ko');
      console.log('3-2B 영→한 (강조/감탄):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('3-2C. 부정과 대조', () => {
      const input =
        "Climate change isn't just another issue, but THE most pressing one. However, many countries aren't taking action. Not because they don't know, but because they fear economic harm. Scientists aren't suggesting, they're warning. We can't wait, we can't delay. International cooperation isn't optional, it's crucial. Developed nations can't just talk, they must act, they must lead, they must support.";
      const expected =
        '기후 변화는 단지 또 다른 문제가 아니라, 가장 시급한 문제야. 하지만, 많은 국가들이 행동하고 있지 않아. 모르기 때문이 아니라, 경제적 피해를 두려워하기 때문이야. 과학자들은 제안하는 게 아니라, 경고하고 있어. 우리는 기다릴 수 없어, 미룰 수 없어. 국제 협력은 선택이 아니라, 필수야. 선진국들은 그저 말만 할 수 없어, 행동해야 해, 이끌어야 해, 지원해야 해.';

      const result = translate(input, 'en-ko');
      console.log('3-2C 영→한 (부정/대조):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 4: 전문가 문장 응용 (Expert Sentences - Variations)
// ========================================

describe('Level 4 응용 - 전문가 문장 변형', () => {
  describe('한국어 → 영어', () => {
    test('4-1A. 의문문과 관용구', () => {
      const input =
        '그 프로젝트가 정말 삐걱거렸을까? 팀장이 손이 컸다고? 돈을 물 쓰듯 했다고? 개발팀은 왜 손을 놓고 있었을까? 발등에 불이 떨어졌는데도? 디자이너는 정말 눈이 높았을까? 모두가 발을 빼려고 했다고? 그런데 CEO가 나서서 팀을 갈아엎었다고? 정말?';
      const expected =
        'Did the project really struggle? The team leader was too generous? He spent money like water? Why was the development team idle? Even when they were in a crisis? Was the designer really that picky? Everyone tried to back out? But then the CEO stepped in and overhauled the team? Really?';

      const result = translate(input, 'ko-en');
      console.log('4-1A 한→영 (관용구):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('4-1B. 감탄문과 속어', () => {
      const input =
        '아이고! 그 프로젝트 정말 망했다니까! 팀장이 돈을 펑펑 쓰는 바람에! 완전 물 쓰듯이! 개발팀은? 아무것도 안 했어! 손 놓고 있었다고! 불났는데도! 디자이너는 또 어찌나 까다로운지! 클라이언트 말은 하나도 안 들어! 결국 다들 튀려고 했잖아! 그런데 CEO가 짠! 나타나서 싹 다 갈아치웠어! 완전 대박!';
      const expected =
        "Oh my! That project was a total disaster! Because the team leader was spending money freely! Completely like water! The development team? They did nothing! They were idle! Even during a crisis! And the designer was so picky! Didn't listen to the client at all! In the end, everyone tried to run away! But then the CEO showed up! Boom! Replaced everyone! Totally awesome!";

      const result = translate(input, 'ko-en');
      console.log('4-1B 한→영 (감탄문/속어):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('4-1C. 가정과 비유', () => {
      const input =
        '만약 팀장이 돈을 조금만 아꼈다면? 만약 개발팀이 진작 불 끄기 시작했다면? 만약 디자이너가 눈높이를 조금 낮췄다면? 그랬다면 프로젝트가 이렇게 산으로 가지는 않았을 텐데. 하지만 CEO가 칼을 빼들고 팀을 싹 갈아엎지 않았다면, 프로젝트는 물 건너갔을 거야.';
      const expected =
        "What if the team leader had been a bit more frugal? What if the development team had started putting out the fire earlier? What if the designer had lowered their standards a bit? Then the project wouldn't have gone off the rails like this. But if the CEO hadn't taken drastic measures and completely overhauled the team, the project would have been doomed.";

      const result = translate(input, 'ko-en');
      console.log('4-1C 한→영 (가정/비유):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('영어 → 한국어', () => {
    test('4-2A. 의문문과 숙어', () => {
      const input =
        'Did she really burn the midnight oil every night? Did she go the extra mile on assignments? Did she leave no stone unturned? Did she bend over backwards for professors? But she barely made the cut? Was it a wake-up call? Did she stop getting lost in the weeds? Did she focus on the big picture instead?';
      const expected =
        '그녀는 정말 매일 밤 밤새워 공부했을까? 과제에서 최선을 다했을까? 모든 가능성을 탐구했을까? 교수들을 위해 온갖 노력을 다했을까? 그런데 겨우 합격선을 넘었다고? 경종이었을까? 세부사항에 빠지는 걸 그만뒀을까? 대신 큰 그림에 집중했을까?';

      const result = translate(input, 'en-ko');
      console.log('4-2A 영→한 (숙어):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('4-2B. 강조와 숙어', () => {
      const input =
        "Listen! She didn't just study! She burned the midnight oil! Every! Single! Night! She went the extra mile! Always! She left absolutely no stone unturned! None! She bent over backwards! But wow! She barely made the cut! Talk about a wake-up call! She completely changed! No more getting lost in the weeds! Big picture! That's what matters!";
      const expected =
        '들어봐! 그녀는 단순히 공부한 게 아니야! 밤을 새웠어! 매일! 밤마다! 최선을 다했어! 항상! 절대 모든 가능성을 빠짐없이 탐구했어! 하나도 빠짐없이! 온갖 노력을 다했어! 그런데 와! 겨우 합격선을 넘었어! 완전 경종이었지! 그녀는 완전히 바뀌었어! 더 이상 세부사항에 빠지지 않아! 큰 그림! 그게 중요한 거야!';

      const result = translate(input, 'en-ko');
      console.log('4-2B 영→한 (강조/숙어):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('4-2C. 부정문과 대조', () => {
      const input =
        "She didn't just work hard, she burned the midnight oil. She didn't do the minimum, she went the extra mile. She didn't leave any stone unturned, not a single one. She didn't half-heartedly try, she bent over backwards. But she didn't pass with flying colors, she barely made the cut. It wasn't discouraging though, it was a wake-up call. She didn't keep getting lost in the weeds, she focused on the big picture instead.";
      const expected =
        '그녀는 단지 열심히 일한 게 아니라, 밤을 새웠어. 최소한만 한 게 아니라, 최선을 다했어. 어떤 가능성도 놓치지 않았어, 단 하나도. 건성으로 시도한 게 아니라, 온갖 노력을 다했어. 하지만 우수한 성적으로 합격한 게 아니라, 겨우 합격선을 넘었어. 하지만 낙담스럽지 않았어, 경종이었어. 계속 세부사항에 빠지지 않았어, 대신 큰 그림에 집중했어.';

      const result = translate(input, 'en-ko');
      console.log('4-2C 영→한 (부정문/대조):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 5: 최고난이도 문장 응용 (Master Level - Variations)
// ========================================

describe('Level 5 응용 - 최고난이도 문장 변형', () => {
  describe('한국어 → 영어', () => {
    test('5-1A. 의문문 연속', () => {
      const input =
        '정말 인간의 본성은 변하지 않을까? 우리는 왜 같은 실수를 반복할까? 더 나은 미래를 꿈꾸면서도, 왜 현재에 안주할까? 변화를 원한다면서, 왜 변화를 두려워할까? 이것이 모순일까, 아니면 인간다움일까? 완벽함을 추구하면서도 완벽해질 수 없다는 것을 아는 것, 그것이 용기일까? 아니면 어리석음일까?';
      const expected =
        'Does human nature really never change? Why do we repeat the same mistakes? While dreaming of a better future, why do we settle for the present? While wanting change, why do we fear change? Is this a contradiction, or is it humanity? Knowing that we pursue perfection yet can never be perfect, is that courage? Or is it foolishness?';

      const result = translate(input, 'ko-en');
      console.log('5-1A 한→영 (철학적 의문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('5-1B. 감탄문과 철학적 표현', () => {
      const input =
        '아! 인간의 본성이라는 것! 정말 신비로워! 우리는 실수를 되풀이하지 않겠다고 외치면서도, 어김없이 같은 돌에 걸려 넘어져! 얼마나 아이러니한가! 미래를 꿈꾸면서도 현재에 갇혀 있어! 변화를 외치면서도 변화 앞에서 움츠러들어! 이 모순! 바로 이것이 인간이야! 완벽을 향해 나아가면서도 결코 완벽해질 수 없다는 것을 알면서도 계속 걸어가는 것! 이것이야말로 진정한 용기가 아니겠어?';
      const expected =
        "Ah! Human nature! How mysterious! We cry out that we won't repeat mistakes, yet we unfailingly trip over the same stone! How ironic! While dreaming of the future, we're trapped in the present! While crying out for change, we shrink before it! This contradiction! This is precisely what it means to be human! Moving toward perfection while knowing we can never be perfect, yet continuing to walk! Isn't this what true courage really is?";

      const result = translate(input, 'ko-en');
      console.log('5-1B 한→영 (철학적 감탄):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('5-1C. 가정과 성찰', () => {
      const input =
        '만약 우리가 실수를 되풀이하지 않는다면, 그게 정말 인간일까? 만약 변화 앞에서 두려움이 없다면, 그게 용기일까? 만약 완벽함을 추구하지 않는다면, 우리는 어디로 가야 할까? 어쩌면 이 모든 모순이야말로, 불완전함이야말로, 계속 나아가려는 노력이야말로, 진정한 인간다움이 아닐까?';
      const expected =
        "If we don't repeat mistakes, would that really be human? If there's no fear before change, would that be courage? If we don't pursue perfection, where should we go? Perhaps all these contradictions, this very imperfection, this effort to keep moving forward, isn't this what being truly human means?";

      const result = translate(input, 'ko-en');
      console.log('5-1C 한→영 (가정/성찰):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('영어 → 한국어', () => {
    test('5-2A. 의문문 연속', () => {
      const input =
        "Does love really conquer all? What does it truly mean to love? Is it the initial butterflies? Or the choice to stay? Is it grand gestures? Or quiet moments? Does love conquer? Or does it endure? Is it passion? Or is it a lifetime of choosing each other? Even when it's easier to leave? Especially then?";
      const expected =
        '사랑이 정말 모든 것을 이길까? 진정으로 사랑한다는 것은 무엇을 의미할까? 처음의 설렘일까? 아니면 머무르기로 하는 선택일까? 거창한 제스처일까? 아니면 조용한 순간들일까? 사랑은 이기는 것일까? 아니면 견디는 것일까? 열정일까? 아니면 평생 서로를 선택하는 것일까? 떠나는 게 더 쉬울 때조차도? 특히 그럴 때?';

      const result = translate(input, 'en-ko');
      console.log('5-2A 영→한 (철학적 의문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('5-2B. 강조와 시적 표현', () => {
      const input =
        "Love! They say it conquers all! But wait! What is love? Is it butterflies? Beautiful! But temporary! Or is it staying? After butterflies fly away? Is it grand romance? Breathtaking! But fleeting! Or is it quiet moments? Simple! Yet profound! Love doesn't conquer! No! It endures! Not a moment! But a lifetime! Choosing each other! Again and again! Even when! Especially when! Walking away seems easier!";
      const expected =
        '사랑! 모든 것을 이긴다고들 하지! 하지만 잠깐! 사랑이 뭘까? 설렘일까? 아름다워! 하지만 일시적이야! 아니면 머무르는 것일까? 설렘이 날아간 후에도? 거창한 로맨스일까? 숨막혀! 하지만 덧없어! 아니면 조용한 순간들일까? 단순해! 하지만 깊어! 사랑은 이기지 않아! 아니야! 견디는 거야! 한 순간이 아니야! 평생이야! 서로를 선택하는 것! 계속해서! 떠나는 게! 특히 그럴 때! 더 쉬워 보일 때조차도!';

      const result = translate(input, 'en-ko');
      console.log('5-2B 영→한 (시적 표현):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('5-2C. 부정과 대조', () => {
      const input =
        "Love doesn't just conquer, it endures. It's not the butterflies, but staying after they've flown. It's not grand gestures, but quiet moments. It's not a single moment, but a lifetime. It's not passion alone, but choosing each other. Not once, but again and again. Not when it's easy, but when it's hard. Not despite difficulty, but because of it. That's not just love, that's true love.";
      const expected =
        '사랑은 단지 이기는 게 아니라, 견디는 거야. 설렘이 아니라, 설렘이 사라진 후에도 머무르는 거야. 거창한 제스처가 아니라, 조용한 순간들이야. 한 순간이 아니라, 평생이야. 열정만이 아니라, 서로를 선택하는 거야. 한 번이 아니라, 계속해서. 쉬울 때가 아니라, 어려울 때. 어려움에도 불구하고가 아니라, 어려움 때문에. 그것은 단지 사랑이 아니라, 진정한 사랑이야.';

      const result = translate(input, 'en-ko');
      console.log('5-2C 영→한 (부정/대조):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 특수문자 집중 테스트 (Punctuation-Focused Tests)
// ========================================

describe('특수문자 집중 테스트', () => {
  describe('복합 문장부호', () => {
    test('한국어 → 영어: 복합 문장부호', () => {
      const input =
        '정말?! 그게 사실이야?! 믿을 수 없어! 하지만... 음, 생각해보니, 그럴 수도 있겠네. 맞아, 맞아! 그랬지! 아, 그런데 말이야... 잠깐만, 그거 언제였더라? 음... 아! 맞다! 지난주였어! 와... 정말 놀라운 일이었어.';
      const expected =
        "Really?! Is that true?! I can't believe it! But... hmm, thinking about it, it could be. Right, right! That's it! Oh, but you know... wait, when was that? Hmm... Ah! That's right! It was last week! Wow... it was truly amazing.";

      const result = translate(input, 'ko-en');
      console.log('특수문자1 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어: 복합 문장부호', () => {
      const input =
        "Wait, what?! You're kidding, right? No way! That can't be... or can it? Hmm, well... maybe, just maybe. Oh! I get it now! Yeah, yeah! Of course! But still... I mean, seriously? Wow... just, wow.";
      const expected =
        '잠깐, 뭐?! 장난치는 거지? 말도 안 돼! 그럴 리가... 아니면 그럴 수도 있나? 음, 글쎄... 어쩌면, 어쩌면 말이야. 오! 이제 알겠어! 그래, 그래! 당연하지! 하지만 여전히... 내 말은, 진짜로? 와... 그냥, 와.';

      const result = translate(input, 'en-ko');
      console.log('특수문자2 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('긴 대화문', () => {
    test('한국어 → 영어: 대화문', () => {
      const input =
        '"정말이야?" 그가 물었다. "응, 정말이야!" 내가 대답했다. "그럼... 우리 어떻게 해야 하지?" "글쎄... 좀 더 생각해봐야 할 것 같아." "맞아, 서두르면 안 돼." "그치?" "응!" "좋아, 그럼 내일 다시 얘기하자." "알았어! 내일 봐!" "응, 내일 봐."';
      const expected =
        '"Really?" he asked. "Yes, really!" I answered. "Then... what should we do?" "Well... I think we need to think about it more." "Right, we shouldn\'t rush." "Right?" "Yes!" "Okay, then let\'s talk again tomorrow." "Got it! See you tomorrow!" "Yeah, see you tomorrow."';

      const result = translate(input, 'ko-en');
      console.log('특수문자3 한→영 (대화문):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어: 감정 표현', () => {
      const input =
        '"No! No, no, no!" she shouted. "Please... don\'t go..." "I have to." "But why?! Why now?!" "Because... I just have to." "Wait! Just... wait a minute!" "I\'m sorry." "Sorry?! That\'s all you can say?!" "Yes... I\'m truly sorry."';
      const expected =
        '"안 돼! 안 돼, 안 돼, 안 돼!" 그녀가 소리쳤다. "제발... 가지 마..." "가야만 해." "하지만 왜?! 왜 지금?!" "왜냐하면... 그냥 가야만 해서." "기다려! 그냥... 잠깐만 기다려!" "미안해." "미안하다고?! 그게 전부야?!" "응... 정말 미안해."';

      const result = translate(input, 'en-ko');
      console.log('특수문자4 영→한 (감정):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('나열과 쉼표', () => {
    test('한국어 → 영어: 나열', () => {
      const input =
        '우리는 빵, 우유, 계란, 치즈, 그리고 과일을 샀다. 사과, 바나나, 오렌지도 샀고, 아, 맞다, 주스도 샀다. 그런데 토마토는? 음... 안 샀네. 아쉽지만, 뭐, 괜찮아. 다음에 사면 되지!';
      const expected =
        "We bought bread, milk, eggs, cheese, and fruit. We also bought apples, bananas, and oranges, oh, right, juice too. But tomatoes? Hmm... we didn't buy them. It's too bad, but, well, it's okay. We can buy them next time!";

      const result = translate(input, 'ko-en');
      console.log('특수문자5 한→영 (나열):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어: 나열', () => {
      const input =
        "I need to do laundry, clean the house, pay bills, and, oh yes, call my mom. Then I should exercise, maybe run, or swim, or just walk. After that, well, let's see... cook dinner, eat, rest, and finally, sleep!";
      const expected =
        '나는 빨래를 해야 하고, 집을 청소해야 하고, 청구서를 내야 하고, 아, 그리고, 엄마한테 전화해야 해. 그런 다음 운동을 해야 해, 아마 달리기, 또는 수영, 아니면 그냥 걷기. 그 후에, 음, 어디 보자... 저녁을 요리하고, 먹고, 쉬고, 마침내, 잠!';

      const result = translate(input, 'en-ko');
      console.log('특수문자6 영→한 (나열):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 테스트 통계 (Test Statistics)
// ========================================

describe('테스트 통계', () => {
  test('테스트 커버리지 요약', () => {
    const coverage = {
      'Level 1 응용 (기본)': {
        '의문문 (Did you...? / 했니?)': true,
        '감탄문 (Wow! / 와!)': true,
        "부정문 (didn't / 하지 않았어)": true,
        '쉼표 연결 (and, but / 그리고, 하지만)': true,
      },
      'Level 2 응용 (중급)': {
        '의문문 + 추측 (Could it be...? / ~였을까?)': true,
        '감정 표현 강조 (so, really / 너무, 정말)': true,
        '조건문 (If... / 만약...)': true,
        '가정법 (would have / ~했을 텐데)': true,
      },
      'Level 3 응용 (고급)': {
        '반문 (But will it...? / 하지만 과연...?)': true,
        '강한 주장 (Listen! / 들어봐!)': true,
        '복합 가정 (What if... then...? / 만약... 그렇다면...?)': true,
        '대조 구문 (not A but B / A가 아니라 B)': true,
      },
      'Level 4 응용 (전문가)': {
        '관용구 의문문 (Did he really...? / 정말 ~했을까?)': true,
        '속어와 감탄 (Oh my! / 아이고!)': true,
        '관용구 가정 (What if... / 만약 ~했다면)': true,
        "숙어 부정문 (didn't just... / 단지 ~한 게 아니라)": true,
      },
      'Level 5 응용 (최고난이도)': {
        '철학적 의문 (Is this...? Or...? / 이것이...일까? 아니면...?)': true,
        '시적 감탄 (Ah! How...! / 아! 얼마나...!)': true,
        '성찰적 가정 (If... would that be...? / 만약... 그게 ~일까?)': true,
        '대조와 강조 (Not just... but... / 단지 ~이 아니라...)': true,
      },
      '특수문자 테스트': {
        '?! 복합 (Really?! / 정말?!)': true,
        '... 말줄임 (But... / 하지만...)': true,
        '"대화문" (따옴표)': true,
        ', 나열 (A, B, and C / A, B, 그리고 C)': true,
        '! 감탄 (Wow! / 와!)': true,
      },
    };

    console.log('\n========================================');
    console.log('양방향 번역 테스트 커버리지 요약');
    console.log('========================================\n');

    for (const [level, tests] of Object.entries(coverage)) {
      console.log(`\n${level}:`);
      for (const [testName, covered] of Object.entries(tests)) {
        console.log(`  ${covered ? '✓' : '✗'} ${testName}`);
      }
    }

    console.log('\n========================================');
    console.log('총 테스트 케이스: 36개 (6개 레벨 × 6개 테스트)');
    console.log('========================================\n');

    expect(true).toBe(true);
  });
});
