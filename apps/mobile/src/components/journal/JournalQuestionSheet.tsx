import React, {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useEffect,
  memo,
} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  BackHandler,
  TextInput,
  PanResponder,
  Alert,
  Image,
} from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { Text } from '@/components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Check, X, Minus, Plus, Camera, Upload, RotateCcw, ArrowRight } from 'lucide-react-native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useJournalStore, JournalHistoryRecord, QuestionDef } from '@/store/journalStore';
import { DraggableScrollDownCircle, useDraggableScroll } from '@/components/ui/draggable-scroll-down-circle';
import SkinExperienceQuestionView from './SkinExperienceQuestionView';

export interface JournalQuestionSheetRef {
  present: (record: JournalHistoryRecord, reanswerKey?: string) => void;
  dismiss: () => void;
}

// Marquee text that animates when pill text overflows
const MarqueeText = memo(function MarqueeText({ text, style }: { text: string; style?: any }) {
  const containerWidthRef = useRef(0);
  const translateX = useSharedValue(0);
  const [shouldScroll, setShouldScroll] = useState(false);

  const onContainerLayout = useCallback((e: any) => {
    containerWidthRef.current = e.nativeEvent.layout.width;
  }, []);

  const onTextLayout = useCallback((e: any) => {
    const w = e.nativeEvent.lines.reduce((max: number, line: any) => Math.max(max, line.width), 0);
    const containerW = containerWidthRef.current;
    const overflow = containerW > 0 && w > containerW + 2;
    setShouldScroll(overflow);
    if (overflow) {
      const distance = w - containerW + 16;
      translateX.value = 0;
      translateX.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 800, easing: Easing.linear }),
          withTiming(-distance, { duration: distance * 22, easing: Easing.linear }),
          withTiming(-distance, { duration: 700, easing: Easing.linear }),
          withTiming(0, { duration: distance * 14, easing: Easing.linear }),
        ),
        -1,
        false
      );
    } else {
      translateX.value = 0;
    }
  }, [translateX]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.marqueeContainer} onLayout={onContainerLayout}>
      <Animated.Text
        numberOfLines={shouldScroll ? 1 : 2}
        onTextLayout={onTextLayout}
        style={[style, animStyle, shouldScroll ? styles.marqueeOverflowText : undefined]}
      >
        {text}
      </Animated.Text>
    </View>
  );
});

// Single option pill memoized for maximum frame rate
interface OptionPillProps {
  opt: { value: string; label: string };
  index: number;
  questionKey: string;
  isSelected: boolean;
  isDark: boolean;
  primaryColor: string;
  onSelect: (qKey: string, val: string) => void;
}

const OptionPill = memo(function OptionPill({
  opt,
  questionKey,
  isSelected,
  isDark,
  primaryColor,
  onSelect,
}: OptionPillProps) {
  const shadowColor = isSelected
    ? isDark
      ? '#4e2d8a'
      : '#735b9c'
    : isDark
    ? 'rgba(255,255,255,0.75)'
    : '#111111';

  const borderColor = isSelected
    ? isDark
      ? '#cdb4f0'
      : primaryColor
    : isDark
    ? 'rgba(255,255,255,0.75)'
    : '#111111';

  const faceBg = isSelected
    ? isDark
      ? '#937abd'
      : '#f0ebf8'
    : isDark
    ? '#2c2c31'
    : '#ffffff';

  const textColor = isDark ? '#ffffff' : '#111111';

  return (
    <View style={styles.optionContainer}>
      <Pressable
        style={styles.optionPressable}
        onPress={() => onSelect(questionKey, opt.value)}
      >
        {({ pressed }) => (
          <>
            <View
              style={[
                styles.optionShadow,
                { backgroundColor: shadowColor },
              ]}
            />
            <View
              style={[
                styles.optionMid,
                {
                  borderColor: shadowColor,
                  top: pressed ? 1 : 1.5,
                  left: pressed ? 1 : 1.5,
                },
              ]}
            />
            <View
              style={[
                styles.optionTop,
                {
                  backgroundColor: faceBg,
                  borderColor: borderColor,
                  transform: [
                    { translateX: pressed ? 1 : 0 },
                    { translateY: pressed ? 1 : 0 },
                  ],
                },
              ]}
            >
              <View style={styles.optionRow}>
                <MarqueeText
                  text={opt.label}
                  style={[styles.optionText, { color: textColor }]}
                />
                {isSelected && (
                  <Check size={20} color={textColor} strokeWidth={3.5} />
                )}
              </View>
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
});

// 3D-rendered Yes / No Big Pill UI
interface BooleanPillGroupProps {
  questionKey: string;
  currentAnswer: string | null;
  isDark: boolean;
  primaryColor: string;
  onSelect: (qKey: string, val: string) => void;
}

const BooleanPillGroup = memo(function BooleanPillGroup({
  questionKey,
  currentAnswer,
  isDark,
  primaryColor,
  onSelect,
}: BooleanPillGroupProps) {
  const options = [
    { label: 'Yes', value: 'Yes', isYes: true },
    { label: 'No', value: 'No', isYes: false },
  ];

  return (
    <View style={styles.booleanRow}>
      {options.map((opt) => {
        const isSelected = currentAnswer === opt.value;
        const shadowColor = isSelected
          ? opt.isYes
            ? isDark ? '#4e2d8a' : '#735b9c'
            : '#991b1b'
          : isDark
          ? 'rgba(255,255,255,0.75)'
          : '#111111';

        const borderColor = isSelected
          ? opt.isYes
            ? isDark ? '#cdb4f0' : primaryColor
            : '#ef4444'
          : isDark
          ? 'rgba(255,255,255,0.75)'
          : '#111111';

        const faceBg = isSelected
          ? isDark
            ? opt.isYes ? '#937abd' : 'rgba(239, 68, 68, 0.25)'
            : opt.isYes ? '#f0ebf8' : '#fee2e2'
          : isDark
          ? '#2c2c31'
          : '#ffffff';

        const textColor = isSelected
          ? opt.isYes
            ? isDark ? '#ffffff' : primaryColor
            : isDark ? '#f87171' : '#b91c1c'
          : isDark
          ? '#ffffff'
          : '#111111';

        return (
          <View key={opt.value} style={styles.booleanBtnContainer}>
            <Pressable
              style={styles.optionPressable}
              onPress={() => onSelect(questionKey, opt.value)}
            >
              {({ pressed }) => (
                <>
                  <View
                    style={[
                      styles.booleanShadow,
                      { backgroundColor: shadowColor },
                    ]}
                  />
                  <View
                    style={[
                      styles.booleanMid,
                      {
                        borderColor: shadowColor,
                        top: pressed ? 1.5 : 2.5,
                        left: pressed ? 1.5 : 2.5,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.booleanTop,
                      {
                        backgroundColor: faceBg,
                        borderColor: borderColor,
                        transform: [
                          { translateX: pressed ? 1.5 : 0 },
                          { translateY: pressed ? 1.5 : 0 },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.booleanContentRow}>
                      {opt.isYes ? (
                        <Check size={24} color={textColor} strokeWidth={3} />
                      ) : (
                        <X size={24} color={textColor} strokeWidth={3} />
                      )}
                      <Text style={[styles.booleanLabelText, { color: textColor }]}>
                        {opt.label}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
});

// ---------------------------------------------------------------------------
// ScaleSliderQuestion: Draggable horizontal slider with circle thumb and uplifted step card
// ---------------------------------------------------------------------------
interface ScaleSliderQuestionProps {
  questionKey: string;
  scaleRange?: '1-3' | '1-5' | '1-10';
  stepLabels?: string[];
  options?: { label: string; value: string }[];
  currentAnswer: string | null;
  isDark: boolean;
  primaryColor: string;
  onSelect: (qKey: string, val: string) => void;
  onContinue: () => void;
}

const ScaleSliderQuestion = memo(function ScaleSliderQuestion({
  questionKey,
  scaleRange,
  stepLabels,
  options,
  currentAnswer,
  isDark,
  primaryColor,
  onSelect,
  onContinue,
}: ScaleSliderQuestionProps) {
  const maxVal = useMemo(() => {
    if (scaleRange === '1-3') return 3;
    if (scaleRange === '1-10') return 10;
    if (scaleRange === '1-5') return 5;
    if (options && options.length > 0) return options.length;
    return 5;
  }, [scaleRange, options]);

  const minVal = 1;

  // Initial value from answer or default to 1
  const initialNum = useMemo(() => {
    if (currentAnswer) {
      const parsed = parseInt(currentAnswer, 10);
      if (!isNaN(parsed) && parsed >= minVal && parsed <= maxVal) {
        return parsed;
      }
    }
    return 1;
  }, [currentAnswer, minVal, maxVal]);

  const [selectedValue, setSelectedValue] = useState(initialNum);
  const selectedValueRef = useRef(selectedValue);
  selectedValueRef.current = selectedValue;

  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);
  const trackViewRef = useRef<View>(null);

  // Sync state if question or currentAnswer changes
  useEffect(() => {
    setSelectedValue(initialNum);
  }, [initialNum, questionKey]);

  const THUMB_RADIUS = 19;

  const updateFromPosition = useCallback((pageX: number) => {
    const totalWidth = trackWidthRef.current;
    if (totalWidth <= THUMB_RADIUS * 2) return;
    const usableWidth = totalWidth - THUMB_RADIUS * 2;
    const relX = Math.max(0, Math.min(pageX - trackPageXRef.current - THUMB_RADIUS, usableWidth));
    const ratio = relX / usableWidth;
    const computedVal = Math.round(minVal + ratio * (maxVal - minVal));
    const clampedVal = Math.max(minVal, Math.min(maxVal, computedVal));
    if (clampedVal !== selectedValueRef.current) {
      setSelectedValue(clampedVal);
      onSelect(questionKey, String(clampedVal));
    }
  }, [minVal, maxVal, questionKey, onSelect]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        trackViewRef.current?.measure((_x, _y, width, _height, pageX) => {
          trackWidthRef.current = width;
          trackPageXRef.current = pageX;
          setTrackWidth(width);
          updateFromPosition(evt.nativeEvent.pageX);
        });
      },
      onPanResponderMove: (evt) => {
        updateFromPosition(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: (evt) => {
        updateFromPosition(evt.nativeEvent.pageX);
      },
    });
  }, [updateFromPosition]);

  const handleTrackLayout = useCallback((e: any) => {
    const w = e.nativeEvent.layout.width;
    trackWidthRef.current = w;
    setTrackWidth(w);
    trackViewRef.current?.measure((_x, _y, width, _height, pageX) => {
      trackWidthRef.current = width;
      trackPageXRef.current = pageX;
      setTrackWidth(width);
    });
  }, []);

  // Compute thumb position percentage (0% to 100%)
  const percentage = maxVal === minVal ? 0 : ((selectedValue - minVal) / (maxVal - minVal)) * 100;
  const usableWidth = Math.max(0, trackWidth - THUMB_RADIUS * 2);
  const activeTrackWidth = (percentage / 100) * usableWidth;
  const thumbTranslateX = (percentage / 100) * usableWidth;

  // Resolve step label for the selected value
  const stepLabelInfo = useMemo(() => {
    const idx = selectedValue - 1;
    if (stepLabels && stepLabels[idx] && stepLabels[idx].trim().length > 0) {
      return { text: stepLabels[idx].trim(), isCustom: true };
    }
    if (options && options[idx]) {
      const opt = options[idx];
      // If label starts with "N - Label", strip "N - "
      const cleaned = opt.label.replace(/^\d+\s*-\s*/, '').trim();
      if (cleaned.length > 0 && cleaned !== String(selectedValue)) {
        return { text: cleaned, isCustom: true };
      }
    }
    return { text: 'No description added', isCustom: false };
  }, [selectedValue, stepLabels, options]);

  return (
    <View style={styles.scaleContainer}>
      {/* Slider Interactive Container */}
      <View
        ref={trackViewRef}
        style={styles.sliderTrackWrapper}
        onLayout={handleTrackLayout}
        {...panResponder.panHandlers}
      >
        {/* Inactive Track */}
        <View
          style={[
            styles.sliderBaseTrack,
            {
              left: THUMB_RADIUS,
              right: THUMB_RADIUS,
              backgroundColor: isDark ? '#27272a' : '#e5e7eb',
            },
          ]}
        />
        {/* Active Filled Track */}
        <View
          style={[
            styles.sliderActiveTrack,
            {
              left: THUMB_RADIUS,
              width: activeTrackWidth,
              backgroundColor: primaryColor,
            },
          ]}
        />

        {/* Draggable Circle Thumb */}
        <View
          style={[
            styles.sliderThumb,
            {
              left: THUMB_RADIUS,
              transform: [{ translateX: thumbTranslateX }],
              backgroundColor: primaryColor,
              borderColor: '#ffffff',
            },
          ]}
        >
          <Text style={styles.sliderThumbText}>
            {selectedValue}
          </Text>
        </View>
      </View>

      {/* Uplifted Step Label Card */}
      <View
        style={[
          styles.scaleUpliftedCard,
          {
            backgroundColor: isDark ? '#1c1c20' : '#ffffff',
            borderColor: isDark ? '#2b2b30' : '#e5e7eb',
            marginTop: 14,
          },
        ]}
      >
        <Text
          style={[
            styles.scaleStepLabelText,
            {
              textAlign: 'center',
            },
            stepLabelInfo.isCustom
              ? { color: isDark ? '#ffffff' : '#111827' }
              : { color: isDark ? '#71717a' : '#9ca3af', fontWeight: '500' },
          ]}
        >
          {`"${stepLabelInfo.text}"`}
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.continueButtonContainer}>
        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: pressed ? '#a98fcc' : primaryColor,
            },
          ]}
        >
          <Text style={[styles.continueButtonText, { color: '#ffffff' }]}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// NumericStepperQuestion: Plus/Minus stepper with number, unit, and Continue button
// ---------------------------------------------------------------------------
interface NumericStepperQuestionProps {
  questionKey: string;
  unit?: string;
  stepSize?: number;
  maxValue?: string;
  currentAnswer: string | null;
  isDark: boolean;
  primaryColor: string;
  onSelect: (qKey: string, val: string) => void;
  onContinue: () => void;
}

const NumericStepperQuestion = memo(function NumericStepperQuestion({
  questionKey,
  unit,
  stepSize = 1,
  maxValue,
  currentAnswer,
  isDark,
  primaryColor,
  onSelect,
  onContinue,
}: NumericStepperQuestionProps) {
  const step = stepSize > 0 ? stepSize : 1;
  const max = useMemo(() => {
    if (!maxValue) return Infinity;
    const parsed = parseFloat(maxValue);
    return !isNaN(parsed) && parsed > 0 ? parsed : Infinity;
  }, [maxValue]);

  const unitText = unit?.trim() || '';

  // Parse initial numeric value
  const initialValue = useMemo(() => {
    if (currentAnswer) {
      const match = currentAnswer.match(/^([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (!isNaN(val)) return val;
      }
    }
    return 1;
  }, [currentAnswer]);

  const [count, setCount] = useState(initialValue);

  // Sync state if question or currentAnswer changes
  useEffect(() => {
    setCount(initialValue);
  }, [initialValue, questionKey]);

  const updateCount = useCallback((newCount: number) => {
    const clamped = Math.max(0, Math.min(max, Math.round(newCount * 100) / 100));
    setCount(clamped);
    const formatted = unitText ? `${clamped} ${unitText}` : String(clamped);
    onSelect(questionKey, formatted);
  }, [max, unitText, questionKey, onSelect]);

  const handleDecrement = useCallback(() => {
    updateCount(count - step);
  }, [count, step, updateCount]);

  const handleIncrement = useCallback(() => {
    updateCount(count + step);
  }, [count, step, updateCount]);

  const isMin = count <= 0;
  const isMax = count >= max;

  // ── Hold-to-repeat ───────────────────────────────────────────────────────
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const countRef = useRef(initialValue);
  countRef.current = count;

  const startHold = useCallback((direction: 1 | -1) => {
    if (holdIntervalRef.current) return;
    holdIntervalRef.current = setInterval(() => {
      const prev = countRef.current;
      const next = Math.max(0, Math.min(max, Math.round((prev + direction * step) * 100) / 100));
      if (next !== prev) {
        countRef.current = next;
        setCount(next);
        const formatted = unitText ? `${next} ${unitText}` : String(next);
        onSelect(questionKey, formatted);
      }
    }, 100);
  }, [max, step, unitText, questionKey, onSelect]);

  const stopHold = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopHold(), [stopHold]);
  // ────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.numericContainer}>
      {/* Uplifted Stepper Card */}
      <View
        style={[
          styles.numericCard,
          {
            backgroundColor: isDark ? '#1c1c20' : '#ffffff',
            borderColor: isDark ? '#2b2b30' : '#e5e7eb',
          },
        ]}
      >
        <View style={styles.numericRow}>
          {/* Decrement Button */}
          <Pressable
            onPress={handleDecrement}
            onLongPress={() => startHold(-1)}
            onPressOut={stopHold}
            delayLongPress={300}
            disabled={isMin}
            style={({ pressed }) => [
              styles.stepperCircleBtn,
              isMin
                ? {
                    backgroundColor: isDark ? '#27272a' : '#f0f0f2',
                    borderColor: isDark ? '#27272a' : '#e5e7eb',
                    shadowOpacity: 0,
                    elevation: 0,
                  }
                : {
                    backgroundColor: pressed
                      ? (isDark ? '#27272a' : '#f0f0f2')
                      : (isDark ? '#18181b' : '#ffffff'),
                    borderColor: isDark ? '#27272a' : '#e5e7eb',
                  },
            ]}
          >
            <Minus
              size={20}
              color={isMin ? (isDark ? '#52525b' : '#9ca3af') : (isDark ? '#ffffff' : '#111827')}
              strokeWidth={2.6}
            />
          </Pressable>

          {/* Centered Value & Unit — switches to stacked column when content is too wide */}
          {(() => {
            // Threshold derived from card geometry:
            // center width ≈ 164px, digit ≈22px at 36sp, unit char ≈9px at 16sp
            // stacked when: digits*22 + unitChars*9 > 150  →  simplified to digits*2 + unitChars > 13
            const digits = String(Math.round(Math.abs(count))).length;
            const isStacked = digits * 2 + unitText.length > 13;

            return (
              <View
                style={[
                  styles.numericValueWrapper,
                  isStacked && {
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.numericValueText,
                    { color: isDark ? '#ffffff' : '#111827' },
                    isStacked && { fontSize: 30 },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {count}
                </Text>
                {unitText.length > 0 && (
                  <Text
                    style={[
                      styles.numericUnitText,
                      { color: isDark ? '#a1a1aa' : '#6b7280' },
                      isStacked && { fontSize: 13, textAlign: 'center' },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {unitText}
                  </Text>
                )}
              </View>
            );
          })()}

          {/* Increment Button */}
          <Pressable
            onPress={handleIncrement}
            onLongPress={() => startHold(1)}
            onPressOut={stopHold}
            delayLongPress={300}
            disabled={isMax}
            style={({ pressed }) => [
              styles.stepperCircleBtn,
              isMax
                ? {
                    backgroundColor: isDark ? '#27272a' : '#f0f0f2',
                    borderColor: isDark ? '#27272a' : '#e5e7eb',
                    shadowOpacity: 0,
                    elevation: 0,
                  }
                : {
                    backgroundColor: pressed ? '#a98fcc' : primaryColor,
                    borderColor: pressed ? '#a98fcc' : primaryColor,
                  },
            ]}
          >
            <Plus
              size={20}
              color={isMax ? (isDark ? '#52525b' : '#9ca3af') : '#ffffff'}
              strokeWidth={2.6}
            />
          </Pressable>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.continueButtonContainer}>
        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: pressed ? '#a98fcc' : primaryColor,
            },
          ]}
        >
          <Text style={[styles.continueButtonText, { color: '#ffffff' }]}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// ImageCaptureQuestion: "Take Image" / "Upload Image" pills for the image data type
// ---------------------------------------------------------------------------
interface ImageCaptureQuestionProps {
  isDark: boolean;
  primaryColor: string;
  onOpenCamera: () => void;
  onUpload: () => void;
}

const ImageCaptureQuestion = memo(function ImageCaptureQuestion({
  isDark,
  primaryColor,
  onOpenCamera,
  onUpload,
}: ImageCaptureQuestionProps) {
  return (
    <View style={styles.imageCaptureContainer}>
      <Pressable
        onPress={onOpenCamera}
        style={({ pressed }) => [
          styles.imageCapturePill,
          { backgroundColor: pressed ? '#a98fcc' : primaryColor },
        ]}
      >
        <Camera size={18} color="#ffffff" strokeWidth={2.6} />
        <Text style={[styles.imageCapturePillText, { color: '#ffffff' }]}>
          Take Image
        </Text>
      </Pressable>

      <Text style={[styles.imageCaptureOrText, { color: isDark ? '#71717a' : '#9ca3af' }]}>
        or
      </Text>

      <Pressable
        onPress={onUpload}
        style={({ pressed }) => [
          styles.imageCapturePill,
          {
            backgroundColor: pressed
              ? (isDark ? '#27272a' : '#f0f0f2')
              : (isDark ? '#18181b' : '#ffffff'),
            borderWidth: 1,
            borderColor: isDark ? '#27272a' : '#e5e7eb',
          },
        ]}
      >
        <Upload size={18} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.6} />
        <Text style={[styles.imageCapturePillText, { color: isDark ? '#ffffff' : '#111827' }]}>
          Upload Image
        </Text>
      </Pressable>
    </View>
  );
});

// ---------------------------------------------------------------------------
// ImageResultView: preview the captured / uploaded image with Retake + Continue
// ---------------------------------------------------------------------------
interface ImageResultViewProps {
  uri: string;
  source: 'camera' | 'upload';
  isDark: boolean;
  primaryColor: string;
  onRetake: () => void;
  onContinue: () => void;
}

const ImageResultView = memo(function ImageResultView({
  uri,
  source,
  isDark,
  primaryColor,
  onRetake,
  onContinue,
}: ImageResultViewProps) {
  return (
    <View style={styles.imageResultContainer}>
      <View style={styles.imageResultSquare}>
        <View
          style={[
            styles.imageResultSquareInner,
            isDark ? styles.imageResultSquareDark : styles.imageResultSquareLight,
          ]}
        >
          <Image source={{ uri }} style={styles.imageResultImage} resizeMode="cover" />
          <View style={styles.imageResultBadge}>
            <Text style={styles.imageResultBadgeText}>
              {source === 'camera' ? 'Took' : 'Uploaded'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.imageResultActions}>
        <Pressable
          onPress={onRetake}
          style={({ pressed }) => [
            styles.imageResultBtn,
            styles.imageResultRetakeBtn,
            isDark ? styles.imageResultRetakeDark : styles.imageResultRetakeLight,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <RotateCcw size={17} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
          <Text style={[styles.imageResultBtnText, { color: isDark ? '#ffffff' : '#111827' }]}>
            Retake Photo
          </Text>
        </Pressable>

        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [
            styles.imageResultBtn,
            { backgroundColor: pressed ? '#a98fcc' : primaryColor },
          ]}
        >
          <Text style={[styles.imageResultBtnText, { color: '#ffffff' }]}>Continue</Text>
          <ArrowRight size={17} color="#ffffff" strokeWidth={2.6} />
        </Pressable>
      </View>
    </View>
  );
});

export interface JournalQuestionSheetProps {
  onCompleted?: () => void;
}

export const JournalQuestionSheet = forwardRef<JournalQuestionSheetRef, JournalQuestionSheetProps>(({ onCompleted }, ref) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const primaryColor = Colors.light.primary;
  const router = useRouter();
  const navigation = useNavigation<any>();
  const isFocused = !navigation?.isFocused || navigation.isFocused();

  const questions = useJournalStore((state) => state.questions);
  const historyRecords = useJournalStore((state) => state.historyRecords);
  const setHistoryRecords = useJournalStore((state) => state.setHistoryRecords);
  const pendingImageCapture = useJournalStore((state) => state.pendingImageCapture);
  const setPendingImageCapture = useJournalStore((state) => state.setPendingImageCapture);

  const sheetRef = useRef<ActionSheetRef>(null);
  const scrollRef = useRef<ScrollView>(null);
  // Per AGENTS.md: store live text in a ref, never set state on every keystroke
  const textInputRef = useRef<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingAnswers, setEditingAnswers] = useState<Record<string, string>>({});
  const [isViewingCompleted, setIsViewingCompleted] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const [reansweringKey, setReansweringKey] = useState<string | null>(null);
  // Image question: holds the photo (taken or uploaded) awaiting confirmation
  const [capturedImage, setCapturedImage] = useState<{
    key: string;
    uri: string;
    source: 'camera' | 'upload';
  } | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draggableScrollConfig = useMemo(() => ({
    modalOpen: isOpen,
    activeStep: currentIndex,
    scrollViewRef: scrollRef,
    shouldScrollToTop: false as const,
    mode: 'bidirectional' as const,
  }), [isOpen, currentIndex]);

  const { scrollHandlers, isSaveBtnVisible, isAtBottom } = useDraggableScroll(draggableScrollConfig);

  // Hardware Back button handling
  useEffect(() => {
    if (!isOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      sheetRef.current?.hide();
      return true;
    });
    return () => sub.remove();
  }, [isOpen]);

  const currentQ = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = currentQ ? editingAnswers[currentQ.key] || null : null;

  // Sync text ref when slide changes so TextInput defaultValue resets correctly
  useEffect(() => {
    if (currentQ?.dataType === 'text') {
      textInputRef.current = editingAnswers[currentQ.key] || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentQ?.key]);

  // The captured-image preview belongs to a single question only
  useEffect(() => {
    setCapturedImage(null);
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, [currentIndex]);

  // Clear any pending auto-advance timer on unmount
  useEffect(
    () => () => {
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
    },
    []
  );

  useImperativeHandle(ref, () => ({
    present: (record: JournalHistoryRecord, reanswerKey?: string) => {
      setActiveRecordId(record.id);
      setIsOpen(true);
      setCapturedImage(null);
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
      const recordAnswers = { ...(record.answers || {}) };

      // Smart persistence for Question 1 (q_skin_map):
      // If current record has no q_skin_map, carry forward from past records so the user isn't forced to re-enter daily
      if (!recordAnswers['q_skin_map']) {
        const pastRecordWithSkinMap = historyRecords.find(
          (hr) => hr.id !== record.id && hr.answers && hr.answers['q_skin_map']
        );
        if (pastRecordWithSkinMap) {
          recordAnswers['q_skin_map'] = pastRecordWithSkinMap.answers['q_skin_map'];
        }
      }

      setEditingAnswers(recordAnswers);
      setSlideDirection('forward');

      // Helper to check if an answer is validly answered (for q_skin_map, requires at least 1 zone)
      const isQuestionAnswered = (qKey: string, ansMap: Record<string, string>) => {
        const val = ansMap[qKey];
        if (!val || !val.trim()) return false;
        if (qKey === 'q_skin_map') {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed.zones) && parsed.zones.length > 0;
          } catch {
            return false;
          }
        }
        return true;
      };

      if (reanswerKey) {
        setReansweringKey(reanswerKey);
        setIsViewingCompleted(false);
        const targetIdx = questions.findIndex((q) => q.key === reanswerKey);
        setCurrentIndex(targetIdx >= 0 ? targetIdx : 0);
      } else {
        setReansweringKey(null);
        const answeredCount = questions.filter((q) => isQuestionAnswered(q.key, recordAnswers)).length;
        const isCompleted = answeredCount >= questions.length && questions.length > 0;

        if (isCompleted) {
          setIsViewingCompleted(true);
          setCurrentIndex(0);
        } else {
          setIsViewingCompleted(false);
          // Find first unanswered question in the questionnaire
          const firstUnansweredIndex = questions.findIndex((q) => !isQuestionAnswered(q.key, recordAnswers));
          setCurrentIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
        }
      }
      // Defer sheetRef.show() to next frame so all React state updates (isOpen, answers, currentIndex)
      // complete their render and layout pass before the ActionSheet starts measuring and animating
      requestAnimationFrame(() => {
        sheetRef.current?.show();
      });
    },
    dismiss: () => {
      sheetRef.current?.hide();
    },
  }));

  const handleStartEditFromBeginning = useCallback(() => {
    setIsViewingCompleted(false);
    setCurrentIndex(0);
    setSlideDirection('forward');
  }, []);

  const selectAnswer = useCallback((qKey: string, val: string) => {
    const updatedAnswers = {
      ...editingAnswers,
      [qKey]: val,
    };
    setEditingAnswers(updatedAnswers);

    setTimeout(() => {
      if (reansweringKey && qKey === reansweringKey) {
        if (activeRecordId) {
          setHistoryRecords((prev) =>
            prev.map((item) =>
              item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
            )
          );
        }
        setReansweringKey(null);
        sheetRef.current?.hide();
        setCurrentIndex(0);
        setActiveRecordId(null);
        return;
      }

      if (isLastQuestion) {
        if (activeRecordId) {
          setHistoryRecords((prev) =>
            prev.map((item) =>
              item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
            )
          );
        }
        sheetRef.current?.hide();
        setCurrentIndex(0);
        setActiveRecordId(null);
        onCompleted?.();
      } else {
        setSlideDirection('forward');
        setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
      }
    }, 220);
  }, [editingAnswers, reansweringKey, activeRecordId, isLastQuestion, questions.length, setHistoryRecords]);

  // Image type: open the Scan tab's camera page to capture a photo.
  // The origin ("journal") + question key are forwarded so the camera knows to
  // hand the captured image back here instead of running the skin analysis.
  const handleTakeImage = useCallback(() => {
    const qKey = currentQ?.key;
    if (!qKey) return;
    sheetRef.current?.hide();
    setTimeout(() => {
      router.push({ pathname: '/camera', params: { from: 'journal', qKey } });
    }, 150);
  }, [router, currentQ?.key]);

  // Image type: pick an image from the system picker (images only, up to 1MB), save locally as the answer
  const handleUploadImage = useCallback(async () => {
    const qKey = currentQ?.key;
    if (!qKey) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const MAX_BYTES = 1024 * 1024; // 1 MB

      if (asset.fileSize && asset.fileSize > MAX_BYTES) {
        Alert.alert('Image too large', 'Please choose an image up to 1 MB.');
        return;
      }

      // Persist the image locally so the answer survives cache cleanup
      let localUri = asset.uri;
      try {
        const baseDir = FileSystem.documentDirectory;
        if (baseDir) {
          const dir = `${baseDir}journal-images/`;
          const dirInfo = await FileSystem.getInfoAsync(dir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
          }
          const ext = (asset.uri.split('.').pop() || 'jpg').split('?')[0];
          const dest = `${dir}${qKey}_${Date.now()}.${ext}`;
          await FileSystem.copyAsync({ from: asset.uri, to: dest });
          localUri = dest;
        }
      } catch {
        localUri = asset.uri;
      }

      // Show the uploaded image with Retake / Continue (advance on Continue)
      setEditingAnswers((prev) => ({ ...prev, [qKey]: localUri }));
      setCapturedImage({ key: qKey, uri: localUri, source: 'upload' });
    } catch {
      // Silently ignore picker failures
    }
  }, [currentQ?.key]);

  // Continue: confirm the captured/uploaded image and move to the next question
  const handleContinueImage = useCallback(() => {
    const qKey = currentQ?.key;
    if (!qKey) return;
    const uriToSave = (capturedImage && capturedImage.key === qKey)
      ? capturedImage.uri
      : editingAnswers[qKey];
    if (!uriToSave) return;

    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    selectAnswer(qKey, uriToSave);
  }, [capturedImage, currentQ?.key, editingAnswers, selectAnswer]);

  // Retake: discard the image and bring back the Take / Upload options
  const handleRetakeImage = useCallback(() => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    const qKey = currentQ?.key;
    setCapturedImage(null);
    if (qKey) {
      setEditingAnswers((prev) => {
        const next = { ...prev };
        delete next[qKey];
        return next;
      });
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) => {
            if (item.id === activeRecordId) {
              const updated = { ...(item.answers || {}) };
              delete updated[qKey];
              return { ...item, answers: updated };
            }
            return item;
          })
        );
      }
    }
  }, [currentQ?.key, activeRecordId, setHistoryRecords]);

  // Pick up a photo captured on the camera page: re-open this sheet, show the
  // photo in the square preview box and record the answer.
  useEffect(() => {
    if (!pendingImageCapture || !isFocused) return;
    const { key, uri } = pendingImageCapture;
    setPendingImageCapture(null);

    // Persist answer immediately so it stays across slides and previous navigation
    setEditingAnswers((prev) => ({ ...prev, [key]: uri }));
    setCapturedImage({ key, uri, source: 'camera' });

    setIsOpen(true);
    requestAnimationFrame(() => {
      sheetRef.current?.show();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingImageCapture, isFocused]);

  // Multi-select toggle without auto-advancing
  const toggleMultiSelectOption = useCallback((qKey: string, val: string) => {
    const rawVal = editingAnswers[qKey] || '';
    let currentSelected: string[] = [];
    if (rawVal) {
      try {
        const parsed = JSON.parse(rawVal);
        currentSelected = Array.isArray(parsed) ? parsed : [rawVal];
      } catch {
        currentSelected = rawVal.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    let nextSelected: string[];
    if (currentSelected.includes(val)) {
      nextSelected = currentSelected.filter((v) => v !== val);
    } else {
      nextSelected = [...currentSelected, val];
    }

    const updatedAnswers = {
      ...editingAnswers,
      [qKey]: JSON.stringify(nextSelected),
    };
    setEditingAnswers(updatedAnswers);
  }, [editingAnswers]);

  // Multi-select Continue button action
  const handleContinueMultiSelect = useCallback(() => {
    const qKey = currentQ?.key;
    if (!qKey) return;

    if (reansweringKey && qKey === reansweringKey) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...editingAnswers } } : item
          )
        );
      }
      setReansweringKey(null);
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      return;
    }

    if (isLastQuestion) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...editingAnswers } } : item
          )
        );
      }
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      onCompleted?.();
    } else {
      setSlideDirection('forward');
      setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
    }
  }, [currentQ?.key, reansweringKey, activeRecordId, editingAnswers, isLastQuestion, questions.length, setHistoryRecords]);

  // Text type: Continue — read from ref, commit, then navigate
  const handleContinueText = useCallback(() => {
    const qKey = currentQ?.key;
    if (!qKey) return;

    const textVal = textInputRef.current.trim();
    const updatedAnswers = { ...editingAnswers, [qKey]: textVal };
    setEditingAnswers(updatedAnswers);

    if (reansweringKey && qKey === reansweringKey) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
          )
        );
      }
      setReansweringKey(null);
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      return;
    }

    if (isLastQuestion) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
          )
        );
      }
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      onCompleted?.();
    } else {
      setSlideDirection('forward');
      setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
    }
  }, [currentQ?.key, reansweringKey, activeRecordId, editingAnswers, isLastQuestion, questions.length, setHistoryRecords]);

  // Scale type: Continue — ensure selected value is recorded, then navigate
  const handleContinueScale = useCallback(() => {
    const qKey = currentQ?.key;
    if (!qKey) return;

    // Default to '1' if not answered yet
    const currentVal = editingAnswers[qKey] || '1';
    const updatedAnswers = { ...editingAnswers, [qKey]: currentVal };
    if (!editingAnswers[qKey]) {
      setEditingAnswers(updatedAnswers);
    }

    if (reansweringKey && qKey === reansweringKey) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
          )
        );
      }
      setReansweringKey(null);
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      return;
    }

    if (isLastQuestion) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
          )
        );
      }
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      onCompleted?.();
    } else {
      setSlideDirection('forward');
      setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
    }
  }, [currentQ?.key, reansweringKey, activeRecordId, editingAnswers, isLastQuestion, questions.length, setHistoryRecords]);

  // Numeric type: Continue — ensure selected value is recorded, then navigate
  const handleContinueNumeric = useCallback(() => {
    const qKey = currentQ?.key;
    if (!qKey) return;

    const unitStr = currentQ.unit?.trim() ? ` ${currentQ.unit.trim()}` : '';
    const defaultVal = `1${unitStr}`;
    const currentVal = editingAnswers[qKey] || defaultVal;
    const updatedAnswers = { ...editingAnswers, [qKey]: currentVal };
    if (!editingAnswers[qKey]) {
      setEditingAnswers(updatedAnswers);
    }

    if (reansweringKey && qKey === reansweringKey) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
          )
        );
      }
      setReansweringKey(null);
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      return;
    }

    if (isLastQuestion) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
          )
        );
      }
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      onCompleted?.();
    } else {
      setSlideDirection('forward');
      setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
    }
  }, [currentQ, reansweringKey, activeRecordId, editingAnswers, isLastQuestion, questions.length, setHistoryRecords]);

  // Skin Experience (Question 1) Continue
  const handleContinueSkinMap = useCallback(() => {
    const qKey = 'q_skin_map';
    const currentVal = editingAnswers[qKey] || JSON.stringify({ zones: [], maxSeverityScale: 5, summary: 'Clear / No issues reported' });
    const updatedAnswers = { ...editingAnswers, [qKey]: currentVal };
    if (!editingAnswers[qKey]) {
      setEditingAnswers(updatedAnswers);
    }

    if (reansweringKey && qKey === reansweringKey) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
          )
        );
      }
      setReansweringKey(null);
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      return;
    }

    if (isLastQuestion) {
      if (activeRecordId) {
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
          )
        );
      }
      sheetRef.current?.hide();
      setCurrentIndex(0);
      setActiveRecordId(null);
      onCompleted?.();
    } else {
      setSlideDirection('forward');
      setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
    }
  }, [reansweringKey, activeRecordId, editingAnswers, isLastQuestion, questions.length, setHistoryRecords, onCompleted]);

  const handlePrevious = useCallback(() => {
    setSlideDirection('backward');
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSheetClose = useCallback(() => {
    setIsOpen(false);
    setCapturedImage(null);
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  const isMultiSelect = currentQ?.dataType === 'multi_select';
  const selectedMultiValues: string[] = useMemo(() => {
    if (!isMultiSelect || !currentAnswer) return [];
    try {
      const parsed = JSON.parse(currentAnswer);
      return Array.isArray(parsed) ? parsed : [currentAnswer];
    } catch {
      return currentAnswer.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }, [isMultiSelect, currentAnswer]);

  return (
    <ActionSheet
      ref={sheetRef}
      isModal={true}
      onClose={handleSheetClose}
      gestureEnabled={true}
      defaultOverlayOpacity={0.5}
      overlayColor="#000000"
      containerStyle={[
        styles.actionSheetContainer,
        isDark ? styles.actionSheetContainerDark : styles.actionSheetContainerLight,
      ]}
      indicatorStyle={[
        styles.actionSheetIndicator,
        isDark ? styles.indicatorDark : styles.indicatorLight,
      ]}
      animated={true}
      keyboardHandlerEnabled={false}
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...scrollHandlers}
        contentContainerStyle={styles.scrollContent}
      >
        {isViewingCompleted ? (
          /* Completed Screen UI */
          <View style={styles.completedSheetContainer}>
            <View style={styles.completedTopRow}>
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={handleStartEditFromBeginning}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.editAnswersPill,
                  isDark ? styles.editAnswersPillDark : styles.editAnswersPillLight,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.editAnswersPillText,
                    { color: isDark ? '#ffffff' : '#111827' },
                  ]}
                >
                  Edit answers
                </Text>
              </Pressable>
            </View>

            <View style={styles.completedCenterContent}>
              <View
                style={[
                  styles.completedBigCircle,
                  {
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.12)',
                    borderColor: isDark ? '#22c55e' : '#16a34a',
                  },
                ]}
              >
                <Check
                  size={48}
                  color={isDark ? '#4ade80' : '#16a34a'}
                  strokeWidth={3.5}
                />
              </View>

              <Text style={[styles.completedHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
                You have completed it
              </Text>
              <Text style={[styles.completedSubheading, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                All daily check-in questions were logged successfully.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Step Header */}
            <View style={styles.stepHeaderRow}>
              <Text
                style={[
                  styles.stepCounterText,
                  { color: isDark ? '#a1a1aa' : '#6b7280' },
                ]}
              >
                {`Question ${currentIndex + 1} of ${questions.length}`}
              </Text>
              {currentIndex > 0 ? (
                <Pressable
                  onPress={handlePrevious}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.prevPill,
                    isDark ? styles.prevPillDark : styles.prevPillLight,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.prevPillText,
                      isDark ? styles.prevTextDark : styles.prevTextLight,
                    ]}
                  >
                    Previous
                  </Text>
                </Pressable>
              ) : (
                <View style={{ height: 28 }} />
              )}
            </View>

            {/* Question Title & Options */}
            {currentQ && (
              <Animated.View
                key={`q-slide-${currentIndex}`}
                entering={
                  slideDirection === 'forward'
                    ? SlideInRight.duration(240)
                    : SlideInLeft.duration(240)
                }
                exiting={
                  slideDirection === 'forward'
                    ? SlideOutLeft.duration(180)
                    : SlideOutRight.duration(180)
                }
              >
                <Text style={[styles.pureQuestionText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  {currentQ.subtitle}
                </Text>

                {currentQ.key === 'q_skin_map' ? (
                  <SkinExperienceQuestionView
                    isDark={isDark}
                    primaryColor={primaryColor}
                    currentAnswer={currentAnswer || undefined}
                    onSelect={(val) => {
                      setEditingAnswers((prev) => ({ ...prev, [currentQ.key]: val }));
                    }}
                    onContinue={handleContinueSkinMap}
                  />
                ) : currentQ.dataType === 'boolean' || (currentQ.options && currentQ.options.length === 2 && currentQ.options.some((o) => o.value.toLowerCase() === 'yes') && currentQ.options.some((o) => o.value.toLowerCase() === 'no')) ? (
                  <BooleanPillGroup
                    questionKey={currentQ.key}
                    currentAnswer={currentAnswer}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    onSelect={selectAnswer}
                  />
                ) : isMultiSelect ? (
                  <View style={styles.pillOptionsList}>
                    {currentQ.options.map((opt, index) => (
                      <OptionPill
                        key={`${currentQ.key}-opt-${index}`}
                        opt={opt}
                        index={index}
                        questionKey={currentQ.key}
                        isSelected={selectedMultiValues.includes(opt.value)}
                        isDark={isDark}
                        primaryColor={primaryColor}
                        onSelect={toggleMultiSelectOption}
                      />
                    ))}

                    {/* Inline Continue button at bottom of sheet content (not fixed) */}
                    <View style={styles.continueButtonContainer}>
                      <Pressable
                        onPress={handleContinueMultiSelect}
                        disabled={selectedMultiValues.length === 0}
                        style={({ pressed }) => [
                          styles.continueButton,
                          {
                            backgroundColor: selectedMultiValues.length === 0
                              ? isDark ? '#27272a' : '#e5e7eb'
                              : pressed ? '#a98fcc' : primaryColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.continueButtonText,
                            {
                              color: selectedMultiValues.length === 0
                                ? isDark ? '#71717a' : '#9ca3af'
                                : '#ffffff',
                            },
                          ]}
                        >
                          Continue
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  ) : currentQ.dataType === 'text' ? (
                  <View>
                    <TextInput
                      key={`text-input-${currentQ.key}-${currentIndex}`}
                      defaultValue={editingAnswers[currentQ.key] || ''}
                      onChangeText={(val) => { textInputRef.current = val; }}
                      placeholder={currentQ.placeholderText?.trim() || 'Enter your answer...'}
                      placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                      multiline
                      textAlignVertical="top"
                      maxLength={999}
                      style={[
                        styles.textAnswerInput,
                        {
                          backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                          borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                          color: isDark ? '#ffffff' : '#111827',
                        },
                      ]}
                    />
                    <View style={styles.continueButtonContainer}>
                      <Pressable
                        onPress={handleContinueText}
                        style={({ pressed }) => [
                          styles.continueButton,
                          {
                            backgroundColor: pressed ? '#a98fcc' : primaryColor,
                          },
                        ]}
                      >
                        <Text style={[styles.continueButtonText, { color: '#ffffff' }]}>
                          Continue
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : currentQ.dataType === 'scale' ? (
                  <ScaleSliderQuestion
                    key={`scale-${currentQ.key}-${currentIndex}`}
                    questionKey={currentQ.key}
                    scaleRange={currentQ.scaleRange}
                    stepLabels={currentQ.stepLabels}
                    options={currentQ.options}
                    currentAnswer={currentAnswer}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    onSelect={(qKey, val) => {
                      setEditingAnswers((prev) => (prev[qKey] === val ? prev : { ...prev, [qKey]: val }));
                    }}
                    onContinue={handleContinueScale}
                  />
                ) : currentQ.dataType === 'numeric' ? (
                  <NumericStepperQuestion
                    key={`numeric-${currentQ.key}-${currentIndex}`}
                    questionKey={currentQ.key}
                    unit={currentQ.unit}
                    stepSize={currentQ.stepSize}
                    maxValue={currentQ.maxValue}
                    currentAnswer={currentAnswer}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    onSelect={(qKey, val) => {
                      setEditingAnswers((prev) => (prev[qKey] === val ? prev : { ...prev, [qKey]: val }));
                    }}
                    onContinue={handleContinueNumeric}
                  />
                ) : currentQ.dataType === 'image' ? (
                  ((capturedImage && capturedImage.key === currentQ.key) || (currentAnswer && typeof currentAnswer === 'string' && currentAnswer.trim().length > 0)) ? (
                    <ImageResultView
                      uri={(capturedImage && capturedImage.key === currentQ.key) ? capturedImage.uri : currentAnswer!}
                      source={(capturedImage && capturedImage.key === currentQ.key) ? capturedImage.source : 'camera'}
                      isDark={isDark}
                      primaryColor={primaryColor}
                      onRetake={handleRetakeImage}
                      onContinue={handleContinueImage}
                    />
                  ) : (
                    <ImageCaptureQuestion
                      isDark={isDark}
                      primaryColor={primaryColor}
                      onOpenCamera={handleTakeImage}
                      onUpload={handleUploadImage}
                    />
                  )
                ) : (
                  <View style={styles.pillOptionsList}>
                    {currentQ.options.map((opt, index) => (
                      <OptionPill
                        key={`${currentQ.key}-opt-${index}`}
                        opt={opt}
                        index={index}
                        questionKey={currentQ.key}
                        isSelected={currentAnswer === opt.value}
                        isDark={isDark}
                        primaryColor={primaryColor}
                        onSelect={selectAnswer}
                      />
                    ))}
                  </View>
                )}
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>

      <DraggableScrollDownCircle
        scrollViewRef={scrollRef}
        isSaveBtnVisible={isSaveBtnVisible}
        modalOpen={isOpen}
        isDark={isDark}
        isFullScreenModal={true}
        bottomOffset={insets.bottom + 16}
        tag="JournalQuestionSheet"
        isAtBottom={isAtBottom}
        mode="bidirectional"
      />
    </ActionSheet>
  );
});

const styles = StyleSheet.create({
  actionSheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  actionSheetContainerLight: {
    backgroundColor: '#FAF8F6',
  },
  actionSheetContainerDark: {
    backgroundColor: '#121212',
  },
  actionSheetIndicator: {
    width: 52,
    height: 6,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 999,
  },
  indicatorLight: {
    backgroundColor: '#d1d5db',
  },
  indicatorDark: {
    backgroundColor: '#3f3f46',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  marqueeContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  marqueeOverflowText: {
    width: 9999,
  },
  completedSheetContainer: {
    paddingTop: 2,
    paddingBottom: 20,
  },
  completedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 32,
    marginBottom: 20,
  },
  editAnswersPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  editAnswersPillLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  editAnswersPillDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  editAnswersPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  completedCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  completedBigCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  completedHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  completedSubheading: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 28,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  prevPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  prevPillLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  prevPillDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  prevPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  prevTextLight: {
    color: '#111827',
  },
  prevTextDark: {
    color: '#ffffff',
  },
  pureQuestionText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
    marginBottom: 18,
    paddingTop: 4,
  },
  pillOptionsList: {
    gap: 10,
  },
  optionContainer: {
    width: '100%',
    height: 44,
    position: 'relative',
  },
  optionPressable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  optionShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    position: 'absolute',
    top: 3,
    left: 3,
  },
  optionMid: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  optionTop: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 2.5,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  booleanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  booleanBtnContainer: {
    flex: 1,
    height: 68,
    position: 'relative',
  },
  booleanShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    position: 'absolute',
    top: 4,
    left: 3,
  },
  booleanMid: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  booleanTop: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 2.5,
  },
  booleanContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  booleanLabelText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  continueButtonContainer: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 4,
  },
  continueButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 100,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textAnswerInput: {
    width: '100%',
    minHeight: 94,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  /* Scale Slider Styles */
  scaleContainer: {
    width: '100%',
    paddingTop: 0,
    marginTop: -4,
  },
  sliderTrackWrapper: {
    width: '100%',
    height: 38,
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 0,
  },
  sliderBaseTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
  },
  sliderActiveTrack: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 5,
  },
  sliderThumbText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  scaleRangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -2,
    marginBottom: 16,
  },
  scaleMinMaxText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scaleUpliftedCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  scaleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scaleBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  scaleBadgePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  scaleStepLabelText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  /* Numeric Stepper Styles */
  numericContainer: {
    width: '100%',
    paddingTop: 8,
  },
  numericCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  numericRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
  },
  stepperCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  numericValueWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 8,
    flex: 1,
  },
  numericValueText: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  numericUnitText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  /* Image Capture Styles */
  imageCaptureContainer: {
    width: '100%',
    paddingTop: 4,
    gap: 10,
  },
  imageCapturePill: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 100,
    // Uplifted card look (matches the daily-journal history day cards)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageCapturePillText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  imageCaptureOrText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  /* Image Result Preview (after take / upload) */
  imageResultContainer: {
    width: '100%',
    gap: 14,
  },
  imageResultSquare: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 22,
    // Uplifted card look (matches the daily-journal history day cards)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageResultSquareInner: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageResultSquareLight: {
    backgroundColor: '#f5f5f7',
    borderColor: '#e5e7eb',
  },
  imageResultSquareDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  imageResultImage: {
    width: '100%',
    height: '100%',
  },
  imageResultBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  imageResultBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  imageResultActions: {
    flexDirection: 'row',
    gap: 10,
  },
  imageResultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
    borderRadius: 100,
    // Uplifted card look (matches the daily-journal history day cards)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageResultRetakeBtn: {
    borderWidth: 1,
  },
  imageResultRetakeLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  imageResultRetakeDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  imageResultBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
