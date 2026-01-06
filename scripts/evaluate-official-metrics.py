#!/usr/bin/env python3
"""
번역기 공식 지표 평가 스크립트

METEOR, chrF, BLEU, TER 점수를 계산하여 JSON으로 저장합니다.
prebuild 단계에서 실행되며, 결과는 apps/tools/public/data/에 저장됩니다.

사용 라이브러리 (모두 오픈소스):
- sacrebleu (Apache 2.0): BLEU, chrF, TER
- nltk (Apache 2.0): METEOR

실행: python3 scripts/evaluate-official-metrics.py
"""

import json
import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

# 스크립트 위치 기준으로 프로젝트 루트 찾기
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
TOOLS_APP = PROJECT_ROOT / "apps" / "tools"
OUTPUT_DIR = TOOLS_APP / "public" / "data"

def check_dependencies():
    """필요한 Python 패키지 확인"""
    missing = []
    try:
        import sacrebleu
    except ImportError:
        missing.append("sacrebleu")

    try:
        import nltk
    except ImportError:
        missing.append("nltk")

    if missing:
        print(f"Missing packages: {', '.join(missing)}")
        print(f"Install with: pip3 install {' '.join(missing)}")
        return False
    return True

def get_test_sentences():
    """평가용 테스트 문장 (다양한 난이도)"""
    return {
        "korean": [
            # 간단
            "안녕하세요.",
            "감사합니다.",
            "좋은 아침입니다.",
            "저는 학생입니다.",
            "오늘 날씨가 좋습니다.",
            "배가 고파요.",
            "물 한 잔 주세요.",
            "어디 가세요?",
            "몇 시예요?",
            "잘 자요.",
            # 중급
            "저는 서울에서 왔습니다.",
            "한국어를 공부하고 있어요.",
            "내일 친구를 만날 거예요.",
            "이 음식은 정말 맛있어요.",
            "지하철역이 어디에 있어요?",
            "주말에 영화를 봤어요.",
            "커피 마시러 갈래요?",
            "이 책은 재미있어요.",
            "한국 문화에 관심이 있어요.",
            "비가 올 것 같아요.",
            # 고급
            "기술의 발전으로 우리의 생활이 편리해졌습니다.",
            "환경 보호는 우리 모두의 책임입니다.",
            "교육은 미래를 위한 가장 중요한 투자입니다.",
            "다양한 문화를 이해하는 것이 중요합니다.",
            "건강을 위해 규칙적으로 운동해야 합니다.",
            "경제 성장과 환경 보호의 균형이 필요합니다.",
            "인공지능이 많은 산업을 변화시키고 있습니다.",
            "세계화로 인해 국가 간 교류가 증가했습니다.",
            "독서는 지식과 상상력을 키워줍니다.",
            "행복은 물질적인 것만으로 측정할 수 없습니다.",
        ],
        "english": [
            # Simple
            "Hello.",
            "Thank you.",
            "Good morning.",
            "I am a student.",
            "The weather is nice today.",
            "I am hungry.",
            "Please give me a glass of water.",
            "Where are you going?",
            "What time is it?",
            "Good night.",
            # Intermediate
            "I am from Seoul.",
            "I am studying Korean.",
            "I will meet my friend tomorrow.",
            "This food is really delicious.",
            "Where is the subway station?",
            "I watched a movie on the weekend.",
            "Do you want to go get coffee?",
            "This book is interesting.",
            "I am interested in Korean culture.",
            "It looks like it will rain.",
            # Advanced
            "Technological advances have made our lives more convenient.",
            "Environmental protection is everyone's responsibility.",
            "Education is the most important investment for the future.",
            "Understanding diverse cultures is important.",
            "You should exercise regularly for your health.",
            "A balance between economic growth and environmental protection is needed.",
            "Artificial intelligence is transforming many industries.",
            "Globalization has increased exchanges between countries.",
            "Reading cultivates knowledge and imagination.",
            "Happiness cannot be measured by material things alone.",
        ]
    }

def run_translations(test_data):
    """번역기를 실행하여 번역 결과 생성"""
    print("  Generating translations...")

    # vitest를 통해 번역 실행 (패키지 의존성 문제 해결)
    test_file_content = '''
import { describe, it, expect } from 'vitest';
import { translate } from './v2.1/index';
import * as fs from 'fs';

const testData = ''' + json.dumps(test_data) + ''';

describe('Generate translations for metrics', () => {
  it('generates all translations', () => {
    const results = {
      koToEn: [] as {src: string, mt: string, ref: string}[],
      enToKo: [] as {src: string, mt: string, ref: string}[],
    };

    // Ko→En
    for (let i = 0; i < testData.korean.length; i++) {
      const src = testData.korean[i];
      const ref = testData.english[i];
      const mt = translate(src, 'ko-en');
      results.koToEn.push({ src, mt, ref });
    }

    // En→Ko
    for (let i = 0; i < testData.english.length; i++) {
      const src = testData.english[i];
      const ref = testData.korean[i];
      const mt = translate(src, 'en-ko');
      results.enToKo.push({ src, mt, ref });
    }

    fs.writeFileSync('/tmp/translation_results_for_metrics.json', JSON.stringify(results, null, 2));
    expect(results.koToEn.length).toBe(testData.korean.length);
  });
});
'''

    # 임시 테스트 파일 생성
    test_file_path = TOOLS_APP / "app" / "tools" / "translator" / "_metrics_gen.test.ts"
    test_file_path.write_text(test_file_content)

    try:
        # vitest 실행
        result = subprocess.run(
            ["pnpm", "--filter", "tools", "exec", "vitest", "run", "_metrics_gen.test.ts", "--reporter=dot"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=120
        )

        if result.returncode != 0:
            print(f"    Warning: vitest returned {result.returncode}")
            print(f"    stderr: {result.stderr[:500] if result.stderr else 'none'}")

        # 결과 파일 읽기
        result_file = Path("/tmp/translation_results_for_metrics.json")
        if result_file.exists():
            with open(result_file) as f:
                return json.load(f)
        else:
            print("    Error: Translation results file not found")
            return None

    finally:
        # 임시 파일 삭제
        if test_file_path.exists():
            test_file_path.unlink()

def calculate_metrics(translations):
    """공식 지표 계산"""
    import sacrebleu
    import nltk
    from nltk.translate.meteor_score import meteor_score
    from nltk.tokenize import word_tokenize

    # NLTK 데이터 다운로드 (조용히)
    for package in ['wordnet', 'punkt', 'punkt_tab', 'omw-1.4']:
        try:
            nltk.download(package, quiet=True)
        except:
            pass

    results = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "testCount": len(translations["koToEn"]),
        "koToEn": {},
        "enToKo": {}
    }

    # Ko→En 평가
    print("  Calculating Ko→En metrics...")
    ko_en_mt = [item["mt"] for item in translations["koToEn"]]
    ko_en_ref = [[item["ref"] for item in translations["koToEn"]]]

    # SacreBLEU 지표
    results["koToEn"]["chrF"] = round(sacrebleu.corpus_chrf(ko_en_mt, ko_en_ref).score, 2)
    results["koToEn"]["bleu"] = round(sacrebleu.corpus_bleu(ko_en_mt, ko_en_ref).score, 2)
    results["koToEn"]["ter"] = round(sacrebleu.corpus_ter(ko_en_mt, ko_en_ref).score, 2)

    # METEOR
    meteor_scores = []
    for item in translations["koToEn"]:
        try:
            ref_tokens = word_tokenize(item["ref"].lower())
            hyp_tokens = word_tokenize(item["mt"].lower())
            score = meteor_score([ref_tokens], hyp_tokens)
            meteor_scores.append(score)
        except:
            meteor_scores.append(0)
    results["koToEn"]["meteor"] = round(sum(meteor_scores) / len(meteor_scores), 4)

    # En→Ko 평가
    print("  Calculating En→Ko metrics...")
    en_ko_mt = [item["mt"] for item in translations["enToKo"]]
    en_ko_ref = [[item["ref"] for item in translations["enToKo"]]]

    # SacreBLEU 지표
    results["enToKo"]["chrF"] = round(sacrebleu.corpus_chrf(en_ko_mt, en_ko_ref).score, 2)
    results["enToKo"]["bleu"] = round(sacrebleu.corpus_bleu(en_ko_mt, en_ko_ref).score, 2)
    results["enToKo"]["ter"] = round(sacrebleu.corpus_ter(en_ko_mt, en_ko_ref).score, 2)

    # METEOR (한국어는 문자 단위)
    meteor_scores = []
    for item in translations["enToKo"]:
        try:
            ref_chars = list(item["ref"].replace(" ", ""))
            hyp_chars = list(item["mt"].replace(" ", ""))
            score = meteor_score([ref_chars], hyp_chars)
            meteor_scores.append(score)
        except:
            meteor_scores.append(0)
    results["enToKo"]["meteor"] = round(sum(meteor_scores) / len(meteor_scores), 4)

    return results

def main():
    print("=" * 50)
    print("Official Metrics Evaluation")
    print("=" * 50)

    # 의존성 확인
    if not check_dependencies():
        print("\nSkipping metrics evaluation (missing dependencies)")
        return 1

    # 출력 디렉토리 생성
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 테스트 문장 가져오기
    test_data = get_test_sentences()
    print(f"\nTest sentences: {len(test_data['korean'])} pairs")

    # 번역 실행
    translations = run_translations(test_data)
    if not translations:
        print("\nFailed to generate translations")
        return 1

    print(f"  Generated {len(translations['koToEn'])} Ko→En translations")
    print(f"  Generated {len(translations['enToKo'])} En→Ko translations")

    # 지표 계산
    print("\nCalculating official metrics...")
    metrics = calculate_metrics(translations)

    # 결과 저장
    output_file = OUTPUT_DIR / "official-metrics.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    print(f"\nResults saved to: {output_file}")

    # 결과 출력
    print("\n" + "=" * 50)
    print("Results Summary")
    print("=" * 50)
    print(f"\n{'Metric':<12} {'Ko→En':>10} {'En→Ko':>10}")
    print("-" * 34)
    print(f"{'METEOR':<12} {metrics['koToEn']['meteor']:>10.4f} {metrics['enToKo']['meteor']:>10.4f}")
    print(f"{'chrF':<12} {metrics['koToEn']['chrF']:>10.2f} {metrics['enToKo']['chrF']:>10.2f}")
    print(f"{'BLEU':<12} {metrics['koToEn']['bleu']:>10.2f} {metrics['enToKo']['bleu']:>10.2f}")
    print(f"{'TER':<12} {metrics['koToEn']['ter']:>10.2f} {metrics['enToKo']['ter']:>10.2f}")
    print("-" * 34)

    print("\n" + "=" * 50)

    return 0

if __name__ == "__main__":
    sys.exit(main())
