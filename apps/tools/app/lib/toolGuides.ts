/**
 * @fileoverview Tool Guide Content Data
 *
 * ⚠️ CRITICAL RULE: 모든 도구는 반드시 ToolGuide를 포함해야 합니다.
 * 새 도구 추가 시 이 파일에 해당 도구의 ko/en 가이드를 등록하세요.
 *
 * Localized guide content for all tools in the Tools app.
 * Each guide includes: purpose, usage instructions, and button descriptions.
 *
 * 필수 섹션 구조:
 * 1. 이 도구는 (About this tool) - 도구의 목적/용도
 * 2. 사용 방법 (How to use) - 단계별 사용 지침
 * 3. 버튼 설명 (Button guide) - 각 버튼/기능 설명
 *
 * @see .claude/rules/tools.md - 상세 규칙 문서
 * @module lib/toolGuides
 */

import type { ToolGuideSection } from '~/components/tools/ToolGuide';
import type { ToolType } from '~/stores/tool-store';

/**
 * Guide content for a single tool
 */
export interface ToolGuideContent {
  /** Collapsible header title */
  title: string;
  /** Sections: purpose, usage, buttons */
  sections: ToolGuideSection[];
}

/**
 * Localized guide content (ko/en)
 */
export type LocalizedGuideContent = {
  ko: ToolGuideContent;
  en: ToolGuideContent;
};

/**
 * All tool guides indexed by tool type
 */
export const TOOL_GUIDES: Record<ToolType, LocalizedGuideContent> = {
  // ========================================
  // 1. Metronome (메트로놈)
  // ========================================
  metronome: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: [
            '일정한 박자를 소리로 알려주는 메트로놈',
            '악기 연습이나 노래 연습 시 박자 맞추기에 유용',
          ],
        },
        {
          title: '사용 방법',
          items: [
            '슬라이더로 빠르기(BPM) 조절',
            '재생 버튼으로 시작/정지',
            '박자 숫자로 한 마디당 비트 수 설정',
          ],
        },
        {
          title: '버튼 설명',
          items: ['▶ 재생: 메트로놈 시작', '⏸ 정지: 메트로놈 멈춤', '초기화: 기본값으로 복원'],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: [
            'A metronome that keeps steady beats with sound',
            'Useful for practicing instruments or singing in time',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Use the slider to adjust speed (BPM)',
            'Press play to start/stop',
            'Change the number to set beats per bar',
          ],
        },
        {
          title: 'Button guide',
          items: ['▶ Play: Start metronome', '⏸ Pause: Stop metronome', 'Reset: Restore defaults'],
        },
      ],
    },
  },

  // ========================================
  // 2. Drum Machine (드럼머신)
  // ========================================
  drumMachine: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: ['드럼 비트를 직접 만드는 도구', '격자에 소리를 배치해서 리듬 패턴 생성'],
        },
        {
          title: '사용 방법',
          items: [
            '격자의 칸을 클릭하여 소리 배치',
            '슬라이더로 빠르기(BPM) 조절',
            '프리셋으로 예시 패턴 불러오기',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            '▶ 재생: 만든 패턴 재생',
            '지우기: 모든 소리 제거',
            '프리셋: 미리 만든 패턴 선택',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: ['Create your own drum beats', 'Place sounds on a grid to make rhythm patterns'],
        },
        {
          title: 'How to use',
          items: [
            'Click grid cells to place sounds',
            'Adjust speed with the slider',
            'Load example patterns from presets',
          ],
        },
        {
          title: 'Button guide',
          items: [
            '▶ Play: Play your pattern',
            'Clear: Remove all sounds',
            'Preset: Choose a pre-made pattern',
          ],
        },
      ],
    },
  },

  // ========================================
  // 3. Delay Calculator (딜레이 계산기)
  // ========================================
  delayCalculator: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: [
            'BPM에 맞는 딜레이/에코 시간을 계산하는 도구',
            '음악 제작 시 박자에 맞는 효과 설정에 유용',
          ],
        },
        {
          title: '사용 방법',
          items: [
            'BPM 숫자 입력 또는 TAP으로 측정',
            '표에서 필요한 딜레이 값 확인',
            '값을 클릭하면 복사됨',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'TAP: 박자에 맞춰 클릭하여 BPM 측정',
            '초기화: 기본값으로 복원',
            '스페이스바: TAP 버튼과 동일',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: [
            'Calculate delay/echo times based on BPM',
            'Useful for setting effects that match the beat',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Enter BPM or measure with TAP',
            'Find the delay value you need in the table',
            'Click a value to copy it',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'TAP: Click to the beat to measure BPM',
            'Reset: Restore defaults',
            'Spacebar: Same as TAP button',
          ],
        },
      ],
    },
  },

  // ========================================
  // 4. Spell Checker (한국어 맞춤법 검사기)
  // ========================================
  spellChecker: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: ['한글 맞춤법을 검사하는 도구', '띄어쓰기, 오타 등을 찾아 수정 제안'],
        },
        {
          title: '사용 방법',
          items: ['검사할 텍스트 입력', '검사하기 버튼 클릭', '표시된 오류를 클릭하여 수정'],
        },
        {
          title: '버튼 설명',
          items: [
            '검사하기: 맞춤법 오류 찾기',
            '초기화: 입력 내용 삭제',
            '복사: 수정된 텍스트 복사',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: ['Check Korean spelling', 'Find spacing and typing errors with suggestions'],
        },
        {
          title: 'How to use',
          items: [
            'Enter text to check',
            'Click the Check button',
            'Click highlighted errors to fix them',
          ],
        },
        {
          title: 'Button guide',
          items: ['Check: Find spelling errors', 'Reset: Clear input', 'Copy: Copy corrected text'],
        },
      ],
    },
  },

  // ========================================
  // 5. English Spell Checker (영어 맞춤법 검사기)
  // ========================================
  englishSpellChecker: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: ['영어 철자를 검사하는 도구', '오타를 찾아 올바른 단어 제안'],
        },
        {
          title: '사용 방법',
          items: ['검사할 영어 텍스트 입력', 'Check 버튼 클릭', '표시된 오류를 클릭하여 수정'],
        },
        {
          title: '버튼 설명',
          items: ['Check: 철자 검사 실행', 'Reset: 입력 내용 삭제', '제안 클릭: 해당 단어로 교체'],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: ['Check English spelling', 'Find typos and suggest correct words'],
        },
        {
          title: 'How to use',
          items: [
            'Enter English text to check',
            'Click the Check button',
            'Click highlighted errors to fix them',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Check: Run spell check',
            'Reset: Clear input',
            'Click suggestion: Replace with that word',
          ],
        },
      ],
    },
  },

  // ========================================
  // 6. QR Generator (QR 생성기)
  // ========================================
  qr: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: ['링크나 글자를 QR 코드로 만드는 도구', '명함, 링크 공유, 홍보 등에 유용'],
        },
        {
          title: '사용 방법',
          items: [
            '링크(URL) 또는 텍스트 입력',
            '원하면 색상과 크기 변경',
            '저장 또는 복사 버튼으로 사용',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'Save: 이미지 파일로 저장',
            'Copy: 이미지를 복사',
            '색상 선택: QR 코드 색상 변경',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: [
            'Create QR codes from links or text',
            'Useful for business cards, sharing links, promotions',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Enter a URL or text',
            'Change colors and size if needed',
            'Save or copy the QR code',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Save: Download as image file',
            'Copy: Copy the image',
            'Color picker: Change QR code colors',
          ],
        },
      ],
    },
  },

  // ========================================
  // 7. TAP Tempo (탭 템포)
  // ========================================
  tapTempo: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: ['박자에 맞춰 클릭하여 BPM 측정', '측정한 빠르기로 소리 재생 가능'],
        },
        {
          title: '사용 방법',
          items: [
            'TAP 버튼을 박자에 맞춰 여러 번 클릭',
            '스페이스바로도 클릭 가능',
            '2초 이상 멈추면 자동 초기화',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'TAP: 박자에 맞춰 클릭',
            'Sound ON/OFF: 클릭할 때 소리 재생',
            'Reset: 측정값 초기화',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: ['Click to the beat to measure BPM', 'Play sound at the measured tempo'],
        },
        {
          title: 'How to use',
          items: [
            'Click TAP button to the beat several times',
            'You can also use spacebar',
            'Auto-resets after 2 seconds of no activity',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'TAP: Click to the beat',
            'Sound ON/OFF: Play sound on each click',
            'Reset: Clear measured values',
          ],
        },
      ],
    },
  },

  // ========================================
  // 8. Translator (번역기)
  // ========================================
  translator: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: ['한국어와 영어를 서로 번역하는 도구', '입력하면 바로 번역 결과 표시'],
        },
        {
          title: '사용 방법',
          items: [
            '번역할 글 입력',
            '방향 버튼으로 한→영 또는 영→한 변경',
            '어투 선택으로 말투 조절',
          ],
        },
        {
          title: '버튼 설명',
          items: ['↔ 버튼: 번역 방향 바꾸기', '지우기: 입력 내용 삭제', '공유: 번역 링크 복사'],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: ['Translate between Korean and English', 'Shows translation as you type'],
        },
        {
          title: 'How to use',
          items: [
            'Enter text to translate',
            'Use direction button to switch Ko→En or En→Ko',
            'Select tone to adjust formality',
          ],
        },
        {
          title: 'Button guide',
          items: [
            '↔ button: Switch translation direction',
            'Clear: Delete input',
            'Share: Copy translation link',
          ],
        },
      ],
    },
  },

  // ========================================
  // 9. Color Harmony (컬러 하모니)
  // ========================================
  colorHarmony: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: [
            '기준 색상에서 어울리는 색상 조합 생성',
            '보색, 유사색, 삼원색, 단색 계열 4가지 모드 지원',
          ],
        },
        {
          title: '사용 방법',
          items: [
            '기준 색상 선택',
            '원하는 조합 방식(모드) 선택',
            '생성된 색상 코드를 클릭하여 복사',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'Random: 무작위 색상 생성',
            'Reset: 기본값으로 복원',
            '색상 클릭: 색상 코드 복사',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: [
            'Create matching color combinations from a base color',
            'Supports 4 modes: complementary, analogous, triadic, monochromatic',
          ],
        },
        {
          title: 'How to use',
          items: ['Pick a base color', 'Choose a harmony mode', 'Click color codes to copy'],
        },
        {
          title: 'Button guide',
          items: [
            'Random: Generate random color',
            'Reset: Restore defaults',
            'Click color: Copy color code',
          ],
        },
      ],
    },
  },

  // ========================================
  // 10. Color Palette (컬러 팔레트)
  // ========================================
  colorPalette: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: ['2~5개 색상을 자유롭게 조합하는 도구', '원하는 색상을 직접 선택하여 팔레트 생성'],
        },
        {
          title: '사용 방법',
          items: [
            '색상 개수(2~5) 선택',
            '각 색상 칸을 클릭하여 색상 변경',
            '색상 코드를 클릭하여 복사',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'Random: 무작위 색상 생성',
            'Reset: 기본값으로 복원',
            '색상 칸 클릭: 색상 선택 창 열기',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: ['Combine 2-5 colors freely', 'Pick colors to create your own palette'],
        },
        {
          title: 'How to use',
          items: [
            'Select number of colors (2-5)',
            'Click each color box to change color',
            'Click color codes to copy',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Random: Generate random colors',
            'Reset: Restore defaults',
            'Click color box: Open color picker',
          ],
        },
      ],
    },
  },

  // ========================================
  // 11. Color Decomposer (색상 분해)
  // ========================================
  colorDecomposer: {
    ko: {
      title: '사용 안내',
      sections: [
        {
          title: '이 도구는',
          items: [
            '목표 색상이 어떤 색상들로 조합되는지 보여주는 도구',
            '색상 혼합 원리를 학습하는 데 유용',
          ],
        },
        {
          title: '사용 방법',
          items: ['목표 색상 선택', '구성 색상 개수(2~5) 선택', '각 색상의 비율 슬라이더로 조절'],
        },
        {
          title: '버튼 설명',
          items: [
            'Random: 무작위 구성 색상 생성',
            'Reset: 기본값으로 복원',
            '비율 슬라이더: 색상 혼합 비율 조절',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: [
            'Shows how a target color can be composed from other colors',
            'Useful for learning color mixing principles',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Select a target color',
            'Choose component count (2-5)',
            'Adjust ratio sliders for each color',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Random: Generate random component colors',
            'Reset: Restore defaults',
            'Ratio slider: Adjust color mixing ratio',
          ],
        },
      ],
    },
  },
};

/**
 * Get guide content for a specific tool and locale
 */
export function getToolGuide(toolType: ToolType, locale: 'ko' | 'en'): ToolGuideContent {
  return TOOL_GUIDES[toolType][locale];
}
