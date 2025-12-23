import { describe, expect, test } from 'vitest';
import { translate } from './translator-service';

describe('양방향 번역 테스트 - 복합 문장', () => {
  test('한국어 → 영어: 복합 문장', () => {
    const input =
      '나는 오늘 아침 일찍 일어나서 운동을 하고 샤워를 한 후에 맛있는 아침식사를 먹었고, 회사에 출근해서 중요한 회의에 참석했으며, 점심시간에는 동료들과 함께 새로 생긴 중국집에서 짜장면을 먹었고, 오후에는 급한 프로젝트를 완성했다.';

    const expected =
      'I woke up early this morning, exercised and took a shower, then ate a delicious breakfast, went to work and attended an important meeting, ate jjajangmyeon at a newly opened Chinese restaurant with my colleagues during lunch time, and completed an urgent project in the afternoon.';

    const result = translate(input, 'ko-en');
    console.log('===== 한→영 번역 결과 =====');
    console.log('입력:', input);
    console.log('예상:', expected);
    console.log('실제:', result);
    console.log('');

    expect(result).toBe(expected);
  });

  test('영어 → 한국어: 복합 문장', () => {
    const input =
      'Yesterday I visited the newly opened art museum with my family, looked at beautiful paintings for two hours, bought interesting souvenirs at the gift shop, ate delicious pasta at a nearby Italian restaurant, and returned home happily because the weather was very nice.';

    const expected =
      '나는 어제 가족과 함께 새로 개관한 미술관을 방문했고, 두 시간 동안 아름다운 그림들을 봤으며, 기념품 가게에서 흥미로운 기념품을 샀고, 근처 이탈리아 식당에서 맛있는 파스타를 먹었으며, 날씨가 매우 좋아서 행복하게 집에 돌아왔다.';

    const result = translate(input, 'en-ko');
    console.log('===== 영→한 번역 결과 =====');
    console.log('입력:', input);
    console.log('예상:', expected);
    console.log('실제:', result);
    console.log('');

    expect(result).toBe(expected);
  });
});
