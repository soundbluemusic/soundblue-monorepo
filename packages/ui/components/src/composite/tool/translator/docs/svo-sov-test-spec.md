# 양방향 번역 테스트 - SVO↔SOV 어순 변환 (4단계 길이)

## 알고리즘/로직 기반 테스트 원칙

| 방식 | 허용 | 설명 |
|------|------|------|
| 하드코딩 | ❌ | 특정 문장만 통과하는 패턴 금지 |
| 알고리즘 기반 | ✅ | 어순 변환 규칙 알고리즘 적용 필수 |

**핵심**: SOV(한국어) ↔ SVO(영어) 구조 완전 변환 능력 검증

---

# Level 1: 짧은 문장 (5-7 단어)

## 한국어(SOV) → 영어(SVO)

| 입력 | 구조 변환 | 출력 |
|------|----------|------|
| 나는 커피를 마셨어. | S-O-V → S-V-O | I drank coffee. |
| 그녀는 노래를 불렀어. | S-O-V → S-V-O | She sang a song. |
| 너는 영화를 봤어? | S-O-V? → Did-S-V-O? | Did you watch the movie? |

## 영어(SVO) → 한국어(SOV)

| 입력 | 구조 변환 | 출력 |
|------|----------|------|
| He bought a car. | S-V-O → S-O-V | 그는 차를 샀어. |
| I don't eat meat. | S-V-O → S-O-V | 나는 고기를 안 먹어. |
| Do you like pizza? | V-S-V-O? → S-O-V? | 너는 피자를 좋아해? |

---

# Level 2: 중간 문장 (10-15 단어)

## 한국어(SOV) → 영어(SVO)

| 입력 | 구조 변환 | 출력 |
|------|----------|------|
| 나는 어제 친구와 함께 맛있는 파스타를 먹었어. | S-시간-With-O-V → S-V-O-With-시간 | I ate delicious pasta with my friend yesterday. |
| 우리는 주말에 새로 생긴 카페에서 브런치를 먹었어. | S-시간-장소-O-V → S-V-O-장소-시간 | We had brunch at the new cafe on the weekend. |
| 그는 생일 선물로 비싼 시계와 예쁜 꽃을 샀어. | S-목적-O-V → S-V-O-목적 | He bought an expensive watch and pretty flowers for a birthday gift. |

## 영어(SVO) → 한국어(SOV)

| 입력 | 구조 변환 | 출력 |
|------|----------|------|
| My brother finished his homework before dinner yesterday. | S-V-O-시간-시간 → S-시간-시간-O-V | 내 동생은 어제 저녁 먹기 전에 숙제를 끝냈어. |
| I met my old friend at the shopping mall last weekend. | S-V-O-장소-시간 → S-시간-장소-O-V | 나는 지난 주말에 쇼핑몰에서 오랜 친구를 만났어. |
| We studied hard all night to pass the exam. | S-V-시간-목적 → S-목적-시간-V | 우리는 시험에 합격하기 위해 밤새도록 열심히 공부했어. |

---

# Level 3: 긴 문장 (20-30 단어)

## 한국어(SOV) → 영어(SVO)

### 테스트 1
```
입력: 나는 지난주 화요일 저녁에 회사 근처 새로 생긴 이탈리안 레스토랑에서 동료들과 함께 맛있는 피자와 파스타를 먹으면서 프로젝트에 대해 이야기했어.

구조: S-시간-장소-With-O1-V1-주제-V2

출력: I ate delicious pizza and pasta with my colleagues at the new Italian restaurant near the office last Tuesday evening while talking about the project.
```

### 테스트 2
```
입력: 그녀는 어젯밤에 친구의 생일 파티 준비를 하느라 너무 늦게까지 잠을 못 자서 오늘 아침 회의에 지각했고 상사한테 혼났어.

구조: S-시간-이유-O1-V1-시간-장소-V2-대상-V3

출력: She couldn't sleep until very late last night because she was preparing for her friend's birthday party, so she was late to the meeting this morning and got scolded by her boss.
```

### 테스트 3
```
입력: 만약 내일 날씨가 좋으면 나는 친구들과 함께 한강 공원에 가서 자전거를 타고 치킨과 맥주를 먹으면서 저녁 노을을 보고 싶어.

구조: 조건-S-With-장소-V1-O1-V2-O2-V3-O3-V4

출력: If the weather is nice tomorrow, I want to go to Hangang Park with my friends, ride bikes, eat chicken and beer, and watch the sunset.
```

## 영어(SVO) → 한국어(SOV)

### 테스트 1
```
입력: Last Saturday morning, I woke up early, made fresh coffee, read the newspaper on the balcony, called my parents, and then went to the gym for two hours.

구조: 시간-S-V1-V2-O1-V3-O2-장소-V4-O3-V5-장소-시간

출력: 나는 지난 토요일 아침에 일찍 일어나서 신선한 커피를 만들고 발코니에서 신문을 읽고 부모님께 전화하고 그 다음에 두 시간 동안 헬스장에 갔어.
```

### 테스트 2
```
입력: Because I failed my driving test three times, I decided to take professional lessons from next month, practice every weekend, and try again before summer vacation starts.

구조: 이유-S-V1-O1-빈도-S-V2-O2-시간-V3-빈도-V4-시간

출력: 운전 시험에 세 번이나 떨어져서 나는 다음 달부터 전문 레슨을 받고 매주 주말마다 연습하고 여름 방학이 시작하기 전에 다시 시도하기로 결정했어.
```

### 테스트 3
```
입력: My younger sister graduated from university last year, found a great job at a tech company, moved to her own apartment downtown, and seems much happier than when she lived with our parents.

구조: S-V1-장소-시간-V2-O1-장소-V3-O2-장소-V4-상태-비교

출력: 내 여동생은 작년에 대학을 졸업하고 테크 회사에서 좋은 직장을 찾고 도심에 있는 자기 아파트로 이사했고 부모님과 살 때보다 훨씬 더 행복해 보여.
```

---

# Level 4: 매우 긴 문장 (40+ 단어)

## 한국어(SOV) → 영어(SVO)

```
입력: 나는 작년 3월부터 올해 11월까지 거의 9개월 동안 매일 새벽 5시에 일어나서 30분 동안 명상을 하고 1시간 동안 조깅을 하고 건강한 아침 식사를 직접 만들어 먹고 출근 전에 영어 공부를 30분씩 하면서 규칙적인 생활 습관을 만들려고 노력했는데 이제는 완전히 자연스럽게 몸에 배어서 아무 생각 없이도 자동으로 하게 되고 덕분에 건강도 좋아지고 영어 실력도 많이 늘었어.

출력: From March last year to November this year, for almost nine months, I woke up every day at 5 AM, meditated for 30 minutes, jogged for one hour, made and ate a healthy breakfast myself, and studied English for 30 minutes before going to work, trying to build regular life habits, and now it has become completely natural and automatic without thinking, and thanks to this, my health has improved and my English skills have increased a lot.
```

## 영어(SVO) → 한국어(SOV)

```
입력: During my three-month backpacking trip through Southeast Asia last summer, I visited twelve different countries, tried countless street foods, learned basic phrases in six languages, made friends from all over the world, got lost in unfamiliar cities multiple times, experienced both amazing kindness and unfortunate scams, ran out of money twice and had to work at hostels, missed my flight once, got food poisoning three times, but looking back now, I realize it was the most valuable and life-changing experience that taught me independence, resilience, and how to appreciate different cultures and perspectives.

출력: 나는 작년 여름에 3개월 동안 동남아시아를 배낭여행하면서 12개의 다른 나라들을 방문했고 수많은 길거리 음식을 먹어봤고 6개 언어로 기본적인 문구를 배웠고 전 세계에서 온 친구들을 사귀었고 낯선 도시에서 여러 번 길을 잃었고 놀라운 친절과 불행한 사기를 모두 경험했고 두 번이나 돈이 떨어져서 호스텔에서 일해야 했고 한 번은 비행기를 놓쳤고 세 번이나 식중독에 걸렸지만 지금 돌이켜보면 그것이 내게 독립심과 회복력과 다양한 문화와 관점을 감상하는 방법을 가르쳐준 가장 가치 있고 인생을 바꾼 경험이었다는 것을 깨달았어.
```

---

# 난이도별 체크리스트

| 레벨 | 단어 수 | 구조 요소 | 특징 |
|------|---------|----------|------|
| Level 1 | 5-7 | S, O, V | 기본 어순 변환 |
| Level 2 | 10-15 | S, O, V + 시간/장소/With | 부사구 위치 조정 |
| Level 3 | 20-30 | 복합절, 연결어 | 복문 처리 |
| Level 4 | 40+ | 다중 절, 인과관계 | 극단적 복잡성 |

---

**용도**: SVO↔SOV 어순 변환 알고리즘 검증 - 4단계 길이별 테스트
**특징**: 짧은→중간→긴→매우 긴 문장, 실제 자주 쓰는 표현, 하드코딩 불가능
