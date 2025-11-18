import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { TOPICS, TOPIC_ICON_COLOR } from '@/constants/topics';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });

export default function TopicSelectionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(TOPICS[0].id);

  const cards = useMemo(() => TOPICS, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.heading}>Topic for your first daily prayer</Text>

        <View style={styles.grid}>
          {cards.map((topic) => {
            const isSelected = topic.id === selected;
            return (
              <TouchableOpacity
                key={topic.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                activeOpacity={0.85}
                onPress={() => setSelected(topic.id)}>
                <View style={styles.iconWrapper}>
                  <FontAwesome5 name={topic.icon as any} size={40} color={TOPIC_ICON_COLOR} />
                </View>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{topic.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: '/prayer-details',
              params: { topic: selected },
            } as never)
          }>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
    lineHeight: 32,
    textAlign: 'center',
    color: '#1B1008',
    fontWeight: '700',
    marginTop: 96,
    fontFamily: FONT_FAMILY,
  },
  grid: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
  card: {
    width: '48%',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#F9E8D7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#3F8A3D',
    shadowColor: '#3F8A3D',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#F0DED0',
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4C2A16',
    fontFamily: FONT_FAMILY,
  },
  cardLabelSelected: {
    color: '#2B6026',
  },
  button: {
    backgroundColor: '#3F8A3D',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    alignSelf: 'center',
    width: '85%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
});
