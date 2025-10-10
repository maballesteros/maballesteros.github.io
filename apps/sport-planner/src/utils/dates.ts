import dayjs, { Dayjs } from 'dayjs';

export function startOfWeekMonday(date: Dayjs): Dayjs {
  const dayOfWeek = (date.day() + 6) % 7; // Monday -> 0
  return date.subtract(dayOfWeek, 'day');
}

export function getCalendarMatrix(anchor: Dayjs): Dayjs[][] {
  const start = startOfWeekMonday(anchor.startOf('month'));
  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => start.add(weekIndex * 7 + dayIndex, 'day'))
  );
}

export function isSameDate(a: string | Dayjs, b: string | Dayjs): boolean {
  return dayjs(a).format('YYYY-MM-DD') === dayjs(b).format('YYYY-MM-DD');
}
