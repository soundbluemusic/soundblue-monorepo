# 양방향 번역 테스트 - 다의어/동음이의어 (Polysemy & Homonyms)

## 난이도별 3단계: 초급, 중급, 고급

---

## 알고리즘 기반 테스트 원칙

**이 테스트는 반드시 알고리즘 기반으로만 실행되어야 합니다.**

| 방식 | 허용 | 설명 |
|------|------|------|
| 사전 기반 | ❌ | 하나의 단어에 여러 뜻이 있을 때 구분 불가 |
| 알고리즘 기반 | ✅ | 문맥을 통한 정확한 의미 선택 |

**이유**: 다의어/동음이의어는 문맥에 따라 완전히 다른 의미이며, 알고리즘이 맥락 분석으로 올바른 의미를 선택해야 함

---

# 초급 (Beginner Level)

## 한국어 → 영어

### 테스트 1: 일 (work / day)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| work | 나는 일을 해요. | 일을 하다 = 동사구 | I work. / I do work. |
| day | 오늘은 좋은 일이에요. | 좋은 일 = 형용사 + 명사 | Today is a good day. |

### 테스트 2: 밤 (night / chestnut)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| night | 밤에 잠을 자요. | 밤에 = 시간 표현 | I sleep at night. |
| chestnut | 밤을 구워 먹었어요. | 밤을 굽다, 먹다 = 음식 | I roasted and ate chestnuts. |

### 테스트 3: 눈 (eye / snow)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| eye | 눈이 아파요. | 아프다 = 신체 | My eyes hurt. |
| snow | 눈이 와요. | 오다 = 날씨 | It's snowing. / Snow is falling. |

### 테스트 4: 말 (horse / speech/words)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| horse | 말을 타요. | 타다 = 동물 | I ride a horse. |
| speech/words | 말을 해요. | 하다 = 언어 | I speak. / I say words. |

### 테스트 5: 배 (stomach / pear / ship)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| stomach | 배가 고파요. | 고프다 = 배고픔 | I'm hungry. / My stomach is empty. |
| pear | 배가 달아요. | 달다 = 맛 | The pear is sweet. |
| ship | 배를 타요. | 타다 = 교통수단 | I ride a ship. / I take a boat. |

---

## 영어 → 한국어

### 테스트 6: Date (날짜 / 데이트 / 대추야자)

| 의미 | 입력(EN) | 문맥 단서 | 출력(KO) |
|------|----------|-----------|----------|
| 날짜 | What's the date today? | today, what's the | 오늘 날짜가 뭐예요? |
| 데이트 | I have a date tonight. | tonight, have a | 오늘 밤 데이트가 있어요. |
| 대추야자 | I like eating dates. | eating | 나는 대추야자 먹는 것을 좋아해요. |

### 테스트 7: Light (빛 / 가볍다 / 밝은 색)

| 의미 | 입력(EN) | 문맥 단서 | 출력(KO) |
|------|----------|-----------|----------|
| 빛/조명 | Turn on the light. | turn on | 불을 켜세요. / 조명을 켜세요. |
| 가볍다 | This box is light. | box is | 이 상자는 가벼워요. |
| 밝은 | I like light colors. | colors | 나는 밝은 색을 좋아해요. |

---

# 중급 (Intermediate Level)

## 한국어 → 영어

### 테스트 1: 보다 (see / watch / meet / look / take exam)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| see | 멀리서 산을 봤어요. | 멀리서, 산 | I saw the mountain from afar. |
| watch | 어제 영화를 봤어요. | 영화 | I watched a movie yesterday. |
| meet | 내일 친구를 봐요. | 친구, 내일 | I'm meeting my friend tomorrow. |
| look | 이거 좀 봐봐. | 이거, 좀 (명령) | Look at this. / Check this out. |
| take exam | 내일 시험을 봐요. | 시험 | I'm taking an exam tomorrow. |

### 테스트 2: 차다 (kick / cold / full / wear)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| kick | 공을 세게 찼어요. | 공, 세게 | I kicked the ball hard. |
| cold | 물이 너무 차요. | 물, 너무 (온도) | The water is too cold. |
| full | 버스가 사람들로 가득 찼어요. | 가득, 사람들로 | The bus is full of people. |
| wear | 시계를 차고 있어요. | 시계, -고 있다 | I'm wearing a watch. |

### 테스트 3: 잡다 (catch / book / hold / fix / set)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| catch | 도둑을 잡았어요. | 도둑 | I caught the thief. |
| book | 호텔 방을 잡았어요. | 호텔, 방 | I booked a hotel room. |
| hold | 손잡이를 꽉 잡으세요. | 손잡이, 꽉 | Hold the handle tightly. |
| fix | 기계 고장을 잡았어요. | 고장 | I fixed the machine breakdown. |
| set | 회의 시간을 잡았어요. | 회의, 시간 | I set the meeting time. |

---

## 영어 → 한국어

### 테스트 4: Run (달리다 / 운영하다 / 작동하다 / 출마하다)

| 의미 | 입력(EN) | 문맥 단서 | 출력(KO) |
|------|----------|-----------|----------|
| 달리다 | I run 5km every morning. | 5km, every morning | 나는 매일 아침 5km를 달려요. |
| 운영하다 | She runs a restaurant. | restaurant | 그녀는 식당을 운영해요. |
| 작동하다 | This program runs on Windows. | program, Windows | 이 프로그램은 윈도우에서 작동해요. |
| 출마하다 | He's running for president. | for president | 그는 대통령에 출마하고 있어요. |

### 테스트 5: Bank (은행 / 강둑 / 비축)

| 의미 | 입력(EN) | 문맥 단서 | 출력(KO) |
|------|----------|-----------|----------|
| 은행 | I need to go to the bank to withdraw money. | withdraw money | 돈을 인출하러 은행에 가야 해요. |
| 강둑 | We sat on the bank of the river. | river, sat on | 우리는 강둑에 앉았어요. |
| 비축 | I need to build up a bank of vacation days. | build up, vacation days | 휴가 일수를 비축해야 해요. |

---

# 고급 (Advanced Level)

## 한국어 → 영어

### 테스트 1: 들다 (hold / hear / like / age / develop habit / lift)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| hold | 가방을 들고 있어요. | 가방, -고 있다 | I'm holding a bag. |
| hear | 소리가 들려요. | 소리, -려요 | I can hear a sound. |
| like | 이 옷이 마음에 들어요. | 마음에 | I like these clothes. |
| age | 나이가 드니까 피곤해요. | 나이가, -니까 | I'm tired as I'm getting older. |
| develop habit | 운동하는 습관이 들었어요. | 습관이 | I've developed an exercise habit. |
| lift | 이 상자 좀 들어줄래요? | 상자, 좀 (부탁) | Can you lift this box for me? |

### 테스트 2: 밝다 (bright light / cheerful / promising / smart)

| 의미 | 입력(KO) | 문맥 단서 | 출력(EN) |
|------|----------|-----------|----------|
| bright | 이 방은 밝아요. | 방 (공간) | This room is bright. |
| cheerful | 그 아이는 성격이 밝아요. | 성격 | That child has a cheerful personality. |
| promising | 미래가 밝아요. | 미래 | The future is promising. |
| smart | 그 학생은 머리가 밝아요. | 머리 | That student is smart/intelligent. |

### 테스트 3: 복합 다의어 문장 (극단적 다의어)

```
입력(KO): 배를 타고 가다가 배가 고파서 배를 먹었어요.

다의어 구분:
- 배1 (ship): 타고
- 배2 (stomach): 고파서
- 배3 (pear): 먹었어요

출력(EN): While riding on the ship, I got hungry so I ate a pear.

정답: ship, stomach, pear (3가지 모두 정확히 구분)
```

---

## 영어 → 한국어

### 테스트 4: Get (얻다 / 이해하다 / 도착하다 / 되다 / 사다 / 받다)

| 의미 | 입력(EN) | 문맥 단서 | 출력(KO) |
|------|----------|-----------|----------|
| 얻다 | I got a new job. | new job | 새 직장을 얻었어요. |
| 이해하다 | I don't get what you mean. | what you mean | 무슨 말인지 이해가 안 돼요. |
| 도착하다 | What time did you get home? | home, what time | 몇 시에 집에 도착했어요? |
| 되다 | It's getting cold. | -ing, cold | 추워지고 있어요. |
| 사다 | Can you get some milk? | some milk, can you | 우유 좀 사올래? |
| 받다 | I got your message. | your message | 메시지 받았어요. |

### 테스트 5: Spring (봄 / 스프링 / 샘/온천 / 튀다)

| 의미 | 입력(EN) | 문맥 단서 | 출력(KO) |
|------|----------|-----------|----------|
| 봄 | Spring is my favorite season. | season, favorite | 봄은 내가 가장 좋아하는 계절이에요. |
| 스프링 | The spring in my mattress is broken. | mattress, broken | 내 매트리스의 스프링이 망가졌어요. |
| 온천 | We visited a natural hot spring. | natural, hot | 우리는 천연 온천을 방문했어요. |
| 뛰어오르다 | The cat sprang onto the table. | cat, onto | 고양이가 테이블 위로 뛰어올랐어요. |

### 테스트 6: Match (미묘한 뉘앙스 구분)

| 의미 | 입력(EN) | 출력(KO) |
|------|----------|----------|
| 성냥 | Strike the match. | 성냥을 그으세요. |
| 경기 | We won the match. | 우리가 경기에서 이겼어요. |
| 어울리다 | These colors match well. | 이 색들은 잘 어울려요. |
| 일치하다 | The fingerprints match. | 지문이 일치해요. |

---

# 난이도별 체크리스트

| 난이도 | 의미 개수 | 문맥 복잡도 | 특징 |
|--------|-----------|-------------|------|
| 초급 | 2-3개 | 명확한 단서 | 일상 단어, 쉽게 구분 |
| 중급 | 4-5개 | 문맥 파악 필요 | 동사 다의어, 미묘한 차이 |
| 고급 | 6개+ | 복잡한 문맥 | 복합 다의어, 매우 미묘한 뉘앙스 |

---

**용도**: 알고리즘 기반 번역 시스템의 다의어/동음이의어 구분 능력을 난이도별로 검증
**핵심**: 초급→중급→고급으로 점진적으로 어려워지는 다의어 구분 테스트
