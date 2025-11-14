import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
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

type WheelPickerProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel?: string;
};

export default function TimeSelectionScreen() {
  const router = useRouter();
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');

  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.heading}>What time do you usually pray?</Text>

        <View style={styles.sceneContainer}>
          <View style={styles.sunGlow} />
          <View style={styles.sunCore} />
          <View style={styles.hillBack} />
          <View style={styles.hillFront} />
        </View>

        <View style={styles.pickerPanel}>
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

        <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={() => router.push('/topic')}>
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
      <View pointerEvents="none" style={styles.wheelHighlight} />
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
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    color: '#1E140A',
    fontWeight: '700',
    marginTop: 32,
    fontFamily: FONT_FAMILY,
  },
  sceneContainer: {
    marginTop: 24,
    height: 220,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#E7F6C2',
    justifyContent: 'flex-end',
  },
  sunGlow: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFEEC1',
    opacity: 0.65,
  },
  sunCore: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFD98A',
  },
  hillBack: {
    position: 'absolute',
    bottom: 70,
    left: -50,
    width: '150%',
    height: 140,
    backgroundColor: '#7BC490',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 200,
  },
  hillFront: {
    position: 'absolute',
    bottom: 0,
    left: -30,
    width: '160%',
    height: 150,
    backgroundColor: '#55A860',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 220,
  },
  pickerPanel: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 32,
    borderRadius: 32,
    backgroundColor: '#5FB16A',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    columnGap: 16,
  },
  wheelContainer: {
    flex: 1,
    height: 180,
    position: 'relative',
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
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FONT_FAMILY,
  },
  wheelTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  wheelHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  button: {
    backgroundColor: '#A25A30',
    paddingVertical: 16,
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
