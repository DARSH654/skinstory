import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Text } from '@/components/AppText';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BadFeedbackSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface BadFeedbackSheetProps {
  isDark: boolean;
  onDismiss?: () => void;
  onCancel?: () => void;
  onSubmit: (feedback: { tags: string[]; comment: string }) => void;
}

const FEATURE_TAGS = [
  'Missing capability',
  'Hard to understand',
  'Feature not working',
  'Slow to respond',
  'Unhelpful suggestions',
];

const DATA_TAGS = [
  'Outdated information',
  'Repetitive answer',
];

const TECHNICAL_TAGS = [
  'Formatting problem',
  'Broken layout',
  'Text cut off',
  'Response incomplete',
  'Display glitch',
];

const OTHER_TAGS = [
  'Inactive device data',
  'Output lagging issue',
  'Inconsistent with instructions',
  'Offensive or unsafe output',
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

const BadFeedbackSheet = forwardRef<BadFeedbackSheetRef, BadFeedbackSheetProps>(({
  isDark,
  onDismiss,
  onCancel,
  onSubmit,
}, ref) => {
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const wasSubmitted = useRef(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const commentRef = useRef('');
  const [hasComment, setHasComment] = useState(false);

  // Randomised pills: 3 feature + 2 data + 2 technical + 2 other = 9 total, shuffled
  const pills = useMemo(() => {
    const picked = [
      ...pickRandom(FEATURE_TAGS, 3),
      ...pickRandom(DATA_TAGS, 2),
      ...pickRandom(TECHNICAL_TAGS, 2),
      ...pickRandom(OTHER_TAGS, 2),
    ];
    return picked.sort(() => Math.random() - 0.5);
  }, []);

  useImperativeHandle(ref, () => ({
    present: () => {
      setSelectedTags([]);
      commentRef.current = '';
      setHasComment(false);
      wasSubmitted.current = false;
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      Keyboard.dismiss();
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const hasContent = hasComment || selectedTags.length > 0;

  const handleSubmit = () => {
    if (!hasContent) return;
    wasSubmitted.current = true;
    onSubmit({ tags: selectedTags, comment: commentRef.current.trim() });
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const bg = isDark ? '#121212' : '#FAF8F6';
  const textColor = isDark ? '#ffffff' : '#111827';
  const subColor = isDark ? '#a1a1aa' : '#71717a';
  const inputBg = isDark ? '#27272a' : '#f9fafb';
  const inputBorder = isDark ? '#3f3f46' : '#e5e7eb';

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      enableDynamicSizing
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      bottomInset={insets.bottom}
      backdropComponent={renderBackdrop}
      onDismiss={() => {
        Keyboard.dismiss();
        if (!wasSubmitted.current) {
          onCancel?.();
        }
        onDismiss?.();
      }}
      handleStyle={styles.handleContainer}
      handleIndicatorStyle={[
        styles.dragHandle,
        { backgroundColor: isDark ? '#3f3f46' : '#d1d5db' },
      ]}
      backgroundStyle={[{ backgroundColor: bg }, styles.roundedTop]}
    >
      <BottomSheetView style={[styles.sheetInner, { paddingBottom: 16 }]}>
        {/* Title */}
        <Text style={[styles.title, { color: textColor }]}>
          Why did you choose this rating?
        </Text>

        {/* Randomised pills */}
        <View style={styles.pillsWrap}>
          {pills.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.7}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? Colors.light.primary : (isDark ? '#27272a' : '#f4f4f5'),
                    borderColor: isSelected
                      ? (isDark ? '#ffffff' : '#000000')
                      : (isDark ? '#3f3f46' : '#e5e7eb'),
                  },
                ]}
              >
                <Text style={[styles.pillText, { color: isSelected ? '#ffffff' : subColor }]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Label */}
        <Text style={[styles.inputLabel, { color: textColor }]}>
          Having any other issue:
        </Text>

        {/* Text input */}
        <BottomSheetTextInput
          key={`comment-${pills.length}`}
          style={[
            styles.input,
            {
              color: textColor,
              borderColor: inputBorder,
              backgroundColor: inputBg,
            },
          ]}
          defaultValue={commentRef.current}
          onChangeText={(val) => {
            commentRef.current = val;
            const filled = val.trim().length > 0;
            setHasComment((prev) => (prev !== filled ? filled : prev));
          }}
          placeholder="Tell us about your issue"
          placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
          maxLength={2000}
        />

        {/* Submit button only */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!hasContent}
          activeOpacity={hasContent ? 0.8 : 1}
          style={[
            styles.submitBtn,
            { backgroundColor: Colors.light.primary, opacity: hasContent ? 1 : 0.4 },
          ]}
        >
          <Text style={styles.submitText}>Submit Feedback</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default BadFeedbackSheet;

const styles = StyleSheet.create({
  roundedTop: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  handleContainer: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 52,
    height: 6,
    borderRadius: 999,
  },
  sheetInner: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
    fontFamily: 'Outfit_700Bold',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 10,
  },
  submitBtn: {
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
