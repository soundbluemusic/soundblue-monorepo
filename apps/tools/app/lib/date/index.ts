/**
 * @fileoverview Date Utilities using date-fns
 *
 * Tree-shakable date formatting and manipulation.
 */

import {
  addDays,
  addHours,
  addMinutes,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  formatDistance,
  formatRelative,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subHours,
  subMinutes,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export type DateInput = Date | string | number;

function toDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'string') return parseISO(input);
  return new Date(input);
}

export const DateUtils = {
  format(date: DateInput, formatStr = 'yyyy-MM-dd'): string {
    return format(toDate(date), formatStr);
  },

  formatKorean(date: DateInput, formatStr = 'yyyy년 M월 d일'): string {
    return format(toDate(date), formatStr, { locale: ko });
  },

  formatTime(date: DateInput, formatStr = 'HH:mm'): string {
    return format(toDate(date), formatStr);
  },

  formatDateTime(date: DateInput, formatStr = 'yyyy-MM-dd HH:mm'): string {
    return format(toDate(date), formatStr);
  },

  formatRelative(date: DateInput, baseDate: DateInput = new Date()): string {
    return formatRelative(toDate(date), toDate(baseDate), { locale: ko });
  },

  formatDistance(date: DateInput, baseDate: DateInput = new Date()): string {
    return formatDistance(toDate(date), toDate(baseDate), {
      addSuffix: true,
      locale: ko,
    });
  },

  formatSmartDate(date: DateInput): string {
    const d = toDate(date);

    if (!isValid(d)) return '유효하지 않은 날짜';

    if (isToday(d)) {
      return `오늘 ${format(d, 'HH:mm')}`;
    }

    if (isYesterday(d)) {
      return `어제 ${format(d, 'HH:mm')}`;
    }

    if (isTomorrow(d)) {
      return `내일 ${format(d, 'HH:mm')}`;
    }

    if (isThisWeek(d)) {
      return format(d, 'EEEE HH:mm', { locale: ko });
    }

    if (isThisYear(d)) {
      return format(d, 'M월 d일', { locale: ko });
    }

    return format(d, 'yyyy년 M월 d일', { locale: ko });
  },

  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  formatBpm(bpm: number, beatsPerBar = 4): string {
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * beatsPerBar;
    return `${barDuration.toFixed(2)}s/bar`;
  },

  diff: {
    days(from: DateInput, to: DateInput = new Date()): number {
      return differenceInDays(toDate(to), toDate(from));
    },
    hours(from: DateInput, to: DateInput = new Date()): number {
      return differenceInHours(toDate(to), toDate(from));
    },
    minutes(from: DateInput, to: DateInput = new Date()): number {
      return differenceInMinutes(toDate(to), toDate(from));
    },
    seconds(from: DateInput, to: DateInput = new Date()): number {
      return differenceInSeconds(toDate(to), toDate(from));
    },
  },

  add: {
    days(date: DateInput, amount: number): Date {
      return addDays(toDate(date), amount);
    },
    hours(date: DateInput, amount: number): Date {
      return addHours(toDate(date), amount);
    },
    minutes(date: DateInput, amount: number): Date {
      return addMinutes(toDate(date), amount);
    },
  },

  sub: {
    days(date: DateInput, amount: number): Date {
      return subDays(toDate(date), amount);
    },
    hours(date: DateInput, amount: number): Date {
      return subHours(toDate(date), amount);
    },
    minutes(date: DateInput, amount: number): Date {
      return subMinutes(toDate(date), amount);
    },
  },

  is: {
    today(date: DateInput): boolean {
      return isToday(toDate(date));
    },
    yesterday(date: DateInput): boolean {
      return isYesterday(toDate(date));
    },
    tomorrow(date: DateInput): boolean {
      return isTomorrow(toDate(date));
    },
    thisWeek(date: DateInput): boolean {
      return isThisWeek(toDate(date));
    },
    thisMonth(date: DateInput): boolean {
      return isThisMonth(toDate(date));
    },
    thisYear(date: DateInput): boolean {
      return isThisYear(toDate(date));
    },
    valid(date: DateInput): boolean {
      return isValid(toDate(date));
    },
  },

  range: {
    startOfDay(date: DateInput): Date {
      return startOfDay(toDate(date));
    },
    endOfDay(date: DateInput): Date {
      return endOfDay(toDate(date));
    },
    startOfWeek(date: DateInput): Date {
      return startOfWeek(toDate(date), { locale: ko });
    },
    endOfWeek(date: DateInput): Date {
      return endOfWeek(toDate(date), { locale: ko });
    },
    startOfMonth(date: DateInput): Date {
      return startOfMonth(toDate(date));
    },
    endOfMonth(date: DateInput): Date {
      return endOfMonth(toDate(date));
    },
  },

  parse(dateString: string): Date {
    return parseISO(dateString);
  },

  now(): Date {
    return new Date();
  },

  toISO(date: DateInput): string {
    return toDate(date).toISOString();
  },

  toUnix(date: DateInput): number {
    return Math.floor(toDate(date).getTime() / 1000);
  },

  fromUnix(timestamp: number): Date {
    return new Date(timestamp * 1000);
  },
};

export { ko as koLocale };
