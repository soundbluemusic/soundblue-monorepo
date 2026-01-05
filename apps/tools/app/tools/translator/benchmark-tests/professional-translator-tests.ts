/**
 * 전문 번역가 수준 테스트 데이터 (Professional Translator Tests)
 * 전문 번역 품질 테스트
 */

import type { TestLevel } from '../types';

export const professionalTranslatorTests: TestLevel[] = [
  {
    id: 'pro-level-1',
    name: 'Level 1: Short Dialogue (Character Traits)',
    nameKo: 'Level 1: 짧은 대사 (캐릭터 특성 반영)',
    categories: [
      {
        id: 'pro-l1-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'pro-l1-1',
            input: '야 진짜 대박! 쟤 완전 내 이상형이야!',
            expected: "OMG! He's literally my dream guy!",
            direction: 'ko-en',
          },
          {
            id: 'pro-l1-2',
            input: '밥은 먹고 다니냐? 얼굴이 왜 이렇게 파리했어?',
            expected: 'Are you eating properly, dear? You look so thin!',
            direction: 'ko-en',
          },
          {
            id: 'pro-l1-3',
            input: '야, 이거 대체 뭐 한 거야? 이렇게 해놓고 보고를 해?',
            expected: 'What the hell is this? You call this a report?',
            direction: 'ko-en',
          },
          {
            id: 'pro-l1-4',
            input: '뭘 봐? 눈 똑바로 못 떠?',
            expected: "What're you staring at? Got a problem?",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'pro-l1-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'pro-l1-5',
            input: "Bruh, that's literally so cringe. I can't even.",
            expected: '야, 진짜 오글거려 죽겠네. 못 보겠어.',
            direction: 'en-ko',
          },
          {
            id: 'pro-l1-6',
            input: "Honey, we need to talk about our finances. We can't keep spending like this.",
            expected: '여보, 우리 돈 문제 좀 얘기해야겠어. 이러다 큰일 나.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'pro-level-2',
    name: 'Level 2: Medium Dialogue (Cultural + Emotion)',
    nameKo: 'Level 2: 중간 대사 (문화적 의역 + 감정)',
    categories: [
      {
        id: 'pro-l2-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'pro-l2-1',
            input:
              '괜찮아. 인생이 어디 한 번으로 결정되는 게 아니잖아. 엄마는 네가 노력하는 거 다 봤어. 너무 속상해하지 마.',
            expected:
              "It's alright, sweetie. One test doesn't define your whole life. I saw how hard you worked. Don't beat yourself up, okay?",
            direction: 'ko-en',
          },
          {
            id: 'pro-l2-2',
            input:
              '에이, 그 정도 남자 차였으면 잘된 거야. 너한테 과분했어. 더 좋은 사람 만날 거야.',
            expected:
              "Good riddance! He wasn't good enough for you anyway. You deserve so much better.",
            direction: 'ko-en',
          },
          {
            id: 'pro-l2-3',
            input:
              '이게 뭐야? 자료 정리도 이렇게밖에 못 해? 고객사 앞에서 이거 들고 나갈 거야? 다시 해와.',
            expected:
              'Are you kidding me? This is how you organize a presentation? You think we can show this to the client? Redo it. Now.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'pro-l2-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'pro-l2-4',
            input:
              "I'm so done with this! You never listen to me. It's always about you, you, you! I feel like I'm talking to a wall!",
            expected:
              '진짜 이제 지긋지긋해! 내 말은 절대 안 듣잖아. 맨날 너 얘기밖에 없고! 벽보고 얘기하는 것 같아!',
            direction: 'en-ko',
          },
          {
            id: 'pro-l2-5',
            input:
              "Mom, seriously? Can you, like, not embarrass me in front of my friends? That's so not cool!",
            expected: '엄마, 진짜요? 친구들 앞에서 좀 그러지 마세요. 완전 쪽팔리잖아요!',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'pro-level-3',
    name: 'Level 3: Long Dialogue (Wordplay + Creative)',
    nameKo: 'Level 3: 긴 대사 (말장난 + 창의적 의역)',
    categories: [
      {
        id: 'pro-l3-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'pro-l3-1',
            input:
              "너 요즘 왜 이렇게 감이 좋아? 아, 진짜 '감' 많이 먹었구나? 아니면 육감이 발달한 거야?",
            expected:
              'Your instincts are on point lately! Did you eat lucky charms for breakfast or something?',
            direction: 'ko-en',
          },
          {
            id: 'pro-l3-2',
            input:
              '사랑한다고? 진짜 웃기네. 사랑이 뭔지나 알아? 힘들 때 옆에 있어주는 게 사랑이야. 그런데 넌? 넌 항상 네 일이 바쁘다고, 힘들다고, 그것만 생각했잖아! 나는? 난 뭐야? 그냥 편할 때만 찾는 사람이야?',
            expected:
              "Love? That's rich. You have no idea what love even means! Love is being there when things get tough. But you? It was always about your job, your stress, your problems! What about me? Am I just someone you come to when it suits you?",
            direction: 'ko-en',
          },
          {
            id: 'pro-l3-3',
            input:
              '크크크... 네가 이길 수 있을 것 같아? 난 이미 10수 앞을 내다보고 있어. 넌 그냥... 내 손바닥 안에서 놀고 있는 거야.',
            expected:
              "You really think you stand a chance? I'm ten steps ahead of you. You're just a pawn in my game.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'pro-l3-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'pro-l3-4',
            input: "I'm reading a book about anti-gravity. It's impossible to put down!",
            expected: '중력 거스르는 법에 관한 책 읽는 중인데, 손에서 안 떨어져!',
            direction: 'en-ko',
          },
          {
            id: 'pro-l3-5',
            input:
              'I spent my whole life running from pain, from loss, from anything that could hurt me. But you... you made me want to stop running. You made me want to stay. And that terrifies me more than anything.',
            expected:
              '평생 도망쳤어. 고통도, 상실도, 날 아프게 할 모든 것들로부터. 근데 너는... 날 멈추게 했어. 여기 있고 싶게 만들었어. 그게 세상에서 제일 무서워.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'pro-level-4',
    name: 'Level 4: Very Long (Expert Level)',
    nameKo: 'Level 4: 매우 긴 대사 (전문가 최고난이도)',
    categories: [
      {
        id: 'pro-l4-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'pro-l4-1',
            input:
              '판사님, 배심원 여러분. 검사 측은 제 의뢰인을 냉혈한 살인자로 묘사했습니다. 하지만 그들이 보지 못한 게 있습니다. 한 인간의 절박함을요. 한 아버지가 자식을 구하기 위해 얼마나 극단적인 선택을 할 수 있는지를요. 법은 정의를 위해 존재합니다. 하지만 때로는, 그 정의가 진짜 정의인지 우리 스스로 물어봐야 할 때가 있습니다.',
            expected:
              'Your Honor, ladies and gentlemen of the jury. The prosecution painted my client as a cold-blooded killer. But they missed something crucial - the desperation of a man pushed to the edge. A father willing to do the unthinkable to save his child. Yes, we have laws. We have justice. But we must ask ourselves: is the letter of the law always just?',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'pro-l4-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'pro-l4-2',
            input:
              "They tell you to follow your dreams, to never give up, to believe in yourself. But they never tell you what to do when your dreams betray you. When giving up seems like the only rational choice. When believing in yourself feels like a cruel joke. I gave it everything I had. My time, my youth, my relationships. And for what? To end up right back where I started, only older and more tired. Maybe some dreams aren't meant to come true. Maybe that's the real lesson.",
            expected:
              '사람들은 말하지. 꿈을 쫓으라고, 절대 포기하지 말라고, 자신을 믿으라고. 근데 아무도 안 알려줘. 꿈이 날 배신할 때는 어떻게 해야 하는지. 포기하는 게 차라리 현명해 보일 때는. 자신을 믿는다는 게 잔인한 농담처럼 느껴질 때는. 난 모든 걸 쏟아부었어. 시간도, 청춘도, 인간관계도. 그래서 뭐가 남았냐고? 출발점으로 돌아왔어. 단지 더 늙고, 더 지쳐서. 어쩌면 어떤 꿈은 이뤄지지 않도록 되어 있는 건지도 몰라. 그게 진짜 배워야 할 거였던 거지.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 의역 테스트 (Localization Test)
// 🌍 문화적 맥락 번역 수준 테스트
// ========================================
