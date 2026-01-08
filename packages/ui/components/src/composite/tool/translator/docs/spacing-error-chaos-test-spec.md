# 양방향 번역 테스트 - 띄어쓰기 오류 + 문맥 파악 강화 (4단계)

## 알고리즘/로직 기반 + 문맥 파악 테스트

| 방식 | 허용 | 설명 |
|------|------|------|
| 하드코딩 | ❌ | 절대 금지 |
| 알고리즘 기반 | ✅ | 띄어쓰기 오류 + 동음이의어 + 다의어 + 감정 + 기술 용어 동시 처리 필수 |

**핵심**: 띄어쓰기가 없어도 문맥으로 의미 파악 능력 검증

---

# Level 1: 짧은 문장 (띄어쓰기 오류 5-7곳)

## 한국어(띄어쓰기X) → 영어

| 입력 | 해석 | 출력 |
|------|------|------|
| 나는일찍일어나서일을했어. | 일찍(early) / 일어나서 / 일(work) | I woke up early and worked. |
| 그는배를타고배가고파서배를먹었어. | 배(ship) / 배(stomach) / 배(pear) | He rode the ship, got hungry, and ate a pear. |
| 눈이와서눈이아파서집에있어. | 눈(snow) / 눈(eye) | It's snowing and my eyes hurt, so I'm at home. |
| 말을타고말을했는데말이안들려. | 말(horse) / 말(speech) / 말(words) | I rode a horse and spoke, but couldn't hear the words. |

## 영어(spacing error) → 한국어

| 입력 | 해석 | 출력 |
|------|------|------|
| Iwatchedthemoviewhileeating. | I watched the movie while eating | 나는 먹으면서 영화를 봤어. |
| Heworksatthebankbytheriver. | bank(은행 vs 강둑) | 그는 강가에 있는 은행에서 일해. |
| Shesangasongaboutlove. | She sang a song about love | 그녀는 사랑에 관한 노래를 불렀어. |

---

# Level 2: 중간 문장 (띄어쓰기 오류 10-15곳)

## 한국어(띄어쓰기X) → 영어

| 입력 | 해석 | 출력 |
|------|------|------|
| 나는어제친구를보러카페에가서커피를마시면서코딩을했는데너무행복했어. | 보러(meet) / 코딩(tech) / 행복(emotion) | I went to a cafe to see my friend yesterday, drank coffee while coding, and was very happy. |
| 그녀는화가나서말을안하고방에들어가서문을쾅닫았어. | 화(anger) / 말(speech) / 문(door) | She was angry so she didn't talk, went into her room, and slammed the door. |
| AI개발을하는회사에서일하면서머신러닝을공부하고데이터를분석해. | AI/머신러닝/데이터(tech) | I work at a company that develops AI, study machine learning, and analyze data. |
| 밤에밤을구워먹으면서영화를보다가잠이들었어. | 밤(night) / 밤(chestnut) | At night, I fell asleep while watching a movie and roasting chestnuts. |

## 영어(spacing error) → 한국어

| 입력 | 해석 | 출력 |
|------|------|------|
| Iwenttothegymthismorningandranonthetreadmillfor30minutes. | gym / ran / treadmill(tech) | 나는 오늘 아침 헬스장에 가서 러닝머신에서 30분 동안 달렸어. |
| Myfriendissadandcryingbecauseshefailedtheexam. | sad/crying(emotion) / failed | 내 친구는 시험에 떨어져서 슬퍼하고 울고 있어. |
| TheprogrammerisfixingbugsandwritingcodefortheAIproject. | programmer/bugs/code/AI(tech) | 그 프로그래머는 AI 프로젝트를 위해 버그를 고치고 코드를 작성하고 있어. |
| Lightcolorsarebetterthandarkonesforspring. | Light(밝은 vs 빛 vs 가벼운), spring(봄 vs 스프링) | 밝은 색이 봄에는 어두운 색보다 더 좋아. |

---

# Level 3: 긴 문장 (띄어쓰기 오류 20-30곳)

## 한국어(띄어쓰기X) → 영어

### 테스트 1
```
입력: 나는지난주일요일에친구들과함께한강공원에가서자전거를타고치킨과맥주를먹으면서프로젝트일정에대해이야기했는데다들걱정이많아서나도불안해졌어.

해석: 일(day-일요일 vs work-일정) / 걱정(worry emotion) / 불안(anxiety emotion)

출력: Last Sunday, I went to Hangang Park with friends, rode bikes, ate chicken and beer while talking about the project schedule, and everyone was worried so I became anxious too.
```

### 테스트 2
```
입력: 그는화가나서사무실을나갔다가다시들어와서컴퓨터를켜고코드를보다가버그를잡았는데기분이좋아졌어.

해석: 화(anger) / 들어와서(enter) / 보다(look vs see) / 잡았는데(catch-bug) / 기분(mood emotion)

출력: He got angry and left the office, came back, turned on the computer, looked at the code, caught a bug, and felt better.
```

### 테스트 3
```
입력: 데이터사이언티스트가빅데이터를분석하면서인공지능모델을학습시키고있는데결과가좋아서너무기뻐.

해석: 데이터사이언티스트/빅데이터/인공지능/학습(tech) / 기뻐(joy emotion)

출력: The data scientist is analyzing big data and training an AI model, and is very happy because the results are good.
```

### 테스트 4 (극단적 다의어)
```
입력: 배를타고여행을가다가배가고파서배와사과를먹었는데배탈이나서배가아파서병원에갔어.

해석: 배(ship) / 배(stomach-hungry) / 배(pear-fruit) / 배탈(stomachache) / 배(stomach-pain)

출력: While traveling by ship, I got hungry so I ate pears and apples, but got a stomachache and my stomach hurt so I went to the hospital.
```

## 영어(spacing error) → 한국어

### 테스트 1
```
입력: LastnightIwassostressedaboutworksoIwenttothebarwithmycolleaguesanddrankbeerandtalkedaboutourproblemsandfeelsomuchbetternow.

해석: stressed(emotion) / work(일) / bar(술집) / better(emotion)

출력: 어젯밤 나는 일 때문에 너무 스트레스 받아서 동료들과 바에 가서 맥주를 마시고 우리 문제들에 대해 얘기했고 지금은 훨씬 나아진 기분이야.
```

### 테스트 2
```
입력: ThesoftwaredeveloperisfrustratedcausethebugkeepsappearingandthecodeisntworkingproperlysohedecidestorefactortheentiremoduleusingPython.

해석: frustrated(emotion) / bug/code/refactor/Python(tech)

출력: 그 소프트웨어 개발자는 버그가 계속 나타나고 코드가 제대로 작동하지 않아서 좌절했고 Python을 사용해서 전체 모듈을 리팩토링하기로 결정했어.
```

### 테스트 3 (다의어 복합)
```
입력: Iwatchedamovieaboutalighthousekeeperwhogotlostinthedarkandusedamatchtolight afirebutthelightwasntenoughandhefeltsadandlonely.

해석: light(등대 vs 불 vs 밝은), match(성냥 vs 경기), light(불 켜다), light(빛), sad/lonely(emotion)

출력: 나는 어둠 속에서 길을 잃은 등대지기가 성냥으로 불을 켰지만 빛이 충분하지 않아서 슬프고 외로워하는 영화를 봤어.
```

---

# Level 4: 매우 긴 문장 (띄어쓰기 오류 40+ 곳)

## 한국어(띄어쓰기X) → 영어

### 테스트 1 (150+ 글자)
```
입력: 나는작년부터올해까지거의일년동안매일일찍일어나서일을하면서파이썬과자바스크립트로코딩을공부하고머신러닝과딥러닝알고리즘을구현해봤는데처음에는너무어려워서화가나고짜증이났지만점점이해가되면서기쁘고행복해졌고이제는AI개발자로취업을해서회사에서데이터를분석하고모델을학습시키면서정말뿌듯하고자랑스러워.

해석:
- 다의어: 일(day-일년 vs work-일을) / 일찍(early)
- 기술용어: 코딩/파이썬/자바스크립트/머신러닝/딥러닝/AI
- 감정: 화(anger) / 짜증(irritation) / 기쁘고(joy) / 행복(happiness) / 뿌듯(pride) / 자랑스러워(proud)

출력: From last year until this year, for almost a year, I woke up early every day, worked, studied coding with Python and JavaScript, and tried implementing machine learning and deep learning algorithms, but at first it was so difficult that I got angry and irritated, but gradually as I understood it I became happy and joyful, and now I got a job as an AI developer and feel really proud and accomplished while analyzing data and training models at the company.
```

### 테스트 2 (180+ 글자)
```
입력: 우리팀은지난달부터이번달까지한달동안밤낮으로일을하면서새로운앱을개발했는데프론트엔드는리액트로백엔드는노드제이에스로데이터베이스는몽고디비로구축했고중간에버그가너무많이나와서다들스트레스받고화가났지만팀장님이격려해주시고피자를사주셔서다시힘을내서코드를수정하고테스트를반복했더니마침내완성이돼서정말기쁘고감동이었어.

해석:
- 다의어: 일(work)
- 기술용어: 개발/프론트엔드/백엔드/리액트/노드제이에스/몽고디비/버그/코드
- 감정: 스트레스(stress) / 화(anger) / 기쁘고(joy) / 감동(touched)

출력: Our team worked day and night for a month from last month until this month developing a new app, built the frontend with React, backend with Node.js, and database with MongoDB, but there were so many bugs in the middle that everyone was stressed and angry, but the team leader encouraged us and bought pizza so we got motivated again, fixed the code and repeated testing, and finally completed it so we were really happy and moved.
```

## 영어(spacing error) → 한국어

### 테스트 1 (400+ chars, with typos)
```
입력: IvebeenanAIdeveloperforthreeyearsandworkingondeeplearnignprojectsisprettyexcitingbutalsoverystressfulcausewhenyoutrainneuralnetworksthebugscanbeveryconfusingandsometimesIfeelfrustartedandsadwhenthemodeldoesntconvergebutwhenitsfinallworkingandtheaccuracyishighIfeelamazingandhappyandproudofmyselfandmyteamandnowwerelookingintotransformermodelsandlargelanguagemodelswhicharesocoolandIcantwaittostartbuildingthem.

오타: learnign→learning, frustarted→frustrated

해석:
- 기술용어: AI/developer/deep learning/neural networks/bugs/converge/transformers/LLM
- 감정: stressed/frustrated/sad/happy/proud

출력: 나는 3년 동안 AI 개발자로 일하고 있고 딥러닝 프로젝트를 하는 건 꽤 신나지만 또 아주 스트레스 받는데 왜냐하면 신경망을 학습시킬 때 버그가 정말 헷갈릴 수 있고 때때로 모델이 수렴하지 않을 때 좌절되고 슬프지만 마침내 작동하고 정확도가 높을 때는 놀랍고 행복하고 나 자신과 우리 팀이 자랑스럽고 이제 우리는 트랜스포머 모델과 대규모 언어 모델을 살펴보고 있는데 정말 멋있어서 그것들을 만들기 시작하는 게 기다려져.
```

### 테스트 2 (500+ chars, with typos)
```
입력: WhenIwasworkingatthetechstartuplastyearIhadtodealwithmultipleproblemslikeservercrashesdatabaseerrorsAPIfailuresandteamconflictswhichmademeanxiousanddepressedbutIlearnedtodebugmoreeffieicntlywritecleanercodeandcommunicatebetterwithmycolleaguessometimesIhadtoworkovernightfixingcriticalbugsandIfeltsotiredandlonelybutwhenwefinallylaunchedtheproductandgotreallypositivefeedbackfromusersIwassohappyandrelievedthatallthehardworkpaidoffandnowIfeelmuchmorecondidentandreadyforthenextchallenge.

오타: effieicntly→efficiently, condident→confident

해석:
- 기술용어: tech/startup/crashes/errors/API/debug/code/bugs
- 감정: anxious/depressed/tired/lonely/happy/relieved/confident

출력: 작년에 테크 스타트업에서 일할 때 서버 충돌이나 데이터베이스 오류나 API 실패 그리고 팀 갈등 같은 여러 문제들을 처리해야 했고 이게 나를 불안하고 우울하게 만들었지만 더 효율적으로 디버그하고 더 깨끗한 코드를 작성하고 동료들과 더 잘 소통하는 법을 배웠고 때때로 밤새워 중요한 버그를 고쳐야 했고 너무 피곤하고 외로웠지만 마침내 제품을 출시하고 사용자들로부터 정말 긍정적인 피드백을 받았을 때 모든 노력이 보람 있었다는 게 너무 행복하고 안도됐고 이제 훨씬 더 자신감 있고 다음 도전을 할 준비가 됐어.
```

---

# 난이도별 체크리스트

| 레벨 | 오류 개수 | 복합 요소 | 특징 |
|------|----------|----------|------|
| Level 1 | 5-7 | 다의어 2-3개 | 기본 띄어쓰기 복원 |
| Level 2 | 10-15 | 다의어 + 감정 + 기술 | 문맥 파악 필요 |
| Level 3 | 20-30 | 모든 요소 복합 | 복문 + 복합 문맥 |
| Level 4 | 40+ | 극단적 복합 + 오타 | 최고 난이도 |

---

**용도**: 띄어쓰기 오류 + 동음이의어 + 다의어 + 감정 + 기술 용어 복합 문맥 파악 테스트
**난이도**: 극악 - 모든 혼란 요소 총집합
