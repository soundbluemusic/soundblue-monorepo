/**
 * 카테고리 테스트 데이터 (Category Tests)
 * 카테고리별 번역 테스트
 */

import type { TestLevel } from '../types';

export const categoryTests: TestLevel[] = [
  {
    id: 'cat-emotion',
    name: 'Emotions',
    nameKo: '감정 표현',
    categories: [
      {
        id: 'emotion-joy',
        name: 'Joy/Happiness',
        nameKo: '기쁨/행복',
        tests: [
          {
            id: 'emo-joy-ko',
            input:
              '와! 정말 기뻐! 오늘 승진 소식 들었어! 너무너무 행복해! 이렇게 기분 좋은 날은 처음이야! 하늘을 날 것 같아! 세상을 다 가진 기분이야!',
            expected:
              "Wow! I'm so happy! I heard about the promotion today! I'm so, so happy! This is the first time I've felt this good! I feel like I'm flying! I feel like I have the whole world!",
            direction: 'ko-en',
          },
          {
            id: 'emo-joy-en',
            input:
              "I'm over the moon! I can't stop smiling! This is the best day ever! My heart is bursting with joy! I feel like I'm on top of the world! Everything is just perfect!",
            expected:
              '진짜 너무 행복해서 미치겠어! 계속 웃음이 나와! 인생 최고의 날이야! 기뻐서 가슴이 터질 것 같아! 세상 다 가진 기분이야! 모든 게 완벽해!',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'emotion-sad',
        name: 'Sadness',
        nameKo: '슬픔/우울',
        tests: [
          {
            id: 'emo-sad-ko',
            input:
              '너무 슬퍼... 눈물이 계속 나와. 가슴이 먹먹하고 아무것도 하기 싫어. 세상이 온통 회색빛인 것 같아. 이 고통이 언제 끝날지 모르겠어. 혼자인 것 같아서 외로워.',
            expected:
              "I'm so sad... Tears keep flowing. My heart feels heavy and I don't want to do anything. The whole world seems gray. I don't know when this pain will end. I feel lonely because I feel alone.",
            direction: 'ko-en',
          },
          {
            id: 'emo-sad-en',
            input:
              "I feel so down... I can't shake this feeling. Everything seems pointless. I'm drowning in sorrow. There's a void in my heart. I can't see the light at the end of the tunnel.",
            expected:
              '너무 우울해... 이 기분이 안 떨쳐져. 다 무의미해 보여. 슬픔에 빠져서 허우적대고 있어. 마음 한구석이 텅 비어 있어. 끝이 안 보여.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'emotion-anger',
        name: 'Anger',
        nameKo: '분노/짜증',
        tests: [
          {
            id: 'emo-anger-ko',
            input:
              '진짜 화나! 도대체 왜 이런 식으로 행동하는 거야?! 참을 수가 없어! 머리끝까지 화가 나! 이제 더 이상 못 참겠어! 당장 사과하지 않으면 정말 큰일 날 거야!',
            expected:
              "I'm really angry! Why on earth are you acting this way?! I can't stand it! I'm furious! I can't take it anymore! If you don't apologize right now, there will be serious consequences!",
            direction: 'ko-en',
          },
          {
            id: 'emo-anger-en',
            input:
              "This is infuriating! I'm absolutely livid! How dare you! I'm at my wit's end! I've had it up to here! You're pushing my buttons! I'm about to explode!",
            expected:
              '진짜 빡쳐! 완전 열받았어! 감히?! 더 못 참겠어! 이제 한계야! 자꾸 건드리네! 터지기 직전이야!',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'emotion-surprise',
        name: 'Surprise',
        nameKo: '놀람/충격',
        tests: [
          {
            id: 'emo-surprise-ko',
            input:
              '헐! 진짜야?! 믿을 수가 없어! 이게 무슨 일이야! 완전 충격이야! 꿈인가 싶어서 뺨을 꼬집어봤어! 세상에! 이런 일이 일어날 줄은 상상도 못 했어!',
            expected:
              "What! Really?! I can't believe it! What's happening! I'm totally shocked! I pinched my cheek to see if I'm dreaming! Oh my God! I never imagined this would happen!",
            direction: 'ko-en',
          },
          {
            id: 'emo-surprise-en',
            input:
              "No way! Are you serious?! I'm speechless! I'm blown away! This is mind-blowing! I'm in complete shock! I never saw this coming! My jaw just dropped!",
            expected:
              '헐 말도 안 돼! 진심이야?! 할 말이 없어! 완전 대박! 이거 진짜 미쳤다! 충격이야! 진짜 예상도 못 했어! 입이 떡 벌어졌어!',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'emotion-fear',
        name: 'Fear',
        nameKo: '두려움/불안',
        tests: [
          {
            id: 'emo-fear-ko',
            input:
              '무서워... 가슴이 두근두근거려. 뭔가 나쁜 일이 일어날 것 같아. 손이 떨려. 불안해서 잠을 잘 수가 없어. 이 기분이 언제까지 계속될지 걱정돼.',
            expected:
              "I'm scared... My heart is pounding. I feel like something bad is going to happen. My hands are shaking. I can't sleep because of anxiety. I'm worried about how long this feeling will last.",
            direction: 'ko-en',
          },
          {
            id: 'emo-fear-en',
            input:
              "I'm terrified... I can't breathe properly. My mind is racing with worst-case scenarios. I'm paralyzed with fear. I'm on edge. This anxiety is overwhelming me.",
            expected:
              '진짜 무서워... 숨이 제대로 안 쉬어져. 자꾸 최악의 상황만 생각나. 무서워서 꼼짝을 못 하겠어. 신경이 곤두서 있어. 불안해서 견딜 수가 없어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'cat-domain',
    name: 'Domain-Specific',
    nameKo: '분야별 대화',
    categories: [
      {
        id: 'domain-medical',
        name: 'Medical',
        nameKo: '의료',
        tests: [
          {
            id: 'med-ko',
            input:
              '증상이 언제부터 시작되었나요? 열은 있으신가요? 두통이나 어지럼증은요? 약물 알레르기가 있으신가요? 혈압을 재보겠습니다. 처방전을 드릴게요. 하루 세 번 식후에 복용하세요.',
            expected:
              "When did the symptoms start? Do you have a fever? How about headache or dizziness? Do you have any drug allergies? Let me check your blood pressure. I'll give you a prescription. Take it three times a day after meals.",
            direction: 'ko-en',
          },
          {
            id: 'med-en',
            input:
              'The patient presents with acute abdominal pain. Vital signs are stable. We need to run some blood tests and imaging. Based on the results, we may need to schedule surgery. Please monitor the patient closely.',
            expected:
              '환자분 급성 복통이에요. 바이탈은 안정적입니다. 피검사랑 영상 촬영 해야 돼요. 결과 보고 수술 잡을 수도 있어요. 환자 상태 잘 지켜봐 주세요.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'domain-legal',
        name: 'Legal',
        nameKo: '법률',
        tests: [
          {
            id: 'legal-ko',
            input:
              '계약서를 작성하기 전에 변호사와 상담하시는 게 좋습니다. 계약 조건을 꼼꼼히 검토하세요. 특히 해지 조항을 주의 깊게 읽어보세요. 서명하시면 법적 구속력이 발생합니다. 추후 분쟁이 발생할 수 있으니 신중하게 결정하세요.',
            expected:
              "It's advisable to consult with a lawyer before drafting a contract. Carefully review the contract terms. Pay particular attention to the termination clause. Once you sign, it becomes legally binding. Make a careful decision as disputes may arise later.",
            direction: 'ko-en',
          },
          {
            id: 'legal-en',
            input:
              'The defendant pleads not guilty. The prosecution must prove guilt beyond a reasonable doubt. Evidence submitted includes witness testimony and physical evidence. The court will now hear opening statements. The jury must deliberate and reach a unanimous verdict.',
            expected:
              '피고인은 무죄를 주장합니다. 검찰이 합리적 의심의 여지가 없도록 유죄를 입증해야 합니다. 제출된 증거로는 증인 진술과 물증이 있습니다. 이제 모두진술을 듣겠습니다. 배심원단은 심의 후 만장일치로 평결해야 합니다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'domain-it',
        name: 'Technology/IT',
        nameKo: '기술/IT',
        tests: [
          {
            id: 'it-ko',
            input:
              '시스템 오류가 발생했습니다. 서버를 재부팅해 보세요. 그래도 안 되면 로그 파일을 확인하세요. 데이터베이스 백업은 되어 있나요? API 연동에 문제가 있는 것 같습니다. 개발팀에 티켓을 생성하겠습니다.',
            expected:
              "A system error has occurred. Try rebooting the server. If that doesn't work, check the log files. Is the database backed up? There seems to be an issue with API integration. I'll create a ticket for the development team.",
            direction: 'ko-en',
          },
          {
            id: 'it-en',
            input:
              "We need to implement a cloud-based solution. The current infrastructure is not scalable. Migration will take approximately three months. We'll use microservices architecture. Security protocols must be upgraded. Let's schedule a sprint planning meeting.",
            expected:
              '클라우드 기반으로 가야 돼요. 지금 인프라는 확장이 안 돼요. 마이그레이션은 한 3개월 걸릴 거예요. 마이크로서비스 아키텍처 쓸 거고요. 보안 프로토콜 업그레이드해야 해요. 스프린트 계획 미팅 잡읍시다.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'domain-business',
        name: 'Business',
        nameKo: '비즈니스',
        tests: [
          {
            id: 'biz-ko',
            input:
              '이번 분기 매출이 목표치를 달성했습니다. 마케팅 전략이 효과적이었습니다. 하지만 운영 비용이 증가했습니다. 다음 주주총회에서 보고하겠습니다. 예산안을 재검토해야 할 것 같습니다.',
            expected:
              "This quarter's sales have met the target. The marketing strategy was effective. However, operating costs have increased. I will report this at next week's shareholder meeting. It seems we need to review the budget plan.",
            direction: 'ko-en',
          },
          {
            id: 'biz-en',
            input:
              "We need to diversify our portfolio. The market analysis shows promising trends. Our ROI has improved by 15%. Let's schedule a board meeting to discuss expansion. We should consider strategic partnerships.",
            expected:
              '포트폴리오 다각화가 필요해요. 시장 분석 결과 전망이 좋습니다. ROI가 15% 올랐어요. 확장 논의하려면 이사회 잡아야죠. 전략적 파트너십도 고려해 봐야 해요.',
            direction: 'en-ko',
          },
        ],
      },
      {
        id: 'domain-academic',
        name: 'Academic',
        nameKo: '학술',
        tests: [
          {
            id: 'acad-ko',
            input:
              '본 연구는 기후 변화가 생태계에 미치는 영향을 분석합니다. 정량적 방법론을 사용하여 데이터를 수집했습니다. 결과는 통계적으로 유의미합니다. 추가 연구가 필요합니다. 참고문헌은 APA 양식을 따릅니다.',
            expected:
              'This study analyzes the impact of climate change on ecosystems. We collected data using quantitative methodology. The results are statistically significant. Further research is needed. References follow APA format.',
            direction: 'ko-en',
          },
          {
            id: 'acad-en',
            input:
              'The hypothesis was tested through controlled experiments. Data analysis revealed a strong correlation. The findings support previous literature. Limitations include sample size constraints. Future studies should address these variables.',
            expected:
              '가설은 통제 실험으로 검증했습니다. 데이터 분석 결과 강한 상관관계가 나타났습니다. 이번 결과는 기존 연구를 뒷받침합니다. 표본 크기의 한계가 있습니다. 후속 연구에서 이 변수들을 다뤄야 합니다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'cat-dialect',
    name: 'Korean Dialects',
    nameKo: '사투리',
    categories: [
      {
        id: 'dialect-busan',
        name: 'Busan/Gyeongsang',
        nameKo: '부산/경상도',
        tests: [
          {
            id: 'dial-busan',
            input:
              '오늘 뭐하노? 나 심심한데 같이 놀자 아이가. 영화 보러 갈까 아이가? 아니면 카페 갈끼? 니 요새 어떻노? 별일 없나?',
            expected:
              "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'dialect-jeolla',
        name: 'Jeolla',
        nameKo: '전라도',
        tests: [
          {
            id: 'dial-jeolla',
            input:
              '오늘 뭐 하시나? 나 심심한디 같이 놀자잉. 영화 보러 갈라우? 아니면 카페 갈라우? 니 요새 어떻게 지내? 별일 없제?',
            expected:
              "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'dialect-chungcheong',
        name: 'Chungcheong',
        nameKo: '충청도',
        tests: [
          {
            id: 'dial-chung',
            input:
              '오늘 뭐 혀유? 나 심심한디 같이 놀자유. 영화 보러 갈까유? 아니면 카페 갈까유? 니 요새 어떻게 지내유? 별일 없제유?',
            expected:
              "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'dialect-jeju',
        name: 'Jeju',
        nameKo: '제주도',
        tests: [
          {
            id: 'dial-jeju',
            input:
              '오늘 무사 호민? 나 시름시름헌디 경허민 놀게. 영화 보레 갈쿠가? 아니민 카페 갈쿠가? 너 요새 어떵 지내? 별일 읎나?',
            expected:
              "What are you doing today? I'm bored, let's hang out. Should we go watch a movie? Or go to a cafe? How have you been lately? Nothing much going on?",
            direction: 'ko-en',
          },
        ],
      },
    ],
  },
];

// ========================================
// 문맥 테스트 데이터 (Context Tests)
// ========================================
