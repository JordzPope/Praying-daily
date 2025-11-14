import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

const FONT_FAMILY = Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium', default: 'sans-serif' });

export default function IntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.topGlow} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoWrapper}>
            <FontAwesome5 name="praying-hands" size={120} color="#3A1F0F" />
          </View>
          <Text style={styles.title}>Talk with Jesus</Text>
          <Text style={styles.subtitle}>
            Set a rhythm, get nudges, and be pulled back to prayer in minutes a day.
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.button}
          onPress={() => router.push('/time')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#BA7B49',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#F0C796',
    opacity: 0.55,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  content: {
    marginTop: 32,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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
    marginTop: 16,
    color: '#2E1408',
    opacity: 0.85,
    fontFamily: FONT_FAMILY,
  },
  button: {
    backgroundColor: '#3F8A3D',
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
