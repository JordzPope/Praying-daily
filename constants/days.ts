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

export const ALL_DAY_IDS = DAYS.map((day) => day.id);

export function dayIdToLabel(id: DayId) {
  const day = DAYS.find((entry) => entry.id === id);
  return day ? day.label : id.charAt(0).toUpperCase();
}

export function dayIdsToLabels(ids: DayId[]) {
  return ids.map((id) => dayIdToLabel(id));
}

export function labelsToDayIds(labels: string[]) {
  const normalized = labels.map((label) => label.trim().toUpperCase());
  return normalized
    .map((label) => {
      const match = DAYS.find((day) => day.label.toUpperCase() === label);
      return match?.id;
    })
    .filter((maybeId): maybeId is DayId => Boolean(maybeId));
}

export function dayIdFromDate(date: Date): DayId | undefined {
  const weekdayIndex = date.getDay();
  const match = DAYS.find((day) => day.weekdayIndex === weekdayIndex);
  return match?.id;
}

export function isFullWeek(ids: DayId[]) {
  return ids.length === DAYS.length;
}
