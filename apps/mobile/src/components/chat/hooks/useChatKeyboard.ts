import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

export function useChatKeyboard(onKeyboardShow?: () => void, enabled: boolean = true, isInTabs: boolean = false) {
  const insets = useSafeAreaInsets();
  const bottomInset = isInTabs ? 0 : insets.bottom;
  const restingPadding = bottomInset + 8;
  const footerPad = useSharedValue(restingPadding);
  const enabledShared = useSharedValue(enabled);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    enabledShared.value = enabled;
    if (!enabled) {
      footerPad.value = withTiming(restingPadding, { duration: 120 });
      setKeyboardHeight(0);
    }
  }, [enabled, restingPadding, enabledShared, footerPad]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (!enabledShared.value) return;
      const kbHeight = e.endCoordinates.height;
      setKeyboardHeight(kbHeight);
      const targetPadding = Platform.OS === 'android'
        ? (isInTabs ? kbHeight + 8 : kbHeight + bottomInset + 8)
        : kbHeight + 8;
      footerPad.value = withTiming(targetPadding, { duration: 180 });
      if (onKeyboardShow) {
        onKeyboardShow();
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      footerPad.value = withTiming(restingPadding, { duration: 180 });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [bottomInset, restingPadding, isInTabs, enabledShared, footerPad, onKeyboardShow]);

  const footerStyle = useAnimatedStyle(() => ({
    paddingBottom: footerPad.value,
  }));

  // Call this after manually dismissing the keyboard (e.g. before/after opening a bottom sheet)
  // to guarantee the footer snaps back to its resting position.
  const resetFooter = () => {
    setKeyboardHeight(0);
    footerPad.value = withTiming(restingPadding, { duration: 180 });
  };

  return { footerStyle, resetFooter, keyboardHeight };
}
