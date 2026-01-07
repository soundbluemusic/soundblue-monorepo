# Translator Development Rules (번역기 개발 규칙)

> **Location**: `packages/core/translator/`
> **적용**: 번역기 관련 작업 시에만 이 파일 참조

## 핵심 원칙
- **100% Algorithm-Based Generalization** - 알고리즘 기반 일반화
- Level = 난이도 수준 (특정 테스트 문장이 아님)
- 테스트 문장 = 샘플일 뿐, 하드코딩 대상 아님

## 하드코딩 정책

### ✅ 허용 (Good Logic)
| 유형 | 예시 |
|------|------|
| 일반화된 문법 패턴 | "Did + S + V + O?" → 모든 의문문 처리 |
| 언어학적 규칙 | 받침 유무 → 조사 선택 (을/를) |
| 재사용 가능한 구조 | SVO → SOV 어순 변환 알고리즘 |

### ❌ 금지 (Bad Logic)
| 유형 | 예시 |
|------|------|
| 특정 문장 정규식 | `/^Did you go to the museum/` |
| 테스트 문장 직접 추가 | `sentences['test'] = 'expected'` |
| 마커 패턴 | `if (text.includes('SPECIFIC'))` |

**판단 기준**: 비슷한 다른 문장도 통과하는가? Yes→허용, No→금지

## 파일별 규칙

| File | 금지 | 허용 |
|------|------|------|
| `dictionary/*.ts` | 테스트 문장 추가 | 개별 단어 쌍 추가 |
| `engine/*.ts` | 특정 문장 마커 | 일반화된 알고리즘 |
| `context/*.ts` | - | 문맥별 어휘 매핑 |

## 사전 수정 정책

**삭제 금지, 추가만 허용, 문맥 기반 선택**

```
❌ 대단하다: 'wonderful' → 'amazing' (삭제 후 교체)
✅ 대단하다: ['wonderful', 'amazing', 'remarkable']
✅ { default: 'wonderful', casual: 'amazing' }
```

## 외부 사전 동기화

```
소스: public-monorepo/data/context/
출력: dictionary/external/ (자동 생성)
명령: pnpm sync:context-dict

우선순위:
1. 문장 사전 (정확 일치)
2. 알고리즘 번역
3. 외부 단어 사전 (최저)
```

⚠️ `external/` 폴더 직접 수정 금지

## 테스트 실패 시

1. ❌ 사전에 문장 추가 금지
2. ❌ 특정 문장 정규식 금지
3. ✅ 일반화 알고리즘 개선
4. ✅ 문맥별 변형 추가

## 벤치마크

- 단일 소스: `benchmark-data.ts` (benchmarkTestGroups)
- vitest 결과 = UI 벤치마크 결과 (100% 동일)
