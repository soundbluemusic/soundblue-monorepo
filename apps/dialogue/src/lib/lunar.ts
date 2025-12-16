/**
 * @fileoverview Korean Lunar (음력) Calendar Conversion Module
 *
 * This module converts Gregorian (solar) calendar dates to the traditional
 * Korean/Chinese lunisolar calendar. The lunar calendar is based on the Moon's
 * phases and is used throughout East Asia for traditional holidays like
 * Seollal (설날, Korean New Year) and Chuseok (추석, Mid-Autumn Festival).
 *
 * ## Algorithm Overview
 *
 * The lunar calendar differs from the Gregorian calendar in several key ways:
 * - A lunar month is ~29.53 days (one synodic month)
 * - A lunar year has 12 or 13 months (354-385 days)
 * - Leap months (윤달, 閏月) are added ~every 3 years to keep the calendar
 *   aligned with the solar year and agricultural seasons
 *
 * ## Data Encoding (LUNAR_DATA)
 *
 * Each entry in LUNAR_DATA is a 17-bit integer encoding information for one year:
 *
 * ```
 * Bit layout: 0x[L][MMMM MMMM MMMM][LLLL]
 *             |  |________________||____|
 *             |         |            |
 *             |         |            └─ Bits 0-3: Leap month number (0 = no leap, 1-12 = which month)
 *             |         └─ Bits 4-15: Month length flags (12 bits for 12 months)
 *             |                        1 = 30 days ("big month"), 0 = 29 days ("small month")
 *             └─ Bit 16: Leap month length (1 = 30 days, 0 = 29 days)
 * ```
 *
 * ### Example: 0x04bd8 (year 1900)
 * - Binary: 0 0100 1011 1101 1000
 * - Bits 0-3 (0x8): Leap month is the 8th month
 * - Bits 4-15: Months 1-12 have lengths [29,30,29,29,30,30,29,30,30,29,30,30]
 * - Bit 16 (0): Leap month (8th) has 29 days
 *
 * ## Reference Date
 *
 * All calculations use January 31, 1900 as the base date, which corresponds
 * to the 1st day of the 1st month of lunar year 1900 (庚子年, Year of the Metal Rat).
 *
 * @module dialogue/lib/lunar
 *
 * @example
 * ```typescript
 * import { solarToLunar, formatLunarDate } from './lunar';
 *
 * // Convert Chuseok 2024 (September 17, 2024 solar)
 * const lunar = solarToLunar(new Date(2024, 8, 17));
 * // Returns: { year: 2024, month: 8, day: 15, isLeapMonth: false }
 *
 * // Format for display
 * console.log(formatLunarDate(lunar, 'ko')); // "2024년 8월 15일"
 * console.log(formatLunarDate(lunar, 'en')); // "2024/8/15"
 * ```
 *
 * @see https://en.wikipedia.org/wiki/Chinese_calendar for background
 * @see https://en.wikipedia.org/wiki/Korean_calendar for Korean specifics
 */

/**
 * Lunar calendar data for years 1900-2100 (201 years).
 *
 * Each 17-bit value encodes the calendar structure for one year:
 * - Bits 0-3: Leap month number (0 means no leap month, 1-12 indicates which month is the leap)
 * - Bits 4-15: 12 flags indicating if each month has 30 days (1) or 29 days (0)
 * - Bit 16: If there's a leap month, indicates if it has 30 days (1) or 29 days (0)
 *
 * The data is derived from astronomical calculations and published lunar calendar tables.
 *
 * @internal
 */
const LUNAR_DATA = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520,
];

/**
 * Calculates the total number of days in a lunar year.
 *
 * A lunar year consists of 12 regular months plus an optional leap month.
 * - Base: 12 months × 29 days = 348 days (minimum)
 * - Each "big month" (대월) adds 1 day (30 instead of 29)
 * - Leap month adds 29 or 30 days
 *
 * The algorithm counts set bits in positions 4-15 of the year's data,
 * where each bit represents whether a month has 30 days.
 *
 * @param year - The lunar year (1900-2100)
 * @returns Total days in the year (354-385)
 *
 * @example
 * ```typescript
 * getLunarYearDays(1900); // Returns 384 (leap year with 29-day leap month)
 * getLunarYearDays(2024); // Returns 384 (leap year)
 * ```
 *
 * @internal
 */
function getLunarYearDays(year: number): number {
  // Start with minimum days: 12 months × 29 days
  let sum = 348;

  // Check bits 4-15 (0x8000 >> 1 down to 0x10, stopping at 0x8)
  // Each set bit means that month has 30 days instead of 29
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_DATA[year - 1900] & i) ? 1 : 0;
  }

  // Add leap month days if this is a leap year
  return sum + getLeapDays(year);
}

/**
 * Gets the leap month number for a given lunar year.
 *
 * In the lunisolar calendar, a leap month (윤달, 閏月) is inserted
 * approximately every 3 years to keep the calendar synchronized with
 * the solar year. This follows the Metonic cycle (19 years = 235 lunar months).
 *
 * The leap month number is stored in the lowest 4 bits (0x0-0xF) of the year data:
 * - 0 = No leap month this year
 * - 1-12 = Leap month comes after the Nth regular month
 *
 * @param year - The lunar year (1900-2100)
 * @returns The leap month number (1-12), or 0 if no leap month
 *
 * @example
 * ```typescript
 * getLeapMonth(1900); // Returns 8 (leap 8th month)
 * getLeapMonth(2023); // Returns 2 (leap 2nd month)
 * getLeapMonth(2025); // Returns 6 (leap 6th month)
 * ```
 *
 * @internal
 */
function getLeapMonth(year: number): number {
  // Extract bits 0-3 (lowest nibble) which encode the leap month
  return LUNAR_DATA[year - 1900] & 0xf;
}

/**
 * Gets the number of days in the leap month for a given year.
 *
 * Like regular months, leap months can be either:
 * - "Big month" (대월, 大月): 30 days
 * - "Small month" (소월, 小月): 29 days
 *
 * The leap month length is encoded in bit 16 (0x10000) of the year data:
 * - Bit set (1) = 30 days
 * - Bit clear (0) = 29 days
 *
 * @param year - The lunar year (1900-2100)
 * @returns Number of days in the leap month (29 or 30), or 0 if no leap month
 *
 * @example
 * ```typescript
 * getLeapDays(1900); // Returns 29 (leap month has 29 days)
 * getLeapDays(2023); // Returns 29 (leap 2nd month has 29 days)
 * getLeapDays(2021); // Returns 0 (no leap month)
 * ```
 *
 * @internal
 */
function getLeapDays(year: number): number {
  // Only return days if this year has a leap month
  if (getLeapMonth(year)) {
    // Bit 16 determines if leap month is "big" (30 days) or "small" (29 days)
    return (LUNAR_DATA[year - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

/**
 * Gets the number of days in a specific regular (non-leap) month.
 *
 * Each lunar month has either 29 or 30 days, determined by the Moon's
 * orbital period. The month length is encoded in bits 4-15 of the year data,
 * where each bit corresponds to one of the 12 months.
 *
 * Bit mapping (0x10000 >> month):
 * - Month 1: bit 15 (0x8000)
 * - Month 2: bit 14 (0x4000)
 * - ...
 * - Month 12: bit 4 (0x10)
 *
 * @param year - The lunar year (1900-2100)
 * @param month - The month number (1-12, NOT 0-indexed)
 * @returns Number of days in the month (29 or 30)
 *
 * @example
 * ```typescript
 * getMonthDays(2024, 1);  // Returns 30 (1st month of 2024)
 * getMonthDays(2024, 2);  // Returns 29 (2nd month of 2024)
 * ```
 *
 * @internal
 */
function getMonthDays(year: number, month: number): number {
  // Shift right by month to check the corresponding bit
  // Month 1 → bit 15, Month 2 → bit 14, ..., Month 12 → bit 4
  return (LUNAR_DATA[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

/**
 * Represents a date in the Korean/Chinese lunar calendar.
 *
 * @property year - The lunar year (1900-2100)
 * @property month - The lunar month (1-12)
 * @property day - The day of the month (1-30)
 * @property isLeapMonth - True if this is a leap month (윤달)
 *
 * @example
 * ```typescript
 * // Seollal (Lunar New Year) 2024
 * const lunarNewYear: LunarDate = {
 *   year: 2024,
 *   month: 1,
 *   day: 1,
 *   isLeapMonth: false
 * };
 *
 * // A date in a leap month
 * const leapMonthDate: LunarDate = {
 *   year: 2023,
 *   month: 2,
 *   day: 15,
 *   isLeapMonth: true  // This is 윤2월 (leap 2nd month)
 * };
 * ```
 */
export interface LunarDate {
  /** The lunar year (1900-2100) */
  year: number;
  /** The lunar month (1-12, same number used for leap months) */
  month: number;
  /** The day of the month (1-30) */
  day: number;
  /** Whether this date falls in a leap month (윤달, 閏月) */
  isLeapMonth: boolean;
}

/**
 * Converts a Gregorian (solar) calendar date to the Korean/Chinese lunar calendar.
 *
 * ## Algorithm
 *
 * The conversion works by calculating the number of days between the input date
 * and the reference date (January 31, 1900 = Lunar 1900/1/1), then iterating
 * through lunar years and months to find the corresponding lunar date.
 *
 * 1. **Calculate day offset**: Days from reference date to input date
 * 2. **Find lunar year**: Subtract year lengths until offset < current year's days
 * 3. **Find lunar month**: Iterate through months (including leap month if present)
 *    - Leap months are handled by "inserting" them after their corresponding
 *      regular month (e.g., leap 8th month comes after regular 8th month)
 * 4. **Calculate day**: Remaining offset + 1 = day of the month
 *
 * ## Supported Date Range
 *
 * This function supports dates from January 31, 1900 to approximately 2100.
 * Dates outside this range will produce incorrect results.
 *
 * ## Time Zone Considerations
 *
 * The conversion uses the local time zone. For consistent results across
 * time zones, ensure the input Date object is set to midnight local time.
 *
 * @param solarDate - A JavaScript Date object representing the Gregorian date
 * @returns The corresponding lunar date
 *
 * @example
 * ```typescript
 * // Convert Korean Thanksgiving (Chuseok) 2024
 * // Chuseok is always on lunar 8/15
 * const chuseok2024 = solarToLunar(new Date(2024, 8, 17)); // Sept 17, 2024
 * console.log(chuseok2024);
 * // { year: 2024, month: 8, day: 15, isLeapMonth: false }
 *
 * // Convert a date in a leap month
 * const leapDate = solarToLunar(new Date(2023, 3, 20)); // Apr 20, 2023
 * console.log(leapDate);
 * // { year: 2023, month: 2, day: 30, isLeapMonth: true }
 * // This is in 윤2월 (leap 2nd month) of 2023
 *
 * // Convert Seollal (Lunar New Year) 2024
 * const seollal = solarToLunar(new Date(2024, 1, 10)); // Feb 10, 2024
 * console.log(seollal);
 * // { year: 2024, month: 1, day: 1, isLeapMonth: false }
 * ```
 *
 * @throws May produce incorrect results for dates before 1900 or after 2100
 */
export function solarToLunar(solarDate: Date): LunarDate {
  // Reference: January 31, 1900 = Lunar Year 1900, Month 1, Day 1
  const baseDate = new Date(1900, 0, 31);

  // Calculate total days from reference date to input date
  // 86400000 = 24 * 60 * 60 * 1000 (milliseconds per day)
  let offset = Math.floor((solarDate.getTime() - baseDate.getTime()) / 86400000);

  let lunarYear = 1900;
  let lunarMonth = 1;
  let lunarDay = 1;
  let isLeapMonth = false;

  // Step 1: Find the lunar year by subtracting year lengths
  let yearDays = getLunarYearDays(lunarYear);
  while (offset >= yearDays) {
    offset -= yearDays;
    lunarYear++;
    yearDays = getLunarYearDays(lunarYear);
  }

  // Step 2: Find the lunar month (including leap month handling)
  const leapMonth = getLeapMonth(lunarYear);
  let monthDays: number;

  for (let i = 1; i <= 12; i++) {
    // Special case: Insert leap month after the corresponding regular month
    // When we're at month (leapMonth + 1) and haven't processed leap yet,
    // we "go back" to process the leap month first
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeapMonth) {
      i--;  // Stay on the same month number
      isLeapMonth = true;
      monthDays = getLeapDays(lunarYear);
    } else {
      monthDays = getMonthDays(lunarYear, i);
    }

    // If remaining offset is less than this month's days, we found our month
    if (offset < monthDays) {
      lunarMonth = i;
      lunarDay = offset + 1;  // Days are 1-indexed
      break;
    }

    // Subtract this month's days and continue
    offset -= monthDays;

    // After processing leap month, reset flag for next iteration
    if (isLeapMonth && i === leapMonth + 1) {
      isLeapMonth = false;
    }
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth,
  };
}

/**
 * Traditional Korean month names in the lunar calendar.
 *
 * These are the classical names still used in Korea:
 * - 정월 (正月): First month / New Year's month
 * - 이월, 삼월, ...: Second through ninth months
 * - 동짓달: Winter solstice month (11th month)
 * - 섣달: Last month of the year (12th month)
 *
 * @internal
 */
const LUNAR_MONTHS_KO = ['정월', '이월', '삼월', '사월', '오월', '유월', '칠월', '팔월', '구월', '시월', '동짓달', '섣달'];

/**
 * English ordinal month names for the lunar calendar.
 * @internal
 */
const LUNAR_MONTHS_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

/**
 * Traditional Japanese/Chinese month names using kanji numerals.
 * @internal
 */
const LUNAR_MONTHS_JA = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

/**
 * Formats a lunar date as a localized string.
 *
 * Supports three locales:
 * - `ko` (Korean): "2024년 8월 15일" or "2023년 윤2월 15일" for leap months
 * - `ja` (Japanese): "2024年8月15日" or "2024年閏8月15日" for leap months
 * - `en` (English/default): "2024/8/15" or "2024/8/15 (leap month)" for leap months
 *
 * ## Leap Month Notation
 *
 * Leap months are indicated differently in each locale:
 * - Korean: 윤 (yun) prefix, e.g., "윤2월" = leap 2nd month
 * - Japanese: 閏 (jun) prefix, e.g., "閏二月" = leap 2nd month
 * - English: "(leap month)" suffix
 *
 * @param lunar - The lunar date to format
 * @param locale - The locale code: 'ko', 'ja', or 'en' (default)
 * @returns A formatted date string in the specified locale
 *
 * @example
 * ```typescript
 * const chuseok: LunarDate = { year: 2024, month: 8, day: 15, isLeapMonth: false };
 *
 * formatLunarDate(chuseok, 'ko'); // "2024년 8월 15일"
 * formatLunarDate(chuseok, 'ja'); // "2024年8月15日"
 * formatLunarDate(chuseok, 'en'); // "2024/8/15"
 *
 * // With leap month
 * const leapDate: LunarDate = { year: 2023, month: 2, day: 15, isLeapMonth: true };
 *
 * formatLunarDate(leapDate, 'ko'); // "2023년 윤2월 15일"
 * formatLunarDate(leapDate, 'ja'); // "2023年閏2月15日"
 * formatLunarDate(leapDate, 'en'); // "2023/2/15 (leap month)"
 * ```
 */
export function formatLunarDate(lunar: LunarDate, locale: string): string {
  // Determine the leap month prefix/suffix based on locale
  const leap = lunar.isLeapMonth ? (locale === 'ko' ? '윤' : locale === 'ja' ? '閏' : 'leap ') : '';

  if (locale === 'ko') {
    // Korean format: YYYY년 [윤]M월 D일
    return `${lunar.year}년 ${leap}${lunar.month}월 ${lunar.day}일`;
  } else if (locale === 'ja') {
    // Japanese format: YYYY年[閏]M月D日
    return `${lunar.year}年${leap}${lunar.month}月${lunar.day}日`;
  } else {
    // English/default format: YYYY/M/D [(leap month)]
    return `${lunar.year}/${lunar.month}/${lunar.day}${leap ? ` (${leap}month)` : ''}`;
  }
}
