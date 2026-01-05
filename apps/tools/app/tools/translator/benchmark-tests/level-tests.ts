/**
 * 레벨 테스트 데이터 (Level Tests)
 * 레벨별 기본 번역 테스트
 */

import type { TestLevel } from '../types';

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
