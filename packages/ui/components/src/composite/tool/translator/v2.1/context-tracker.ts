/**
 * 다문장 문맥 추적 시스템 (Context Tracker)
 *
 * 목적: 여러 문장을 번역할 때 이전 문장의 문맥을 유지
 * - 주어/대상 추적 (철수, 영희 → He, She)
 * - 대명사 해석 (그는, 그녀는 → 이전 문장의 주어)
 * - 시간 문맥 유지
 */

// ============================================
// 일반 한국 이름 ↔ 영어 음역 사전
// ============================================

export const KOREAN_NAMES: Record<string, string> = {
  // 남성 이름
  철수: 'Cheolsu',
  민수: 'Minsu',
  영수: 'Youngsu',
  준호: 'Junho',
  지훈: 'Jihoon',
  성민: 'Sungmin',
  동현: 'Donghyun',
  현우: 'Hyunwoo',
  민재: 'Minjae',
  성호: 'Sungho',
  재현: 'Jaehyun',
  승우: 'Seungwoo',
  태현: 'Taehyun',
  정우: 'Jungwoo',
  시우: 'Siwoo',

  // 여성 이름
  영희: 'Younghee',
  지은: 'Jieun',
  수진: 'Sujin',
  미영: 'Miyoung',
  은지: 'Eunji',
  지연: 'Jiyeon',
  유진: 'Yujin',
  서연: 'Seoyeon',
  민지: 'Minji',
  수아: 'Sua',
  하은: 'Haeun',
  지민: 'Jimin',
  서윤: 'Seoyoon',
  채원: 'Chaewon',
  예은: 'Yeeun',

  // 성씨
  김: 'Kim',
  이: 'Lee',
  박: 'Park',
  최: 'Choi',
  정: 'Jung',
  강: 'Kang',
  조: 'Cho',
  윤: 'Yoon',
  장: 'Jang',
  임: 'Lim',
  한: 'Han',
  오: 'Oh',
  서: 'Seo',
  신: 'Shin',
  권: 'Kwon',
  황: 'Hwang',
  안: 'Ahn',
  송: 'Song',
  류: 'Ryu',
  홍: 'Hong',
};

export const ENGLISH_NAMES: Record<string, string> = {
  // 영어 → 한글 음역
  john: '존',
  mary: '메리',
  tom: '톰',
  jane: '제인',
  mike: '마이크',
  sarah: '사라',
  david: '데이비드',
  emily: '에밀리',
  james: '제임스',
  anna: '안나',
  peter: '피터',
  susan: '수잔',
  robert: '로버트',
  lisa: '리사',
  michael: '마이클',
  jennifer: '제니퍼',
  william: '윌리엄',
  elizabeth: '엘리자베스',
  chris: '크리스',
  jessica: '제시카',
};

// ============================================
// 대명사 사전
// ============================================

export const KO_PRONOUNS_TO_EN: Record<string, string> = {
  // 주격
  그는: 'he',
  그가: 'he',
  그녀는: 'she',
  그녀가: 'she',
  그것은: 'it',
  그것이: 'it',
  그들은: 'they',
  그들이: 'they',
  우리는: 'we',
  우리가: 'we',
  나는: 'I',
  내가: 'I',
  너는: 'you',
  네가: 'you',

  // 목적격
  그를: 'him',
  그에게: 'him',
  그녀를: 'her',
  그녀에게: 'her',
  그것을: 'it',
  그들을: 'them',
  그들에게: 'them',
  우리를: 'us',
  우리에게: 'us',
  나를: 'me',
  나에게: 'me',
  너를: 'you',
  너에게: 'you',

  // 소유격
  그의: 'his',
  그녀의: 'her',
  그것의: 'its',
  그들의: 'their',
  우리의: 'our',
  나의: 'my',
  내: 'my',
  너의: 'your',
  네: 'your',
};

export const EN_PRONOUNS_TO_KO: Record<
  string,
  { subject: string; object: string; possessive: string }
> = {
  he: { subject: '그는', object: '그를', possessive: '그의' },
  she: { subject: '그녀는', object: '그녀를', possessive: '그녀의' },
  it: { subject: '그것은', object: '그것을', possessive: '그것의' },
  they: { subject: '그들은', object: '그들을', possessive: '그들의' },
  we: { subject: '우리는', object: '우리를', possessive: '우리의' },
  i: { subject: '나는', object: '나를', possessive: '나의' },
  you: { subject: '너는', object: '너를', possessive: '너의' },
  him: { subject: '그는', object: '그를', possessive: '그의' },
  her: { subject: '그녀는', object: '그녀를', possessive: '그녀의' },
  them: { subject: '그들은', object: '그들을', possessive: '그들의' },
  us: { subject: '우리는', object: '우리를', possessive: '우리의' },
  me: { subject: '나는', object: '나를', possessive: '나의' },
  his: { subject: '그는', object: '그를', possessive: '그의' },
  its: { subject: '그것은', object: '그것을', possessive: '그것의' },
  their: { subject: '그들은', object: '그들을', possessive: '그들의' },
  our: { subject: '우리는', object: '우리를', possessive: '우리의' },
  my: { subject: '나는', object: '나를', possessive: '나의' },
  your: { subject: '너는', object: '너를', possessive: '너의' },
};

// ============================================
// 구동사 사전
// ============================================

export const PHRASAL_VERBS_EN_TO_KO: Record<string, string> = {
  'get up': '일어나다',
  'got up': '일어났다',
  'wake up': '일어나다',
  'woke up': '일어났다',
  'go off': '울리다',
  'went off': '울렸다',
  'give up': '포기하다',
  'gave up': '포기했다',
  'pick up': '집다',
  'picked up': '집었다',
  'put on': '입다',
  'put off': '미루다',
  'take off': '벗다',
  'took off': '벗었다',
  'turn on': '켜다',
  'turned on': '켰다',
  'turn off': '끄다',
  'turned off': '껐다',
  'look at': '보다',
  'looked at': '봤다',
  'look for': '찾다',
  'looked for': '찾았다',
  'call back': '다시 전화하다',
  'called back': '다시 전화했다',
  'come back': '돌아오다',
  'came back': '돌아왔다',
  'go back': '돌아가다',
  'went back': '돌아갔다',
  'sit down': '앉다',
  'sat down': '앉았다',
  'stand up': '일어서다',
  'stood up': '일어섰다',
  'show up': '나타나다',
  'showed up': '나타났다',
  'work out': '운동하다',
  'worked out': '운동했다',
  'find out': '알아내다',
  'found out': '알아냈다',
  'figure out': '이해하다',
  'figured out': '이해했다',
  'run out': '다 떨어지다',
  'ran out': '다 떨어졌다',
  'hang out': '놀다',
  'hung out': '놀았다',
  'catch up': '따라잡다',
  'caught up': '따라잡았다',
  'make up': '화해하다',
  'made up': '화해했다',
  'break up': '헤어지다',
  'broke up': '헤어졌다',
  'set up': '준비하다',
  'hear from': '연락받다',
  'heard from': '연락받았다',
};

export const PHRASAL_VERBS_KO_TO_EN: Record<string, string> = {
  일어났다: 'got up',
  일어나다: 'get up',
  일어났어: 'got up',
  일어나: 'get up',
};

// ============================================
// 문화 표현 사전
// ============================================

export const CULTURAL_EXPRESSIONS_KO_TO_EN: Record<string, string> = {
  // 설날
  설날: 'Lunar New Year',
  세배: "New Year's bow",
  세배돈: "New Year's money",
  떡국: 'rice cake soup',

  // 추석
  추석: 'Chuseok',
  송편: 'songpyeon',

  // 일상
  잘먹겠습니다: "Let's eat / Thank you for the meal",
  잘먹었습니다: 'Thank you for the meal',
  화이팅: 'Fighting / Good luck',
  파이팅: 'Fighting / Good luck',
  수고하셨습니다: 'Good work / Thank you for your hard work',
  수고하세요: 'Keep up the good work',

  // 호칭
  형: 'older brother',
  오빠: 'older brother',
  누나: 'older sister',
  언니: 'older sister',
  선배: 'senior',
  후배: 'junior',
};

export const CULTURAL_EXPRESSIONS_EN_TO_KO: Record<string, string> = {
  thanksgiving: '추수감사절',
  'turkey day': '추수감사절',
  christmas: '크리스마스',
  halloween: '할로윈',
  'new year': '새해',
  "new year's day": '새해 첫날',
  "new year's eve": '새해 전야',
  easter: '부활절',
  "valentine's day": '발렌타인데이',
  "mother's day": '어머니날',
  "father's day": '아버지날',
};

// ============================================
// 비유/관용 표현 사전
// ============================================

export const FIGURATIVE_EN_TO_KO: Record<string, string> = {
  'ray of sunshine': '한 줄기 빛',
  'light up a room': '분위기를 밝게 하다',
  'piece of cake': '식은 죽 먹기',
  'break a leg': '행운을 빌어',
  'under the weather': '몸이 안 좋은',
  'hit the hay': '잠자리에 들다',
  'spill the beans': '비밀을 누설하다',
  'in your court': '네 차례야',
  'burn the midnight oil': '밤늦게까지 일하다',
  'raining cats and dogs': '비가 억수로 오다',
};

// ============================================
// 문맥 추적기 클래스
// ============================================

export interface Entity {
  name: string;
  englishName: string;
  gender: 'male' | 'female' | 'neutral';
  role: 'subject' | 'object';
}

export class ContextTracker {
  private entities: Entity[] = [];
  private lastSubject: Entity | null = null;
  private lastObject: Entity | null = null;

  /**
   * 엔티티 등록 (문장에서 고유명사 발견 시)
   */
  registerEntity(koreanName: string, role: 'subject' | 'object' = 'subject'): Entity | null {
    const englishName = KOREAN_NAMES[koreanName];
    if (!englishName) return null;

    // 성별 추정 (한국 이름 기반)
    const femaleNames = [
      '영희',
      '지은',
      '수진',
      '미영',
      '은지',
      '지연',
      '유진',
      '서연',
      '민지',
      '수아',
      '하은',
      '지민',
      '서윤',
      '채원',
      '예은',
    ];
    const gender = femaleNames.includes(koreanName) ? 'female' : 'male';

    const entity: Entity = {
      name: koreanName,
      englishName,
      gender,
      role,
    };

    this.entities.push(entity);

    if (role === 'subject') {
      this.lastSubject = entity;
    } else {
      this.lastObject = entity;
    }

    return entity;
  }

  /**
   * 대명사 해석 (그는, 그녀는 등)
   */
  resolvePronoun(pronoun: string): Entity | null {
    if (pronoun.includes('그녀') || pronoun.includes('she')) {
      return this.entities.find((e) => e.gender === 'female') || null;
    }
    if (pronoun.includes('그') || pronoun.includes('he')) {
      return this.entities.find((e) => e.gender === 'male') || null;
    }
    if (pronoun.includes('그것') || pronoun.includes('it')) {
      return this.lastObject;
    }
    return null;
  }

  /**
   * 마지막 주어 반환
   */
  getLastSubject(): Entity | null {
    return this.lastSubject;
  }

  /**
   * 마지막 목적어 반환
   */
  getLastObject(): Entity | null {
    return this.lastObject;
  }

  /**
   * 초기화
   */
  reset(): void {
    this.entities = [];
    this.lastSubject = null;
    this.lastObject = null;
  }
}

// ============================================
// 헬퍼 함수들
// ============================================

/**
 * 한국어 이름을 영어로 변환
 */
export function translateKoreanName(name: string): string | null {
  // 조사 제거
  const cleanName = name.replace(/[은는이가을를의에게와과]$/, '');
  return KOREAN_NAMES[cleanName] || null;
}

/**
 * 영어 이름을 한국어로 변환
 */
export function translateEnglishName(name: string): string | null {
  return ENGLISH_NAMES[name.toLowerCase()] || null;
}

/**
 * 한국어 대명사를 영어로 변환
 */
export function translateKoreanPronoun(pronoun: string): string | null {
  return KO_PRONOUNS_TO_EN[pronoun] || null;
}

/**
 * 영어 대명사를 한국어로 변환 (문맥에 맞는 형태)
 */
export function translateEnglishPronoun(
  pronoun: string,
  form: 'subject' | 'object' | 'possessive' = 'subject',
): string | null {
  const entry = EN_PRONOUNS_TO_KO[pronoun.toLowerCase()];
  return entry ? entry[form] : null;
}

/**
 * 구동사 번역 (영→한)
 */
export function translatePhrasalVerb(phrase: string): string | null {
  return PHRASAL_VERBS_EN_TO_KO[phrase.toLowerCase()] || null;
}

/**
 * 문화 표현 번역 (한→영)
 */
export function translateCulturalKoToEn(text: string): string | null {
  return CULTURAL_EXPRESSIONS_KO_TO_EN[text] || null;
}

/**
 * 문화 표현 번역 (영→한)
 */
export function translateCulturalEnToKo(text: string): string | null {
  return CULTURAL_EXPRESSIONS_EN_TO_KO[text.toLowerCase()] || null;
}

/**
 * 비유 표현 번역 (영→한)
 */
export function translateFigurativeEnToKo(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [en, ko] of Object.entries(FIGURATIVE_EN_TO_KO)) {
    if (lower.includes(en)) {
      return ko;
    }
  }
  return null;
}

/**
 * 텍스트에서 구동사 찾아 번역
 */
export function replacePhrasalVerbs(text: string): string {
  let result = text;
  // 긴 구동사부터 매칭 (예: "wake up"이 "wake"보다 먼저)
  const sorted = Object.entries(PHRASAL_VERBS_EN_TO_KO).sort((a, b) => b[0].length - a[0].length);

  for (const [en, ko] of sorted) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, ko);
  }
  return result;
}

/**
 * 텍스트에서 한국어 이름 찾아 영어로 변환
 */
export function replaceKoreanNames(text: string): string {
  let result = text;

  // 긴 이름부터 매칭
  const sorted = Object.entries(KOREAN_NAMES).sort((a, b) => b[0].length - a[0].length);

  for (const [ko, en] of sorted) {
    // 조사 포함 패턴: 철수는, 철수가, 철수를 등
    const patterns = [
      `${ko}는`,
      `${ko}은`,
      `${ko}가`,
      `${ko}이`,
      `${ko}를`,
      `${ko}을`,
      `${ko}의`,
      `${ko}에게`,
      `${ko}와`,
      `${ko}과`,
      `${ko}한테`,
    ];

    // 1글자 이름(성씨)은 조사와 함께 사용될 때만 매칭 (단독 매칭 방지)
    // "한" → "Han" 변환이 "좋아한다"에서 발생하는 문제 방지
    if (ko.length >= 2) {
      patterns.push(ko);
    }

    for (const pattern of patterns) {
      if (result.includes(pattern)) {
        // 조사에 따른 영어 처리
        let replacement = en;
        if (pattern.endsWith('의')) {
          replacement = `${en}'s`;
        } else if (pattern.endsWith('에게') || pattern.endsWith('한테')) {
          replacement = `to ${en}`;
        } else if (pattern.endsWith('와') || pattern.endsWith('과')) {
          replacement = `${en} and`;
        }
        result = result.replace(new RegExp(pattern, 'g'), replacement);
      }
    }
  }

  return result;
}

/**
 * 텍스트에서 영어 이름 찾아 한국어로 변환
 */
export function replaceEnglishNames(text: string): string {
  let result = text;

  for (const [en, ko] of Object.entries(ENGLISH_NAMES)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, ko);
  }

  return result;
}

/**
 * 텍스트에서 한국어 대명사 찾아 영어로 변환
 */
export function replaceKoreanPronouns(text: string): string {
  let result = text;

  // 긴 대명사부터 매칭
  const sorted = Object.entries(KO_PRONOUNS_TO_EN).sort((a, b) => b[0].length - a[0].length);

  for (const [ko, en] of sorted) {
    result = result.replace(new RegExp(ko, 'g'), en);
  }

  return result;
}

/**
 * 텍스트에서 영어 대명사 찾아 한국어로 변환
 */
export function replaceEnglishPronouns(text: string): string {
  let result = text;

  // 주어 위치 대명사 (문장 시작 또는 주어 역할)
  const subjectPatterns: Array<[RegExp, string]> = [
    [/\bHe\b/g, '그는'],
    [/\bShe\b/g, '그녀는'],
    [/\bIt\b/g, '그것은'],
    [/\bThey\b/g, '그들은'],
    [/\bWe\b/g, '우리는'],
    [/\bI\b/g, '나는'],
    [/\bYou\b/g, '너는'],
  ];

  // 목적어/소유격 대명사
  const objectPatterns: Array<[RegExp, string]> = [
    [/\bhim\b/gi, '그를'],
    [/\bher\b/gi, '그녀를'],
    [/\bthem\b/gi, '그들을'],
    [/\bus\b/gi, '우리를'],
    [/\bme\b/gi, '나를'],
    [/\bhis\b/gi, '그의'],
    [/\bits\b/gi, '그것의'],
    [/\btheir\b/gi, '그들의'],
    [/\bour\b/gi, '우리의'],
    [/\bmy\b/gi, '나의'],
    [/\byour\b/gi, '너의'],
  ];

  for (const [pattern, replacement] of [...subjectPatterns, ...objectPatterns]) {
    result = result.replace(pattern, replacement);
  }

  return result;
}
