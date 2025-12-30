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
 * ║  예시: Level 1 의문문 규칙                                                     ║
 * ║    규칙: "Did + S + V + O?" → "S는 O를 V했니?"                                ║
 * ║                                                                              ║
 * ║    적용 가능한 모든 문장:                                                       ║
 * ║    - Did you eat breakfast?    → 너는 아침을 먹었니?                           ║
 * ║    - Did she read the book?    → 그녀는 책을 읽었니?                           ║
 * ║    - (... 무한히 많은 문장들)                                                  ║
 * ║                                                                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  ⚠️ 절대 금지 (PROHIBITED):                                                   ║
 * ║                                                                              ║
 * ║  ❌ 테스트 문장 하드코딩: /^Did you go to the museum/                          ║
 * ║  ❌ 사전에 테스트 문장 등록: i18n-sentences.ts, idioms.ts                       ║
 * ║                                                                              ║
 * ║  ✅ 올바른 방식:                                                               ║
 * ║     문법 패턴 알고리즘 구현 (grammar/, core/)                                   ║
 * ║     개별 단어만 사전에 추가 (dictionary/words.ts)                               ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * 번역기 벤치마크 테스트 데이터
 * level-test.test.ts, category-test.test.ts, context-test.test.ts에서 추출
 */

import type { TestCase, TestCategory, TestLevel } from './types';

export type { TestCase, TestCategory, TestLevel };

// ========================================
// 레벨 테스트 데이터 (Level Tests)
// ========================================

export const levelTests: TestLevel[] = [
  {
    id: 'level-1',
    name: 'Level 1 - Basic',
    nameKo: 'Level 1 - 기본',
    categories: [
      {
        id: 'l1-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'l1-1a',
            input:
              '너는 오늘 아침에 일찍 일어났니? 운동을 했니? 샤워는? 그리고 아침은 뭘 먹었어? 회사에는 몇 시에 도착했고, 회의는 어땠어?',
            expected:
              'Did you wake up early this morning? Did you exercise? How about a shower? And what did you eat for breakfast? What time did you arrive at work, and how was the meeting?',
            direction: 'ko-en',
          },
          {
            id: 'l1-1b',
            input:
              '와! 오늘 날씨가 정말 좋네! 나는 아침 일찍 일어나서 공원에서 조깅을 했어. 정말 상쾌했어! 그 후에 집에 돌아와서 샤워를 하고, 맛있는 샌드위치를 만들어 먹었지. 음, 정말 맛있었어!',
            expected:
              'Wow! The weather is really nice today! I woke up early in the morning and jogged in the park. It was so refreshing! After that, I came home, took a shower, and made a delicious sandwich. Mmm, it was really delicious!',
            direction: 'ko-en',
          },
          {
            id: 'l1-1c',
            input:
              '나는 어제 일찍 일어나지 못했어. 운동도 하지 않았고, 아침도 먹지 않았어. 회사에 지각했지만, 다행히 중요한 회의는 없었어. 점심은 동료들과 먹지 않고 혼자 먹었어.',
            expected:
              "I couldn't wake up early yesterday. I didn't exercise, and I didn't eat breakfast either. I was late for work, but fortunately, there was no important meeting. I didn't eat lunch with my colleagues and ate alone.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'l1-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'l1-2a',
            input:
              'Did you go to the museum yesterday? Was it fun? What paintings did you see? Did you buy any souvenirs? Oh, and where did you eat lunch?',
            expected:
              '너는 어제 박물관에 갔니? 재미있었어? 어떤 그림들을 봤어? 기념품은 샀어? 아, 그리고 점심은 어디서 먹었어?',
            direction: 'en-ko',
          },
          {
            id: 'l1-2b',
            input:
              'Amazing! I visited the new art museum with my family, and wow, it was beautiful! We looked at paintings, bought souvenirs, ate pasta, and yes, the weather was perfect!',
            expected:
              '대박! 가족이랑 새로 생긴 미술관 갔는데, 진짜 너무 예뻤어! 그림도 보고, 기념품도 사고, 파스타도 먹었는데, 날씨까지 완벽했어!',
            direction: 'en-ko',
          },
          {
            id: 'l1-2c',
            input:
              "I didn't visit the museum yesterday. I stayed home instead. I didn't see any paintings, didn't buy souvenirs, and didn't eat out. But it was okay, because I needed rest.",
            expected:
              '어제 박물관 안 갔어. 그냥 집에 있었어. 그림도 안 보고, 기념품도 안 사고, 외식도 안 했어. 근데 괜찮아, 좀 쉬어야 했거든.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'level-2',
    name: 'Level 2 - Intermediate',
    nameKo: 'Level 2 - 중급',
    categories: [
      {
        id: 'l2-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'l2-1a',
            input:
              '그는 정말 대학을 졸업했을까? 취업 준비를 제대로 했을까? 아마 여러 회사에 지원했겠지? 하지만 왜 계속 떨어졌을까? 혹시 면접 준비가 부족했던 건 아닐까? 결국 합격했다고 하던데, 정말일까?',
            expected:
              'Did he really graduate from university? Did he prepare properly for employment? He probably applied to several companies, right? But why did he keep failing? Could it be that his interview preparation was insufficient? I heard he finally passed, is it true?',
            direction: 'ko-en',
          },
          {
            id: 'l2-1b',
            input:
              '아! 그는 졸업 후 취업 준비를 하면서 정말 힘들었어! 수십 군데 회사에 떨어졌지만, 포기하지 않았어! 와, 정말 대단하지 않아? 드디어 합격했을 때는 너무너무 기뻤대! 첫 출근 날에는 떨렸겠지만, 선배들 덕분에 잘 적응했다니 다행이야!',
            expected:
              "Ah! After graduation, he really had a hard time preparing for employment! He failed at dozens of companies, but he didn't give up! Wow, isn't that really amazing? He was so, so happy when he finally passed! He must have been nervous on his first day at work, but it's fortunate that he adapted well thanks to his seniors!",
            direction: 'ko-en',
          },
          {
            id: 'l2-1c',
            input:
              '만약 그가 졸업 후 바로 포기했다면 어땠을까? 만약 계속 도전하지 않았다면, 지금의 회사에 합격하지 못했을 거야. 만약 첫 출근 날 선배들이 도와주지 않았다면, 적응하기 정말 어려웠을 텐데, 다행히 모든 게 잘 풀렸어.',
            expected:
              "What if he had given up right after graduation? If he hadn't kept challenging himself, he wouldn't have passed his current company. If his seniors hadn't helped him on his first day at work, it would have been really difficult to adapt, but fortunately, everything worked out well.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'l2-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'l2-2a',
            input:
              "Had she really been studying English for five years? Was it really that difficult when she arrived? Why couldn't she communicate well? Was it because textbooks are different from real conversations? How did she improve? Did native speakers really help her that much?",
            expected:
              '진짜 영어 공부한 지 5년이나 됐을까? 처음 갔을 때 진짜 그렇게 힘들었을까? 왜 말이 안 통했을까? 교과서랑 실제 대화가 달라서 그랬을까? 어떻게 늘었을까? 원어민들이 진짜 그렇게 많이 도와줬을까?',
            direction: 'en-ko',
          },
          {
            id: 'l2-2b',
            input:
              'Wow! She had studied English for five whole years! But oh my, real conversations were so much harder! However, amazing! She practiced every single day! Her pronunciation improved! Her vocabulary expanded! And finally, after six months, she could speak naturally!',
            expected:
              '와! 영어 공부한 지 무려 5년이나 됐대! 근데 세상에, 실제로 대화하는 건 훨씬 어렵더라! 근데 대박! 매일매일 연습했대! 발음도 좋아지고! 어휘도 늘고! 결국 6개월 뒤에는 자연스럽게 말할 수 있게 됐대!',
            direction: 'en-ko',
          },
          {
            id: 'l2-2c',
            input:
              "She hadn't studied English for just one or two years, but for five years. However, real conversations weren't as easy as textbook exercises. She didn't give up. She didn't practice just once or twice, but every single day. She didn't see results immediately, but after six months, finally, she could communicate naturally.",
            expected:
              '1~2년 공부한 게 아니라 5년이나 했어. 근데 실제 대화는 교과서처럼 쉽지 않더라. 그래도 포기 안 했어. 한두 번 연습한 게 아니라 매일매일 했어. 바로 결과가 나온 건 아니지만, 6개월 후에 드디어 자연스럽게 대화할 수 있게 됐어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'level-3',
    name: 'Level 3 - Advanced',
    nameKo: 'Level 3 - 고급',
    categories: [
      {
        id: 'l3-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'l3-1a',
            input:
              '정말 인공지능이 일자리를 빼앗을까? 전문가들은 새로운 일자리가 생긴다고 하는데, 과연 그럴까? 변화에 적응하는 능력이 중요하다고? 하지만 모든 사람이 쉽게 적응할 수 있을까? 정부의 재교육 프로그램이 충분할까? 기업들의 투자가 과연 실질적인 도움이 될까?',
            expected:
              "Will AI really take away jobs? Experts say new jobs will be created, but will that really happen? The ability to adapt to change is important? But can everyone adapt easily? Will the government's retraining programs be sufficient? Will corporate investments really provide practical help?",
            direction: 'ko-en',
          },
          {
            id: 'l3-1b',
            input:
              '놀랍게도, 인공지능 기술이 엄청나게 발전하고 있어! 사람들이 걱정하는 건 당연해! 하지만 전문가들의 주장을 들어봐! 오히려 더 많은 기회가 생긴다니까! 중요한 건, 바로 이거야, 적응 능력이야! 정부도 발 벗고 나섰어! 재교육 프로그램을 확 늘렸다고! 기업들도 가만있지 않아! 투자를 아끼지 않고 있어!',
            expected:
              "Amazingly, AI technology is developing tremendously! It's natural for people to worry! But listen to what the experts say! More opportunities will be created instead! The important thing is, this is it, adaptability! The government has also stepped up! They've greatly expanded retraining programs! Companies aren't just sitting either! They're sparing no investment!",
            direction: 'ko-en',
          },
          {
            id: 'l3-1c',
            input:
              '만약 인공지능이 정말로 일자리를 대체한다면? 만약 새로운 일자리가 생기지 않는다면? 만약 사람들이 변화에 적응하지 못한다면? 그렇다면 정부는 어떻게 대응해야 할까? 재교육만으로 충분할까? 기업들이 투자를 하지 않는다면?',
            expected:
              "What if AI really replaces jobs? What if new jobs aren't created? What if people can't adapt to change? Then how should the government respond? Will retraining alone be enough? What if companies don't invest?",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'l3-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'l3-2a',
            input:
              'Is climate change really the most pressing issue? Are countries actually reluctant to act? Is it because of economic concerns? Do scientists really warn of catastrophic consequences? Is international cooperation truly crucial? Should developed nations really take the lead? Must they provide support to developing countries?',
            expected:
              '기후변화가 진짜 제일 급한 문제일까? 각 나라들이 정말 행동을 꺼리는 걸까? 경제 걱정 때문일까? 과학자들이 진짜 대재앙이 온다고 경고하는 걸까? 국제 협력이 정말 그렇게 중요할까? 선진국들이 진짜 앞장서야 할까? 개도국한테 지원도 해줘야 하는 걸까?',
            direction: 'en-ko',
          },
          {
            id: 'l3-2b',
            input:
              "Climate change! Yes, it's become THE most pressing issue! But look! Many countries are still reluctant! Why? Economic growth! Scientists are warning us! Listen! The consequences will be catastrophic! Irreversible! Therefore, international cooperation! More crucial than ever! Developed nations! Take the lead! Provide support! Financial! Technological! Do it now!",
            expected:
              '기후변화! 맞아, 이게 지금 제일 급한 문제야! 근데 봐봐! 아직도 많은 나라들이 머뭇거려! 왜? 경제 성장 때문에! 과학자들이 경고하잖아! 들어봐! 결과는 재앙이야! 돌이킬 수 없다고! 그러니까 국제 협력! 그 어느 때보다 중요해! 선진국들! 앞장서! 지원해! 돈으로! 기술로! 지금 당장!',
            direction: 'en-ko',
          },
          {
            id: 'l3-2c',
            input:
              "Climate change isn't just another issue, but THE most pressing one. However, many countries aren't taking action. Not because they don't know, but because they fear economic harm. Scientists aren't suggesting, they're warning. We can't wait, we can't delay. International cooperation isn't optional, it's crucial. Developed nations can't just talk, they must act, they must lead, they must support.",
            expected:
              '기후변화는 그냥 문제가 아니라, 지금 가장 급한 문제야. 근데 많은 나라들이 움직이지 않아. 몰라서가 아니라 경제 타격이 두려워서야. 과학자들은 제안하는 게 아니야, 경고하는 거야. 기다릴 시간 없어, 미룰 수도 없어. 국제 협력은 선택이 아니야, 필수야. 선진국들, 말만 하면 안 돼, 행동해야 해, 이끌어야 해, 지원해야 해.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'level-4',
    name: 'Level 4 - Expert',
    nameKo: 'Level 4 - 전문가',
    categories: [
      {
        id: 'l4-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'l4-1a',
            input:
              '그 프로젝트가 정말 삐걱거렸을까? 팀장이 손이 컸다고? 돈을 물 쓰듯 했다고? 개발팀은 왜 손을 놓고 있었을까? 발등에 불이 떨어졌는데도? 디자이너는 정말 눈이 높았을까? 모두가 발을 빼려고 했다고? 그런데 CEO가 나서서 팀을 갈아엎었다고? 정말?',
            expected:
              'Did the project really struggle? The team leader was too generous? He spent money like water? Why was the development team idle? Even when they were in a crisis? Was the designer really that picky? Everyone tried to back out? But then the CEO stepped in and overhauled the team? Really?',
            direction: 'ko-en',
          },
          {
            id: 'l4-1b',
            input:
              '아이고! 그 프로젝트 정말 망했다니까! 팀장이 돈을 펑펑 쓰는 바람에! 완전 물 쓰듯이! 개발팀은? 아무것도 안 했어! 손 놓고 있었다고! 불났는데도! 디자이너는 또 어찌나 까다로운지! 클라이언트 말은 하나도 안 들어! 결국 다들 튀려고 했잖아! 그런데 CEO가 짠! 나타나서 싹 다 갈아치웠어! 완전 대박!',
            expected:
              "Oh my! That project was a total disaster! Because the team leader was spending money freely! Completely like water! The development team? They did nothing! They were idle! Even during a crisis! And the designer was so picky! Didn't listen to the client at all! In the end, everyone tried to run away! But then the CEO showed up! Boom! Replaced everyone! Totally awesome!",
            direction: 'ko-en',
          },
          {
            id: 'l4-1c',
            input:
              '만약 팀장이 돈을 조금만 아꼈다면? 만약 개발팀이 진작 불 끄기 시작했다면? 만약 디자이너가 눈높이를 조금 낮췄다면? 그랬다면 프로젝트가 이렇게 산으로 가지는 않았을 텐데. 하지만 CEO가 칼을 빼들고 팀을 싹 갈아엎지 않았다면, 프로젝트는 물 건너갔을 거야.',
            expected:
              "What if the team leader had been a bit more frugal? What if the development team had started putting out the fire earlier? What if the designer had lowered their standards a bit? Then the project wouldn't have gone off the rails like this. But if the CEO hadn't taken drastic measures and completely overhauled the team, the project would have been doomed.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'l4-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'l4-2a',
            input:
              'Did she really burn the midnight oil every night? Did she go the extra mile on assignments? Did she leave no stone unturned? Did she bend over backwards for professors? But she barely made the cut? Was it a wake-up call? Did she stop getting lost in the weeds? Did she focus on the big picture instead?',
            expected:
              '진짜 매일 밤새워 공부했을까? 과제도 최선을 다했을까? 안 해본 게 없을 정도였을까? 교수님들한테 잘 보이려고 엄청 노력했을까? 근데 겨우 턱걸이로 붙었다고? 그게 정신 차리는 계기가 됐을까? 쓸데없는 데 시간 쓰는 거 그만뒀을까? 중요한 것만 집중하게 됐을까?',
            direction: 'en-ko',
          },
          {
            id: 'l4-2b',
            input:
              "Listen! She didn't just study! She burned the midnight oil! Every! Single! Night! She went the extra mile! Always! She left absolutely no stone unturned! None! She bent over backwards! But wow! She barely made the cut! Talk about a wake-up call! She completely changed! No more getting lost in the weeds! Big picture! That's what matters!",
            expected:
              '들어봐! 그냥 공부한 게 아니야! 밤을 새웠어! 매일! 밤마다! 최선을 다했어! 항상! 안 해본 게 없어! 진짜 하나도! 죽어라 노력했어! 근데 와! 겨우 턱걸이로 붙었어! 완전 정신 번쩍 들었지! 완전 달라졌어! 쓸데없는 데 시간 안 써! 중요한 것만 봐! 그게 핵심이야!',
            direction: 'en-ko',
          },
          {
            id: 'l4-2c',
            input:
              "She didn't just work hard, she burned the midnight oil. She didn't do the minimum, she went the extra mile. She didn't leave any stone unturned, not a single one. She didn't half-heartedly try, she bent over backwards. But she didn't pass with flying colors, she barely made the cut. It wasn't discouraging though, it was a wake-up call. She didn't keep getting lost in the weeds, she focused on the big picture instead.",
            expected:
              '그냥 열심히 한 게 아니야, 밤새웠어. 대충 한 게 아니야, 최선을 다했어. 안 해본 게 없어, 진짜 하나도. 건성으로 한 게 아니야, 죽도록 노력했어. 근데 우등으로 붙은 게 아니야, 겨우 턱걸이야. 근데 좌절한 게 아니야, 정신 차리는 계기가 됐어. 쓸데없는 데 시간 안 썼어, 중요한 것만 집중했어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'level-5',
    name: 'Level 5 - Master',
    nameKo: 'Level 5 - 최고난이도',
    categories: [
      {
        id: 'l5-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'l5-1a',
            input:
              '정말 인간의 본성은 변하지 않을까? 우리는 왜 같은 실수를 반복할까? 더 나은 미래를 꿈꾸면서도, 왜 현재에 안주할까? 변화를 원한다면서, 왜 변화를 두려워할까? 이것이 모순일까, 아니면 인간다움일까? 완벽함을 추구하면서도 완벽해질 수 없다는 것을 아는 것, 그것이 용기일까? 아니면 어리석음일까?',
            expected:
              'Does human nature really never change? Why do we repeat the same mistakes? While dreaming of a better future, why do we settle for the present? While wanting change, why do we fear change? Is this a contradiction, or is it humanity? Knowing that we pursue perfection yet can never be perfect, is that courage? Or is it foolishness?',
            direction: 'ko-en',
          },
          {
            id: 'l5-1b',
            input:
              '아! 인간의 본성이라는 것! 정말 신비로워! 우리는 실수를 되풀이하지 않겠다고 외치면서도, 어김없이 같은 돌에 걸려 넘어져! 얼마나 아이러니한가! 미래를 꿈꾸면서도 현재에 갇혀 있어! 변화를 외치면서도 변화 앞에서 움츠러들어! 이 모순! 바로 이것이 인간이야! 완벽을 향해 나아가면서도 결코 완벽해질 수 없다는 것을 알면서도 계속 걸어가는 것! 이것이야말로 진정한 용기가 아니겠어?',
            expected:
              "Ah! Human nature! How mysterious! We cry out that we won't repeat mistakes, yet we unfailingly trip over the same stone! How ironic! While dreaming of the future, we're trapped in the present! While crying out for change, we shrink before it! This contradiction! This is precisely what it means to be human! Moving toward perfection while knowing we can never be perfect, yet continuing to walk! Isn't this what true courage really is?",
            direction: 'ko-en',
          },
          {
            id: 'l5-1c',
            input:
              '만약 우리가 실수를 되풀이하지 않는다면, 그게 정말 인간일까? 만약 변화 앞에서 두려움이 없다면, 그게 용기일까? 만약 완벽함을 추구하지 않는다면, 우리는 어디로 가야 할까? 어쩌면 이 모든 모순이야말로, 불완전함이야말로, 계속 나아가려는 노력이야말로, 진정한 인간다움이 아닐까?',
            expected:
              "If we don't repeat mistakes, would that really be human? If there's no fear before change, would that be courage? If we don't pursue perfection, where should we go? Perhaps all these contradictions, this very imperfection, this effort to keep moving forward, isn't this what being truly human means?",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'l5-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'l5-2a',
            input:
              "Does love really conquer all? What does it truly mean to love? Is it the initial butterflies? Or the choice to stay? Is it grand gestures? Or quiet moments? Does love conquer? Or does it endure? Is it passion? Or is it a lifetime of choosing each other? Even when it's easier to leave? Especially then?",
            expected:
              '사랑이 진짜 다 이길까? 진짜 사랑한다는 건 뭘까? 처음 설레는 그 감정? 아니면 곁에 남겠다는 선택? 거창한 이벤트? 아니면 소소한 순간들? 사랑은 이기는 걸까? 아니면 견디는 걸까? 열정일까? 아니면 평생 서로를 선택하는 걸까? 떠나는 게 더 쉬울 때도? 특히 그럴 때?',
            direction: 'en-ko',
          },
          {
            id: 'l5-2b',
            input:
              "Love! They say it conquers all! But wait! What is love? Is it butterflies? Beautiful! But temporary! Or is it staying? After butterflies fly away? Is it grand romance? Breathtaking! But fleeting! Or is it quiet moments? Simple! Yet profound! Love doesn't conquer! No! It endures! Not a moment! But a lifetime! Choosing each other! Again and again! Even when! Especially when! Walking away seems easier!",
            expected:
              '사랑! 다 이긴다고들 하잖아! 근데 잠깐! 사랑이 뭔데? 설렘? 예쁘지! 근데 잠깐이야! 아니면 곁에 남는 것? 설렘이 식은 다음에도? 화려한 로맨스? 심장 떨려! 근데 금방 사라져! 아니면 소소한 순간들? 단순해! 근데 깊어! 사랑은 이기는 게 아니야! 아니! 견디는 거야! 한순간이 아니야! 평생이야! 서로를 선택하는 것! 계속! 떠나고 싶을 때도! 특히 그럴 때! 떠나는 게 더 쉬워 보일 때!',
            direction: 'en-ko',
          },
          {
            id: 'l5-2c',
            input:
              "Love doesn't just conquer, it endures. It's not the butterflies, but staying after they've flown. It's not grand gestures, but quiet moments. It's not a single moment, but a lifetime. It's not passion alone, but choosing each other. Not once, but again and again. Not when it's easy, but when it's hard. Not despite difficulty, but because of it. That's not just love, that's true love.",
            expected:
              '사랑은 이기는 게 아니라 견디는 거야. 설렘이 아니라, 설렘이 식은 뒤에도 곁에 있는 거야. 거창한 게 아니라 소소한 순간들이야. 한순간이 아니라 평생이야. 열정만이 아니라 서로를 선택하는 거야. 한 번이 아니라 계속. 쉬울 때가 아니라 어려울 때. 힘들어도가 아니라, 힘들기 때문에. 그게 그냥 사랑이 아니야, 진짜 사랑이야.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 카테고리 테스트 데이터 (Category Tests)
// ========================================

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

export const spacingErrorTests: TestLevel[] = [
  {
    id: 'spacing-level1',
    name: 'Level 1: Short (5-7 spacing errors)',
    nameKo: 'Level 1: 짧은 문장 (띄어쓰기 5-7곳)',
    categories: [
      {
        id: 'sp-l1-ko-en',
        name: 'Korean(no spacing) → English',
        nameKo: '한국어(띄어쓰기X) → 영어',
        tests: [
          {
            id: 'sp-l1-1',
            input: '나는일찍일어나서일을했어.',
            expected: 'I woke up early and worked.',
            direction: 'ko-en',
          },
          {
            id: 'sp-l1-2',
            input: '그는배를타고배가고파서배를먹었어.',
            expected: 'He rode the ship, got hungry, and ate a pear.',
            direction: 'ko-en',
          },
          {
            id: 'sp-l1-3',
            input: '눈이와서눈이아파서집에있어.',
            expected: "It's snowing and my eyes hurt, so I'm at home.",
            direction: 'ko-en',
          },
          {
            id: 'sp-l1-4',
            input: '말을타고말을했는데말이안들려.',
            expected: "I rode a horse and spoke, but couldn't hear the words.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'sp-l1-en-ko',
        name: 'English(no spacing) → Korean',
        nameKo: '영어(띄어쓰기X) → 한국어',
        tests: [
          {
            id: 'sp-l1-5',
            input: 'Iwatchedthemoviewhileeating.',
            expected: '밥 먹으면서 영화 봤어.',
            direction: 'en-ko',
          },
          {
            id: 'sp-l1-6',
            input: 'Heworksatthebankbytheriver.',
            expected: '걔는 강가 은행에서 일해.',
            direction: 'en-ko',
          },
          {
            id: 'sp-l1-7',
            input: 'Shesangasongaboutlove.',
            expected: '사랑 노래를 불렀어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'spacing-level2',
    name: 'Level 2: Medium (10-15 spacing errors)',
    nameKo: 'Level 2: 중간 문장 (띄어쓰기 10-15곳)',
    categories: [
      {
        id: 'sp-l2-ko-en',
        name: 'Korean(no spacing) → English',
        nameKo: '한국어(띄어쓰기X) → 영어',
        tests: [
          {
            id: 'sp-l2-1',
            input: '나는어제친구를보러카페에가서커피를마시면서코딩을했는데너무행복했어.',
            expected:
              'I went to a cafe to see my friend yesterday, drank coffee while coding, and was very happy.',
            direction: 'ko-en',
          },
          {
            id: 'sp-l2-2',
            input: '그녀는화가나서말을안하고방에들어가서문을쾅닫았어.',
            expected: "She was angry so she didn't talk, went into her room, and slammed the door.",
            direction: 'ko-en',
          },
          {
            id: 'sp-l2-3',
            input: 'AI개발을하는회사에서일하면서머신러닝을공부하고데이터를분석해.',
            expected:
              'I work at a company that develops AI, study machine learning, and analyze data.',
            direction: 'ko-en',
          },
          {
            id: 'sp-l2-4',
            input: '밤에밤을구워먹으면서영화를보다가잠이들었어.',
            expected: 'At night, I fell asleep while watching a movie and roasting chestnuts.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'sp-l2-en-ko',
        name: 'English(no spacing) → Korean',
        nameKo: '영어(띄어쓰기X) → 한국어',
        tests: [
          {
            id: 'sp-l2-5',
            input: 'Iwenttothegymthismorningandranonthetreadmillfor30minutes.',
            expected: '오늘 아침 헬스장 가서 러닝머신으로 30분 뛰었어.',
            direction: 'en-ko',
          },
          {
            id: 'sp-l2-6',
            input: 'Myfriendissadandcryingbecauseshefailedtheexam.',
            expected: '친구가 시험 떨어져서 울고 있어.',
            direction: 'en-ko',
          },
          {
            id: 'sp-l2-7',
            input: 'TheprogrammerisfixingbugsandwritingcodefortheAIproject.',
            expected: '그 프로그래머가 AI 프로젝트 버그 잡고 코드 짜고 있어.',
            direction: 'en-ko',
          },
          {
            id: 'sp-l2-8',
            input: 'Lightcolorsarebetterthandarkonesforspring.',
            expected: '밝은 색이 봄에는 어두운 색보다 더 좋아.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'spacing-level3',
    name: 'Level 3: Long (20-30 spacing errors)',
    nameKo: 'Level 3: 긴 문장 (띄어쓰기 20-30곳)',
    categories: [
      {
        id: 'sp-l3-ko-en',
        name: 'Korean(no spacing) → English',
        nameKo: '한국어(띄어쓰기X) → 영어',
        tests: [
          {
            id: 'sp-l3-1',
            input:
              '나는지난주일요일에친구들과함께한강공원에가서자전거를타고치킨과맥주를먹으면서프로젝트일정에대해이야기했는데다들걱정이많아서나도불안해졌어.',
            expected:
              'Last Sunday, I went to Hangang Park with friends, rode bikes, ate chicken and beer while talking about the project schedule, and everyone was worried so I became anxious too.',
            direction: 'ko-en',
          },
          {
            id: 'sp-l3-2',
            input:
              '그는화가나서사무실을나갔다가다시들어와서컴퓨터를켜고코드를보다가버그를잡았는데기분이좋아졌어.',
            expected:
              'He got angry and left the office, came back, turned on the computer, looked at the code, caught a bug, and felt better.',
            direction: 'ko-en',
          },
          {
            id: 'sp-l3-3',
            input:
              '데이터사이언티스트가빅데이터를분석하면서인공지능모델을학습시키고있는데결과가좋아서너무기뻐.',
            expected:
              'The data scientist is analyzing big data and training an AI model, and is very happy because the results are good.',
            direction: 'ko-en',
          },
          {
            id: 'sp-l3-4',
            input:
              '배를타고여행을가다가배가고파서배와사과를먹었는데배탈이나서배가아파서병원에갔어.',
            expected:
              'While traveling by ship, I got hungry so I ate pears and apples, but got a stomachache and my stomach hurt so I went to the hospital.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'sp-l3-en-ko',
        name: 'English(no spacing) → Korean',
        nameKo: '영어(띄어쓰기X) → 한국어',
        tests: [
          {
            id: 'sp-l3-5',
            input:
              'LastnightIwassostressedaboutworksoIwenttothebarwithmycolleaguesanddrankbeerandtalkedaboutourproblemsandfeelsomuchbetternow.',
            expected:
              '어젯밤에 일 때문에 너무 스트레스받아서 동료들이랑 술집 가서 맥주 마시면서 고민 얘기했더니 지금은 훨씬 나아.',
            direction: 'en-ko',
          },
          {
            id: 'sp-l3-6',
            input:
              'ThesoftwaredeveloperisfrustratedcausethebugkeepsappearingandthecodeisntworkingproperlysohedecidestorefactortheentiremoduleusingPython.',
            expected:
              '그 개발자가 버그가 자꾸 나오고 코드가 안 돌아가서 빡쳐서 Python으로 모듈 전체를 리팩토링하기로 했어.',
            direction: 'en-ko',
          },
          {
            id: 'sp-l3-7',
            input:
              'Iwatchedamovieaboutalighthousekeeperwhogotlostinthedarkandusedamatchtolight afirebutthelightwasntenoughandhefeltsadandlonely.',
            expected:
              '어둠 속에서 길 잃은 등대지기가 성냥으로 불 피웠는데 빛이 부족해서 슬프고 외로워하는 영화 봤어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'spacing-level4',
    name: 'Level 4: Very Long (40+ spacing errors + typos)',
    nameKo: 'Level 4: 매우 긴 문장 (띄어쓰기 40+ 곳 + 오타)',
    categories: [
      {
        id: 'sp-l4-ko-en',
        name: 'Korean(no spacing) → English',
        nameKo: '한국어(띄어쓰기X) → 영어',
        tests: [
          {
            id: 'sp-l4-1',
            input:
              '나는작년부터올해까지거의일년동안매일일찍일어나서일을하면서파이썬과자바스크립트로코딩을공부하고머신러닝과딥러닝알고리즘을구현해봤는데처음에는너무어려워서화가나고짜증이났지만점점이해가되면서기쁘고행복해졌고이제는AI개발자로취업을해서회사에서데이터를분석하고모델을학습시키면서정말뿌듯하고자랑스러워.',
            expected:
              'From last year until this year, for almost a year, I woke up early every day, worked, studied coding with Python and JavaScript, and tried implementing machine learning and deep learning algorithms, but at first it was so difficult that I got angry and irritated, but gradually as I understood it I became happy and joyful, and now I got a job as an AI developer and feel really proud and accomplished while analyzing data and training models at the company.',
            direction: 'ko-en',
          },
          {
            id: 'sp-l4-2',
            input:
              '우리팀은지난달부터이번달까지한달동안밤낮으로일을하면서새로운앱을개발했는데프론트엔드는리액트로백엔드는노드제이에스로데이터베이스는몽고디비로구축했고중간에버그가너무많이나와서다들스트레스받고화가났지만팀장님이격려해주시고피자를사주셔서다시힘을내서코드를수정하고테스트를반복했더니마침내완성이돼서정말기쁘고감동이었어.',
            expected:
              'Our team worked day and night for a month from last month until this month developing a new app, built the frontend with React, backend with Node.js, and database with MongoDB, but there were so many bugs in the middle that everyone was stressed and angry, but the team leader encouraged us and bought pizza so we got motivated again, fixed the code and repeated testing, and finally completed it so we were really happy and moved.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'sp-l4-en-ko',
        name: 'English(no spacing + typos) → Korean',
        nameKo: '영어(띄어쓰기X + 오타) → 한국어',
        tests: [
          {
            id: 'sp-l4-3',
            input:
              'IvebeenanAIdeveloperforthreeyearsandworkingondeeplearnignprojectsisprettyexcitingbutalsoverystressfulcausewhenyoutrainneuralnetworksthebugscanbeveryconfusingandsometimesIfeelfrustartedandsadwhenthemodeldoesntconvergebutwhenitsfinallworkingandtheaccuracyishighIfeelamazingandhappyandproudofmyselfandmyteamandnowwerelookingintotransformermodelsandlargelanguagemodelswhicharesocoolandIcantwaittostartbuildingthem.',
            expected:
              'AI 개발자로 3년째 일하는데, 딥러닝 프로젝트는 진짜 재밌긴 한데 스트레스도 심해. 신경망 학습시킬 때 버그 잡기가 너무 헷갈리거든. 모델이 수렴 안 되면 좌절하고 우울해지는데, 결국 잘 돌아가고 정확도 높으면 뿌듯하고 우리 팀이 자랑스러워. 요즘 트랜스포머랑 LLM 보고 있는데 진짜 멋있어서 빨리 만들어보고 싶어.',
            direction: 'en-ko',
          },
          {
            id: 'sp-l4-4',
            input:
              'WhenIwasworkingatthetechstartuplastyearIhadtodealwithmultipleproblemslikeservercrashesdatabaseerrorsAPIfailuresandteamconflictswhichmademeanxiousanddepressedbutIlearnedtodebugmoreeffieicntlywritecleanercodeandcommunicatebetterwithmycolleaguessometimesIhadtoworkovernightfixingcriticalbugsandIfeltsotiredandlonelybutwhenwefinallylaunchedtheproductandgotreallypositivefeedbackfromusersIwassohappyandrelievedthatallthehardworkpaidoffandnowIfeelmuchmorecondidentandreadyforthenextchallenge.',
            expected:
              '작년에 스타트업 다닐 때 서버 터지고, DB 에러 나고, API 뻗고, 팀원끼리 갈등 생기고, 진짜 많이 힘들었어. 불안하고 우울했는데, 그래도 디버깅 실력이랑 코딩 스킬, 커뮤니케이션 능력이 많이 늘었어. 야근하면서 치명적인 버그 고친 적도 있고, 너무 힘들고 외로웠는데, 출시하고 유저들 반응 좋았을 때 진짜 뿌듯하고 안도됐어. 이제 자신감 붙어서 다음 도전도 할 준비됐어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 최종 파이널 테스트 (FINAL TEST)
// 5 Chaos Elements: 시제, 단수/복수+관사, 주어 복원, 격식/반말, 부정 위치
// ========================================

export const finalTests: TestLevel[] = [
  {
    id: 'final-level1',
    name: 'Level 1: Short (Extreme)',
    nameKo: 'Level 1: 짧은 문장 (극악 난이도)',
    categories: [
      {
        id: 'final-l1-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'final-l1-1',
            input: '밥 먹었어?',
            expected: 'Did you eat?',
            direction: 'ko-en',
          },
          {
            id: 'final-l1-2',
            input: '학교 안 갔어.',
            expected: "I didn't go to school.",
            direction: 'ko-en',
          },
          {
            id: 'final-l1-3',
            input: '사과 좀 줘.',
            expected: 'Give me an apple.',
            direction: 'ko-en',
          },
          {
            id: 'final-l1-4',
            input: '친구들 만났어.',
            expected: 'I met my friends.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'final-l1-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'final-l1-5',
            input: 'Did you eat?',
            expected: '밥 먹었어?',
            direction: 'en-ko',
          },
          {
            id: 'final-l1-6',
            input: "I didn't go to school.",
            expected: '학교 안 갔어.',
            direction: 'en-ko',
          },
          {
            id: 'final-l1-7',
            input: 'Give me an apple.',
            expected: '사과 좀 줘.',
            direction: 'en-ko',
          },
          {
            id: 'final-l1-8',
            input: 'I met my friends.',
            expected: '친구들 만났어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'final-level2',
    name: 'Level 2: Medium (Extreme++)',
    nameKo: 'Level 2: 중간 문장 (극악++)',
    categories: [
      {
        id: 'final-l2-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'final-l2-1',
            input: '어제 영화 봤는데 재밌었어.',
            expected: 'I watched a movie yesterday and it was fun.',
            direction: 'ko-en',
          },
          {
            id: 'final-l2-2',
            input: '지금 뭐 해? 같이 밥 먹을래?',
            expected: 'What are you doing now? Do you want to eat together?',
            direction: 'ko-en',
          },
          {
            id: 'final-l2-3',
            input: '비가 와서 우산 챙겼어.',
            expected: "It's raining, so I brought an umbrella.",
            direction: 'ko-en',
          },
          {
            id: 'final-l2-4',
            input: '그 책 못 읽었어. 시간 없었거든.',
            expected: "I couldn't read the book. I didn't have time.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'final-l2-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'final-l2-5',
            input: 'I watched a movie yesterday and it was fun.',
            expected: '어제 영화 봤는데 재밌었어.',
            direction: 'en-ko',
          },
          {
            id: 'final-l2-6',
            input: 'What are you doing now? Do you want to eat together?',
            expected: '지금 뭐 해? 같이 밥 먹을래?',
            direction: 'en-ko',
          },
          {
            id: 'final-l2-7',
            input: "It's raining, so I brought an umbrella.",
            expected: '비가 와서 우산을 챙겼어.',
            direction: 'en-ko',
          },
          {
            id: 'final-l2-8',
            input: "I couldn't read the book. I didn't have time.",
            expected: '그 책 못 읽었어. 시간이 없었어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'final-level3',
    name: 'Level 3: Long (Extreme+++)',
    nameKo: 'Level 3: 긴 문장 (극악+++)',
    categories: [
      {
        id: 'final-l3-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'final-l3-1',
            input: '어제 친구랑 카페 갔다가 서점 들렀는데, 좋은 책 발견해서 샀어.',
            expected:
              'Yesterday, I went to a cafe with a friend and stopped by a bookstore, found a good book, and bought it.',
            direction: 'ko-en',
          },
          {
            id: 'final-l3-2',
            input: '회의 끝나고 저녁 먹자. 근데 너무 늦으면 안 돼, 내일 출장이야.',
            expected:
              "Let's eat dinner after the meeting. But we can't be too late, I have a business trip tomorrow.",
            direction: 'ko-en',
          },
          {
            id: 'final-l3-3',
            input: '프로젝트 마감이 다가오는데 아직 버그가 많아서 야근 중이야.',
            expected:
              "The project deadline is approaching, but there are still many bugs, so I'm working overtime.",
            direction: 'ko-en',
          },
          {
            id: 'final-l3-4',
            input: '운동 시작한 지 한 달 됐는데, 아직 효과를 못 느끼겠어.',
            expected:
              "It's been a month since I started exercising, but I still can't feel the effects.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'final-l3-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'final-l3-5',
            input:
              'Yesterday, I went to a cafe with a friend and stopped by a bookstore, found a good book, and bought it.',
            expected: '어제 친구랑 카페에 갔다가 서점에 들렀는데, 좋은 책을 발견해서 샀어.',
            direction: 'en-ko',
          },
          {
            id: 'final-l3-6',
            input:
              "Let's eat dinner after the meeting. But we can't be too late, I have a business trip tomorrow.",
            expected: '회의 끝나고 저녁 먹자. 근데 너무 늦으면 안 돼, 내일 출장이야.',
            direction: 'en-ko',
          },
          {
            id: 'final-l3-7',
            input:
              "The project deadline is approaching, but there are still many bugs, so I'm working overtime.",
            expected: '프로젝트 마감이 다가오는데 아직 버그가 많아서 야근 중이야.',
            direction: 'en-ko',
          },
          {
            id: 'final-l3-8',
            input:
              "It's been a month since I started exercising, but I still can't feel the effects.",
            expected: '운동 시작한 지 한 달 됐는데, 아직 효과를 못 느끼겠어.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'final-level4',
    name: 'Level 4: Very Long (Final Boss - Extreme++++)',
    nameKo: 'Level 4: 매우 긴 문장 (최종 보스 - 극악++++)',
    categories: [
      {
        id: 'final-l4-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'final-l4-1',
            input:
              '오늘 회사에서 발표했는데 준비를 못해서 망했어. 상사가 화났고, 동료들 앞에서 창피당했어. 집에 오는 길에 비까지 맞았는데, 우산도 안 챙겨서 완전 젖었어. 그래도 내일 다시 해보려고. 포기 안 할 거야.',
            expected:
              "I gave a presentation at work today, but I wasn't prepared, so it went badly. My boss got angry, and I was embarrassed in front of my colleagues. On the way home, I even got caught in the rain, and I didn't bring an umbrella, so I got completely soaked. Still, I'm going to try again tomorrow. I'm not going to give up.",
            direction: 'ko-en',
          },
          {
            id: 'final-l4-2',
            input:
              '지난 주말에 가족들이랑 여행 갔었는데, 날씨가 안 좋아서 계획했던 걸 다 못 했어. 근데 오히려 숙소에서 보드게임하고 이야기하면서 더 재밌었어. 역시 누구랑 가느냐가 중요한 것 같아.',
            expected:
              "Last weekend, I went on a trip with my family, but the weather was bad, so we couldn't do everything we planned. But instead, we had more fun playing board games and talking at the accommodation. After all, I think who you go with is what matters.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'final-l4-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'final-l4-3',
            input:
              "I gave a presentation at work today, but I wasn't prepared, so it went badly. My boss got angry, and I was embarrassed in front of my colleagues. On the way home, I even got caught in the rain, and I didn't bring an umbrella, so I got completely soaked. Still, I'm going to try again tomorrow. I'm not going to give up.",
            expected:
              '오늘 회사에서 발표했는데 준비를 못해서 망했어. 상사가 화났고, 동료들 앞에서 창피당했어. 집에 오는 길에 비까지 맞았는데, 우산도 안 챙겨서 완전 젖었어. 그래도 내일 다시 해보려고. 포기 안 할 거야.',
            direction: 'en-ko',
          },
          {
            id: 'final-l4-4',
            input:
              "Last weekend, I went on a trip with my family, but the weather was bad, so we couldn't do everything we planned. But instead, we had more fun playing board games and talking at the accommodation. After all, I think who you go with is what matters.",
            expected:
              '지난 주말에 가족들이랑 여행 갔었는데, 날씨가 안 좋아서 계획했던 걸 다 못 했어. 근데 오히려 숙소에서 보드게임하고 이야기하면서 더 재밌었어. 역시 누구랑 가느냐가 중요한 것 같아.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 전문 번역가 수준 테스트 (Professional Translator Level Test)
// 🎬 넷플릭스 즉시 사용 가능 수준
// ========================================

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

export const localizationTests: TestLevel[] = [
  {
    id: 'loc-level-1',
    name: 'Level 1: Idioms (속담/관용구)',
    nameKo: 'Level 1: 속담/관용구',
    categories: [
      {
        id: 'loc-l1-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'loc-l1-1',
            input: '티끌 모아 태산이야',
            expected: 'Every little bit counts',
            direction: 'ko-en',
          },
          {
            id: 'loc-l1-2',
            input: '이번만 눈 감아줄게',
            expected: "I'll let it slide this time",
            direction: 'ko-en',
          },
          {
            id: 'loc-l1-3',
            input: '이제 발 뻗고 잘 수 있겠다',
            expected: 'Now I can finally sleep in peace',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'loc-l1-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'loc-l1-4',
            input: "It's raining cats and dogs outside",
            expected: '밖에 비가 억수같이 쏟아지네',
            direction: 'en-ko',
          },
          {
            id: 'loc-l1-5',
            input: 'Break a leg at your audition!',
            expected: '오디션 대박 나라!',
            direction: 'en-ko',
          },
          {
            id: 'loc-l1-6',
            input: "Don't worry, it'll be a piece of cake",
            expected: '걱정 마, 누워서 떡 먹기야',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'loc-level-2',
    name: 'Level 2: Cultural Expressions (문화적 표현)',
    nameKo: 'Level 2: 문화적 표현',
    categories: [
      {
        id: 'loc-l2-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'loc-l2-1',
            input: '오늘 회식인데 1차만 하고 빠져도 돼?',
            expected: 'We have a work dinner tonight. Can I leave after the first round?',
            direction: 'ko-en',
          },
          {
            id: 'loc-l2-2',
            input: '걔는 눈치가 빠른 편이야',
            expected: "She's good at reading the room",
            direction: 'ko-en',
          },
          {
            id: 'loc-l2-3',
            input: '설날에 세배하고 세뱃돈 받았어',
            expected: 'I bowed to my elders on New Year and got gift money',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'loc-l2-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'loc-l2-4',
            input: "Let's do Thanksgiving at my place this year",
            expected: '올해 추수감사절은 우리 집에서 하자',
            direction: 'en-ko',
          },
          {
            id: 'loc-l2-5',
            input: 'I brought some housewarming gifts for you',
            expected: '집들이 선물 가져왔어',
            direction: 'en-ko',
          },
          {
            id: 'loc-l2-6',
            input: 'She threw a baby shower for her sister',
            expected: '언니 출산 축하 파티 열었어',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'loc-level-3',
    name: 'Level 3: Complex Cultural Context (복잡한 문화적 맥락)',
    nameKo: 'Level 3: 복잡한 문화적 맥락',
    categories: [
      {
        id: 'loc-l3-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'loc-l3-1',
            input: '저 선배 군대 말년에 맨날 짬 타더니 지금도 똑같네',
            expected:
              'That senior was always slacking off near the end of his service, and nothing has changed',
            direction: 'ko-en',
          },
          {
            id: 'loc-l3-2',
            input: '요즘 수저 계급론 때문에 다들 포기가 빠르더라',
            expected:
              'These days people give up quickly because they think wealth determines everything',
            direction: 'ko-en',
          },
          {
            id: 'loc-l3-3',
            input: '워라밸 좋은 회사 찾는다고? 그건 좀 판타지지',
            expected:
              'Looking for a company with good work-life balance? That sounds like a fantasy',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'loc-l3-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'loc-l3-4',
            input: "He's a real trust fund baby who never had to work a day",
            expected: '금수저라 평생 일 안 해도 되는 애야',
            direction: 'en-ko',
          },
          {
            id: 'loc-l3-5',
            input: "That's just keeping up with the Joneses mentality",
            expected: '그건 그냥 남들 따라가려는 허세야',
            direction: 'en-ko',
          },
          {
            id: 'loc-l3-6',
            input: 'He pulled himself up by his bootstraps from nothing',
            expected: '맨땅에서 헤딩으로 성공한 사람이야',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'loc-level-4',
    name: 'Level 4: Subtitle Compression + Creative (자막 압축 + 창의 의역)',
    nameKo: 'Level 4: 자막 압축 + 창의 의역',
    categories: [
      {
        id: 'loc-l4-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'loc-l4-1',
            input:
              '내가 솔직히 지금 일 그만두고 여행 다니고 싶은데, 그렇다고 현실을 무시할 수도 없고, 그냥 답답해 죽겠어',
            expected:
              'I want to quit and travel, but reality keeps holding me back. I feel so stuck',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'loc-l4-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'loc-l4-2',
            input:
              'Well, that escalated quickly. I mean, that really got out of hand fast. Everyone was just fine, and then boom, total chaos',
            expected: '순식간에 개판됐네. 멀쩡하다가 한순간에 난장판',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 안티하드코딩 알고리즘 테스트 (Anti-Hardcoding Algorithm Test)
// 🚫 암기/하드코딩으로는 절대 통과 불가능
// 22가지 핵심 알고리즘 규칙 - 무한 조합 가능
// ========================================

export const antiHardcodingTests: TestLevel[] = [
  {
    id: 'anti-level-1',
    name: 'Level 1: Number + Plural Rules (숫자+복수형)',
    nameKo: 'Level 1: 숫자 + 복수형 규칙',
    categories: [
      {
        id: 'anti-l1-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l1-1',
            input: '사과 1개',
            expected: '1 apple',
            direction: 'ko-en',
          },
          {
            id: 'anti-l1-2',
            input: '사과 2개',
            expected: '2 apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l1-3',
            input: '사과 0개',
            expected: '0 apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l1-4',
            input: '고양이 1마리',
            expected: '1 cat',
            direction: 'ko-en',
          },
          {
            id: 'anti-l1-5',
            input: '고양이 5마리',
            expected: '5 cats',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l1-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l1-6',
            input: '1 apple',
            expected: '사과 1개',
            direction: 'en-ko',
          },
          {
            id: 'anti-l1-7',
            input: '2 apples',
            expected: '사과 2개',
            direction: 'en-ko',
          },
          {
            id: 'anti-l1-8',
            input: '0 apples',
            expected: '사과 0개',
            direction: 'en-ko',
          },
          {
            id: 'anti-l1-9',
            input: '1 cat',
            expected: '고양이 1마리',
            direction: 'en-ko',
          },
          {
            id: 'anti-l1-10',
            input: '5 cats',
            expected: '고양이 5마리',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-2',
    name: 'Level 2: Article a/an Rules (관사 a/an)',
    nameKo: 'Level 2: 관사 a/an 발음 규칙',
    categories: [
      {
        id: 'anti-l2-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l2-1',
            input: '사과 하나',
            expected: 'an apple',
            direction: 'ko-en',
          },
          {
            id: 'anti-l2-2',
            input: '책 하나',
            expected: 'a book',
            direction: 'ko-en',
          },
          {
            id: 'anti-l2-3',
            input: '대학교 하나',
            expected: 'a university',
            direction: 'ko-en',
          },
          {
            id: 'anti-l2-4',
            input: '한 시간',
            expected: 'an hour',
            direction: 'ko-en',
          },
          {
            id: 'anti-l2-5',
            input: '정직한 사람',
            expected: 'an honest person',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l2-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l2-6',
            input: 'an apple',
            expected: '사과 하나',
            direction: 'en-ko',
          },
          {
            id: 'anti-l2-7',
            input: 'a book',
            expected: '책 하나',
            direction: 'en-ko',
          },
          {
            id: 'anti-l2-8',
            input: 'a university',
            expected: '대학교 하나',
            direction: 'en-ko',
          },
          {
            id: 'anti-l2-9',
            input: 'an hour',
            expected: '한 시간',
            direction: 'en-ko',
          },
          {
            id: 'anti-l2-10',
            input: 'an honest person',
            expected: '정직한 사람',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-3',
    name: 'Level 3: Ordinal Numbers (서수)',
    nameKo: 'Level 3: 서수 생성 규칙',
    categories: [
      {
        id: 'anti-l3-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l3-1',
            input: '1번째',
            expected: '1st',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-2',
            input: '2번째',
            expected: '2nd',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-3',
            input: '3번째',
            expected: '3rd',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-4',
            input: '11번째',
            expected: '11th',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-5',
            input: '21번째',
            expected: '21st',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-6',
            input: '112번째',
            expected: '112th',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l3-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l3-7',
            input: '1st',
            expected: '1번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-8',
            input: '2nd',
            expected: '2번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-9',
            input: '3rd',
            expected: '3번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-10',
            input: '11th',
            expected: '11번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-11',
            input: '21st',
            expected: '21번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-12',
            input: '112th',
            expected: '112번째',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-4',
    name: 'Level 4: Tense Detection (시제 자동 판단)',
    nameKo: 'Level 4: 시제 자동 판단',
    categories: [
      {
        id: 'anti-l4-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l4-1',
            input: '어제 먹었다',
            expected: 'ate yesterday',
            direction: 'ko-en',
          },
          {
            id: 'anti-l4-2',
            input: '내일 먹을 거야',
            expected: 'will eat tomorrow',
            direction: 'ko-en',
          },
          {
            id: 'anti-l4-3',
            input: '매일 먹는다',
            expected: 'eat every day',
            direction: 'ko-en',
          },
          {
            id: 'anti-l4-4',
            input: '지금 먹고 있다',
            expected: 'am eating now',
            direction: 'ko-en',
          },
          {
            id: 'anti-l4-5',
            input: '이미 먹었다',
            expected: 'have already eaten',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l4-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l4-6',
            input: 'ate yesterday',
            expected: '어제 먹었다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l4-7',
            input: 'will eat tomorrow',
            expected: '내일 먹을 거야',
            direction: 'en-ko',
          },
          {
            id: 'anti-l4-8',
            input: 'eat every day',
            expected: '매일 먹는다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l4-9',
            input: 'am eating now',
            expected: '지금 먹고 있다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l4-10',
            input: 'have already eaten',
            expected: '이미 먹었다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-5',
    name: 'Level 5: Subject-Verb Agreement (주어-동사 수 일치)',
    nameKo: 'Level 5: 주어-동사 수 일치',
    categories: [
      {
        id: 'anti-l5-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l5-1',
            input: '그는 달린다',
            expected: 'He runs',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-2',
            input: '그들은 달린다',
            expected: 'They run',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-3',
            input: '고양이가 잔다',
            expected: 'The cat sleeps',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-4',
            input: '고양이들이 잔다',
            expected: 'The cats sleep',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-5',
            input: '학생이 공부한다',
            expected: 'The student studies',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-6',
            input: '버스가 간다',
            expected: 'The bus goes',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l5-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l5-7',
            input: 'He runs',
            expected: '그는 달린다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-8',
            input: 'They run',
            expected: '그들은 달린다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-9',
            input: 'The cat sleeps',
            expected: '고양이가 잔다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-10',
            input: 'The cats sleep',
            expected: '고양이들이 잔다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-11',
            input: 'The student studies',
            expected: '학생이 공부한다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-12',
            input: 'The bus goes',
            expected: '버스가 간다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-6',
    name: 'Level 6: Negation (부정문 자동 생성)',
    nameKo: 'Level 6: 부정문 자동 생성',
    categories: [
      {
        id: 'anti-l6-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l6-1',
            input: '안 먹는다',
            expected: "don't eat",
            direction: 'ko-en',
          },
          {
            id: 'anti-l6-2',
            input: '그는 안 먹는다',
            expected: "He doesn't eat",
            direction: 'ko-en',
          },
          {
            id: 'anti-l6-3',
            input: '안 먹었다',
            expected: "didn't eat",
            direction: 'ko-en',
          },
          {
            id: 'anti-l6-4',
            input: '안 먹을 거야',
            expected: "won't eat",
            direction: 'ko-en',
          },
          {
            id: 'anti-l6-5',
            input: '안 먹고 있다',
            expected: 'am not eating',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l6-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l6-6',
            input: "don't eat",
            expected: '안 먹는다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l6-7',
            input: "He doesn't eat",
            expected: '그는 안 먹는다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l6-8',
            input: "didn't eat",
            expected: '안 먹었다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l6-9',
            input: "won't eat",
            expected: '안 먹을 거야',
            direction: 'en-ko',
          },
          {
            id: 'anti-l6-10',
            input: 'am not eating',
            expected: '안 먹고 있다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-7',
    name: 'Level 7: Comparative/Superlative (비교급/최상급)',
    nameKo: 'Level 7: 비교급/최상급 규칙',
    categories: [
      {
        id: 'anti-l7-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l7-1',
            input: '더 크다',
            expected: 'bigger',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-2',
            input: '가장 크다',
            expected: 'biggest',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-3',
            input: '더 행복하다',
            expected: 'happier',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-4',
            input: '더 아름답다',
            expected: 'more beautiful',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-5',
            input: '더 좋다',
            expected: 'better',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-6',
            input: '가장 나쁘다',
            expected: 'worst',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l7-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l7-7',
            input: 'bigger',
            expected: '더 크다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-8',
            input: 'biggest',
            expected: '가장 크다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-9',
            input: 'happier',
            expected: '더 행복하다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-10',
            input: 'more beautiful',
            expected: '더 아름답다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-11',
            input: 'better',
            expected: '더 좋다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-12',
            input: 'worst',
            expected: '가장 나쁘다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-8',
    name: 'Level 8: Countable/Uncountable (가산/불가산)',
    nameKo: 'Level 8: 가산/불가산 명사 판단',
    categories: [
      {
        id: 'anti-l8-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l8-1',
            input: '사과 3개',
            expected: '3 apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l8-2',
            input: '물 3잔',
            expected: '3 glasses of water',
            direction: 'ko-en',
          },
          {
            id: 'anti-l8-3',
            input: '커피 2잔',
            expected: '2 cups of coffee',
            direction: 'ko-en',
          },
          {
            id: 'anti-l8-4',
            input: '정보가 많다',
            expected: 'much information',
            direction: 'ko-en',
          },
          {
            id: 'anti-l8-5',
            input: '사람이 많다',
            expected: 'many people',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l8-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l8-6',
            input: '3 apples',
            expected: '사과 3개',
            direction: 'en-ko',
          },
          {
            id: 'anti-l8-7',
            input: '3 glasses of water',
            expected: '물 3잔',
            direction: 'en-ko',
          },
          {
            id: 'anti-l8-8',
            input: '2 cups of coffee',
            expected: '커피 2잔',
            direction: 'en-ko',
          },
          {
            id: 'anti-l8-9',
            input: 'much information',
            expected: '정보가 많다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l8-10',
            input: 'many people',
            expected: '사람이 많다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-9',
    name: 'Level 9: Passive/Active Voice (수동태/능동태)',
    nameKo: 'Level 9: 수동태/능동태 변환',
    categories: [
      {
        id: 'anti-l9-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l9-1',
            input: '나는 사과를 먹었다',
            expected: 'I ate an apple',
            direction: 'ko-en',
          },
          {
            id: 'anti-l9-2',
            input: '사과가 먹혔다',
            expected: 'The apple was eaten',
            direction: 'ko-en',
          },
          {
            id: 'anti-l9-3',
            input: '그는 문을 닫았다',
            expected: 'He closed the door',
            direction: 'ko-en',
          },
          {
            id: 'anti-l9-4',
            input: '문이 닫혔다',
            expected: 'The door was closed',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l9-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l9-5',
            input: 'I ate an apple',
            expected: '나는 사과를 먹었다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l9-6',
            input: 'The apple was eaten',
            expected: '사과가 먹혔다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l9-7',
            input: 'He closed the door',
            expected: '그는 문을 닫았다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l9-8',
            input: 'The door was closed',
            expected: '문이 닫혔다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-10',
    name: 'Level 10: Time Prepositions (시간 전치사)',
    nameKo: 'Level 10: 전치사 자동 선택 (시간)',
    categories: [
      {
        id: 'anti-l10-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l10-1',
            input: '3시에',
            expected: "at 3 o'clock",
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-2',
            input: '월요일에',
            expected: 'on Monday',
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-3',
            input: '3월에',
            expected: 'in March',
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-4',
            input: '2024년에',
            expected: 'in 2024',
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-5',
            input: '아침에',
            expected: 'in the morning',
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-6',
            input: '정오에',
            expected: 'at noon',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l10-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l10-7',
            input: "at 3 o'clock",
            expected: '3시에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-8',
            input: 'on Monday',
            expected: '월요일에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-9',
            input: 'in March',
            expected: '3월에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-10',
            input: 'in 2024',
            expected: '2024년에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-11',
            input: 'in the morning',
            expected: '아침에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-12',
            input: 'at noon',
            expected: '정오에',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-11',
    name: 'Level 11: Place Prepositions (장소 전치사)',
    nameKo: 'Level 11: 전치사 자동 선택 (장소)',
    categories: [
      {
        id: 'anti-l11-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l11-1',
            input: '집에',
            expected: 'at home',
            direction: 'ko-en',
          },
          {
            id: 'anti-l11-2',
            input: '서울에',
            expected: 'in Seoul',
            direction: 'ko-en',
          },
          {
            id: 'anti-l11-3',
            input: '책상 위에',
            expected: 'on the desk',
            direction: 'ko-en',
          },
          {
            id: 'anti-l11-4',
            input: '상자 안에',
            expected: 'in the box',
            direction: 'ko-en',
          },
          {
            id: 'anti-l11-5',
            input: '학교에서',
            expected: 'at school',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l11-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l11-6',
            input: 'at home',
            expected: '집에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l11-7',
            input: 'in Seoul',
            expected: '서울에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l11-8',
            input: 'on the desk',
            expected: '책상 위에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l11-9',
            input: 'in the box',
            expected: '상자 안에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l11-10',
            input: 'at school',
            expected: '학교에서',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-12',
    name: 'Level 12: Question Words (의문사)',
    nameKo: 'Level 12: 의문사 자동 선택',
    categories: [
      {
        id: 'anti-l12-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l12-1',
            input: '누구?',
            expected: 'Who?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-2',
            input: '뭐?',
            expected: 'What?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-3',
            input: '언제?',
            expected: 'When?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-4',
            input: '어디?',
            expected: 'Where?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-5',
            input: '왜?',
            expected: 'Why?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-6',
            input: '어떻게?',
            expected: 'How?',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l12-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l12-7',
            input: 'Who?',
            expected: '누구?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-8',
            input: 'What?',
            expected: '뭐?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-9',
            input: 'When?',
            expected: '언제?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-10',
            input: 'Where?',
            expected: '어디?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-11',
            input: 'Why?',
            expected: '왜?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-12',
            input: 'How?',
            expected: '어떻게?',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-13',
    name: 'Level 13: Adjective Order (형용사 순서)',
    nameKo: 'Level 13: 형용사 순서 규칙',
    categories: [
      {
        id: 'anti-l13-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l13-1',
            input: '큰 빨간 사과',
            expected: 'a big red apple',
            direction: 'ko-en',
          },
          {
            id: 'anti-l13-2',
            input: '낡은 나무 탁자',
            expected: 'an old wooden table',
            direction: 'ko-en',
          },
          {
            id: 'anti-l13-3',
            input: '예쁜 작은 파란 집',
            expected: 'a beautiful small blue house',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l13-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l13-4',
            input: 'a big red apple',
            expected: '큰 빨간 사과',
            direction: 'en-ko',
          },
          {
            id: 'anti-l13-5',
            input: 'an old wooden table',
            expected: '낡은 나무 탁자',
            direction: 'en-ko',
          },
          {
            id: 'anti-l13-6',
            input: 'a beautiful small blue house',
            expected: '예쁜 작은 파란 집',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-14',
    name: 'Level 14: Relative Pronouns (관계대명사)',
    nameKo: 'Level 14: 관계대명사 자동 삽입',
    categories: [
      {
        id: 'anti-l14-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l14-1',
            input: '내가 산 책',
            expected: 'the book that I bought',
            direction: 'ko-en',
          },
          {
            id: 'anti-l14-2',
            input: '나를 도운 사람',
            expected: 'the person who helped me',
            direction: 'ko-en',
          },
          {
            id: 'anti-l14-3',
            input: '그가 사는 집',
            expected: 'the home where he lives',
            direction: 'ko-en',
          },
          {
            id: 'anti-l14-4',
            input: '우리가 만난 날',
            expected: 'the day when we met',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l14-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l14-5',
            input: 'the book that I bought',
            expected: '내가 산 책',
            direction: 'en-ko',
          },
          {
            id: 'anti-l14-6',
            input: 'the person who helped me',
            expected: '나를 도운 사람',
            direction: 'en-ko',
          },
          {
            id: 'anti-l14-7',
            input: 'the home where he lives',
            expected: '그가 사는 집',
            direction: 'en-ko',
          },
          {
            id: 'anti-l14-8',
            input: 'the day when we met',
            expected: '우리가 만난 날',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-15',
    name: 'Level 15: Pronoun Resolution (대명사 결정)',
    nameKo: 'Level 15: 대명사 자동 결정',
    categories: [
      {
        id: 'anti-l15-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l15-1',
            input: '철수는 사과를 샀다. 그것은 빨갛다.',
            expected: 'Chulsoo bought an apple. It is red.',
            direction: 'ko-en',
          },
          {
            id: 'anti-l15-2',
            input: '영희는 학교에 갔다. 그녀는 학생이다.',
            expected: 'Younghee went to school. She is a student.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l15-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l15-3',
            input: 'Chulsoo bought an apple. It is red.',
            expected: '철수는 사과를 샀다. 그것은 빨갛다.',
            direction: 'en-ko',
          },
          {
            id: 'anti-l15-4',
            input: 'Younghee went to school. She is a student.',
            expected: '영희는 학교에 갔다. 그녀는 학생이다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-16',
    name: 'Level 16: Subject Recovery (생략 주어 복원)',
    nameKo: 'Level 16: 생략 주어 복원',
    categories: [
      {
        id: 'anti-l16-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l16-1',
            input: '어제 영화 봤어',
            expected: 'I watched a movie yesterday',
            direction: 'ko-en',
          },
          {
            id: 'anti-l16-2',
            input: '밥 먹었어?',
            expected: 'Did you eat?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l16-3',
            input: '피곤해',
            expected: "I'm tired",
            direction: 'ko-en',
          },
          {
            id: 'anti-l16-4',
            input: '어디 가?',
            expected: 'Where are you going?',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l16-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l16-5',
            input: 'I watched a movie yesterday',
            expected: '어제 영화 봤어',
            direction: 'en-ko',
          },
          {
            id: 'anti-l16-6',
            input: 'Did you eat?',
            expected: '밥 먹었어?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l16-7',
            input: "I'm tired",
            expected: '피곤해',
            direction: 'en-ko',
          },
          {
            id: 'anti-l16-8',
            input: 'Where are you going?',
            expected: '어디 가?',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-17',
    name: 'Level 17: Gerund/Infinitive (동명사/to부정사)',
    nameKo: 'Level 17: 동명사/to부정사 선택',
    categories: [
      {
        id: 'anti-l17-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l17-1',
            input: '수영하는 것을 즐긴다',
            expected: 'enjoy swimming',
            direction: 'ko-en',
          },
          {
            id: 'anti-l17-2',
            input: '수영하고 싶다',
            expected: 'want to swim',
            direction: 'ko-en',
          },
          {
            id: 'anti-l17-3',
            input: '수영하는 것을 멈췄다',
            expected: 'stopped swimming',
            direction: 'ko-en',
          },
          {
            id: 'anti-l17-4',
            input: '수영하기 위해',
            expected: 'to swim',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l17-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l17-5',
            input: 'enjoy swimming',
            expected: '수영하는 것을 즐긴다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l17-6',
            input: 'want to swim',
            expected: '수영하고 싶다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l17-7',
            input: 'stopped swimming',
            expected: '수영하는 것을 멈췄다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l17-8',
            input: 'to swim',
            expected: '수영하기 위해',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-18',
    name: 'Level 18: Quantifiers (수량사)',
    nameKo: 'Level 18: 수량사 자동 선택',
    categories: [
      {
        id: 'anti-l18-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l18-1',
            input: '많은 사과',
            expected: 'many apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l18-2',
            input: '많은 물',
            expected: 'much water',
            direction: 'ko-en',
          },
          {
            id: 'anti-l18-3',
            input: '약간의 사과',
            expected: 'a few apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l18-4',
            input: '약간의 물',
            expected: 'a little water',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l18-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l18-5',
            input: 'many apples',
            expected: '사과가 많다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l18-6',
            input: 'much water',
            expected: '물이 많다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l18-7',
            input: 'a few apples',
            expected: '약간의 사과',
            direction: 'en-ko',
          },
          {
            id: 'anti-l18-8',
            input: 'a little water',
            expected: '약간의 물',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-19',
    name: 'Level 19: Reflexive Pronouns (재귀 대명사)',
    nameKo: 'Level 19: 재귀 대명사 규칙',
    categories: [
      {
        id: 'anti-l19-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l19-1',
            input: '나 자신을',
            expected: 'myself',
            direction: 'ko-en',
          },
          {
            id: 'anti-l19-2',
            input: '너 자신을',
            expected: 'yourself',
            direction: 'ko-en',
          },
          {
            id: 'anti-l19-3',
            input: '그 자신을',
            expected: 'himself',
            direction: 'ko-en',
          },
          {
            id: 'anti-l19-4',
            input: '그녀 자신을',
            expected: 'herself',
            direction: 'ko-en',
          },
          {
            id: 'anti-l19-5',
            input: '우리 자신을',
            expected: 'ourselves',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l19-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l19-6',
            input: 'myself',
            expected: '나 자신을',
            direction: 'en-ko',
          },
          {
            id: 'anti-l19-7',
            input: 'yourself',
            expected: '너 자신을',
            direction: 'en-ko',
          },
          {
            id: 'anti-l19-8',
            input: 'himself',
            expected: '그 자신을',
            direction: 'en-ko',
          },
          {
            id: 'anti-l19-9',
            input: 'herself',
            expected: '그녀 자신을',
            direction: 'en-ko',
          },
          {
            id: 'anti-l19-10',
            input: 'ourselves',
            expected: '우리 자신을',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-20',
    name: 'Level 20: Homonym Disambiguation (중의적 표현 해소)',
    nameKo: 'Level 20: 중의적 표현 해소',
    categories: [
      {
        id: 'anti-l20-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l20-1',
            input: '배를 타고',
            expected: 'ride a ship',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-2',
            input: '배가 고파서',
            expected: 'because I am hungry',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-3',
            input: '배를 먹고',
            expected: 'eat a pear',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-4',
            input: '눈이 와서',
            expected: "because it's snowing",
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-5',
            input: '눈이 아파서',
            expected: 'because my eyes hurt',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-6',
            input: '말을 타고',
            expected: 'ride a horse',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-7',
            input: '말을 했는데',
            expected: 'I spoke but',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l20-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l20-8',
            input: 'ride a ship',
            expected: '배를 타고',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-9',
            input: 'because I am hungry',
            expected: '배가 고파서',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-10',
            input: 'eat a pear',
            expected: '배를 먹고',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-11',
            input: "because it's snowing",
            expected: '눈이 와서',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-12',
            input: 'because my eyes hurt',
            expected: '눈이 아파서',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-13',
            input: 'ride a horse',
            expected: '말을 타고',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-14',
            input: 'I spoke but',
            expected: '말을 했는데',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-21',
    name: 'Level 21: Irregular Verbs (불규칙 동사)',
    nameKo: 'Level 21: 동사 불규칙 변화',
    categories: [
      {
        id: 'anti-l21-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l21-1',
            input: '갔다',
            expected: 'went',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-2',
            input: '먹었다',
            expected: 'ate',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-3',
            input: '봤다',
            expected: 'saw',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-4',
            input: '샀다',
            expected: 'bought',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-5',
            input: '생각했다',
            expected: 'thought',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-6',
            input: '썼다',
            expected: 'wrote',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l21-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l21-7',
            input: 'went',
            expected: '갔다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-8',
            input: 'ate',
            expected: '먹었다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-9',
            input: 'saw',
            expected: '봤다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-10',
            input: 'bought',
            expected: '샀다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-11',
            input: 'thought',
            expected: '생각했다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-12',
            input: 'wrote',
            expected: '썼다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-22',
    name: 'Level 22: Combination Explosion (조합 폭발)',
    nameKo: 'Level 22: 조합 폭발 처리',
    categories: [
      {
        id: 'anti-l22-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l22-1',
            input: '3개의 큰 빨간 사과를 어제 그가 샀다',
            expected: 'He bought 3 big red apples yesterday',
            direction: 'ko-en',
          },
          {
            id: 'anti-l22-2',
            input: '5마리의 작은 파란 새들이 내일 노래할 것이다',
            expected: '5 small blue birds will sing tomorrow',
            direction: 'ko-en',
          },
          {
            id: 'anti-l22-3',
            input: '2마리의 귀여운 흰 고양이가 지금 자고 있다',
            expected: '2 cute white cats are sleeping now',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l22-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l22-4',
            input: 'He bought 3 big red apples yesterday',
            expected: '3개의 큰 빨간 사과를 어제 그가 샀다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l22-5',
            input: '5 small blue birds will sing tomorrow',
            expected: '5마리의 작은 파란 새들이 내일 노래할 것이다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l22-6',
            input: '2 cute white cats are sleeping now',
            expected: '2마리의 귀여운 흰 고양이가 지금 자고 있다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 헬퍼 함수
// ========================================

export function getAllTests(): TestCase[] {
  const tests: TestCase[] = [];

  for (const level of levelTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of categoryTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of contextTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of typoTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of uniqueTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of polysemyTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of wordOrderTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of spacingErrorTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of finalTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of professionalTranslatorTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of localizationTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of antiHardcodingTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  return tests;
}

export function countTests(levels: TestLevel[]): number {
  let count = 0;
  for (const level of levels) {
    for (const category of level.categories) {
      count += category.tests.length;
    }
  }
  return count;
}
