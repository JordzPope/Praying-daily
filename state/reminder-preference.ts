import * as FileSystem from 'expo-file-system';

type DirectoryHandles = typeof FileSystem & { documentDirectory?: string | null; cacheDirectory?: string | null };
const directories = FileSystem as DirectoryHandles;
const BASE_DIRECTORY = directories.documentDirectory ?? directories.cacheDirectory ?? null;
const STORAGE_PATH = BASE_DIRECTORY ? `${BASE_DIRECTORY}reminder-time.json` : null;
export const REMINDER_DEFAULT = '07:00';

type ReminderData = {
  time: string;
  enabled: boolean;
};

const DEFAULT_DATA: ReminderData = {
  time: REMINDER_DEFAULT,
  enabled: false,
};

let cachedData: ReminderData = { ...DEFAULT_DATA };
let hydrated = false;
let loadingPromise: Promise<ReminderData> | null = null;

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

async function readFromDisk(): Promise<ReminderData> {
  if (!STORAGE_PATH) {
    return DEFAULT_DATA;
  }
  try {
    const info = await FileSystem.getInfoAsync(STORAGE_PATH);
    if (!info.exists) {
      return DEFAULT_DATA;
    }
    const content = await FileSystem.readAsStringAsync(STORAGE_PATH);
    const parsed = JSON.parse(content);
    if (typeof parsed === 'string') {
      return isValidTime(parsed) ? { time: parsed, enabled: false } : DEFAULT_DATA;
    }
    const parsedTime = typeof parsed?.time === 'string' && isValidTime(parsed.time) ? parsed.time : REMINDER_DEFAULT;
    const parsedEnabled = typeof parsed?.enabled === 'boolean' ? parsed.enabled : false;
    return { time: parsedTime, enabled: parsedEnabled };
  } catch (error) {
    console.warn('Failed to read reminder preferences', error);
  }
  return DEFAULT_DATA;
}

async function persistToDisk(data: ReminderData) {
  if (!STORAGE_PATH) {
    return;
  }
  try {
    await FileSystem.writeAsStringAsync(STORAGE_PATH, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to persist reminder preferences', error);
  }
}

export function getReminderTimeSync() {
  return cachedData.time;
}

export function getReminderEnabledSync() {
  return cachedData.enabled;
}

export async function hydrateReminderPreferences(): Promise<ReminderData> {
  if (hydrated && !loadingPromise) {
    return cachedData;
  }
  if (!loadingPromise) {
    loadingPromise = readFromDisk().then((value) => {
      cachedData = value;
      hydrated = true;
      loadingPromise = null;
      return value;
    });
  }
  return loadingPromise;
}

export async function hydrateReminderTime(): Promise<string> {
  const data = await hydrateReminderPreferences();
  return data.time;
}

export async function setReminderTime(value: string): Promise<void> {
  if (!isValidTime(value)) {
    return;
  }
  cachedData = { ...cachedData, time: value };
  hydrated = true;
  await persistToDisk(cachedData);
}

export async function setReminderEnabledPreference(value: boolean): Promise<void> {
  cachedData = { ...cachedData, enabled: value };
  hydrated = true;
  await persistToDisk(cachedData);
}
