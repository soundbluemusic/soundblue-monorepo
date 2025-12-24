import type { TranslationDirection } from './settings';

/**
 * 번역기 벤치마크 테스트 데이터
 * level-test.test.ts, category-test.test.ts, context-test.test.ts에서 추출
 *
 * ⚠️ CRITICAL: ALGORITHM-ONLY TESTING REQUIREMENT (알고리즘 기반 테스트 필수)
 * ========================================
 *
 * 이 파일의 모든 테스트 문장은 반드시 알고리즘 기반으로만 번역되어야 합니다.
 * 사전(dictionary)에 테스트 문장을 직접 등록하여 테스트를 통과시키는 것은 금지됩니다.
 *
 * 이유:
 * 1. 사전 기반 테스트는 응용력 검증이 불가능함 (응용력 0%)
 * 2. 새로운 문장에 대한 번역 능력을 측정할 수 없음
 * 3. 실제 사용자 입력은 사전에 없는 문장이 대부분임
 *
 * 테스트 문장 추가 시 확인사항:
 * - i18n-sentences.ts에 해당 문장이 없어야 함
 * - idioms.ts에 해당 문장이 없어야 함
 * - cultural-expressions.ts에 해당 문장이 없어야 함
 * - 기타 모든 사전 파일에 해당 문장이 없어야 함
 *
 * ========================================
 */

export interface TestCase {
  id: string;
  input: string;
  expected: string;
  direction: TranslationDirection;
}

export interface TestCategory {
  id: string;
  name: string;
  nameKo: string;
  tests: TestCase[];
}

export interface TestLevel {
  id: string;
  name: string;
  nameKo: string;
  categories: TestCategory[];
}

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
              '놀라워! 나는 가족과 함께 새 미술관을 방문했고, 와우, 정말 아름다웠어! 우리는 그림들을 보고, 기념품을 사고, 파스타를 먹었고, 그래, 날씨는 완벽했어!',
            direction: 'en-ko',
          },
          {
            id: 'l1-2c',
            input:
              "I didn't visit the museum yesterday. I stayed home instead. I didn't see any paintings, didn't buy souvenirs, and didn't eat out. But it was okay, because I needed rest.",
            expected:
              '나는 어제 박물관에 가지 않았어. 대신 집에 있었어. 그림도 보지 않았고, 기념품도 사지 않았으며, 외식도 하지 않았어. 하지만 괜찮았어, 왜냐하면 나는 휴식이 필요했거든.',
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
              '그녀는 정말 5년 동안 영어를 공부했을까? 도착했을 때 정말 그렇게 어려웠을까? 왜 잘 소통할 수 없었을까? 교과서가 실제 대화와 다르기 때문일까? 그녀는 어떻게 향상했을까? 원어민들이 정말 그렇게 많이 도와줬을까?',
            direction: 'en-ko',
          },
          {
            id: 'l2-2b',
            input:
              'Wow! She had studied English for five whole years! But oh my, real conversations were so much harder! However, amazing! She practiced every single day! Her pronunciation improved! Her vocabulary expanded! And finally, after six months, she could speak naturally!',
            expected:
              '와! 그녀는 무려 5년 동안 영어를 공부했어! 그런데 세상에, 실제 대화는 훨씬 더 어려웠어! 하지만 놀랍게도! 그녀는 매일 매일 연습했어! 발음이 향상됐어! 어휘가 늘어났어! 그리고 마침내, 6개월 후에, 그녀는 자연스럽게 말할 수 있었어!',
            direction: 'en-ko',
          },
          {
            id: 'l2-2c',
            input:
              "She hadn't studied English for just one or two years, but for five years. However, real conversations weren't as easy as textbook exercises. She didn't give up. She didn't practice just once or twice, but every single day. She didn't see results immediately, but after six months, finally, she could communicate naturally.",
            expected:
              '그녀는 단지 1년이나 2년 동안 영어를 공부한 것이 아니라, 5년 동안 공부했어. 하지만, 실제 대화는 교과서 연습만큼 쉽지 않았어. 그녀는 포기하지 않았어. 한두 번만 연습한 게 아니라, 매일 매일 연습했어. 즉시 결과를 보지는 못했지만, 6개월 후에, 마침내, 그녀는 자연스럽게 소통할 수 있었어.',
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
              '기후 변화가 정말 가장 시급한 문제일까? 국가들이 실제로 행동을 꺼리고 있을까? 경제적 우려 때문일까? 과학자들이 정말 재앙적인 결과를 경고하고 있을까? 국제 협력이 진정 중요할까? 선진국들이 정말 앞장서야 할까? 그들은 개발도상국에 지원을 제공해야만 할까?',
            direction: 'en-ko',
          },
          {
            id: 'l3-2b',
            input:
              "Climate change! Yes, it's become THE most pressing issue! But look! Many countries are still reluctant! Why? Economic growth! Scientists are warning us! Listen! The consequences will be catastrophic! Irreversible! Therefore, international cooperation! More crucial than ever! Developed nations! Take the lead! Provide support! Financial! Technological! Do it now!",
            expected:
              '기후 변화! 그래, 가장 시급한 문제가 됐어! 하지만 봐! 많은 국가들이 여전히 꺼리고 있어! 왜? 경제 성장! 과학자들이 경고하고 있어! 들어봐! 결과는 재앙적일 거야! 돌이킬 수 없어! 따라서, 국제 협력! 그 어느 때보다 중요해! 선진국들! 앞장서! 지원을 제공해! 재정적! 기술적! 지금 당장!',
            direction: 'en-ko',
          },
          {
            id: 'l3-2c',
            input:
              "Climate change isn't just another issue, but THE most pressing one. However, many countries aren't taking action. Not because they don't know, but because they fear economic harm. Scientists aren't suggesting, they're warning. We can't wait, we can't delay. International cooperation isn't optional, it's crucial. Developed nations can't just talk, they must act, they must lead, they must support.",
            expected:
              '기후 변화는 단지 또 다른 문제가 아니라, 가장 시급한 문제야. 하지만, 많은 국가들이 행동하고 있지 않아. 모르기 때문이 아니라, 경제적 피해를 두려워하기 때문이야. 과학자들은 제안하는 게 아니라, 경고하고 있어. 우리는 기다릴 수 없어, 미룰 수 없어. 국제 협력은 선택이 아니라, 필수야. 선진국들은 그저 말만 할 수 없어, 행동해야 해, 이끌어야 해, 지원해야 해.',
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
              '그녀는 정말 매일 밤 밤새워 공부했을까? 과제에서 최선을 다했을까? 모든 가능성을 탐구했을까? 교수들을 위해 온갖 노력을 다했을까? 그런데 겨우 합격선을 넘었다고? 경종이었을까? 세부사항에 빠지는 걸 그만뒀을까? 대신 큰 그림에 집중했을까?',
            direction: 'en-ko',
          },
          {
            id: 'l4-2b',
            input:
              "Listen! She didn't just study! She burned the midnight oil! Every! Single! Night! She went the extra mile! Always! She left absolutely no stone unturned! None! She bent over backwards! But wow! She barely made the cut! Talk about a wake-up call! She completely changed! No more getting lost in the weeds! Big picture! That's what matters!",
            expected:
              '들어봐! 그녀는 단순히 공부한 게 아니야! 밤을 새웠어! 매일! 밤마다! 최선을 다했어! 항상! 절대 모든 가능성을 빠짐없이 탐구했어! 하나도 빠짐없이! 온갖 노력을 다했어! 그런데 와! 겨우 합격선을 넘었어! 완전 경종이었지! 그녀는 완전히 바뀌었어! 더 이상 세부사항에 빠지지 않아! 큰 그림! 그게 중요한 거야!',
            direction: 'en-ko',
          },
          {
            id: 'l4-2c',
            input:
              "She didn't just work hard, she burned the midnight oil. She didn't do the minimum, she went the extra mile. She didn't leave any stone unturned, not a single one. She didn't half-heartedly try, she bent over backwards. But she didn't pass with flying colors, she barely made the cut. It wasn't discouraging though, it was a wake-up call. She didn't keep getting lost in the weeds, she focused on the big picture instead.",
            expected:
              '그녀는 단지 열심히 일한 게 아니라, 밤을 새웠어. 최소한만 한 게 아니라, 최선을 다했어. 어떤 가능성도 놓치지 않았어, 단 하나도. 건성으로 시도한 게 아니라, 온갖 노력을 다했어. 하지만 우수한 성적으로 합격한 게 아니라, 겨우 합격선을 넘었어. 하지만 낙담스럽지 않았어, 경종이었어. 계속 세부사항에 빠지지 않았어, 대신 큰 그림에 집중했어.',
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
              '사랑이 정말 모든 것을 이길까? 진정으로 사랑한다는 것은 무엇을 의미할까? 처음의 설렘일까? 아니면 머무르기로 하는 선택일까? 거창한 제스처일까? 아니면 조용한 순간들일까? 사랑은 이기는 것일까? 아니면 견디는 것일까? 열정일까? 아니면 평생 서로를 선택하는 것일까? 떠나는 게 더 쉬울 때조차도? 특히 그럴 때?',
            direction: 'en-ko',
          },
          {
            id: 'l5-2b',
            input:
              "Love! They say it conquers all! But wait! What is love? Is it butterflies? Beautiful! But temporary! Or is it staying? After butterflies fly away? Is it grand romance? Breathtaking! But fleeting! Or is it quiet moments? Simple! Yet profound! Love doesn't conquer! No! It endures! Not a moment! But a lifetime! Choosing each other! Again and again! Even when! Especially when! Walking away seems easier!",
            expected:
              '사랑! 모든 것을 이긴다고들 하지! 하지만 잠깐! 사랑이 뭘까? 설렘일까? 아름다워! 하지만 일시적이야! 아니면 머무르는 것일까? 설렘이 날아간 후에도? 거창한 로맨스일까? 숨막혀! 하지만 덧없어! 아니면 조용한 순간들일까? 단순해! 하지만 깊어! 사랑은 이기지 않아! 아니야! 견디는 거야! 한 순간이 아니야! 평생이야! 서로를 선택하는 것! 계속해서! 떠나는 게! 특히 그럴 때! 더 쉬워 보일 때조차도!',
            direction: 'en-ko',
          },
          {
            id: 'l5-2c',
            input:
              "Love doesn't just conquer, it endures. It's not the butterflies, but staying after they've flown. It's not grand gestures, but quiet moments. It's not a single moment, but a lifetime. It's not passion alone, but choosing each other. Not once, but again and again. Not when it's easy, but when it's hard. Not despite difficulty, but because of it. That's not just love, that's true love.",
            expected:
              '사랑은 단지 이기는 게 아니라, 견디는 거야. 설렘이 아니라, 설렘이 사라진 후에도 머무르는 거야. 거창한 제스처가 아니라, 조용한 순간들이야. 한 순간이 아니라, 평생이야. 열정만이 아니라, 서로를 선택하는 거야. 한 번이 아니라, 계속해서. 쉬울 때가 아니라, 어려울 때. 어려움에도 불구하고가 아니라, 어려움 때문에. 그것은 단지 사랑이 아니라, 진정한 사랑이야.',
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
              '정말 기뻐서 어쩔 줄 모르겠어! 웃음이 멈추지 않아! 오늘이 최고의 날이야! 가슴이 기쁨으로 터질 것 같아! 세상 꼭대기에 있는 것 같아! 모든 게 완벽해!',
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
              '너무 우울해... 이 기분을 떨쳐낼 수가 없어. 모든 게 무의미해 보여. 슬픔에 빠져 허우적대고 있어. 가슴에 공허함이 있어. 터널 끝의 빛이 보이지 않아.',
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
              '이거 정말 열받아! 완전 분노했어! 감히 어떻게! 더 이상 견딜 수가 없어! 이제 한계야! 내 신경을 건드리는 거야! 폭발하기 직전이야!',
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
              '말도 안 돼! 진심이야?! 할 말을 잃었어! 완전 놀랐어! 이거 정말 충격적이야! 완전히 충격 받았어! 전혀 예상 못 했어! 입이 떡 벌어졌어!',
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
              '너무 무서워... 제대로 숨을 쉴 수가 없어. 머릿속에 최악의 시나리오가 계속 떠올라. 두려움에 얼어붙었어. 신경이 곤두서 있어. 이 불안감이 나를 압도하고 있어.',
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
              '환자가 급성 복통을 호소하고 있습니다. 활력 징후는 안정적입니다. 혈액 검사와 영상 검사를 해야 합니다. 결과에 따라 수술을 예약해야 할 수도 있습니다. 환자를 면밀히 모니터링해 주세요.',
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
              '피고인은 무죄를 주장합니다. 검찰은 합리적 의심을 넘어 유죄를 입증해야 합니다. 제출된 증거에는 증인 진술과 물적 증거가 포함됩니다. 법정은 이제 모두 진술을 듣겠습니다. 배심원단은 심의하여 만장일치 평결에 도달해야 합니다.',
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
              '클라우드 기반 솔루션을 구현해야 합니다. 현재 인프라는 확장 가능하지 않습니다. 마이그레이션에는 약 3개월이 걸릴 것입니다. 마이크로서비스 아키텍처를 사용하겠습니다. 보안 프로토콜을 업그레이드해야 합니다. 스프린트 계획 회의를 잡읍시다.',
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
              '우리는 포트폴리오를 다각화해야 합니다. 시장 분석은 유망한 추세를 보여줍니다. 우리의 ROI가 15% 향상되었습니다. 확장을 논의하기 위해 이사회 회의를 잡읍시다. 전략적 파트너십을 고려해야 합니다.',
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
              '가설은 통제된 실험을 통해 검증되었습니다. 데이터 분석은 강한 상관관계를 드러냈습니다. 발견 사항은 이전 문헌을 뒷받침합니다. 한계점으로는 표본 크기 제약이 있습니다. 향후 연구는 이러한 변수들을 다루어야 합니다.',
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
            expected: '존이 메리에게 전화했다. 그녀는 그에게서 소식을 듣고 기뻤다.',
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
            expected: '일찍 일어났다. 아침을 만들었다. 출근했다.',
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
            expected: '나는 늦게 도착했다. 그 전에 교통이 끔찍했다.',
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
              '톰과 그의 형이 낚시를 갔다. 톰은 큰 물고기를 잡았지만, 그의 형은 아무것도 잡지 못했다. 형은 실망했지만, 톰을 위해 기뻐했다. 그들은 그것을 나누기로 결정했다.',
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
              '알람이 울리지 않았다. 늦게 일어났다. 아침을 거른채 회사로 서둘렀다. 그래도 회의에 늦었다.',
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
              '새 식당에 갔다. 스페셜 메뉴를 주문했다. 정말 오래 기다렸다. 맛은 놀라웠다. 기다릴 만한 가치가 있었다.',
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
              '"배고파." 그녀가 말했다. "피자 시키자." 내가 제안했다. "좋은 생각이야!" 그녀가 외쳤다. "평소에 먹던 걸로 시킬까?" 내가 물었다. "응, 그래!" 그녀가 대답했다.',
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
              '사라는 마케팅 회사에서 일했다. 그녀는 프로젝트 마감일이 다가오고 있었다. 그녀의 매니저인 데이비드는 매우 까다로웠다. 데이비드의 상사인 CEO는 더욱 엄격했다. 사라는 동료 마이크에게 도움을 요청했다. 마이크는 동의했지만 그 역시 자신의 일로 압도되어 있었다. 사라는 야근하기로 결정했다. 그녀는 제시간에 프로젝트를 완성했다. 데이비드는 감동받아 그녀를 칭찬했다. CEO는 그녀의 헌신을 인정하고 보너스를 주었다.',
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
              '어제 오래된 사진을 발견했다. 그것은 5년 전 내 졸업식 때 찍은 것이었다. 나는 그날을 명확히 기억했다. 아침은 혼란스러웠는데 늦게 일어났기 때문이다. 나는 전날 밤 친구들과 축하하느라 늦게까지 깨어 있었다. 하지만 제시간에 행사에 도착했다. 부모님은 정말 자랑스러워하셨다. 행사 후에 우리는 고급 식당에서 저녁을 먹었다. 지금, 사진을 보면서, 얼마나 많이 변했는지 깨닫는다. 내일, 나는 여동생의 졸업식에 참석할 것이고 순환은 계속된다.',
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
              '의사가 천천히 들어왔다. 그녀는 차트를 봤다. 그리고 나를 봤다. 그녀는 의자를 당겼다. "검사 결과에 대해 얘기합시다." 그녀가 부드럽게 말했다. 그녀의 어조는 부드러웠다. 너무 부드러웠다. 나는 가슴이 철렁했다. "안 좋은가요?" 내가 물었다. 그녀는 내 손을 잡았다. 그때 나는 알았다.',
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
              '추수감사절에 우리는 부모님 댁에 모였다. 우리는 칠면조를 잘랐다. 모두가 감사한 것을 나눴다. 그런 다음 함께 풋볼을 봤다.',
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
              '그녀는 내 어두운 날들의 한줄기 햇살이었다. 그녀의 미소는 방을 밝힐 수 있었다. 그녀가 떠났을 때, 내 마음에 겨울이 왔다.',
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
            expected: '나는 이 영화가 정말 좋아요. 훌륭했고 배우들이 대단했어요.',
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
            expected: '나는 어제 가게에 갔고 식료품을 샀어요.',
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
            expected: '나는 오늘 너무 행복해요. 우리는 좋은 시간을 보냈어요.',
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
            expected: '안녕하세요! 오늘 어떻게 지내세요? 잘 지내시길 바래요.',
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
            expected: '그들은 저녁을 위해 고기를 사러 가게에 가고 있어요. 맛있을 거예요.',
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
            expected:
              '나는 매일 학교에 가요. 그녀는 아이스크림을 좋아해요. 그들은 축구를 하고 있었어요.',
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
            expected: '어제 나는 친구와 영화를 보러 갔어요. 우리는 놀라운 시간을 보냈어요.',
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
            expected: '안녕하세요, 어떻게 지내세요? 잘 지내요, 감사합니다. 당신은요?',
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
            expected:
              '나는 어제 가게에 갔고 무언가를 샀다. 그것은 매우 비쌌지만 정말 필요했기 때문에 샀다.',
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
            expected:
              '내가 어렸을 때, 나는 동화를 믿곤 했다. 이제 나는 그것들이 진짜가 아니라는 것을 알지만, 여전히 읽는 것을 즐긴다.',
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
            expected:
              '나는 어제 해변에 갔지만 매우 더워서 오래 머물지 않았고 피곤함을 느껴서 일찍 집에 갔다.',
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
            expected:
              '내일 친구를 만날 거야. 우리는 쇼핑몰에 갈 거야. 물건을 살 거야. 아마 먹기도 할 거야. 기다릴 수 없어!',
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
            expected: '세상에, 늦고 있어! 교통이 미쳤어! 5분 안에 갈게! 미안!',
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
            expected: '말도 안 돼! 이거 놀라워! 최고의 날이야!',
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
