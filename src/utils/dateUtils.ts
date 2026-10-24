export interface DayInfo {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // شنبه، یکشنبه، ...
  shortName: string; // ش، ی، ...
  dayNumber: number; // Day of month or solar calendar
  formattedPersian: string; // e.g. "۲۴ مهر"
  isToday: boolean;
}

const PERSIAN_DAY_NAMES = [
  { full: 'شنبه', short: 'ش' },
  { full: 'یکشنبه', short: 'ی' },
  { full: 'دوشنبه', short: 'د' },
  { full: 'سه‌شنبه', short: 'س' },
  { full: 'چهارشنبه', short: 'چ' },
  { full: 'پنج‌شنبه', short: 'پ' },
  { full: 'جمعه', short: 'ج' },
];

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, d => persianDigits[parseInt(d, 10)]);
}

/**
 * Returns the 7 days of the week for a given week offset (0 = current week, -1 = last week, +1 = next week).
 * Persian week starts on Saturday.
 */
export function getWeekDays(weekOffset = 0): DayInfo[] {
  const today = new Date();
  const todayStr = getTodayDateStr();

  // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const jsDay = today.getDay();
  // In Persian week: Saturday is day 0, Sunday is 1, ..., Friday is 6
  const persianDayIndex = (jsDay + 1) % 7;

  // Calculate Saturday of the target week
  const saturday = new Date(today);
  saturday.setDate(today.getDate() - persianDayIndex + weekOffset * 7);

  const days: DayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(saturday);
    current.setDate(saturday.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Simple Persian date formatting using Intl if available
    let formattedPersian = '';
    try {
      formattedPersian = new Intl.DateTimeFormat('fa-IR', {
        month: 'long',
        day: 'numeric',
      }).format(current);
    } catch {
      formattedPersian = `${formatPersianNumber(day)} / ${formatPersianNumber(month)}`;
    }

    days.push({
      dateStr,
      dayName: PERSIAN_DAY_NAMES[i].full,
      shortName: PERSIAN_DAY_NAMES[i].short,
      dayNumber: current.getDate(),
      formattedPersian,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

export function formatFullPersianDate(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr || getTodayDateStr();
  }
}
