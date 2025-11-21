import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_CHANNEL_ID = 'daily-prayer-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Daily Prayer Reminder',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) {
    return null;
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export async function requestReminderPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return Boolean(requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL);
}

export async function cancelScheduledReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDailyReminder(time: string): Promise<boolean> {
  const parsed = parseTime(time);
  if (!parsed) {
    return false;
  }

  const granted = await requestReminderPermissions();
  if (!granted) {
    return false;
  }

  await ensureAndroidChannel();
  await cancelScheduledReminders();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to pray',
      body: "Open Praying Daily to see today's prayers.",
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: parsed.hour,
      minute: parsed.minute,
      repeats: true,
      channelId: Platform.OS === 'android' ? REMINDER_CHANNEL_ID : undefined,
    },
  });

  return true;
}
