import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TOPIC_ICON_COLOR, TOPICS } from '@/constants/topics';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });

export default function AddTopicScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(TOPICS[0].id);

  const cards = useMemo(() => TOPICS, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
            <FontAwesome5 name="arrow-left" size={18} color="#4C2A16" />
          </Pressable>
          <Text style={styles.headerTitle}>Add a new daily prayer</Text>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.heading}>Pick a Category</Text>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}>
          {cards.map((topic) => {
            const isSelected = topic.id === selected;
            return (
              <TouchableOpacity
                key={topic.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                activeOpacity={0.85}
                onPress={() => setSelected(topic.id)}>
                <View style={styles.iconWrapper}>
                  <FontAwesome5 name={topic.icon as any} size={42} color={TOPIC_ICON_COLOR} />
                </View>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{topic.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: '/add-prayer-details',
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
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4C2A16',
    fontFamily: FONT_FAMILY,
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    color: '#1B1008',
    fontWeight: '700',
    marginTop: 12,
    fontFamily: FONT_FAMILY,
  },
  scrollArea: {
    flex: 1,
  },
  grid: {
    paddingBottom: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
  card: {
    width: '48%',
    borderRadius: 28,
    paddingVertical: 26,
    paddingHorizontal: 16,
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
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#F0DED0',
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4C2A16',
    textAlign: 'center',
    fontFamily: FONT_FAMILY,
  },
  cardLabelSelected: {
    color: '#2B6026',
  },
  button: {
    backgroundColor: '#3F8A3D',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    alignSelf: 'center',
    width: '85%',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
});
