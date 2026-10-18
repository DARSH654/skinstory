import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSharedValue, withTiming, runOnJS, useAnimatedStyle } from 'react-native-reanimated';

export function useChatKeyboard(onKeyboardShow?: () => void, enabled: boolean = true) {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const footerPad = useSharedValue(bottomInset + 8);
  const enabledShared = useSharedValue(enabled);

  useEffect(() => {
    enabledShared.value = enabled;
    if (!enabled) {
      footerPad.value = withTiming(bottomInset + 8, { duration: 120 });
    }
  }, [enabled, bottomInset, enabledShared, footerPad]);

  useKeyboardHandler({
    onStart: (e) => {
      'worklet';
      if (!enabledShared.value) return;
      footerPad.value = withTiming(
        e.progress === 1 ? e.height + 8 : bottomInset + 8,
        { duration: 180 }
      );
      if (e.progress === 1 && onKeyboardShow) {
        runOnJS(onKeyboardShow)();
      }
    },
  });

  const footerStyle = useAnimatedStyle(() => ({
    paddingBottom: footerPad.value,
  }));

  // Call this after manually dismissing the keyboard (e.g. before/after opening a bottom sheet)
  // to guarantee the footer snaps back to its resting position.
  const resetFooter = () => {
    footerPad.value = withTiming(bottomInset + 8, { duration: 180 });
  };

  return { footerStyle, resetFooter };
}
