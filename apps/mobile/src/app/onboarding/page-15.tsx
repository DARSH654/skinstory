import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function OnboardingPage15() {
  const mountStart = useRef(Date.now());
  const renderCount = useRef(0);
  renderCount.current += 1;
  const _renderNum = renderCount.current;
  console.log(`[PAGE-15 PERF] 🔄 RENDER #${_renderNum} at ${Date.now() - mountStart.current}ms after mount`);

  const router = useRouter();

  useEffect(() => {
    const elapsed = Date.now() - mountStart.current;
    console.log(`[PAGE-15 PERF] ⚡ MOUNTED in ${elapsed}ms (Final Onboarding Step)`);
    return () => {
      console.log(`[PAGE-15 PERF] 💀 UNMOUNTED after ${Date.now() - mountStart.current}ms`);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} maxFontSizeMultiplier={1.2}>Page 15</Text>
      <Pressable 
        style={styles.button} 
        onPress={() => {
          const t = Date.now();
          console.log(`[PAGE-15 ACTION] 🏁 Finish Onboarding PRESSED`);
          console.log(`[PAGE-15 -> HOME] 🚀 router.replace('/') called`);
          router.replace('/');
          console.log(`[PAGE-15 -> HOME] ⏱️ dispatched in ${Date.now() - t}ms`);
        }}
      >
        <Text style={styles.buttonText} maxFontSizeMultiplier={1.2}>Finish Onboarding</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(24),
  },
  title: {
    fontSize: moderateScale(24, 0.3),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: verticalScale(40),
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(36),
    borderRadius: moderateScale(30, 0.3),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: moderateScale(16, 0.3),
    fontWeight: '600',
  },
});
