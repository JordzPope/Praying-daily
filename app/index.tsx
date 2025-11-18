import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });

export default function IntroScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <FontAwesome5 name="praying-hands" size={120} color="#3A1F0F" />
        </View>
        <Text style={styles.title}>Talk with Jesus</Text>
        <Text style={styles.subtitle}>
          Set a rhythm, get nudges, and be pulled back to prayer in minutes a day.
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.button}
          onPress={() => router.push('/time')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5D7B1',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2E1408',
    fontFamily: FONT_FAMILY,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#2E1408',
    opacity: 0.85,
    fontFamily: FONT_FAMILY,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#3F8A3D',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    alignSelf: 'center',
    width: '85%',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
});
