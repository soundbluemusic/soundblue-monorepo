import { describe, expect, it } from 'vitest';
import {
  applyFinalConsonantRule,
  applyInitialLaw,
  applyRyeolYul,
  applySiot,
  getSiotCompounds,
  needsSiot,
  removeSiot,
  reverseInitialLaw,
  selectAOrEo,
  toPronunciation,
} from '../src';

describe('phonetics', () => {
  describe('selectAOrEo (모음조화)', () => {
    it('should return 아 for 양성모음 (positive vowels)', () => {
      expect(selectAOrEo('가')).toBe('ㅏ');
      expect(selectAOrEo('오')).toBe('ㅏ');
      expect(selectAOrEo('사')).toBe('ㅏ');
    });

    it('should return 어 for 음성모음 (negative vowels)', () => {
      expect(selectAOrEo('서')).toBe('ㅓ');
      expect(selectAOrEo('먹')).toBe('ㅓ');
      expect(selectAOrEo('주')).toBe('ㅓ');
    });

    it('should return 어 as default', () => {
      expect(selectAOrEo('')).toBe('ㅓ');
    });
  });

  describe('applyFinalConsonantRule (받침 대표음)', () => {
    it('should convert to representative final consonants', () => {
      // ㄱ 계열
      expect(applyFinalConsonantRule('ㄱ')).toBe('ㄱ');
      expect(applyFinalConsonantRule('ㄲ')).toBe('ㄱ');
      expect(applyFinalConsonantRule('ㅋ')).toBe('ㄱ');

      // ㄴ 계열
      expect(applyFinalConsonantRule('ㄴ')).toBe('ㄴ');
      expect(applyFinalConsonantRule('ㄵ')).toBe('ㄴ');

      // ㄷ 계열
      expect(applyFinalConsonantRule('ㄷ')).toBe('ㄷ');
      expect(applyFinalConsonantRule('ㅅ')).toBe('ㄷ');
      expect(applyFinalConsonantRule('ㅆ')).toBe('ㄷ');
      expect(applyFinalConsonantRule('ㅈ')).toBe('ㄷ');

      // ㄹ 계열
      expect(applyFinalConsonantRule('ㄹ')).toBe('ㄹ');
      expect(applyFinalConsonantRule('ㄼ')).toBe('ㄹ');

      // ㅁ 계열
      expect(applyFinalConsonantRule('ㅁ')).toBe('ㅁ');
      expect(applyFinalConsonantRule('ㄻ')).toBe('ㅁ');

      // ㅂ 계열
      expect(applyFinalConsonantRule('ㅂ')).toBe('ㅂ');
      expect(applyFinalConsonantRule('ㅍ')).toBe('ㅂ');
    });
  });

  describe('toPronunciation', () => {
    it('should apply phonetic rules to text', () => {
      // Basic test - the function should return a string
      const result = toPronunciation('한글');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('applyInitialLaw (두음법칙)', () => {
    describe('제10항: ㄴ계 두음법칙', () => {
      it('should apply 녀→여 rule', () => {
        expect(applyInitialLaw('녀자')).toBe('여자');
        expect(applyInitialLaw('녀성')).toBe('여성');
      });

      it('should apply 뇨→요 rule', () => {
        expect(applyInitialLaw('뇨강')).toBe('요강');
      });

      it('should apply 뉴→유 rule', () => {
        expect(applyInitialLaw('뉴월')).toBe('유월');
      });

      it('should apply 니→이 rule', () => {
        expect(applyInitialLaw('니승')).toBe('이승');
      });
    });

    describe('제11항: ㄹ계 두음법칙 (야,여,요,유,이 앞)', () => {
      it('should apply 랴→야 rule', () => {
        expect(applyInitialLaw('랴량')).toBe('야량');
      });

      it('should apply 려→여 rule', () => {
        expect(applyInitialLaw('려행')).toBe('여행');
        expect(applyInitialLaw('려관')).toBe('여관');
      });

      it('should apply 례→예 rule', () => {
        expect(applyInitialLaw('례의')).toBe('예의');
      });

      it('should apply 료→요 rule', () => {
        expect(applyInitialLaw('료리')).toBe('요리');
      });

      it('should apply 류→유 rule', () => {
        expect(applyInitialLaw('류행')).toBe('유행');
      });

      it('should apply 리→이 rule', () => {
        expect(applyInitialLaw('리과')).toBe('이과');
      });
    });

    describe('제12항: ㄹ계 두음법칙 (아,애,오,우,으 앞)', () => {
      it('should apply 라→나 rule', () => {
        expect(applyInitialLaw('라원')).toBe('나원');
      });

      it('should apply 래→내 rule', () => {
        expect(applyInitialLaw('래일')).toBe('내일');
      });

      it('should apply 로→노 rule', () => {
        expect(applyInitialLaw('로동')).toBe('노동');
        expect(applyInitialLaw('로인')).toBe('노인');
      });

      it('should apply 루→누 rule', () => {
        expect(applyInitialLaw('루각')).toBe('누각');
      });
    });

    it('should not apply to word-internal positions by default', () => {
      expect(applyInitialLaw('대한민국')).toBe('대한민국');
    });

    it('should apply to word-internal positions when specified', () => {
      expect(applyInitialLaw('대리점', false)).toBe('대이점');
    });
  });

  describe('reverseInitialLaw (두음법칙 역변환)', () => {
    // 참고: 단순 역변환만으로는 원래 한자가 '녀'인지 '려'인지 구분 불가
    // 여→려로 역변환 (ㄹ계열이 더 일반적)
    it('should reverse 여→려 for Sino-Korean words', () => {
      expect(reverseInitialLaw('여행')).toBe('려행'); // 旅行
    });

    it('should reverse 이→리 for Sino-Korean words', () => {
      expect(reverseInitialLaw('이과')).toBe('리과'); // 理科
    });

    it('should reverse 유→류 for Sino-Korean words', () => {
      expect(reverseInitialLaw('유행')).toBe('류행'); // 流行
    });
  });

  describe('applyRyeolYul (열/률 선택)', () => {
    it('should return 열 after vowel', () => {
      expect(applyRyeolYul('비', '률')).toBe('율');
      expect(applyRyeolYul('비', '렬')).toBe('열');
    });

    it('should return 률 after consonant', () => {
      expect(applyRyeolYul('확', '률')).toBe('률');
      expect(applyRyeolYul('백', '렬')).toBe('렬');
    });
  });

  describe('사이시옷 (맞춤법 제30항)', () => {
    describe('needsSiot', () => {
      it('should return true for 된소리화 cases', () => {
        // 뒷말 첫소리가 ㄱ,ㄷ,ㅂ,ㅅ,ㅈ인 경우
        expect(needsSiot('나무', '가지')).toBe(true);
        expect(needsSiot('바다', '가')).toBe(true);
        expect(needsSiot('배', '길')).toBe(true);
      });

      it('should return true for ㄴ/ㅁ cases', () => {
        // 뒷말 첫소리가 ㄴ,ㅁ인 경우
        expect(needsSiot('아래', '니')).toBe(true);
        expect(needsSiot('비', '물')).toBe(true);
      });

      it('should return true for vowel (ㄴㄴ) cases', () => {
        // 뒷말 첫소리가 모음인 경우
        expect(needsSiot('나무', '잎')).toBe(true);
      });

      it('should return false when first word has batchim', () => {
        // 앞말에 받침이 있으면 사이시옷 불필요
        expect(needsSiot('산', '길')).toBe(false); // 산 has ㄴ batchim
        expect(needsSiot('강', '가')).toBe(false); // 강 has ㅇ batchim
        expect(needsSiot('집', '안')).toBe(false); // 집 has ㅂ batchim
      });
    });

    describe('applySiot', () => {
      it('should apply siot to compound words', () => {
        expect(applySiot('나무', '잎')).toBe('나뭇잎');
        expect(applySiot('바다', '가')).toBe('바닷가');
        expect(applySiot('배', '길')).toBe('뱃길');
        expect(applySiot('코', '등')).toBe('콧등');
      });

      it('should use registered compounds when available', () => {
        expect(applySiot('해', '볕')).toBe('햇볕');
        expect(applySiot('해', '살')).toBe('햇살');
        expect(applySiot('깨', '잎')).toBe('깻잎');
      });

      it('should not apply siot when not needed', () => {
        // 앞말에 받침이 있으면 사이시옷 불필요
        expect(applySiot('산', '길')).toBe('산길'); // 산 has ㄴ batchim
        expect(applySiot('강', '가')).toBe('강가'); // 강 has ㅇ batchim
      });
    });

    describe('removeSiot', () => {
      it('should restore original words from siot compound', () => {
        const result1 = removeSiot('나뭇잎');
        expect(result1).toEqual({ first: '나무', second: '잎' });

        const result2 = removeSiot('바닷가');
        expect(result2).toEqual({ first: '바다', second: '가' });
      });

      it('should return null for non-siot words', () => {
        expect(removeSiot('학교')).toBeNull();
        expect(removeSiot('사과')).toBeNull();
      });
    });

    describe('getSiotCompounds', () => {
      it('should return compound dictionary', () => {
        const compounds = getSiotCompounds();
        expect(compounds['나무잎']).toBe('나뭇잎');
        expect(compounds['바다가']).toBe('바닷가');
      });

      it('should include 6 한자어 exceptions', () => {
        const compounds = getSiotCompounds();
        expect(compounds['곳간']).toBe('곳간');
        expect(compounds['셋방']).toBe('셋방');
        expect(compounds['숫자']).toBe('숫자');
        expect(compounds['찻간']).toBe('찻간');
        expect(compounds['툇간']).toBe('툇간');
        expect(compounds['횟수']).toBe('횟수');
      });
    });
  });
});
