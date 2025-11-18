import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TOPIC_ICON_COLOR, getTopicById, TopicId } from '@/constants/topics';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });
const PRIMARY_GREEN = '#3F8A3D';

const DAYS = [
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'S' },
] as const;

export default function PrayerDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ topic?: TopicId }>();
  const topic = getTopicById(Array.isArray(params.topic) ? params.topic[0] : params.topic);

  const [prayerName, setPrayerName] = useState('');
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const dayStates = useMemo(() => DAYS.map((day) => ({ ...day, active: selectedDays.has(day.id) })), [selectedDays]);

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }
      return next;
    });
  };

  const handleRepeatToggle = () => {
    setRepeatDaily((prev) => {
      const nextState = !prev;
      setSelectedDays(nextState ? new Set(DAYS.map((day) => day.id)) : new Set());
      return nextState;
    });
  };

  const handleReminderToggle = () => {
    setReminderEnabled((prev) => {
      const next = !prev;
      if (next) {
        Alert.alert('Turn on notifications', 'We will remind you when it is time to pray.');
      }
      return next;
    });
  };

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.heading}>Prayer details</Text>

        <View style={styles.topicCard}>
          <View style={styles.topicIconWrapper}>
            <FontAwesome5 name={topic.icon as any} size={48} color={TOPIC_ICON_COLOR} />
          </View>
          <Text style={styles.topicLabel}>{topic.label}</Text>
        </View>

        <View style={styles.formCard}>
          <TextInput
            value={prayerName}
            onChangeText={setPrayerName}
            placeholder="Name your prayer"
            placeholderTextColor="rgba(46,20,8,0.5)"
            style={styles.input}
          />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Repeat daily</Text>
            <Checkbox checked={repeatDaily} onToggle={handleRepeatToggle} />
          </View>

          <View style={styles.dayRow}>
            {dayStates.map((day, index) => (
              <Pressable
                key={day.id}
                style={[styles.dayPill, day.active && styles.dayPillActive]}
                onPress={() => toggleDay(day.id)}>
                <Text style={[styles.dayLabel, day.active && styles.dayLabelActive]}>{day.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Set reminder</Text>
            <Checkbox checked={reminderEnabled} onToggle={handleReminderToggle} />
          </View>
        </View>

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue to add prayer</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <Pressable style={[styles.checkbox, checked && styles.checkboxChecked]} onPress={onToggle}>
      {checked && <FontAwesome5 name="check" size={14} color="#FFFFFF" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EBC5A4',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 24,
  },
  heading: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    color: '#1B1008',
    fontWeight: '700',
    marginTop: 24,
    fontFamily: FONT_FAMILY,
  },
  topicCard: {
    alignItems: 'center',
    gap: 8,
  },
  topicIconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F0DED0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicLabel: {
    fontSize: 18,
    color: '#4C2A16',
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  formCard: {
    backgroundColor: '#F9E8D7',
    borderRadius: 28,
    padding: 20,
    gap: 24,
  },
  input: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D6C2B4',
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2E1408',
    fontFamily: FONT_FAMILY,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 18,
    color: '#2E1408',
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#A9A093',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillActive: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  dayLabel: {
    color: '#7A6A5C',
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  dayLabelActive: {
    color: '#FFFFFF',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8B7B6C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  button: {
    marginTop: 'auto',
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
});
