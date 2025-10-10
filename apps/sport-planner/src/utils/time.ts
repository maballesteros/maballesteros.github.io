export function parseTimeToMinutes(time: string | undefined, fallback: string = '18:30'): number {
  const source = (time ?? fallback).trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(source);
  if (!match) {
    return parseTimeToMinutes(fallback, fallback);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return parseTimeToMinutes(fallback, fallback);
  }
  return (hours * 60 + minutes) % 1440;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  return `${hoursStr}:${minutesStr}`;
}
