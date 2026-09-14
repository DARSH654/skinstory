import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedProps,
} from 'react-native-reanimated';

const BAR_COUNT = 40;
const BAR_WIDTH = 4;
const BAR_GAP = 3;
const MAX_BAR_HEIGHT = 110;
const MIN_BAR_HEIGHT = 4;
const WAVEFORM_W = BAR_COUNT * (BAR_WIDTH + BAR_GAP);

const AnimatedRect = Animated.createAnimatedComponent(Rect);

function WaveBar({ index, amplitude, totalBars }: { index: number; amplitude: number; totalBars: number }) {
  const h = useSharedValue(MIN_BAR_HEIGHT);

  useEffect(() => {
    const center = totalBars / 2;
    const dist = Math.abs(index - center) / center;
    const bell = Math.cos((dist * Math.PI) / 2);
    const variance = 0.65 + Math.random() * 0.7;
    const target = amplitude > 0.01
      ? MIN_BAR_HEIGHT + bell * amplitude * MAX_BAR_HEIGHT * variance
      : MIN_BAR_HEIGHT + bell * 7;
    h.value = withSpring(target, { damping: 14, stiffness: 200, mass: 0.35 });
  }, [amplitude]);

  const animProps = useAnimatedProps(() => ({ height: h.value, y: (MAX_BAR_HEIGHT - h.value) / 2 }));
  const x = index * (BAR_WIDTH + BAR_GAP);
  const center = totalBars / 2;
  const t = Math.abs(index - center) / center;
  const r = Math.round(147 + t * (244 - 147));
  const g = Math.round(122 + t * (114 - 122));
  const b = Math.round(189 + t * (182 - 189));

  return (
    <AnimatedRect x={x} width={BAR_WIDTH} rx={BAR_WIDTH / 2} fill={`rgb(${r},${g},${b})`} opacity={0.92} animatedProps={animProps} />
  );
}

export default function StartRoutineScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [routine, setRoutine] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amplitude, setAmplitude] = useState(0.05);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');

  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idlePhase = useRef(0);

  // Hook real live microphone volume from speech recognition
  useSpeechRecognitionEvent('volumechange', (event) => {
    // event.value gives live acoustic volume (-2 to 10 dB on Android / 0 to 1 on iOS)
    if (isListening && event.value !== undefined) {
      const normalized = Math.max(0.05, Math.min(1, (event.value + 2) / 12));
      setAmplitude(normalized);
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      const text = event.results[0]?.transcript || '';
      setSpokenTranscript(text);
    }
  });

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('Speech Recognition Error:', event.error, event.message);
    setIsListening(false);
  });

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const stored = await AsyncStorage.getItem('routines');
          if (stored) {
            const list = JSON.parse(stored);
            const found = list.find((r: any) => r.id === id);
            if (found) setRoutine(found);
          }
        } catch (e) {
          console.error('Failed to load routine', e);
        }
        setLoading(false);
      };
      if (id) load();
      return () => {
        stopSpeech();
      };
    }, [id])
  );

  // Gentle idle breathing wave when not actively speaking
  useEffect(() => {
    if (!isListening) {
      idleTimerRef.current = setInterval(() => {
        idlePhase.current += 0.08;
        const idleAmp = 0.06 + Math.sin(idlePhase.current) * 0.04;
        setAmplitude(Math.max(0.03, idleAmp));
      }, 80);
    }
    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [isListening]);

  const startSpeech = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        console.warn('Microphone permission not granted');
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true
      });
    } catch (e) {
      console.error('Failed to start speech recognition', e);
    }
  };

  const stopSpeech = () => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (_) {}
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopSpeech();
    } else {
      startSpeech();
    }
  };

  const stepsKeys = routine
    ? Object.keys(routine.stepData || {}).map((k) => parseInt(k)).sort((a, b) => a - b)
    : [];
  const totalSteps = stepsKeys.length || 1;
  const currentStepKey = stepsKeys[currentStepIndex] || 1;
  const currentStep = routine?.stepData?.[currentStepKey] || {};
  const actionText = currentStep.actionTitle || `Step ${currentStepIndex + 1}`;

  const goNext = () => { if (currentStepIndex < totalSteps - 1) setCurrentStepIndex((p) => p + 1); };
  const goPrev = () => { if (currentStepIndex > 0) setCurrentStepIndex((p) => p - 1); };
  const handleTap = (e: any) => { if (e.nativeEvent.locationX > SCREEN_WIDTH / 2) goNext(); else goPrev(); };

  if (loading || !routine) {
    return (
      <View style={[styles.container, styles.centerFlex, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <Text style={[styles.loadingText, { color: isDark ? '#e2e8f0' : '#475569' }]}>Preparing your routine...</Text>
      </View>
    );
  }

  const progressPct = `${((currentStepIndex + 1) / totalSteps) * 100}%`;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* TOP: Routine title + step counter + progress track */}
      <View style={[styles.topBar, { paddingTop: insets.top + 18 }]}>
        <View style={styles.topRow}>
          <Text style={[styles.routineTitle, { color: isDark ? '#ffffff' : '#111827' }]} numberOfLines={1}>{routine.title}</Text>
          <Text style={[styles.stepCounter, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }]}>{currentStepIndex + 1} / {totalSteps}</Text>
        </View>
        <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
          <View style={[styles.trackFill, { width: progressPct as any }]} />
        </View>
      </View>

      {/* CENTER: 40-Bar Real Hardware Microphone Reactive Waveform */}
      <Pressable style={styles.centerFlex} onPress={handleTap}>
        <Svg width={WAVEFORM_W} height={MAX_BAR_HEIGHT}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <WaveBar key={i} index={i} amplitude={amplitude} totalBars={BAR_COUNT} />
          ))}
        </Svg>

        <Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#111827' }]} numberOfLines={2}>{actionText}</Text>

        {spokenTranscript ? (
          <Text style={[styles.transcriptText, { color: isDark ? '#c084fc' : '#937abd' }]} numberOfLines={2}>
            “{spokenTranscript}”
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.micBtn,
            {
              backgroundColor: isDark
                ? (isListening ? 'rgba(147,122,189,0.22)' : 'rgba(255,255,255,0.08)')
                : (isListening ? 'rgba(147,122,189,0.18)' : 'rgba(0,0,0,0.05)'),
              borderColor: isDark
                ? (isListening ? '#937abd' : 'rgba(255,255,255,0.15)')
                : (isListening ? '#937abd' : 'rgba(0,0,0,0.1)'),
            }
          ]}
          onPress={toggleMic}
        >
          <Text style={[styles.micBtnText, { color: isDark ? '#ffffff' : '#111827' }]}>
            {isListening ? '??  Live Mic Active (Speak now)' : '??  Tap to start speaking'}
          </Text>
        </Pressable>

        <Text style={[styles.hint, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }]}>? tap screen left / right to navigate steps ?</Text>
      </Pressable>

      {/* BOTTOM: Exit Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.endBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.endBtnText, { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }]}>End Routine</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  loadingText: { fontSize: 16 },
  topBar: { paddingHorizontal: 24 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  routineTitle: { fontSize: 16, fontWeight: '700', maxWidth: '60%' },
  stepCounter: { fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  track: { height: 3, borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: '100%', backgroundColor: '#937abd' },
  actionText: { fontSize: 22, fontWeight: '800', textAlign: 'center', lineHeight: 30, paddingHorizontal: 28 },
  transcriptText: { fontSize: 15, fontWeight: '600', fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 32 },
  micBtn: { paddingVertical: 11, paddingHorizontal: 26, borderRadius: 30, borderWidth: 1 },
  micBtnText: { fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  hint: { fontSize: 11, letterSpacing: 0.4 },
  bottomBar: { alignItems: 'center' },
  endBtn: { paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20 },
  endBtnText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
});

