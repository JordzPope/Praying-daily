export const DAYS = [
  { id: 'mon', label: 'M', full: 'Monday', weekdayIndex: 1 },
  { id: 'tue', label: 'T', full: 'Tuesday', weekdayIndex: 2 },
  { id: 'wed', label: 'W', full: 'Wednesday', weekdayIndex: 3 },
  { id: 'thu', label: 'T', full: 'Thursday', weekdayIndex: 4 },
  { id: 'fri', label: 'F', full: 'Friday', weekdayIndex: 5 },
  { id: 'sat', label: 'S', full: 'Saturday', weekdayIndex: 6 },
  { id: 'sun', label: 'S', full: 'Sunday', weekdayIndex: 0 },
] as const;

export type DayId = (typeof DAYS)[number]['id'];

export const ALL_DAY_IDS: DayId[] = DAYS.map((day) => day.id);
export const WEEKDAY_IDS: DayId[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

export function dayIdToLabel(id: DayId) {
  const day = DAYS.find((entry) => entry.id === id);
  return day ? day.label : id.charAt(0).toUpperCase();
}

export function dayIdsToLabels(ids: DayId[]) {
  return ids.map((id) => dayIdToLabel(id));
}

export function labelsToDayIds(labels: string[]) {
  if (labels.length === 0) return [];
  const normalized = labels.map((label) => label.trim().toUpperCase());
  if (normalized.includes('DAILY')) {
    return [...ALL_DAY_IDS];
  }

  const used = new Set<DayId>();
  const result: DayId[] = [];

  normalized.forEach((label) => {
    if (label === 'WEEKDAYS') {
      WEEKDAY_IDS.forEach((dayId) => {
        if (!used.has(dayId)) {
          used.add(dayId);
          result.push(dayId);
        }
      });
      return;
    }

    const candidate = DAYS.find((day) => day.label.toUpperCase() === label && !used.has(day.id));
    if (candidate) {
      used.add(candidate.id);
      result.push(candidate.id);
    }
  });

  return result;
}

export function dayIdFromDate(date: Date): DayId | undefined {
  const weekdayIndex = date.getDay();
  const match = DAYS.find((day) => day.weekdayIndex === weekdayIndex);
  return match?.id;
}

export function isFullWeek(ids: DayId[]) {
  return ids.length === ALL_DAY_IDS.length;
}

export function isDayId(value: string): value is DayId {
  return (ALL_DAY_IDS as readonly string[]).includes(value);
}

export function filterDayIds(values?: string[]) {
  if (!values || values.length === 0) {
    return [];
  }
  return values.filter((value): value is DayId => isDayId(value));
}
