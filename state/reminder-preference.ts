import * as FileSystem from 'expo-file-system';

type DirectoryHandles = typeof FileSystem & { documentDirectory?: string | null; cacheDirectory?: string | null };
const directories = FileSystem as DirectoryHandles;
const BASE_DIRECTORY = directories.documentDirectory ?? directories.cacheDirectory ?? null;
const STORAGE_PATH = BASE_DIRECTORY ? `${BASE_DIRECTORY}reminder-time.json` : null;
export const REMINDER_DEFAULT = '07:00';

let cachedTime = REMINDER_DEFAULT;
let hydrated = false;
let loadingPromise: Promise<string> | null = null;

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

async function readFromDisk(): Promise<string> {
  if (!STORAGE_PATH) {
    return REMINDER_DEFAULT;
  }
  try {
    const info = await FileSystem.getInfoAsync(STORAGE_PATH);
    if (!info.exists) {
      return REMINDER_DEFAULT;
    }
    const content = await FileSystem.readAsStringAsync(STORAGE_PATH);
    const data = JSON.parse(content);
    if (typeof data?.time === 'string' && isValidTime(data.time)) {
      return data.time;
    }
  } catch (error) {
    console.warn('Failed to read reminder time', error);
  }
  return REMINDER_DEFAULT;
}

export function getReminderTimeSync() {
  return cachedTime;
}

export async function hydrateReminderTime(): Promise<string> {
  if (hydrated && !loadingPromise) {
    return cachedTime;
  }
  if (!loadingPromise) {
    loadingPromise = readFromDisk().then((value) => {
      cachedTime = value;
      hydrated = true;
      loadingPromise = null;
      return value;
    });
  }
  return loadingPromise;
}

export async function setReminderTime(value: string): Promise<void> {
  if (!isValidTime(value)) {
    return;
  }
  cachedTime = value;
  hydrated = true;
  if (!STORAGE_PATH) {
    return;
  }
  try {
    await FileSystem.writeAsStringAsync(STORAGE_PATH, JSON.stringify({ time: value }));
  } catch (error) {
    console.warn('Failed to persist reminder time', error);
  }
}
