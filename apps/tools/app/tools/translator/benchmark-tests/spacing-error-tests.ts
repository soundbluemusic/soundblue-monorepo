/**
 * 띄어쓰기 오류 테스트 데이터 (Spacing Error Tests)
 * 띄어쓰기 오류 처리 테스트
 */

import type { TestLevel } from '../types';

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
