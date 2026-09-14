import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet, View, Animated,
} from 'react-native';
import { Text, TitleText, SubtitleText, CaptionText } from '@/components/AppText';
import WheelPicker, { withVirtualized } from '@quidone/react-native-wheel-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useOnboardingStore } from '@/store/onboardingStore';
import OnboardingProgressBar from '@/components/OnboardingProgressBar';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import HighlightPhrase from '@/components/HighlightPhrase';
import Native3DButton from '@/components/page7/Native3DButton';

const VirtualizedWheelPicker = withVirtualized(WheelPicker);

const ITEM_HEIGHT = moderateScale(54, 0.3);
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const BASE_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const BASE_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const currentYear = new Date().getFullYear();
const BASE_YEARS = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i);

const MONTHS = BASE_MONTHS.map((m, i) => ({ id: `m-${i}`, label: m, value: i }));
const DAYS = BASE_DAYS.map((d, i) => ({
  id: `d-${i}`,
  label: String(d).padStart(2, '0'),
  value: d,
}));
const YEARS = BASE_YEARS.map((y, i) => ({ id: `y-${i}`, label: String(y), value: y }));

const primaryColor = '#937abd';
const shadowColor = '#735b9c';
const secondaryColor = '#d6cbe8';

interface WheelColumnProps {
  name: string;
  data: { id: string; label: string; value: number }[];
  initialIndex: number;
  onValueChange: (index: number) => void;
  onSettled: (index: number) => void;
}

function WheelColumn({ data, initialIndex, onValueChange, onSettled }: WheelColumnProps) {
  const [value, setValue] = useState(data[initialIndex]?.value ?? data[0]?.value);

  const triggerHaptic = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const handleValueChanging = useCallback(({ index }: any) => {
    triggerHaptic();
    onValueChange(index);
  }, [onValueChange, triggerHaptic]);

  const handleValueChanged = useCallback(({ item, index }: any) => {
    setValue(item.value);
    onValueChange(index);
    onSettled(index);
  }, [onValueChange, onSettled]);

  const renderPickerItem = useCallback(
    ({ item }: { item: { id: string; label: string; value: number } }) => {
      return (
        <Text style={styles.itemText} maxFontSizeMultiplier={1.0}>
          {item.label ?? item.value}
        </Text>
      );
    },
    []
  );

  return (
    <View style={styles.pickerColumn}>
      <VirtualizedWheelPicker
        data={data}
        value={value}
        itemHeight={ITEM_HEIGHT}
        visibleItemCount={VISIBLE_ITEMS}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        onValueChanging={handleValueChanging}
        onValueChanged={handleValueChanged}
        renderOverlay={null}
        renderItem={renderPickerItem}
        style={{ height: WHEEL_HEIGHT, width: '100%' }}
      />
    </View>
  );
}

export default function OnboardingPage8() {
  const insets = useSafeAreaInsets();

  const { navigate } = useNavigationGuard();
  const { setAnswer } = useOnboardingStore.getState();

  const today = new Date();
  const MIN_AGE = 12;
  const defaultYear = today.getFullYear() - MIN_AGE; 

  const savedDate = useOnboardingStore.getState().answers['q_skinJourneyDate'];
  const savedMonthIdx = savedDate?.month ? BASE_MONTHS.indexOf(savedDate.month) : -1;
  const initialMonthVal = savedMonthIdx >= 0 ? savedMonthIdx : today.getMonth();
  const initialDayVal = savedDate?.day ?? today.getDate();
  const initialYearVal = savedDate?.year ?? defaultYear;

  const selectedMonthRef = useRef(initialMonthVal);
  const selectedDayRef   = useRef(initialDayVal);
  const selectedYearRef  = useRef(initialYearVal);

  const [displayDate, setDisplayDate] = useState({
    month: initialMonthVal,
    day:   initialDayVal,
    year:  initialYearVal,
  });

  const initialMonthIndex = initialMonthVal;
  const initialDayIndex = initialDayVal - 1;
  const initialYearIndex = Math.max(0, currentYear - initialYearVal);

  const toastSlideAnim = useRef(new Animated.Value(-80)).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showAgeToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    toastSlideAnim.stopAnimation();
    toastSlideAnim.setValue(-80);
    setToastVisible(true);

    Animated.spring(toastSlideAnim, {
      toValue: 0,
      damping: 20,
      stiffness: 200,
      mass: 0.8,
      useNativeDriver: true,
    }).start(() => {
      toastTimerRef.current = setTimeout(() => {
        Animated.timing(toastSlideAnim, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setToastVisible(false);
          toastTimerRef.current = null;
        });
      }, 2000);
    });
  }, [toastSlideAnim]);

  const handleNext = useCallback(() => {
    const selected = new Date(
      selectedYearRef.current,
      selectedMonthRef.current,
      selectedDayRef.current,
    );
    const cutoff = new Date(
      today.getFullYear() - MIN_AGE,
      today.getMonth(),
      today.getDate(),
    );

    if (selected > cutoff) {
      showAgeToast();
      return;
    }

    const chosenDate = {
      month: BASE_MONTHS[selectedMonthRef.current],
      day:   selectedDayRef.current,
      year:  selectedYearRef.current,
    };
    setAnswer('q_skinJourneyDate', chosenDate);
    navigate('/onboarding/page-9');
  }, [navigate, setAnswer, showAgeToast, today]);

  const displayMonthStr = MONTH_ABBR[displayDate.month] || 'Jan';

  return (
    <View
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View>
        <OnboardingProgressBar step={3} total={7} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <View style={styles.titleFlow}>
            <TitleText style={styles.titleOverride}>So, which year did your </TitleText>
            <HighlightPhrase
              words={['skin ', 'story ']}
              secondaryColor={secondaryColor}
              textStyle={styles.titleOverride}
            />
            <TitleText style={styles.titleOverride}>officially begin?</TitleText>
          </View>
        </View>

        <View style={styles.datePreviewContainer}>
          <SubtitleText style={styles.datePreviewHeader}>
            {displayMonthStr}, {displayDate.year}
          </SubtitleText>
          <Text style={styles.datePreviewDay} maxFontSizeMultiplier={1.0}>
            {String(displayDate.day).padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.pickerSection}>
          <View style={styles.pickerWindow}>
            <View style={styles.activeSelectionBar} pointerEvents="none" />

            <WheelColumn
              name="MONTH"
              data={MONTHS}
              initialIndex={initialMonthIndex}
              onValueChange={(idx) => { selectedMonthRef.current = idx; }}
              onSettled={(idx) => {
                setDisplayDate(prev => ({ ...prev, month: idx }));
              }}
            />

            <WheelColumn
              name="DAY"
              data={DAYS}
              initialIndex={initialDayIndex}
              onValueChange={(idx) => { selectedDayRef.current = idx + 1; }}
              onSettled={(idx) => {
                setDisplayDate(prev => ({ ...prev, day: idx + 1 }));
              }}
            />

            <WheelColumn
              name="YEAR"
              data={YEARS}
              initialIndex={initialYearIndex}
              onValueChange={(idx) => { selectedYearRef.current = BASE_YEARS[idx]; }}
              onSettled={(idx) => {
                setDisplayDate(prev => ({ ...prev, year: BASE_YEARS[idx] }));
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Native3DButton
          enabled={true}
          onPress={handleNext}
          primaryColor={primaryColor}
          shadowColor={shadowColor}
        />
      </View>

      {toastVisible && (
        <Animated.View
          style={[
            styles.toastContainer,
            { transform: [{ translateY: toastSlideAnim }], top: insets.top + verticalScale(10) },
          ]}
          pointerEvents="none"
        >
          <CaptionText style={styles.toastText}>
            Minimum age to continue is 12 years
          </CaptionText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(9),
    borderRadius: moderateScale(12, 0.3),
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
    zIndex: 9999,
  },
  toastText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '500',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    flexShrink: 1,
    overflow: 'hidden',
  },
  titleContainer: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(4),
    alignItems: 'center',
  },
  titleFlow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: moderateScale(2, 0.3),
    left: 0,
    right: 0,
    height: moderateScale(10, 0.3),
    backgroundColor: secondaryColor,
  },
  titleOverride: {
    color: '#2a2a2a',
    textAlign: 'center',
  },
  datePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(4),
  },
  datePreviewHeader: {
    fontSize: moderateScale(26, 0.3),
    fontFamily: 'Outfit_700Bold',
    fontWeight: '700',
    color: '#2a2a2a',
    letterSpacing: -0.3,
    marginBottom: verticalScale(-10),
    textAlign: 'center',
  },
  datePreviewDay: {
    fontSize: moderateScale(195, 0.3),
    fontFamily: 'Outfit_400Regular',
    fontWeight: '400',
    color: '#2a2a2a',
    lineHeight: moderateScale(200, 0.3),
    letterSpacing: -5,
    textAlign: 'center',
  },
  pickerSection: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    marginTop: verticalScale(-8),
  },
  pickerWindow: {
    width: '100%',
    height: WHEEL_HEIGHT,
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
  },
  activeSelectionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
    height: ITEM_HEIGHT,
    backgroundColor: '#f0ebf8',
    borderRadius: moderateScale(16, 0.3),
    zIndex: 0,
  },
  pickerColumn: {
    flex: 1,
    height: WHEEL_HEIGHT,
    zIndex: 1,
  },
  itemText: {
    fontSize: moderateScale(20, 0.3),
    fontFamily: 'Outfit_700Bold',
    fontWeight: '700',
    color: '#2a2a2a',
    lineHeight: ITEM_HEIGHT,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(35),
    height: verticalScale(75),
  },
});
