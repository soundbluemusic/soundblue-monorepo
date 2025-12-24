import { describe, expect, test } from 'vitest';
import { translate } from './translator-service';

/**
 * 양방향 번역 테스트 문장 - 카테고리별 (Category-Specific Tests)
 *
 * 테스트 목적:
 * - 감정, 인사, 상식, 전문 분야, 사투리 처리 능력 검증
 * - 다양한 문맥과 도메인에서의 번역 정확도 테스트
 */

// ========================================
// 1. 감정 표현 (Emotional Expressions)
// ========================================

describe('1. 감정 표현 (Emotional Expressions)', () => {
  describe('1-1. 기쁨/행복 (Joy/Happiness)', () => {
    test('한국어 → 영어', () => {
      const input =
        '와! 정말 기뻐! 오늘 승진 소식 들었어! 너무너무 행복해! 이렇게 기분 좋은 날은 처음이야! 하늘을 날 것 같아! 세상을 다 가진 기분이야!';
      const expected =
        "Wow! I'm so happy! I heard about the promotion today! I'm so, so happy! This is the first time I've felt this good! I feel like I'm flying! I feel like I have the whole world!";

      const result = translate(input, 'ko-en');
      console.log('1-1 기쁨 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "I'm over the moon! I can't stop smiling! This is the best day ever! My heart is bursting with joy! I feel like I'm on top of the world! Everything is just perfect!";
      const expected =
        '정말 기뻐서 어쩔 줄 모르겠어! 웃음이 멈추지 않아! 오늘이 최고의 날이야! 가슴이 기쁨으로 터질 것 같아! 세상 꼭대기에 있는 것 같아! 모든 게 완벽해!';

      const result = translate(input, 'en-ko');
      console.log('1-1 기쁨 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-2. 슬픔/우울 (Sadness/Depression)', () => {
    test('한국어 → 영어', () => {
      const input =
        '너무 슬퍼... 눈물이 계속 나와. 가슴이 먹먹하고 아무것도 하기 싫어. 세상이 온통 회색빛인 것 같아. 이 고통이 언제 끝날지 모르겠어. 혼자인 것 같아서 외로워.';
      const expected =
        "I'm so sad... Tears keep flowing. My heart feels heavy and I don't want to do anything. The whole world seems gray. I don't know when this pain will end. I feel lonely because I feel alone.";

      const result = translate(input, 'ko-en');
      console.log('1-2 슬픔 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "I feel so down... I can't shake this feeling. Everything seems pointless. I'm drowning in sorrow. There's a void in my heart. I can't see the light at the end of the tunnel.";
      const expected =
        '너무 우울해... 이 기분을 떨쳐낼 수가 없어. 모든 게 무의미해 보여. 슬픔에 빠져 허우적대고 있어. 가슴에 공허함이 있어. 터널 끝의 빛이 보이지 않아.';

      const result = translate(input, 'en-ko');
      console.log('1-2 슬픔 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-3. 분노/짜증 (Anger/Irritation)', () => {
    test('한국어 → 영어', () => {
      const input =
        '진짜 화나! 도대체 왜 이런 식으로 행동하는 거야?! 참을 수가 없어! 머리끝까지 화가 나! 이제 더 이상 못 참겠어! 당장 사과하지 않으면 정말 큰일 날 거야!';
      const expected =
        "I'm really angry! Why on earth are you acting this way?! I can't stand it! I'm furious! I can't take it anymore! If you don't apologize right now, there will be serious consequences!";

      const result = translate(input, 'ko-en');
      console.log('1-3 분노 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "This is infuriating! I'm absolutely livid! How dare you! I'm at my wit's end! I've had it up to here! You're pushing my buttons! I'm about to explode!";
      const expected =
        '이거 정말 열받아! 완전 분노했어! 감히 어떻게! 더 이상 견딜 수가 없어! 이제 한계야! 내 신경을 건드리는 거야! 폭발하기 직전이야!';

      const result = translate(input, 'en-ko');
      console.log('1-3 분노 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-4. 놀람/충격 (Surprise/Shock)', () => {
    test('한국어 → 영어', () => {
      const input =
        '헐! 진짜야?! 믿을 수가 없어! 이게 무슨 일이야! 완전 충격이야! 꿈인가 싶어서 뺨을 꼬집어봤어! 세상에! 이런 일이 일어날 줄은 상상도 못 했어!';
      const expected =
        "What! Really?! I can't believe it! What's happening! I'm totally shocked! I pinched my cheek to see if I'm dreaming! Oh my God! I never imagined this would happen!";

      const result = translate(input, 'ko-en');
      console.log('1-4 놀람 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "No way! Are you serious?! I'm speechless! I'm blown away! This is mind-blowing! I'm in complete shock! I never saw this coming! My jaw just dropped!";
      const expected =
        '말도 안 돼! 진심이야?! 할 말을 잃었어! 완전 놀랐어! 이거 정말 충격적이야! 완전히 충격 받았어! 전혀 예상 못 했어! 입이 떡 벌어졌어!';

      const result = translate(input, 'en-ko');
      console.log('1-4 놀람 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-5. 두려움/불안 (Fear/Anxiety)', () => {
    test('한국어 → 영어', () => {
      const input =
        '무서워... 가슴이 두근두근거려. 뭔가 나쁜 일이 일어날 것 같아. 손이 떨려. 불안해서 잠을 잘 수가 없어. 이 기분이 언제까지 계속될지 걱정돼.';
      const expected =
        "I'm scared... My heart is pounding. I feel like something bad is going to happen. My hands are shaking. I can't sleep because of anxiety. I'm worried about how long this feeling will last.";

      const result = translate(input, 'ko-en');
      console.log('1-5 두려움 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "I'm terrified... I can't breathe properly. My mind is racing with worst-case scenarios. I'm paralyzed with fear. I'm on edge. This anxiety is overwhelming me.";
      const expected =
        '너무 무서워... 제대로 숨을 쉴 수가 없어. 머릿속에 최악의 시나리오가 계속 떠올라. 두려움에 얼어붙었어. 신경이 곤두서 있어. 이 불안감이 나를 압도하고 있어.';

      const result = translate(input, 'en-ko');
      console.log('1-5 두려움 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 2. 인사 표현 (Greetings)
// ========================================

describe('2. 인사 표현 (Greetings)', () => {
  describe('2-1. 일상 인사 (Casual Greetings)', () => {
    test('한국어 → 영어', () => {
      const input =
        '안녕! 잘 지냈어? 오랜만이야! 어떻게 지내? 요즘 어때? 별일 없지? 건강하지? 가족들은 다 잘 있어?';
      const expected =
        'Hi! How have you been? Long time no see! How are you doing? How are things lately? Nothing much going on? Are you healthy? Is your family doing well?';

      const result = translate(input, 'ko-en');
      console.log('2-1 일상인사 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "Hey! What's up? How's it going? Good to see you! How have you been? What have you been up to? How's everything? How's life treating you?";
      const expected =
        '이봐! 잘 지내? 어떻게 지내? 만나서 반가워! 어떻게 지냈어? 요즘 뭐 하고 지내? 모든 게 어때? 요즘 어떻게 살아?';

      const result = translate(input, 'en-ko');
      console.log('2-1 일상인사 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-2. 격식 있는 인사 (Formal Greetings)', () => {
    test('한국어 → 영어', () => {
      const input =
        '안녕하십니까. 처음 뵙겠습니다. 제 이름은 김철수입니다. 만나 뵙게 되어 영광입니다. 오늘 좋은 하루 되시기 바랍니다. 건강하시길 기원합니다.';
      const expected =
        "Hello. It's nice to meet you for the first time. My name is Kim Cheolsu. It's an honor to meet you. I hope you have a good day today. I wish you good health.";

      const result = translate(input, 'ko-en');
      console.log('2-2 격식인사 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "Good morning. It's a pleasure to meet you. I'm John Smith. I'm honored to make your acquaintance. I hope this day finds you well. May I wish you continued success.";
      const expected =
        '좋은 아침입니다. 만나 뵙게 되어 기쁩니다. 저는 존 스미스입니다. 알게 되어 영광입니다. 오늘 좋은 하루 보내시길 바랍니다. 계속적인 성공을 기원합니다.';

      const result = translate(input, 'en-ko');
      console.log('2-2 격식인사 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-3. 작별 인사 (Farewells)', () => {
    test('한국어 → 영어', () => {
      const input =
        '그럼 이만! 조심해서 가! 다음에 또 보자! 연락할게! 잘 가! 좋은 하루 보내! 안녕히 계세요! 또 만나요!';
      const expected =
        "Well then! Take care! See you next time! I'll call you! Bye! Have a good day! Goodbye! See you again!";

      const result = translate(input, 'ko-en');
      console.log('2-3 작별인사 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'Gotta go! Take it easy! Catch you later! Stay in touch! See ya! Have a great one! Until next time! So long!';
      const expected =
        '가봐야 해! 편히 지내! 나중에 봐! 연락하고 지내! 잘 가! 좋은 하루 보내! 다음에 또! 안녕!';

      const result = translate(input, 'en-ko');
      console.log('2-3 작별인사 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-4. 특수 상황 인사 (Special Occasion Greetings)', () => {
    test('한국어 → 영어', () => {
      const input =
        '생일 축하해! 새해 복 많이 받으세요! 축하합니다! 고생 많았어! 수고했어! 좋은 결과 있기를 바랄게! 파이팅! 힘내!';
      const expected =
        "Happy birthday! Happy New Year! Congratulations! You've been through a lot! Good work! I hope you get good results! Fighting! Cheer up!";

      const result = translate(input, 'ko-en');
      console.log('2-4 특수상황 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'Merry Christmas! Happy holidays! Congratulations on your achievement! Well done! Great job! Best of luck! You got this! Hang in there!';
      const expected =
        '메리 크리스마스! 즐거운 연휴 보내세요! 성취를 축하합니다! 잘했어! 훌륭해! 행운을 빌어! 넌 할 수 있어! 버텨!';

      const result = translate(input, 'en-ko');
      console.log('2-4 특수상황 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 3. 상식 표현 (Common Sense Expressions)
// ========================================

describe('3. 상식 표현 (Common Sense Expressions)', () => {
  describe('3-1. 날씨 대화 (Weather Talk)', () => {
    test('한국어 → 영어', () => {
      const input =
        '오늘 날씨 진짜 좋다! 맑고 화창해. 산책하기 딱 좋은 날씨야. 근데 내일은 비 온다더라. 우산 챙겨야겠어. 요즘 날씨가 참 변덕스러워.';
      const expected =
        "The weather is really nice today! It's clear and sunny. It's perfect weather for a walk. But I heard it's going to rain tomorrow. I should bring an umbrella. The weather has been so unpredictable lately.";

      const result = translate(input, 'ko-en');
      console.log('3-1 날씨 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "It's freezing outside! Bundle up! They say it might snow tonight. The temperature dropped significantly. Spring is just around the corner though. I can't wait for warmer weather.";
      const expected =
        '밖이 정말 추워! 따뜻하게 입어! 오늘 밤 눈이 올 수도 있대. 기온이 크게 떨어졌어. 하지만 곧 봄이야. 따뜻한 날씨가 기다려져.';

      const result = translate(input, 'en-ko');
      console.log('3-1 날씨 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-2. 음식 대화 (Food Talk)', () => {
    test('한국어 → 영어', () => {
      const input =
        '배고파 죽겠어! 뭐 먹을까? 치킨 어때? 아니면 피자? 중국집도 괜찮을 것 같은데. 아, 그냥 간단하게 라면 끓일까? 다이어트는 내일부터!';
      const expected =
        "I'm starving! What should we eat? How about chicken? Or pizza? Chinese food seems good too. Oh, should I just make some ramen simply? Diet starts tomorrow!";

      const result = translate(input, 'ko-en');
      console.log('3-2 음식 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "I'm craving something sweet! How about dessert? Ice cream sounds amazing! Or maybe cake? Cookies would be good too. But I shouldn't... well, just this once!";
      const expected =
        '단 게 당겨! 디저트 어때? 아이스크림 완전 좋을 것 같아! 아니면 케이크? 쿠키도 좋을 것 같은데. 하지만 먹으면 안 되는데... 뭐, 딱 한 번만!';

      const result = translate(input, 'en-ko');
      console.log('3-2 음식 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-3. 일상 불편 (Daily Complaints)', () => {
    test('한국어 → 영어', () => {
      const input =
        '아, 진짜 짜증나! 버스를 놓쳤어. 다음 버스는 30분 뒤야. 오늘 지각하겠네. 상사가 뭐라고 하겠지. 아침부터 운이 없어.';
      const expected =
        "Ugh, so annoying! I missed the bus. The next bus is in 30 minutes. I'm going to be late today. My boss is going to say something. I've had bad luck since morning.";

      const result = translate(input, 'ko-en');
      console.log('3-3 일상불편 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'This is frustrating! My phone died and I forgot my charger. I have an important call to make. Why does this always happen to me? Just my luck!';
      const expected =
        '이거 짜증나! 내 폰이 꺼졌는데 충전기를 안 가져왔어. 중요한 전화를 해야 하는데. 왜 나한테만 이런 일이 생기는 거야? 정말 재수 없어!';

      const result = translate(input, 'en-ko');
      console.log('3-3 일상불편 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-4. 관용 표현 (Idiomatic Expressions)', () => {
    test('한국어 → 영어', () => {
      const input =
        '티끌 모아 태산이야. 천천히 하면 돼. 로마는 하루아침에 이루어지지 않았어. 포기하지 마. 고생 끝에 낙이 온다고. 언젠가는 빛을 볼 거야.';
      const expected =
        "Every little bit adds up. You can take it slow. Rome wasn't built in a day. Don't give up. After hardship comes happiness. Someday you'll see the light.";

      const result = translate(input, 'ko-en');
      console.log('3-4 관용표현 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "Don't put all your eggs in one basket. Better safe than sorry. A bird in the hand is worth two in the bush. Actions speak louder than words. The early bird catches the worm.";
      const expected =
        '한 바구니에 모든 걸 담지 마. 안전한 게 나아. 손안의 한 마리가 숲속의 두 마리보다 낫다. 행동이 말보다 크게 말한다. 일찍 일어나는 새가 벌레를 잡는다.';

      const result = translate(input, 'en-ko');
      console.log('3-4 관용표현 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 4. 분야별 대화 및 문서 (Domain-Specific Content)
// ========================================

describe('4. 분야별 대화 (Domain-Specific Content)', () => {
  describe('4-1. 의료 (Medical)', () => {
    test('한국어 → 영어', () => {
      const input =
        '증상이 언제부터 시작되었나요? 열은 있으신가요? 두통이나 어지럼증은요? 약물 알레르기가 있으신가요? 혈압을 재보겠습니다. 처방전을 드릴게요. 하루 세 번 식후에 복용하세요.';
      const expected =
        "When did the symptoms start? Do you have a fever? How about headache or dizziness? Do you have any drug allergies? Let me check your blood pressure. I'll give you a prescription. Take it three times a day after meals.";

      const result = translate(input, 'ko-en');
      console.log('4-1 의료 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'The patient presents with acute abdominal pain. Vital signs are stable. We need to run some blood tests and imaging. Based on the results, we may need to schedule surgery. Please monitor the patient closely.';
      const expected =
        '환자가 급성 복통을 호소하고 있습니다. 활력 징후는 안정적입니다. 혈액 검사와 영상 검사를 해야 합니다. 결과에 따라 수술을 예약해야 할 수도 있습니다. 환자를 면밀히 모니터링해 주세요.';

      const result = translate(input, 'en-ko');
      console.log('4-1 의료 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('4-2. 법률 (Legal)', () => {
    test('한국어 → 영어', () => {
      const input =
        '계약서를 작성하기 전에 변호사와 상담하시는 게 좋습니다. 계약 조건을 꼼꼼히 검토하세요. 특히 해지 조항을 주의 깊게 읽어보세요. 서명하시면 법적 구속력이 발생합니다. 추후 분쟁이 발생할 수 있으니 신중하게 결정하세요.';
      const expected =
        "It's advisable to consult with a lawyer before drafting a contract. Carefully review the contract terms. Pay particular attention to the termination clause. Once you sign, it becomes legally binding. Make a careful decision as disputes may arise later.";

      const result = translate(input, 'ko-en');
      console.log('4-2 법률 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'The defendant pleads not guilty. The prosecution must prove guilt beyond a reasonable doubt. Evidence submitted includes witness testimony and physical evidence. The court will now hear opening statements. The jury must deliberate and reach a unanimous verdict.';
      const expected =
        '피고인은 무죄를 주장합니다. 검찰은 합리적 의심을 넘어 유죄를 입증해야 합니다. 제출된 증거에는 증인 진술과 물적 증거가 포함됩니다. 법정은 이제 모두 진술을 듣겠습니다. 배심원단은 심의하여 만장일치 평결에 도달해야 합니다.';

      const result = translate(input, 'en-ko');
      console.log('4-2 법률 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('4-3. 기술/IT (Technology/IT)', () => {
    test('한국어 → 영어', () => {
      const input =
        '시스템 오류가 발생했습니다. 서버를 재부팅해 보세요. 그래도 안 되면 로그 파일을 확인하세요. 데이터베이스 백업은 되어 있나요? API 연동에 문제가 있는 것 같습니다. 개발팀에 티켓을 생성하겠습니다.';
      const expected =
        "A system error has occurred. Try rebooting the server. If that doesn't work, check the log files. Is the database backed up? There seems to be an issue with API integration. I'll create a ticket for the development team.";

      const result = translate(input, 'ko-en');
      console.log('4-3 IT 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "We need to implement a cloud-based solution. The current infrastructure is not scalable. Migration will take approximately three months. We'll use microservices architecture. Security protocols must be upgraded. Let's schedule a sprint planning meeting.";
      const expected =
        '클라우드 기반 솔루션을 구현해야 합니다. 현재 인프라는 확장 가능하지 않습니다. 마이그레이션에는 약 3개월이 걸릴 것입니다. 마이크로서비스 아키텍처를 사용하겠습니다. 보안 프로토콜을 업그레이드해야 합니다. 스프린트 계획 회의를 잡읍시다.';

      const result = translate(input, 'en-ko');
      console.log('4-3 IT 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('4-4. 비즈니스 (Business)', () => {
    test('한국어 → 영어', () => {
      const input =
        '이번 분기 매출이 목표치를 달성했습니다. 마케팅 전략이 효과적이었습니다. 하지만 운영 비용이 증가했습니다. 다음 주주총회에서 보고하겠습니다. 예산안을 재검토해야 할 것 같습니다.';
      const expected =
        "This quarter's sales have met the target. The marketing strategy was effective. However, operating costs have increased. I will report this at next week's shareholder meeting. It seems we need to review the budget plan.";

      const result = translate(input, 'ko-en');
      console.log('4-4 비즈니스 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        "We need to diversify our portfolio. The market analysis shows promising trends. Our ROI has improved by 15%. Let's schedule a board meeting to discuss expansion. We should consider strategic partnerships.";
      const expected =
        '우리는 포트폴리오를 다각화해야 합니다. 시장 분석은 유망한 추세를 보여줍니다. 우리의 ROI가 15% 향상되었습니다. 확장을 논의하기 위해 이사회 회의를 잡읍시다. 전략적 파트너십을 고려해야 합니다.';

      const result = translate(input, 'en-ko');
      console.log('4-4 비즈니스 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('4-5. 학술 (Academic)', () => {
    test('한국어 → 영어', () => {
      const input =
        '본 연구는 기후 변화가 생태계에 미치는 영향을 분석합니다. 정량적 방법론을 사용하여 데이터를 수집했습니다. 결과는 통계적으로 유의미합니다. 추가 연구가 필요합니다. 참고문헌은 APA 양식을 따릅니다.';
      const expected =
        'This study analyzes the impact of climate change on ecosystems. We collected data using quantitative methodology. The results are statistically significant. Further research is needed. References follow APA format.';

      const result = translate(input, 'ko-en');
      console.log('4-5 학술 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('영어 → 한국어', () => {
      const input =
        'The hypothesis was tested through controlled experiments. Data analysis revealed a strong correlation. The findings support previous literature. Limitations include sample size constraints. Future studies should address these variables.';
      const expected =
        '가설은 통제된 실험을 통해 검증되었습니다. 데이터 분석은 강한 상관관계를 드러냈습니다. 발견 사항은 이전 문헌을 뒷받침합니다. 한계점으로는 표본 크기 제약이 있습니다. 향후 연구는 이러한 변수들을 다루어야 합니다.';

      const result = translate(input, 'en-ko');
      console.log('4-5 학술 영→한:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 5. 사투리 (Korean Dialects)
// ========================================

describe('5. 사투리 (Korean Dialects)', () => {
  describe('5-1. 서울/표준어 (Seoul/Standard Korean)', () => {
    test('한국어 → 영어', () => {
      const input =
        '오늘 뭐 해? 나 심심한데 같이 놀자. 영화 보러 갈까? 아니면 카페 갈까? 너 요즘 어떻게 지내? 별일 없지?';
      const expected =
        "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?";

      const result = translate(input, 'ko-en');
      console.log('5-1 표준어 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('5-2. 부산/경상도 사투리 (Busan/Gyeongsang Dialect)', () => {
    test('한국어 → 영어', () => {
      const input =
        '오늘 뭐하노? 나 심심한데 같이 놀자 아이가. 영화 보러 갈까 아이가? 아니면 카페 갈끼? 니 요새 어떻노? 별일 없나?';
      const expected =
        "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?";

      const result = translate(input, 'ko-en');
      console.log('5-2 경상도 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('5-3. 전라도 사투리 (Jeolla Dialect)', () => {
    test('한국어 → 영어', () => {
      const input =
        '오늘 뭐 하시나? 나 심심한디 같이 놀자잉. 영화 보러 갈라우? 아니면 카페 갈라우? 니 요새 어떻게 지내? 별일 없제?';
      const expected =
        "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?";

      const result = translate(input, 'ko-en');
      console.log('5-3 전라도 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('5-4. 충청도 사투리 (Chungcheong Dialect)', () => {
    test('한국어 → 영어', () => {
      const input =
        '오늘 뭐 혀유? 나 심심한디 같이 놀자유. 영화 보러 갈까유? 아니면 카페 갈까유? 니 요새 어떻게 지내유? 별일 없제유?';
      const expected =
        "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?";

      const result = translate(input, 'ko-en');
      console.log('5-4 충청도 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('5-5. 강원도 사투리 (Gangwon Dialect)', () => {
    test('한국어 → 영어', () => {
      const input =
        '오늘 뭐 하가? 나 심심한데 같이 놀자게. 영화 보러 갈까? 아니면 카페 갈까? 니 요새 어떻게 지내? 별일 없어?';
      const expected =
        "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?";

      const result = translate(input, 'ko-en');
      console.log('5-5 강원도 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('5-6. 제주도 사투리 (Jeju Dialect)', () => {
    test('한국어 → 영어', () => {
      const input =
        '오늘 무사 호민? 나 시름시름헌디 경허민 놀게. 영화 보레 갈쿠가? 아니민 카페 갈쿠가? 너 요새 어떵 지내? 별일 읎나?';
      const expected =
        "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?";

      const result = translate(input, 'ko-en');
      console.log('5-6 제주도 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('5-7. 사투리 격언 (Dialect Proverbs)', () => {
    test('부산 사투리 격언', () => {
      const input =
        '공짜는 양념도 안 친다 카이. 가는 말이 고와야 오는 말이 곱다 아이가. 될 놈은 떡잎부터 다르다 카더라.';
      const expected =
        "They say there's no such thing as a free lunch. They say you get what you give. They say you can tell from the start.";

      const result = translate(input, 'ko-en');
      console.log('5-7 부산격언 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('전라도 사투리 격언', () => {
      const input =
        '공짜는 양념도 안 친다잉. 가는 말이 고와야 오는 말이 곱다께. 될 놈은 떡잎부터 다르다고.';
      const expected =
        "They say there's no such thing as a free lunch. They say you get what you give. They say you can tell from the start.";

      const result = translate(input, 'ko-en');
      console.log('5-7 전라격언 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 6. 복합 테스트 (Combined Tests)
// ========================================

describe('6. 복합 테스트 (Combined Tests)', () => {
  describe('6-1. 감정 + 사투리 (Emotion + Dialect)', () => {
    test('부산 사투리로 기쁨 표현', () => {
      const input =
        '아이고! 진짜 기분 좋다 아이가! 오늘 승진했거든! 완전 날아갈 것 같아 아이가! 이거 진짜 대박이다 카이!';
      const expected =
        "Wow! I feel really good! I got promoted today! I feel like I'm flying! This is really amazing!";

      const result = translate(input, 'ko-en');
      console.log('6-1 부산+기쁨 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('전라도 사투리로 슬픔 표현', () => {
      const input =
        '아이고매... 너무 슬퍼라잉. 눈물이 계속 나오네잉. 가슴이 먹먹허이. 이 고통이 언제 끝날란지 모르겄어잉.';
      const expected =
        "Oh my... I'm so sad. Tears keep flowing. My heart feels heavy. I don't know when this pain will end.";

      const result = translate(input, 'ko-en');
      console.log('6-1 전라+슬픔 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('6-2. 전문 분야 + 감정 (Professional + Emotion)', () => {
    test('의료 + 불안', () => {
      const input =
        '검사 결과가 너무 걱정돼요... 혹시 안 좋은 소식은 아닐까요? 가슴이 두근두근거려요. 의사 선생님, 정확히 어떤 상황인가요?';
      const expected =
        "I'm so worried about the test results... Could it be bad news? My heart is pounding. Doctor, what exactly is the situation?";

      const result = translate(input, 'ko-en');
      console.log('6-2 의료+불안 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('비즈니스 + 분노', () => {
      const input =
        '이건 도저히 받아들일 수 없습니다! 계약 조건이 이렇게 바뀔 수는 없어요! 이건 명백한 계약 위반입니다! 법적 조치를 취하겠습니다!';
      const expected =
        'This is absolutely unacceptable! The contract terms cannot change like this! This is a clear breach of contract! I will take legal action!';

      const result = translate(input, 'ko-en');
      console.log('6-2 비즈니스+분노 한→영:', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// 테스트 통계 (Test Statistics)
// ========================================

describe('테스트 통계', () => {
  test('카테고리별 테스트 커버리지 요약', () => {
    const coverage = {
      '1. 감정 표현': {
        '기쁨/행복': true,
        '슬픔/우울': true,
        '분노/짜증': true,
        '놀람/충격': true,
        '두려움/불안': true,
      },
      '2. 인사 표현': {
        '일상 인사': true,
        '격식 있는 인사': true,
        '작별 인사': true,
        '특수 상황 인사': true,
      },
      '3. 상식 표현': {
        '날씨 대화': true,
        '음식 대화': true,
        '일상 불편': true,
        '관용 표현': true,
      },
      '4. 분야별 대화': {
        의료: true,
        법률: true,
        '기술/IT': true,
        비즈니스: true,
        학술: true,
      },
      '5. 사투리': {
        '서울/표준어': true,
        '부산/경상도': true,
        전라도: true,
        충청도: true,
        강원도: true,
        제주도: true,
        '사투리 격언': true,
      },
      '6. 복합 테스트': {
        '감정 + 사투리': true,
        '전문 분야 + 감정': true,
      },
    };

    console.log('\n========================================');
    console.log('카테고리별 번역 테스트 커버리지 요약');
    console.log('========================================\n');

    let totalTests = 0;
    for (const [category, tests] of Object.entries(coverage)) {
      console.log(`\n${category}:`);
      for (const [testName, covered] of Object.entries(tests)) {
        console.log(`  ${covered ? '✓' : '✗'} ${testName}`);
        if (covered) totalTests++;
      }
    }

    console.log('\n========================================');
    console.log(`총 테스트 카테고리: ${Object.keys(coverage).length}개`);
    console.log(`총 테스트 케이스: ${totalTests}개 (양방향 포함 약 ${totalTests * 2}개)`);
    console.log('========================================\n');

    expect(true).toBe(true);
  });
});
