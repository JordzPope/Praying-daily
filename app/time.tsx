import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });
const ITEM_HEIGHT = 48;
const VISIBLE_ITEM_COUNT = 3;

import { scheduleDailyReminder } from '@/lib/reminder-notifications';
import { getReminderEnabledSync, getReminderTimeSync, hydrateReminderTime, setReminderTime } from '@/state/reminder-preference';

type WheelPickerProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel?: string;
};

export default function TimeSelectionScreen() {
  const router = useRouter();
  const initial = getReminderTimeSync();
  const [hour, setHour] = useState(initial.split(':')[0]);
  const [minute, setMinute] = useState(initial.split(':')[1]);

  useEffect(() => {
    hydrateReminderTime().then((value) => {
      const [h, m] = value.split(':');
      setHour(h);
      setMinute(m);
    });
  }, []);

  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContent}>
          <Text style={styles.heading}>What time do you usually pray?</Text>

          <View style={styles.cardShell}>
            <View style={styles.selectionCard}>
              <View style={styles.pickerRow}>
                <WheelPicker options={hourOptions} value={hour} onChange={setHour} accessibilityLabel="Hour picker" />
                <WheelPicker
                  options={minuteOptions}
                  value={minute}
                  onChange={setMinute}
                  accessibilityLabel="Minute picker"
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={async () => {
            const nextTime = `${hour}:${minute}`;
            await setReminderTime(nextTime);
            if (getReminderEnabledSync()) {
              const scheduled = await scheduleDailyReminder(nextTime);
              if (!scheduled) {
                Alert.alert('Notifications disabled', 'Enable notifications in your device settings to receive reminders.');
              }
            }
            router.push('/topic');
          }}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

function WheelPicker({ options, value, onChange, accessibilityLabel }: WheelPickerProps) {
  const listRef = useRef<FlatList<string>>(null);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const getItemLayout = useCallback((_: ArrayLike<string> | null | undefined, index: number) => {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };
  }, []);

  useEffect(() => {
    const initialIndex = Math.max(options.indexOf(value), 0);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: initialIndex * ITEM_HEIGHT, animated: false });
    });
  }, [value, options]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
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
      <View style={[styles.wheelItem, isActive && styles.wheelItemActive]}>
        <Text style={[styles.wheelText, isActive && styles.wheelTextActive]}>{item}</Text>
      </View>
    );
  };

  return (
    <View style={styles.wheelContainer} accessibilityLabel={accessibilityLabel} accessible>
      <FlatList
        ref={listRef}
        data={options}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialNumToRender={options.length}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.wheelContent}
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    color: '#1E140A',
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },
  cardShell: {
    width: '85%',
    alignSelf: 'center',
    borderRadius: 32,
    shadowColor: '#B58A5F',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  selectionCard: {
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8E3C8',
    borderWidth: 1,
    borderColor: 'rgba(46,20,8,0.08)',
    overflow: 'hidden',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    columnGap: 24,
  },
  wheelContainer: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEM_COUNT,
    position: 'relative',
    overflow: 'hidden',
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemActive: {
    transform: [{ scale: 1.05 }],
  },
  wheelText: {
    fontSize: 24,
    lineHeight: ITEM_HEIGHT,
    color: '#2E1408',
    fontFamily: FONT_FAMILY,
    textAlign: 'center',
  },
  wheelTextActive: {
    color: '#2E1408',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#3F8A3D',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
});
