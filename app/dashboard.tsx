import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

import { dayIdsToLabels, filterDayIds, labelsToDayIds } from '@/constants/days';
import { TOPIC_ICON_COLOR, TOPICS, TopicId, getTopicById } from '@/constants/topics';
import { scheduleDailyReminder } from '@/lib/reminder-notifications';
import { getReminderEnabledSync, getReminderTimeSync, hydrateReminderPreferences, setReminderTime } from '@/state/reminder-preference';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });
const PRIMARY_GREEN = '#3F8A3D';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const REMINDER_ITEM_HEIGHT = 48;
const REMINDER_VISIBLE_COUNT = 3;

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    topic?: TopicId;
    name?: string;
    repeat?: string;
    days?: string;
    reminder?: string;
    id?: string;
    dayIds?: string;
    mode?: 'new' | 'edit';
  }>();

  const today = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => buildWeek(today), [today]);
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const incomingPrayer = useMemo(() => {
    const topicId = Array.isArray(params.topic) ? params.topic[0] : params.topic;
    if (!topicId) return undefined;
    const topic = getTopicById(topicId);
    const nameParam = Array.isArray(params.name) ? params.name[0] : params.name;
    const reminderParam = Array.isArray(params.reminder) ? params.reminder[0] : params.reminder;
    const dayParam = Array.isArray(params.days) ? params.days[0] : params.days;
    const dayIdsParam = Array.isArray(params.dayIds) ? params.dayIds[0] : params.dayIds;
    const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const modeParam = Array.isArray(params.mode) ? params.mode[0] : params.mode;

    const parsedDayIds = filterDayIds(safeParseStringArray(dayIdsParam));
    const parsedDayLetters = safeParseStringArray(dayParam);
    const resolvedDayLabels = parsedDayIds.length > 0 ? dayIdsToLabels(parsedDayIds) : parsedDayLetters;

    return {
      id: idParam ?? `prayer-${Date.now()}`,
      topicId: topic.id,
      name: nameParam && nameParam.length > 0 ? nameParam : `${topic.label} Prayer`,
      reminder: reminderParam === '1',
      days: resolvedDayLabels,
      completed: false,
      mode: modeParam ?? 'new',
    } as PrayerItem;
  }, [params]);

  const [activePrayers, setActivePrayers] = useState<PrayerItem[]>(samplePrayers);
  const [completedPrayers, setCompletedPrayers] = useState<PrayerItem[]>([]);
  const initialReminderTime = getReminderTimeSync();
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerItem | null>(null);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [reminderHour, setReminderHour] = useState(initialReminderTime.split(':')[0]);
  const [reminderMinute, setReminderMinute] = useState(initialReminderTime.split(':')[1]);

  const reminderHourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const reminderMinuteOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);

  useEffect(() => {
    hydrateReminderPreferences().then(({ time }) => {
      const [hour, minute] = time.split(':');
      setReminderHour(hour);
      setReminderMinute(minute);
    });
  }, []);

  useEffect(() => {
    if (!incomingPrayer) return;
    if (incomingPrayer.mode === 'edit') {
      setActivePrayers((current) => {
        const exists = current.some((p) => p.id === incomingPrayer.id);
        if (exists) {
          return current.map((p) => (p.id === incomingPrayer.id ? { ...incomingPrayer, mode: undefined } : p));
        }
        return current;
      });
      setCompletedPrayers((current) => current.map((p) => (p.id === incomingPrayer.id ? { ...incomingPrayer, mode: undefined } : p)));
    } else {
      setActivePrayers((current) => [{ ...incomingPrayer, mode: undefined }, ...current.filter((p) => p.id !== incomingPrayer.id)]);
    }
  }, [incomingPrayer]);

  const toggleComplete = (prayer: PrayerItem) => {
    setActivePrayers((current) => {
      if (current.find((p) => p.id === prayer.id)) {
        setCompletedPrayers((done) => [{ ...prayer, completed: true }, ...done]);
        return current.filter((p) => p.id !== prayer.id);
      }
      return current;
    });

    setCompletedPrayers((done) => {
      if (done.find((p) => p.id === prayer.id)) {
        setActivePrayers((current) => [...current, { ...prayer, completed: false }]);
        return done.filter((p) => p.id !== prayer.id);
      }
      return done;
    });
  };

  const shouldShowPrayer = (prayer: PrayerItem) => {
    if (prayer.days.length === 0) return true;
    const dayLabel = selectedDay.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0).toUpperCase();
    if (prayer.days.includes('Daily')) return true;
    if (prayer.days.includes(dayLabel)) return true;
    return false;
  };

  const openOptions = (prayer: PrayerItem) => {
    setSelectedPrayer(prayer);
    setOptionsVisible(true);
  };

  const handleEdit = () => {
    setOptionsVisible(false);
    if (selectedPrayer) {
      const derivedDayIds = labelsToDayIds(selectedPrayer.days);
      router.push({
        pathname: '/edit-prayer',
        params: {
          id: selectedPrayer.id,
          topic: selectedPrayer.topicId,
          name: selectedPrayer.name,
          reminder: selectedPrayer.reminder ? '1' : '0',
          days: JSON.stringify(selectedPrayer.days),
          dayIds: JSON.stringify(derivedDayIds),
        },
      } as never);
    }
  };

  const handleDelete = () => {
    if (selectedPrayer) {
      setActivePrayers((current) => current.filter((p) => p.id !== selectedPrayer.id));
      setCompletedPrayers((done) => done.filter((p) => p.id !== selectedPrayer.id));
    }
    setOptionsVisible(false);
  };

  const renderPrayer = (prayer: PrayerItem, completed = false) => {
    const topic = getTopicById(prayer.topicId);
    return (
      <View key={prayer.id} style={[styles.prayerCard, completed && styles.prayerCardCompleted]}>
        <View style={styles.prayerIconWrapper}>
          <FontAwesome5 name={topic.icon as any} size={22} color={TOPIC_ICON_COLOR} />
        </View>
        <View style={styles.prayerInfo}>
          <Pressable onPress={() => openOptions(prayer)}>
            <Text style={styles.prayerName}>{prayer.name}</Text>
          </Pressable>
          {prayer.days.length > 0 && (
            <Text style={styles.prayerMeta}>{prayer.days.join(', ')}</Text>
          )}
        </View>
        <Pressable
          accessibilityLabel={completed ? 'Mark as incomplete' : 'Mark as complete'}
          onPress={() => toggleComplete(prayer)}
          style={[styles.checkbox, (completed || prayer.completed) && styles.checkboxChecked]}>
          {(completed || prayer.completed) && <FontAwesome5 name="check" size={14} color="#FFFFFF" />}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <FontAwesome5 name="bars" size={18} color="#1B1008" />
          <Text style={styles.todayLabel}>Today</Text>
          <Pressable accessibilityLabel="Change reminder time" onPress={() => setReminderVisible(true)}>
            <FontAwesome5 name="bell" size={18} color="#1B1008" />
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {DAY_LABELS.map((label, index) => {
              const day = weekDays[index];
              const isSelected = isSameDate(day.date, selectedDay);
              return (
                <Pressable
                  key={label + day.display}
                  style={styles.dayContainer}
                  onPress={() => setSelectedDay(day.date)}>
                  <Text style={[
                    styles.dayLabel,
                    isSameDate(day.date, today) && styles.dayLabelActiveToday,
                  ]}>{label}</Text>
                  <View style={[styles.dayCircle, isSelected && styles.dayCircleActive]}>
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>{day.date.getDate()}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Prayer List</Text>
          <View style={styles.prayerList}>
            {activePrayers.filter(shouldShowPrayer).map((prayer) => renderPrayer(prayer))}
            {completedPrayers.length > 0 && (
              <View style={styles.completedSection}>
                <Text style={styles.completedTitle}>Completed</Text>
                {completedPrayers.filter(shouldShowPrayer).map((prayer) => renderPrayer(prayer, true))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Pressable
        style={styles.addButton}
        accessibilityLabel="Add prayer"
        onPress={() => router.push('/add-topic')}>
        <FontAwesome5 name="plus" size={20} color="#FFFFFF" />
      </Pressable>

      <Modal visible={optionsVisible} transparent animationType="fade" onRequestClose={() => setOptionsVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedPrayer?.name}</Text>
            <Pressable style={styles.modalButton} onPress={handleEdit}>
              <Text style={styles.modalButtonText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={handleDelete}>
              <Text style={styles.modalButtonText}>Delete</Text>
            </Pressable>
            <Pressable style={styles.modalCancel} onPress={() => setOptionsVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reminderVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReminderVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>Change the time you pray</Text>
            <View style={styles.reminderPickerRow}>
              <ReminderWheel
                options={reminderHourOptions}
                value={reminderHour}
                onChange={setReminderHour}
                accessibilityLabel="Hour picker"
              />
              <ReminderWheel
                options={reminderMinuteOptions}
                value={reminderMinute}
                onChange={setReminderMinute}
                accessibilityLabel="Minute picker"
              />
            </View>
            <Pressable
              style={styles.reminderSaveButton}
              accessibilityLabel="Save reminder time"
              onPress={async () => {
                const nextTime = `${reminderHour}:${reminderMinute}`;
                await setReminderTime(nextTime);
                if (getReminderEnabledSync()) {
                  const scheduled = await scheduleDailyReminder(nextTime);
                  if (!scheduled) {
                    Alert.alert('Notifications disabled', 'Enable notifications in your device settings to receive reminders.');
                  }
                }
                setReminderVisible(false);
              }}>
              <Text style={styles.reminderSaveText}>Save</Text>
            </Pressable>
            <Pressable style={styles.modalCancel} onPress={() => setReminderVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function buildWeek(today: Date) {
  const weekday = today.getDay();
  const mondayDiff = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayDiff);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { date, display: `${date.getMonth() + 1}/${date.getDate()}` };
  });
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getHeadingLabel(selected: Date, today: Date) {
  if (isSameDate(selected, today)) {
    return 'Today';
  }
  return selected.toLocaleDateString('en-US', { weekday: 'long' });
}

function safeParseStringArray(serialized?: string) {
  if (!serialized) return [];
  try {
    const parsed = JSON.parse(serialized);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

const samplePrayers: PrayerItem[] = [
  { id: 'p1', topicId: 'family', name: 'Family Crisis', days: ['M', 'T', 'W'], reminder: true, completed: false },
  { id: 'p2', topicId: 'health', name: 'Health Concern', days: ['Daily'], reminder: true, completed: false },
  { id: 'p3', topicId: 'work', name: 'Promotion', days: ['Weekdays'], reminder: false, completed: false },
];

interface PrayerItem {
  id: string;
  topicId: TopicId;
  name: string;
  days: string[];
  reminder: boolean;
  completed: boolean;
  mode?: 'new' | 'edit';
}

type ReminderWheelProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel?: string;
};

function ReminderWheel({ options, value, onChange, accessibilityLabel }: ReminderWheelProps) {
  const listRef = useRef<FlatList<string>>(null);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const getItemLayout = useCallback((_: ArrayLike<string> | null | undefined, index: number) => {
    return { length: REMINDER_ITEM_HEIGHT, offset: REMINDER_ITEM_HEIGHT * index, index };
  }, []);

  useEffect(() => {
    const initialIndex = Math.max(options.indexOf(value), 0);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: initialIndex * REMINDER_ITEM_HEIGHT, animated: false });
    });
  }, [value, options]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / REMINDER_ITEM_HEIGHT);
    const safeIndex = Math.min(Math.max(index, 0), options.length - 1);
    const nextValue = options[safeIndex];
    if (nextValue !== internalValue) {
      setInternalValue(nextValue);
      onChange(nextValue);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<string>) => {
    const isActive = item === internalValue;
    return (
      <View style={[styles.reminderWheelItem, isActive && styles.reminderWheelItemActive]}>
        <Text style={[styles.reminderWheelText, isActive && styles.reminderWheelTextActive]}>{item}</Text>
      </View>
    );
  };

  return (
    <View style={styles.reminderWheelContainer} accessibilityLabel={accessibilityLabel} accessible>
      <FlatList
        ref={listRef}
        data={options}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        snapToInterval={REMINDER_ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialNumToRender={options.length}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.reminderWheelContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5D7B1',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  todayLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B1008',
    fontFamily: FONT_FAMILY,
  },
  calendarCard: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: '#F8E7CE',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    color: '#7A6A5C',
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
  },
  dayLabelActiveToday: {
    color: PRIMARY_GREEN,
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCircleActive: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: 'rgba(63,138,61,0.12)',
  },
  dayNumber: {
    color: '#3B2B1D',
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
  },
  dayNumberActive: {
    color: PRIMARY_GREEN,
  },
  listContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1008',
    marginBottom: 12,
    fontFamily: FONT_FAMILY,
    paddingLeft: 32,
    paddingRight: 12,
  },
  prayerList: {
    gap: 16,
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#54A06B',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 12,
  },
  prayerCardCompleted: {
    opacity: 0.6,
  },
  prayerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0DED0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  prayerMeta: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontFamily: FONT_FAMILY,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  completedSection: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  completedTitle: {
    fontSize: 16,
    color: '#3B2B1D',
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PRIMARY_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_GREEN,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#F9E8D7',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1008',
    textAlign: 'center',
    fontFamily: FONT_FAMILY,
  },
  modalButton: {
    backgroundColor: '#3F8A3D',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  modalCancel: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#7A6A5C',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  reminderCard: {
    width: '100%',
    backgroundColor: '#F9E8D7',
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1008',
    textAlign: 'center',
    fontFamily: FONT_FAMILY,
  },
  reminderPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 24,
  },
  reminderWheelContainer: {
    width: 72,
    height: REMINDER_ITEM_HEIGHT * REMINDER_VISIBLE_COUNT,
    overflow: 'hidden',
  },
  reminderWheelContent: {
    paddingVertical: REMINDER_ITEM_HEIGHT,
  },
  reminderWheelItem: {
    height: REMINDER_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderWheelItemActive: {
    transform: [{ scale: 1.05 }],
  },
  reminderWheelText: {
    fontSize: 24,
    color: '#2E1408',
    fontFamily: FONT_FAMILY,
  },
  reminderWheelTextActive: {
    fontWeight: '700',
  },
  reminderSaveButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  reminderSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
});
