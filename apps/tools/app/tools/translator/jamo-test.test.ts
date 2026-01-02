import { decompose, jamoEditDistance } from '@soundblue/hangul';
import { describe, it } from 'vitest';

describe('자모 유사도 문제 분석', () => {
  it('하고 vs 하구 거리 확인', () => {
    console.log('\n=== 자모 분석 ===');
    console.log('하 decompose:', decompose('하'));
    console.log('고 decompose:', decompose('고'));
    console.log('구 decompose:', decompose('구'));

    const distance = jamoEditDistance('하고', '하구');
    console.log('\n하고 vs 하구 거리:', distance);
    console.log('SIMILARITY_THRESHOLD (1.5) 이하면 매칭됨');
  });

  it('연결어미 -고 확인', () => {
    // -고 있다 패턴 확인
    const words = ['하고', '먹고', '가고', '오고'];
    console.log('\n=== 연결어미 -고 패턴 ===');
    for (const w of words) {
      console.log(`${w}: 끝이 '고'인가?`, w.endsWith('고'));
    }
  });
});
