'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { useEffect, useMemo, useState } from 'react';

// ========================================
// World Clock Widget - AOD Style
// ========================================
// 세계시간 (서울, 뉴욕, 런던) + 현재 날짜 표시
// 시(hour)만 도시별로, 분:초는 통합 표시

interface WorldClockWidgetProps {
  isCompact?: boolean;
}

interface CityTime {
  id: string;
  city: { ko: string; en: string };
  timezone: string;
  countryCode: string; // ISO 3166-1 alpha-2 country code for flag image
}

const CITIES: CityTime[] = [
  { id: 'seoul', city: { ko: '서울', en: 'Seoul' }, timezone: 'Asia/Seoul', countryCode: 'kr' },
  {
    id: 'newyork',
    city: { ko: '뉴욕', en: 'New York' },
    timezone: 'America/New_York',
    countryCode: 'us',
  },
  {
    id: 'london',
    city: { ko: '런던', en: 'London' },
    timezone: 'Europe/London',
    countryCode: 'gb',
  },
];

// Flag image URL - use fixed size to avoid SSR/client hydration mismatch
// CSS handles responsive sizing, URL stays constant
const getFlagUrl = (countryCode: string) => `https://flagcdn.com/24x18/${countryCode}.png`;

// Cached Intl.DateTimeFormat instances - O(1) reuse instead of creating new formatters
const hourFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

const getHourFormatter = (timezone: string): Intl.DateTimeFormat => {
  if (!hourFormatters.has(timezone)) {
    hourFormatters.set(
      timezone,
      new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        hour12: false,
      }),
    );
  }
  return hourFormatters.get(timezone)!;
};

const getDateFormatter = (timezone: string, locale: string): Intl.DateTimeFormat => {
  const key = `${timezone}-${locale}`;
  if (!dateFormatters.has(key)) {
    dateFormatters.set(
      key,
      new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    );
  }
  return dateFormatters.get(key)!;
};

// Month and weekday names (static)
const monthNames = {
  ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
} as const;

const weekdayNames = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
} as const;

export function WorldClockWidget({ isCompact = false }: WorldClockWidgetProps) {
  const { locale } = useParaglideI18n();

  // 하이드레이션 후에만 시간 표시 (SSG 빌드 시간 불일치 방지)
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // 클라이언트에서만 시간 초기화
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 타임존별 시(hour)만 가져오기 - cached formatter 사용
  const getHour = (timezone: string) => {
    if (!now) return '--';
    return getHourFormatter(timezone).format(now);
  };

  // 공통 분:초 (UTC 기준으로 모든 타임존 동일)
  const getMinuteSecond = () => {
    if (!now) return '--:--';
    const min = now.getMinutes().toString().padStart(2, '0');
    const sec = now.getSeconds().toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // 타임존별 날짜 (요일 포함) - cached formatter 사용
  const getDate = (timezone: string) => {
    if (!now) return '---';
    return getDateFormatter(timezone, locale).format(now);
  };

  // 현재 로컬 날짜 (메인 캘린더용) - hydration 후에만 사용됨
  const currentDate = useMemo(() => {
    if (!now) return { year: 0, month: 0, day: 0, weekday: 0 };
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      weekday: now.getDay(),
    };
  }, [now]);

  // 미니 캘린더 데이터 생성 - 날짜 변경시에만 재계산
  const calendarDays = useMemo(() => {
    const { year, month } = currentDate;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    // 빈 칸 (월 시작 전)
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate.year, currentDate.month]);

  return (
    <div
      className={`flex h-full flex-col items-center justify-center p-4 ${isCompact ? 'gap-3' : 'gap-6 p-6'}`}
    >
      {/* 세계시간 - 시(hour)만 도시별로 (반응형 개선) */}
      <div className={`flex items-end justify-center flex-wrap ${isCompact ? 'gap-2' : 'gap-4'}`}>
        {CITIES.map((city) => (
          <div key={city.id} className="flex flex-col items-center gap-1 min-w-[60px]">
            <img
              src={getFlagUrl(city.countryCode)}
              alt={city.city.en}
              className={`rounded-sm object-cover ${isCompact ? 'w-5 h-[15px]' : 'w-6 h-[18px]'}`}
              loading="lazy"
            />
            <span
              className={`font-light tabular-nums text-[var(--color-text-primary)] ${isCompact ? 'text-2xl' : 'text-4xl'}`}
              suppressHydrationWarning
            >
              {getHour(city.timezone)}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)] text-center truncate max-w-[80px]">
              {city.city[locale]}
            </span>
          </div>
        ))}
      </div>

      {/* 공통 분:초 - 크게 표시 (콜론 분리로 UX 개선) */}
      <div className="flex items-baseline gap-1">
        <span
          className={`font-extralight text-[var(--color-text-tertiary)] ${isCompact ? 'text-2xl' : 'text-4xl'}`}
        >
          :
        </span>
        <span
          className={`font-extralight tabular-nums tracking-tight text-[var(--color-accent-primary)] ${isCompact ? 'text-4xl' : 'text-6xl'}`}
          suppressHydrationWarning
        >
          {getMinuteSecond()}
        </span>
      </div>

      {/* 날짜 정보 */}
      <div
        className={`text-[var(--color-text-tertiary)] ${isCompact ? 'flex flex-col items-center gap-1 text-xs' : 'flex gap-4 text-sm'}`}
      >
        {CITIES.map((city) => (
          <span key={city.id} className="inline-flex items-center gap-1" suppressHydrationWarning>
            <img
              src={getFlagUrl(city.countryCode)}
              alt=""
              className="w-4 h-3 rounded-sm inline-block object-cover"
              loading="lazy"
            />
            {getDate(city.timezone)}
          </span>
        ))}
      </div>

      {/* 구분선 - 캘린더가 있을 때만 표시 */}
      {now && <div className="w-full max-w-sm h-px bg-[var(--color-border-primary)]" />}

      {/* 미니 캘린더 - hydration 후에만 렌더링 (SSR 불일치 방지) */}
      {now && (
        <div className="flex flex-col items-center gap-2">
          {/* 년월 표시 */}
          <div
            className={`font-medium text-[var(--color-text-primary)] ${isCompact ? 'text-base' : 'text-lg'}`}
          >
            {locale === 'ko'
              ? `${currentDate.year}년 ${monthNames.ko[currentDate.month]}`
              : `${monthNames.en[currentDate.month]} ${currentDate.year}`}
          </div>

          {/* 요일 헤더 */}
          <div
            className={`grid grid-cols-7 text-center text-xs text-[var(--color-text-tertiary)] ${isCompact ? 'gap-0.5' : 'gap-1'}`}
          >
            {weekdayNames[locale].map((day) => (
              <div
                key={day}
                className={`flex items-center justify-center ${isCompact ? 'w-6 h-5' : 'w-8 h-6'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className={`grid grid-cols-7 ${isCompact ? 'gap-0.5' : 'gap-1'}`}>
            {calendarDays.map((day, index) => (
              <div
                key={day ?? `empty-${index}`}
                className={`flex items-center justify-center rounded-full transition-colors ${isCompact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} ${
                  day === currentDate.day
                    ? 'bg-[var(--color-accent-primary)] text-white font-semibold'
                    : day
                      ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                      : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
