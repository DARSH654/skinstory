import React from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { getResponsiveValue } from '@/constants/theme';

interface Props {
  step: number;
  total: number;
}

const PRIMARY = '#937abd';

export default function OnboardingProgressBar({ step, total }: Props) {
  const router = useRouter();
  const progress = step / total;

  return (
    <View style={styles.container}>
      {/* Back button — grey circle tap area */}
      <Pressable
        style={({ pressed }) => [
          styles.backBtn,
          pressed && styles.backBtnPressed,
        ]}
        onPress={() => router.back()}
        hitSlop={6}
      >
        <ArrowLeft
          size={getResponsiveValue(17, 19, 21, 23)}
          color="#111111"
          strokeWidth={2.8}
        />
      </Pressable>

      {/* Progress track — black bordered, primary fill */}
      <View style={styles.trackBorder}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveValue(14, 18, 22, 22),
    paddingTop: getResponsiveValue(6, 8, 10, 12),
    paddingBottom: getResponsiveValue(4, 5, 6, 6),
    gap: getResponsiveValue(10, 12, 14, 14),
  },

  // Circular grey tap area for back button
  backBtn: {
    width: getResponsiveValue(34, 38, 42, 46),
    height: getResponsiveValue(34, 38, 42, 46),
    borderRadius: getResponsiveValue(17, 19, 21, 23),
    backgroundColor: '#efefef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    backgroundColor: '#e0e0e0',
  },

  // Black border wrapping the track
  trackBorder: {
    flex: 1,
    borderWidth: 2.5,
    borderColor: '#111111',
    borderRadius: 99,
    padding: 0.5,
  },
  track: {
    width: '100%',
    height: getResponsiveValue(4, 5, 5.5, 6),
    backgroundColor: '#e8e8e8',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 99,
  },
});
