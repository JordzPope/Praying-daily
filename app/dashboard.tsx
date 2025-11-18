import { useMemo, useState } from 'react';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

import { TOPIC_ICON_COLOR, TOPICS, TopicId, getTopicById } from '@/constants/topics';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });
const PRIMARY_GREEN = '#3F8A3D';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DashboardScreen() {
  const params = useLocalSearchParams<{
    topic?: TopicId;
    name?: string;
    repeat?: string;
    days?: string;
    reminder?: string;
  }>();

  const today = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => buildWeek(today), [today]);
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const onboardingPrayer = useMemo(() => {
    const topicId = Array.isArray(params.topic) ? params.topic[0] : params.topic;
    if (!topicId) return undefined;
    const topic = getTopicById(topicId);
    const nameParam = Array.isArray(params.name) ? params.name[0] : params.name;
    const reminderParam = Array.isArray(params.reminder) ? params.reminder[0] : params.reminder;
    const dayParam = Array.isArray(params.days) ? params.days[0] : params.days;

    return {
      id: `onboarding-${topic.id}`,
      topicId: topic.id,
      name: nameParam && nameParam.length > 0 ? nameParam : `${topic.label} Prayer` ,
      reminder: reminderParam === '1',
      days: safeParseDays(dayParam),
      completed: false,
    } as PrayerItem;
  }, [params]);

  const [activePrayers, setActivePrayers] = useState<PrayerItem[]>(() => {
    if (onboardingPrayer) {
      return [onboardingPrayer, ...samplePrayers.filter((p) => p.id !== onboardingPrayer.id)];
    }
    return samplePrayers;
  });

  const [completedPrayers, setCompletedPrayers] = useState<PrayerItem[]>([]);

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

  const renderPrayer = (prayer: PrayerItem, completed = false) => {
    const topic = getTopicById(prayer.topicId);
    return (
      <View key={prayer.id} style={[styles.prayerCard, completed && styles.prayerCardCompleted]}>
        <View style={styles.prayerIconWrapper}>
          <FontAwesome5 name={topic.icon as any} size={22} color={TOPIC_ICON_COLOR} />
        </View>
        <View style={styles.prayerInfo}>
          <Text style={styles.prayerName}>{prayer.name}</Text>
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
          <FontAwesome5 name="bell" size={18} color="#1B1008" />
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

      <Pressable style={styles.addButton} accessibilityLabel="Add prayer">
        <FontAwesome5 name="plus" size={20} color="#FFFFFF" />
      </Pressable>
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

function safeParseDays(serialized?: string) {
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
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
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
});
