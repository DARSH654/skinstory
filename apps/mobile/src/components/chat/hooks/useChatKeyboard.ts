import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (!enabledShared.value) return;
      footerPad.value = withTiming(e.endCoordinates.height + 8, { duration: 180 });
      if (onKeyboardShow) {
        onKeyboardShow();
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      footerPad.value = withTiming(bottomInset + 8, { duration: 180 });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [bottomInset, enabledShared, footerPad, onKeyboardShow]);

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
