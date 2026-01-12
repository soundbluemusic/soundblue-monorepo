/**
 * @fileoverview Tool Guide Content Data
 *
 * Localized guide content for all 7 tools in the Tools app.
 * Each guide includes: purpose, usage instructions, and button descriptions.
 *
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
          items: ['정확한 템포로 연습할 수 있는 메트로놈', '음악 연습 시 박자 감각 훈련에 유용'],
        },
        {
          title: '사용 방법',
          items: [
            'BPM 슬라이더로 원하는 속도 설정',
            '재생 버튼으로 메트로놈 시작/정지',
            '박자 설정으로 비트 구성 변경 (4/4, 3/4 등)',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'Play/Pause: 메트로놈 재생/정지',
            'Reset: BPM과 박자를 기본값으로 복원',
            '박자 선택: 한 마디의 비트 수 설정',
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
            'A metronome for practicing with precise tempo',
            'Useful for rhythm training during music practice',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Set your desired speed with the BPM slider',
            'Start/stop the metronome with the play button',
            'Change beat configuration with time signature (4/4, 3/4, etc.)',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Play/Pause: Start or stop the metronome',
            'Reset: Restore BPM and time signature to defaults',
            'Time signature: Set beats per measure',
          ],
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
          items: ['16스텝 드럼 패턴을 만드는 시퀀서', '비트메이킹 연습 및 아이디어 스케치에 유용'],
        },
        {
          title: '사용 방법',
          items: [
            '그리드의 셀을 클릭하여 드럼 사운드 배치',
            'BPM 슬라이더로 템포 조절',
            '프리셋을 선택하여 빠르게 시작',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'Play/Stop: 패턴 재생/정지',
            'Clear: 현재 패턴 모두 지우기',
            'Preset: 미리 만들어진 패턴 불러오기',
            'Synth: 사운드 설정 패널 열기',
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
            'A 16-step drum pattern sequencer',
            'Useful for beatmaking practice and idea sketching',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Click grid cells to place drum sounds',
            'Adjust tempo with the BPM slider',
            'Select a preset to get started quickly',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Play/Stop: Play or stop the pattern',
            'Clear: Clear all sounds from the pattern',
            'Preset: Load pre-made patterns',
            'Synth: Open sound settings panel',
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
          items: ['BPM에 맞는 딜레이 타임(ms)을 계산', 'DAW의 딜레이/리버브 플러그인 설정 시 유용'],
        },
        {
          title: '사용 방법',
          items: [
            'BPM을 직접 입력하거나 TAP으로 감지',
            '음표별 딜레이 시간(ms) 확인',
            '값을 클릭하면 클립보드에 복사됨',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'TAP: 박자에 맞춰 탭하면 BPM 자동 감지',
            'Reset: BPM을 기본값(120)으로 초기화',
            '키보드 Space: TAP 버튼과 동일',
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
            'Calculate delay time (ms) based on BPM',
            'Useful for setting up delay/reverb plugins in your DAW',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Enter BPM directly or detect it with TAP',
            'Check delay times (ms) for each note value',
            'Click a value to copy it to clipboard',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'TAP: Tap along to the beat to detect BPM',
            'Reset: Reset BPM to default (120)',
            'Keyboard Space: Same as TAP button',
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
          items: ['한국어 맞춤법을 검사하는 도구', '띄어쓰기, 오타, 문법 오류를 찾아 수정 제안'],
        },
        {
          title: '사용 방법',
          items: [
            '검사할 한국어 텍스트 입력',
            '검사하기 버튼 클릭',
            '오류 목록에서 수정 제안 확인 후 적용',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            '검사하기: 맞춤법 검사 실행',
            '초기화: 입력 텍스트 모두 지우기',
            '복사: 수정된 텍스트를 클립보드에 복사',
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
            'A Korean spell checker',
            'Finds and suggests corrections for spacing, typos, and grammar errors',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Enter the Korean text you want to check',
            'Click the Check button',
            'Review suggestions in the error list and apply corrections',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Check: Run the spell check',
            'Reset: Clear all input text',
            'Copy: Copy corrected text to clipboard',
          ],
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
          items: ['영어 철자를 검사하는 도구', '오타를 찾아 수정 제안을 제공'],
        },
        {
          title: '사용 방법',
          items: ['검사할 영어 텍스트 입력', 'Check 버튼 클릭', '제안 목록에서 올바른 철자 선택'],
        },
        {
          title: '버튼 설명',
          items: [
            'Check: 철자 검사 실행',
            'Reset: 입력 텍스트 모두 지우기',
            '제안 클릭: 해당 단어로 자동 교체',
          ],
        },
      ],
    },
    en: {
      title: 'How to Use',
      sections: [
        {
          title: 'About this tool',
          items: ['An English spell checker', 'Finds typos and provides correction suggestions'],
        },
        {
          title: 'How to use',
          items: [
            'Enter the English text you want to check',
            'Click the Check button',
            'Select the correct spelling from the suggestions',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Check: Run the spell check',
            'Reset: Clear all input text',
            'Click suggestion: Auto-replace with that word',
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
          items: ['URL이나 텍스트를 QR 코드로 변환', '명함, 링크 공유, 이벤트 홍보 등에 유용'],
        },
        {
          title: '사용 방법',
          items: [
            'URL 또는 텍스트 입력',
            '필요시 색상과 크기 커스터마이즈',
            '이미지 저장 또는 클립보드 복사',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'Save: QR 코드를 PNG 이미지로 다운로드',
            'Copy: QR 코드 이미지를 클립보드에 복사',
            '색상 선택: 전경색/배경색 변경',
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
            'Convert URL or text to QR code',
            'Useful for business cards, link sharing, event promotion, etc.',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Enter a URL or text',
            'Customize colors and size if needed',
            'Save the image or copy to clipboard',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Save: Download QR code as PNG image',
            'Copy: Copy QR code image to clipboard',
            'Color picker: Change foreground/background colors',
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
          items: ['박자에 맞춰 탭하면 BPM을 자동 감지', '메트로놈 소리를 켜서 리듬 확인 가능'],
        },
        {
          title: '사용 방법',
          items: [
            'TAP 버튼을 박자에 맞춰 여러 번 클릭',
            '스페이스바로도 탭 가능',
            '2초 이상 멈추면 자동으로 리셋',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            'TAP: 박자에 맞춰 클릭 (스페이스바도 가능)',
            'Sound ON/OFF: 탭할 때 메트로놈 소리 재생',
            'Reset: BPM 및 탭 기록 초기화',
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
            'Tap to the beat to detect BPM automatically',
            'Enable metronome sound to hear the rhythm',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Click TAP button multiple times to the beat',
            'You can also use spacebar to tap',
            'Auto-resets after 2 seconds of inactivity',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'TAP: Click to the beat (spacebar also works)',
            'Sound ON/OFF: Play metronome sound on each tap',
            'Reset: Clear BPM and tap history',
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
          items: ['한국어 ↔ 영어 양방향 번역기', '알고리즘 기반 번역 (AI가 아닌 규칙 기반)'],
        },
        {
          title: '사용 방법',
          items: [
            '텍스트 입력 시 자동으로 번역됨',
            '방향 전환 버튼으로 입출력 언어 변경',
            '어투 선택으로 번역 스타일 조절',
          ],
        },
        {
          title: '버튼 설명',
          items: [
            '방향 전환 (↔): 번역 방향 변경 (한→영 / 영→한)',
            '지우기: 입력 텍스트 초기화',
            '공유: 현재 번역 URL을 클립보드에 복사',
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
            'Bidirectional Korean ↔ English translator',
            'Algorithm-based translation (rule-based, not AI)',
          ],
        },
        {
          title: 'How to use',
          items: [
            'Text is translated automatically as you type',
            'Switch direction button to change input/output language',
            'Select formality to adjust translation style',
          ],
        },
        {
          title: 'Button guide',
          items: [
            'Direction switch (↔): Change translation direction (Ko→En / En→Ko)',
            'Clear: Reset input text',
            'Share: Copy current translation URL to clipboard',
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
