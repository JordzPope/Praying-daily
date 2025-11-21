import { useEffect, useRef } from 'react';
import { Animated, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { getTopicById } from '@/constants/topics';
import { hydratePrayers, savePrayers, StoredPrayer } from '@/state/prayer-storage';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });
const PRIMARY_GREEN = '#3F8A3D';

export default function AddConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<PrayerParams>();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    hydratePrayers().then((existing) => {
      const normalized = normalizeParams(params);
      if (!normalized) return;
      const filtered = existing.filter((prayer) => prayer.id !== normalized.id);
      savePrayers([normalized, ...filtered]);
    });

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 250, useNativeDriver: true }),
      ]),
    ]).start(() => {
      router.push({ pathname: '/dashboard', params } as never);
    });
  }, [opacity, params, router, scale]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}> 
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="praying-hands" size={72} color={PRIMARY_GREEN} />
          </View>
          <Text style={styles.heading}>Your prayer has been added</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

type PrayerParams = {
  id?: string;
  topic?: string;
  topicLabel?: string;
  name?: string;
  days?: string;
  reminder?: string;
  completed?: string;
  mode?: 'new' | 'edit';
};

function normalizeParams(params: PrayerParams): StoredPrayer | null {
  const topicId = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const topic = getTopicById(topicId);
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const nameParam = Array.isArray(params.name) ? params.name[0] : params.name;
  const topicLabelParam = Array.isArray(params.topicLabel) ? params.topicLabel[0] : params.topicLabel;
  const reminderParam = Array.isArray(params.reminder) ? params.reminder[0] : params.reminder;
  const daysParam = Array.isArray(params.days) ? params.days[0] : params.days;
  const completedParam = Array.isArray(params.completed) ? params.completed[0] : params.completed;

  if (!idParam || !topicId) {
    return null;
  }

  const days = safeParseStringArray(daysParam);

  return {
    id: idParam,
    topicId: topic.id,
    topicLabel: topicLabelParam ?? topic.label,
    name: nameParam && nameParam.length > 0 ? nameParam : `${topic.label} Prayer`,
    days,
    reminder: reminderParam === '1',
    completed: completedParam === '1',
  };
}

function safeParseStringArray(serialized?: string) {
  if (!serialized) return [] as string[];
  try {
    const parsed = JSON.parse(serialized);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5D7B1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    gap: 24,
    padding: 40,
    borderRadius: 32,
    backgroundColor: '#F9E8D7',
    shadowColor: PRIMARY_GREEN,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0DED0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1B1008',
    fontFamily: FONT_FAMILY,
  },
});
