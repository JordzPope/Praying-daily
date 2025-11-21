import * as FileSystem from 'expo-file-system';

import { TopicId } from '@/constants/topics';

export type StoredPrayer = {
  id: string;
  topicId: TopicId;
  topicLabel: string;
  name: string;
  days: string[];
  reminder: boolean;
  completed: boolean;
};

const directories = FileSystem as typeof FileSystem & { documentDirectory?: string | null; cacheDirectory?: string | null };
const BASE_DIRECTORY = directories.documentDirectory ?? directories.cacheDirectory ?? null;
const STORAGE_PATH = BASE_DIRECTORY ? `${BASE_DIRECTORY}prayers.json` : null;

let cachedPrayers: StoredPrayer[] = [];
let hydrated = false;
let loadingPromise: Promise<StoredPrayer[]> | null = null;

async function readFromDisk(): Promise<StoredPrayer[]> {
  if (!STORAGE_PATH) {
    return [];
  }
  try {
    const info = await FileSystem.getInfoAsync(STORAGE_PATH);
    if (!info.exists) {
      return [];
    }
    const content = await FileSystem.readAsStringAsync(STORAGE_PATH);
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.filter(isStoredPrayer);
    }
  } catch (error) {
    console.warn('Failed to read prayers', error);
  }
  return [];
}

function isStoredPrayer(value: any): value is StoredPrayer {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.topicId === 'string' &&
    typeof value.topicLabel === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.days) &&
    value.days.every((day: unknown) => typeof day === 'string') &&
    typeof value.reminder === 'boolean' &&
    typeof value.completed === 'boolean'
  );
}

async function persistToDisk(prayers: StoredPrayer[]) {
  if (!STORAGE_PATH) {
    return;
  }
  try {
    await FileSystem.writeAsStringAsync(STORAGE_PATH, JSON.stringify(prayers));
  } catch (error) {
    console.warn('Failed to persist prayers', error);
  }
}

export function getPrayersSync() {
  return cachedPrayers;
}

export async function hydratePrayers(): Promise<StoredPrayer[]> {
  if (hydrated && !loadingPromise) {
    return cachedPrayers;
  }
  if (!loadingPromise) {
    loadingPromise = readFromDisk().then((value) => {
      cachedPrayers = value;
      hydrated = true;
      loadingPromise = null;
      return value;
    });
  }
  return loadingPromise;
}

export async function savePrayers(prayers: StoredPrayer[]): Promise<void> {
  cachedPrayers = prayers;
  hydrated = true;
  await persistToDisk(prayers);
}
