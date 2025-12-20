import { type Component, createMemo, createSignal, For, onCleanup, onMount } from 'solid-js';
import { useLanguage } from '~/i18n';

// ========================================
// World Clock Widget - AOD Style
// ========================================
// 세계시간 (서울, 뉴욕, 런던) + 현재 날짜 표시
// 시(hour)만 도시별로, 분:초는 통합 표시

interface CityTime {
  id: string;
  city: { ko: string; en: string };
  timezone: string;
  flag: string;
}

const CITIES: CityTime[] = [
  { id: 'seoul', city: { ko: '서울', en: 'Seoul' }, timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { id: 'newyork', city: { ko: '뉴욕', en: 'New York' }, timezone: 'America/New_York', flag: '🇺🇸' },
  { id: 'london', city: { ko: '런던', en: 'London' }, timezone: 'Europe/London', flag: '🇬🇧' },
];

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

export const WorldClockWidget: Component = () => {
  const { locale } = useLanguage();

  // 1초마다 업데이트되는 시간
  const [now, setNow] = createSignal(new Date());

  onMount(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  // 타임존별 시(hour)만 가져오기 - cached formatter 사용
  const getHour = (timezone: string) => {
    return getHourFormatter(timezone).format(now());
  };

  // 공통 분:초 (UTC 기준으로 모든 타임존 동일)
  const getMinuteSecond = () => {
    const date = now();
    const min = date.getMinutes().toString().padStart(2, '0');
    const sec = date.getSeconds().toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // 타임존별 날짜 (요일 포함) - cached formatter 사용
  const getDate = (timezone: string) => {
    return getDateFormatter(timezone, locale()).format(now());
  };

  // 현재 로컬 날짜 (메인 캘린더용)
  const currentDate = () => {
    const date = now();
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      weekday: date.getDay(),
    };
  };

  // 미니 캘린더 데이터 생성 - 날짜 변경시에만 재계산
  const calendarDays = createMemo(() => {
    const { year, month } = currentDate();
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
  });

  return (
    <div class="flex h-full flex-col items-center justify-center gap-6 p-6">
      {/* 세계시간 - 시(hour)만 도시별로 */}
      <div class="flex items-end justify-center gap-4">
        <For each={CITIES}>
          {(city) => (
            <div class="flex flex-col items-center gap-1">
              <span class="text-lg">{city.flag}</span>
              <span class="text-4xl font-light tabular-nums">{getHour(city.timezone)}</span>
              <span class="text-xs text-muted-foreground">{city.city[locale()]}</span>
            </div>
          )}
        </For>
      </div>

      {/* 공통 분:초 - 크게 표시 */}
      <div class="flex items-baseline gap-1">
        <span class="text-6xl font-extralight tabular-nums tracking-tight text-primary">
          :{getMinuteSecond()}
        </span>
      </div>

      {/* 날짜 정보 */}
      <div class="flex gap-4 text-sm text-muted-foreground">
        <For each={CITIES}>
          {(city) => (
            <span>
              {city.flag} {getDate(city.timezone)}
            </span>
          )}
        </For>
      </div>

      {/* 구분선 */}
      <div class="w-full max-w-sm h-px bg-border" />

      {/* 미니 캘린더 */}
      <div class="flex flex-col items-center gap-3">
        {/* 년월 표시 */}
        <div class="text-lg font-medium">
          {locale() === 'ko'
            ? `${currentDate().year}년 ${monthNames.ko[currentDate().month]}`
            : `${monthNames.en[currentDate().month]} ${currentDate().year}`}
        </div>

        {/* 요일 헤더 */}
        <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          <For each={weekdayNames[locale()]}>
            {(day) => <div class="w-8 h-6 flex items-center justify-center">{day}</div>}
          </For>
        </div>

        {/* 날짜 그리드 */}
        <div class="grid grid-cols-7 gap-1">
          <For each={calendarDays()}>
            {(day) => (
              <div
                class={`w-8 h-8 flex items-center justify-center text-sm rounded-full transition-colors ${
                  day === currentDate().day
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : day
                      ? 'text-foreground hover:bg-muted'
                      : ''
                }`}
              >
                {day}
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
