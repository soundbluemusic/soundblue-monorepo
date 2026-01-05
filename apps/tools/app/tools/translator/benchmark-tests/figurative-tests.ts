/**
 * 비유 표현 테스트 데이터 (Figurative Expression Tests)
 * 직유, 은유, 의인법, 과장법, 관용적 비유, 역설, 환유, 제유, 문화 특수 비유
 */

import type { TestLevel } from '../types';

export const figurativeTests: TestLevel[] = [
  // ────────────────────────────────────────
  // 1. 직유 (Simile) - ~처럼, ~같이 / like, as ~ as
  // ────────────────────────────────────────
  {
    id: 'fig-simile',
    name: 'Simile',
    nameKo: '직유',
    categories: [
      {
        id: 'fig-simile-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'sim-ko-1',
            input: '그녀의 피부는 눈처럼 하얗다.',
            expected: 'Her skin is white as snow.',
            direction: 'ko-en',
          },
          {
            id: 'sim-ko-2',
            input: '그의 눈빛은 얼음처럼 차갑다.',
            expected: 'His eyes are cold as ice.',
            direction: 'ko-en',
          },
          {
            id: 'sim-ko-3',
            input: '그는 새처럼 날았다.',
            expected: 'He flew like a bird.',
            direction: 'ko-en',
          },
          {
            id: 'sim-ko-4',
            input: '마치 꿈인 것처럼 느껴졌다.',
            expected: 'It felt as if it were a dream.',
            direction: 'ko-en',
          },
          {
            id: 'sim-ko-5',
            input: '천사같은 미소를 지었다.',
            expected: 'She smiled like an angel.',
            direction: 'ko-en',
          },
          {
            id: 'sim-ko-6',
            input: '물처럼 흐르는 음악',
            expected: 'Music that flows like water.',
            direction: 'ko-en',
          },
          {
            id: 'sim-ko-7',
            input: '호랑이같은 남자',
            expected: 'A man like a tiger.',
            direction: 'ko-en',
          },
          {
            id: 'sim-ko-8',
            input: '꿀같은 목소리',
            expected: 'A voice like honey.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-simile-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'sim-en-1',
            input: 'She runs fast as the wind.',
            expected: '그녀는 바람처럼 빠르게 달린다.',
            direction: 'en-ko',
          },
          {
            id: 'sim-en-2',
            input: 'He is strong as an ox.',
            expected: '그는 소처럼 힘이 세다.',
            direction: 'en-ko',
          },
          {
            id: 'sim-en-3',
            input: 'The child cried like a baby.',
            expected: '그 아이는 아기처럼 울었다.',
            direction: 'en-ko',
          },
          {
            id: 'sim-en-4',
            input: 'It looks as though he saw a ghost.',
            expected: '마치 그가 귀신을 본 것처럼 보인다.',
            direction: 'en-ko',
          },
          {
            id: 'sim-en-5',
            input: 'Quick as lightning.',
            expected: '번개처럼 빠르다.',
            direction: 'en-ko',
          },
          {
            id: 'sim-en-6',
            input: 'Solid as a rock.',
            expected: '바위처럼 단단하다.',
            direction: 'en-ko',
          },
          {
            id: 'sim-en-7',
            input: 'Deep as the ocean.',
            expected: '바다처럼 깊다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────
  // 2. 은유 (Metaphor) - A는 B이다 / A is B
  // ────────────────────────────────────────
  {
    id: 'fig-metaphor',
    name: 'Metaphor',
    nameKo: '은유',
    categories: [
      {
        id: 'fig-metaphor-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'met-ko-1',
            input: '인생은 여행이다.',
            expected: 'Life is a journey.',
            direction: 'ko-en',
          },
          {
            id: 'met-ko-2',
            input: '시간은 금이다.',
            expected: 'Time is gold.',
            direction: 'ko-en',
          },
          {
            id: 'met-ko-3',
            input: '희망의 빛이 보인다.',
            expected: 'I see the light of hope.',
            direction: 'ko-en',
          },
          {
            id: 'met-ko-4',
            input: '슬픔의 바다에 빠졌다.',
            expected: 'I fell into a sea of sorrow.',
            direction: 'ko-en',
          },
          {
            id: 'met-ko-5',
            input: '지식은 힘이다.',
            expected: 'Knowledge is power.',
            direction: 'ko-en',
          },
          {
            id: 'met-ko-6',
            input: '시간의 강이 흐른다.',
            expected: 'The river of time flows.',
            direction: 'ko-en',
          },
          {
            id: 'met-ko-7',
            input: '내 마음은 호수다.',
            expected: 'My heart is a lake.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-metaphor-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'met-en-1',
            input: 'Love is a battlefield.',
            expected: '사랑은 전쟁터다.',
            direction: 'en-ko',
          },
          {
            id: 'met-en-2',
            input: 'He drowned in a river of tears.',
            expected: '그는 눈물의 강에 빠졌다.',
            direction: 'en-ko',
          },
          {
            id: 'met-en-3',
            input: 'The world is a stage.',
            expected: '세상은 무대다.',
            direction: 'en-ko',
          },
          {
            id: 'met-en-4',
            input: 'Her words were poison.',
            expected: '그녀의 말은 독이었다.',
            direction: 'en-ko',
          },
          {
            id: 'met-en-5',
            input: 'Hope is a flame that never dies.',
            expected: '희망은 꺼지지 않는 불꽃이다.',
            direction: 'en-ko',
          },
          {
            id: 'met-en-6',
            input: 'Books are windows to the world.',
            expected: '책은 세상으로 가는 창문이다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────
  // 3. 의인법 (Personification) - 무생물 + 인간 동사
  // ────────────────────────────────────────
  {
    id: 'fig-personification',
    name: 'Personification',
    nameKo: '의인법',
    categories: [
      {
        id: 'fig-person-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'per-ko-1',
            input: '바람이 속삭인다.',
            expected: 'The wind whispers.',
            direction: 'ko-en',
          },
          {
            id: 'per-ko-2',
            input: '달이 미소 짓는다.',
            expected: 'The moon smiles.',
            direction: 'ko-en',
          },
          {
            id: 'per-ko-3',
            input: '시간이 기다려주지 않는다.',
            expected: 'Time waits for no one.',
            direction: 'ko-en',
          },
          {
            id: 'per-ko-4',
            input: '꽃이 고개를 숙인다.',
            expected: 'The flowers bow their heads.',
            direction: 'ko-en',
          },
          {
            id: 'per-ko-5',
            input: '파도가 해변을 어루만진다.',
            expected: 'Waves caress the shore.',
            direction: 'ko-en',
          },
          {
            id: 'per-ko-6',
            input: '별들이 노래한다.',
            expected: 'The stars sing.',
            direction: 'ko-en',
          },
          {
            id: 'per-ko-7',
            input: '산이 우리를 부른다.',
            expected: 'The mountain calls us.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-person-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'per-en-1',
            input: 'The sun smiled down on us.',
            expected: '태양이 우리에게 미소 지었다.',
            direction: 'en-ko',
          },
          {
            id: 'per-en-2',
            input: 'Death knocked on the door.',
            expected: '죽음이 문을 두드렸다.',
            direction: 'en-ko',
          },
          {
            id: 'per-en-3',
            input: 'Opportunity knocked twice.',
            expected: '기회가 두 번 문을 두드렸다.',
            direction: 'en-ko',
          },
          {
            id: 'per-en-4',
            input: 'The trees danced in the wind.',
            expected: '나무들이 바람에 춤추었다.',
            direction: 'en-ko',
          },
          {
            id: 'per-en-5',
            input: 'The old house groaned.',
            expected: '오래된 집이 신음했다.',
            direction: 'en-ko',
          },
          {
            id: 'per-en-6',
            input: 'Justice is blind.',
            expected: '정의는 눈이 멀었다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────
  // 4. 과장법 (Hyperbole) - 죽을 만큼, ~해 죽겠다 / to death, million times
  // ────────────────────────────────────────
  {
    id: 'fig-hyperbole',
    name: 'Hyperbole',
    nameKo: '과장법',
    categories: [
      {
        id: 'fig-hyper-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'hyp-ko-1',
            input: '죽을 만큼 아프다.',
            expected: 'It hurts to death.',
            direction: 'ko-en',
          },
          {
            id: 'hyp-ko-2',
            input: '백 번도 더 말했다.',
            expected: "I've told you a million times.",
            direction: 'ko-en',
          },
          {
            id: 'hyp-ko-3',
            input: '배가 등에 붙었다.',
            expected: "I'm starving to death.",
            direction: 'ko-en',
          },
          {
            id: 'hyp-ko-4',
            input: '눈물의 바다였다.',
            expected: 'It was an ocean of tears.',
            direction: 'ko-en',
          },
          {
            id: 'hyp-ko-5',
            input: '눈이 빠지게 기다렸다.',
            expected: 'I waited until my eyes fell out.',
            direction: 'ko-en',
          },
          {
            id: 'hyp-ko-6',
            input: '산더미 같은 일이 있다.',
            expected: 'I have a mountain of work.',
            direction: 'ko-en',
          },
          {
            id: 'hyp-ko-7',
            input: '목이 빠지게 기다렸다.',
            expected: 'I waited forever.',
            direction: 'ko-en',
          },
          {
            id: 'hyp-ko-8',
            input: '귀에 못이 박히게 들었다.',
            expected: "I've heard it a thousand times.",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-hyper-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'hyp-en-1',
            input: "I'm dying of hunger.",
            expected: '배고파 죽겠다.',
            direction: 'en-ko',
          },
          {
            id: 'hyp-en-2',
            input: 'I have a million things to do.',
            expected: '할 일이 산더미다.',
            direction: 'en-ko',
          },
          {
            id: 'hyp-en-3',
            input: 'This bag weighs a ton.',
            expected: '이 가방은 엄청 무겁다.',
            direction: 'en-ko',
          },
          {
            id: 'hyp-en-4',
            input: 'I could eat a horse.',
            expected: '너무 배고파서 뭐든 먹을 수 있다.',
            direction: 'en-ko',
          },
          {
            id: 'hyp-en-5',
            input: "I've been waiting for ages.",
            expected: '한참을 기다렸다.',
            direction: 'en-ko',
          },
          {
            id: 'hyp-en-6',
            input: 'She cried an ocean of tears.',
            expected: '그녀는 눈물의 바다를 흘렸다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────
  // 5. 관용적 비유 - 동물 (Idiomatic Animal Similes)
  // ────────────────────────────────────────
  {
    id: 'fig-idiom-animal',
    name: 'Idiomatic Simile - Animals',
    nameKo: '관용적 비유 - 동물',
    categories: [
      {
        id: 'fig-animal-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'ani-ko-1',
            input: '그는 여우같은 사람이다.',
            expected: 'He is as sly as a fox.',
            direction: 'ko-en',
          },
          {
            id: 'ani-ko-2',
            input: '그녀는 양처럼 순하다.',
            expected: 'She is gentle as a lamb.',
            direction: 'ko-en',
          },
          {
            id: 'ani-ko-3',
            input: '개미처럼 부지런하다.',
            expected: 'As busy as a bee.',
            direction: 'ko-en',
          },
          {
            id: 'ani-ko-4',
            input: '거북이처럼 느리다.',
            expected: 'As slow as a turtle.',
            direction: 'ko-en',
          },
          {
            id: 'ani-ko-5',
            input: '소처럼 고집이 세다.',
            expected: 'As stubborn as an ox.',
            direction: 'ko-en',
          },
          {
            id: 'ani-ko-6',
            input: '뱀같은 사람이다.',
            expected: 'He is as slippery as a snake.',
            direction: 'ko-en',
          },
          {
            id: 'ani-ko-7',
            input: '사자같은 용기',
            expected: 'Courage like a lion.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-animal-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'ani-en-1',
            input: 'She is as brave as a lion.',
            expected: '그녀는 사자처럼 용감하다.',
            direction: 'en-ko',
          },
          {
            id: 'ani-en-2',
            input: "He's a chicken.",
            expected: '그는 겁쟁이다.',
            direction: 'en-ko',
          },
          {
            id: 'ani-en-3',
            input: 'Quick as a bunny.',
            expected: '토끼처럼 빠르다.',
            direction: 'en-ko',
          },
          {
            id: 'ani-en-4',
            input: 'Free as a bird.',
            expected: '새처럼 자유롭다.',
            direction: 'en-ko',
          },
          {
            id: 'ani-en-5',
            input: 'Quiet as a mouse.',
            expected: '쥐처럼 조용하다.',
            direction: 'en-ko',
          },
          {
            id: 'ani-en-6',
            input: 'Wise as an owl.',
            expected: '부엉이처럼 현명하다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────
  // 6. 역설/모순어법 (Paradox/Oxymoron)
  // ────────────────────────────────────────
  {
    id: 'fig-paradox',
    name: 'Paradox / Oxymoron',
    nameKo: '역설 / 모순어법',
    categories: [
      {
        id: 'fig-paradox-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'par-ko-1',
            input: '달콤한 고통',
            expected: 'Sweet pain.',
            direction: 'ko-en',
          },
          {
            id: 'par-ko-2',
            input: '시끄러운 침묵',
            expected: 'Loud silence.',
            direction: 'ko-en',
          },
          {
            id: 'par-ko-3',
            input: '절망 속의 희망',
            expected: 'Hope in despair.',
            direction: 'ko-en',
          },
          {
            id: 'par-ko-4',
            input: '소리 없는 아우성',
            expected: 'Silent scream.',
            direction: 'ko-en',
          },
          {
            id: 'par-ko-5',
            input: '차가운 불꽃',
            expected: 'Cold fire.',
            direction: 'ko-en',
          },
          {
            id: 'par-ko-6',
            input: '아름다운 상처',
            expected: 'Beautiful scars.',
            direction: 'ko-en',
          },
          {
            id: 'par-ko-7',
            input: '살아있는 죽음',
            expected: 'Living death.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-paradox-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'par-en-1',
            input: 'Cruel kindness.',
            expected: '잔인한 친절.',
            direction: 'en-ko',
          },
          {
            id: 'par-en-2',
            input: 'Light in darkness.',
            expected: '어둠 속의 빛.',
            direction: 'en-ko',
          },
          {
            id: 'par-en-3',
            input: 'Bittersweet memories.',
            expected: '씁쓸달콤한 추억.',
            direction: 'en-ko',
          },
          {
            id: 'par-en-4',
            input: 'Deafening silence.',
            expected: '귀를 찢는 침묵.',
            direction: 'en-ko',
          },
          {
            id: 'par-en-5',
            input: 'Joyful sorrow.',
            expected: '기쁜 슬픔.',
            direction: 'en-ko',
          },
          {
            id: 'par-en-6',
            input: 'Virtual reality.',
            expected: '가상 현실.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────
  // 7. 환유 (Metonymy) - 장소→기관, 도구→행위
  // ────────────────────────────────────────
  {
    id: 'fig-metonymy',
    name: 'Metonymy',
    nameKo: '환유',
    categories: [
      {
        id: 'fig-metonymy-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'meto-ko-1',
            input: '청와대가 발표했다.',
            expected: 'The Blue House announced.',
            direction: 'ko-en',
          },
          {
            id: 'meto-ko-2',
            input: '펜은 칼보다 강하다.',
            expected: 'The pen is mightier than the sword.',
            direction: 'ko-en',
          },
          {
            id: 'meto-ko-3',
            input: '셰익스피어를 읽었다.',
            expected: 'I read Shakespeare.',
            direction: 'ko-en',
          },
          {
            id: 'meto-ko-4',
            input: '그는 펜을 놓았다.',
            expected: 'He put down his pen.',
            direction: 'ko-en',
          },
          {
            id: 'meto-ko-5',
            input: '왕관을 쓰다.',
            expected: 'Wear the crown.',
            direction: 'ko-en',
          },
          {
            id: 'meto-ko-6',
            input: '베토벤을 들었다.',
            expected: 'I listened to Beethoven.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-metonymy-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'meto-en-1',
            input: 'The White House decided.',
            expected: '백악관이 결정했다.',
            direction: 'en-ko',
          },
          {
            id: 'meto-en-2',
            input: 'Wall Street reacted.',
            expected: '월가가 반응했다.',
            direction: 'en-ko',
          },
          {
            id: 'meto-en-3',
            input: 'Hollywood produced a new movie.',
            expected: '할리우드가 새 영화를 만들었다.',
            direction: 'en-ko',
          },
          {
            id: 'meto-en-4',
            input: 'The Pentagon confirmed.',
            expected: '펜타곤이 확인했다.',
            direction: 'en-ko',
          },
          {
            id: 'meto-en-5',
            input: 'I saw a Picasso.',
            expected: '나는 피카소를 봤다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────
  // 8. 제유 (Synecdoche) - 부분→전체, 전체→부분
  // ────────────────────────────────────────
  {
    id: 'fig-synecdoche',
    name: 'Synecdoche',
    nameKo: '제유',
    categories: [
      {
        id: 'fig-synec-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'syn-ko-1',
            input: '손이 모자라다.',
            expected: 'We need more hands.',
            direction: 'ko-en',
          },
          {
            id: 'syn-ko-2',
            input: '입을 놀리지 마라.',
            expected: "Don't run your mouth.",
            direction: 'ko-en',
          },
          {
            id: 'syn-ko-3',
            input: '지붕 아래 함께 살다.',
            expected: 'Live under one roof.',
            direction: 'ko-en',
          },
          {
            id: 'syn-ko-4',
            input: '머리 수를 세다.',
            expected: 'Count heads.',
            direction: 'ko-en',
          },
          {
            id: 'syn-ko-5',
            input: '귀를 기울이다.',
            expected: 'Lend an ear.',
            direction: 'ko-en',
          },
          {
            id: 'syn-ko-6',
            input: '발을 끊었다.',
            expected: 'Cut ties.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-synec-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'syn-en-1',
            input: 'All hands on deck.',
            expected: '모든 손이 필요하다.',
            direction: 'en-ko',
          },
          {
            id: 'syn-en-2',
            input: 'Give us our daily bread.',
            expected: '우리에게 일용할 양식을 주소서.',
            direction: 'en-ko',
          },
          {
            id: 'syn-en-3',
            input: 'Nice wheels!',
            expected: '좋은 차네!',
            direction: 'en-ko',
          },
          {
            id: 'syn-en-4',
            input: 'The whole world knows.',
            expected: '온 세상이 안다.',
            direction: 'en-ko',
          },
          {
            id: 'syn-en-5',
            input: 'Keep your eyes open.',
            expected: '눈을 크게 떠라.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────
  // 9. 문화 특수 비유 (Culture-Specific Idioms)
  // ────────────────────────────────────────
  {
    id: 'fig-culture',
    name: 'Culture-Specific Idioms',
    nameKo: '문화 특수 비유',
    categories: [
      {
        id: 'fig-culture-ko-en',
        name: 'Korean → English (의역)',
        nameKo: '한국어 → 영어 (의역)',
        tests: [
          {
            id: 'cul-ko-1',
            input: '눈에 넣어도 안 아플 아이',
            expected: 'The apple of my eye.',
            direction: 'ko-en',
          },
          {
            id: 'cul-ko-2',
            input: '식은 죽 먹기야.',
            expected: "It's a piece of cake.",
            direction: 'ko-en',
          },
          {
            id: 'cul-ko-3',
            input: '하늘의 별 따기다.',
            expected: "It's like finding a needle in a haystack.",
            direction: 'ko-en',
          },
          {
            id: 'cul-ko-4',
            input: '우물 안 개구리',
            expected: 'A frog in a well.',
            direction: 'ko-en',
          },
          {
            id: 'cul-ko-5',
            input: '그림의 떡이다.',
            expected: "It's pie in the sky.",
            direction: 'ko-en',
          },
          {
            id: 'cul-ko-6',
            input: '누워서 떡 먹기',
            expected: 'Easy as pie.',
            direction: 'ko-en',
          },
          {
            id: 'cul-ko-7',
            input: '꿩 대신 닭',
            expected: 'The next best thing.',
            direction: 'ko-en',
          },
          {
            id: 'cul-ko-8',
            input: '발 없는 말이 천 리 간다.',
            expected: 'Word travels fast.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'fig-culture-en-ko',
        name: 'English → Korean (의역)',
        nameKo: '영어 → 한국어 (의역)',
        tests: [
          {
            id: 'cul-en-1',
            input: 'Break a leg!',
            expected: '행운을 빌어!',
            direction: 'en-ko',
          },
          {
            id: 'cul-en-2',
            input: "I'm feeling under the weather.",
            expected: '몸이 안 좋아.',
            direction: 'en-ko',
          },
          {
            id: 'cul-en-3',
            input: "Let's hit the hay.",
            expected: '잠자리에 들자.',
            direction: 'en-ko',
          },
          {
            id: 'cul-en-4',
            input: 'Spill the beans.',
            expected: '비밀을 털어놔.',
            direction: 'en-ko',
          },
          {
            id: 'cul-en-5',
            input: 'The ball is in your court.',
            expected: '이제 네 차례야.',
            direction: 'en-ko',
          },
          {
            id: 'cul-en-6',
            input: 'Barking up the wrong tree.',
            expected: '헛다리 짚고 있다.',
            direction: 'en-ko',
          },
          {
            id: 'cul-en-7',
            input: 'Burn the midnight oil.',
            expected: '밤새 일하다.',
            direction: 'en-ko',
          },
          {
            id: 'cul-en-8',
            input: "It's raining cats and dogs.",
            expected: '비가 억수같이 온다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];
