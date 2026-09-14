import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  Keyboard,
  Animated,
  PanResponder,
} from 'react-native';
import { Text } from '@/components/AppText';
import { 
  BottomSheetModal, 
  BottomSheetView, 
  BottomSheetTextInput, 
  BottomSheetBackdrop, 
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface EnterRoutineCodeSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface EnterRoutineCodeSheetProps {
  isDark: boolean;
  onSuccess: (msg: string) => void;
  onDismiss?: () => void;
}

const EnterRoutineCodeSheet = forwardRef<EnterRoutineCodeSheetRef, EnterRoutineCodeSheetProps>(({
  isDark,
  onSuccess,
  onDismiss,
}, ref) => {
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [addCodeValue, setAddCodeValue] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const toastSlideAnim = useRef(new Animated.Value(-80)).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      Keyboard.dismiss();
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    toastSlideAnim.stopAnimation();
    toastSlideAnim.setValue(-80);
    setToastMessage(msg);
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
          setToastMessage("");
          toastTimerRef.current = null;
        });
      }, 2000); // 2 seconds
    });
  };

  const dismissErrorToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    Animated.timing(toastSlideAnim, {
      toValue: -80,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setToastMessage("");
    });
  };

  const errorToastPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy < 0) {
          toastSlideAnim.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -20) {
          dismissErrorToast();
        } else {
          Animated.spring(toastSlideAnim, {
            toValue: 0,
            damping: 20,
            stiffness: 200,
            mass: 0.8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
        {toastMessage ? (
          <Animated.View
            {...errorToastPanResponder.panHandlers}
            style={[
              styles.toastContainer,
              isDark ? styles.toastDark : styles.toastLight,
              {
                transform: [{ translateY: toastSlideAnim }],
                top: Math.max(insets.top, 16) + 10,
              }
            ]}
          >
            <Text style={isDark ? styles.toastTextDark : styles.toastTextLight}>
              {toastMessage}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    ),
    [toastMessage, isDark, insets.top]
  );

  const handleClose = () => {
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  };

  const handleEnterCode = () => {
    if (addCodeValue.length === 0) return;
    
    if (addCodeValue.length < 6) {
      showToast("Enter a 6-digit code");
      return;
    }
    
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
    setAddCodeValue("");
    onSuccess("Routine code successfully added!");
  };

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
        onDismiss?.();
      }}
      handleStyle={styles.handleContainer}
      handleIndicatorStyle={[styles.dragHandle, isDark ? styles.dragHandleDark : styles.dragHandleLight]}
      backgroundStyle={[isDark ? styles.bgDark : styles.bgLight, styles.roundedTop]}
    >
      <BottomSheetView 
        style={[styles.sheetInner, { paddingBottom: 16 }]}
      >
        <Text style={[styles.sheetTitle, isDark ? styles.textDark : styles.textLight]}>
          Enter Routine Code
        </Text>
        
        <BottomSheetTextInput
          style={[
            styles.sheetInput,
            isDark ? styles.sheetInputDark : styles.sheetInputLight,
            isDark ? styles.textDark : styles.textLight,
          ]}
          placeholder="E.G. A3F9B2"
          placeholderTextColor={isDark ? "#52525b" : "#9ca3af"}
          value={addCodeValue}
          maxLength={6}
          autoCapitalize="characters"
          textAlign="center"
          onChangeText={(val) => {
            const sanitized = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            setAddCodeValue(sanitized);
          }}
          onSubmitEditing={handleEnterCode}
        />
        
        <View style={styles.sheetActions}>
          <Pressable 
            onPress={handleClose}
            style={[styles.sheetActionBtn, isDark ? styles.sheetBtnCancelDark : styles.sheetBtnCancelLight]}
          >
            <Text style={[styles.sheetBtnCancelText, isDark ? styles.textDark : styles.textLight]}>Cancel</Text>
          </Pressable>
          <Pressable 
            onPress={handleEnterCode}
            disabled={addCodeValue.length === 0}
            style={[styles.sheetActionBtn, styles.sheetBtnEnter, addCodeValue.length === 0 && styles.disabledBtn]}
          >
            <Text style={styles.sheetBtnEnterText}>Enter</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default EnterRoutineCodeSheet;

const styles = StyleSheet.create({
  roundedTop: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bgLight: { backgroundColor: '#FAF8F6' },
  bgDark: { backgroundColor: '#121212' },
  handleContainer: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 52,
    height: 6,
    borderRadius: 999,
  },
  dragHandleLight: {
    backgroundColor: '#d1d5db',
  },
  dragHandleDark: {
    backgroundColor: '#3f3f46',
  },
  sheetInner: {
    paddingHorizontal: 20,
    paddingTop: 2,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Outfit_700Bold',
    textAlign: 'center',
  },
  textLight: { color: '#111827' },
  textDark: { color: '#ffffff' },
  sheetInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 6,
    fontFamily: 'Outfit_700Bold',
  },
  sheetInputLight: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  sheetInputDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sheetActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBtnCancelLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sheetBtnCancelDark: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  sheetBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetBtnEnter: {
    backgroundColor: Colors.light.primary,
  },
  sheetBtnEnterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 10,
    borderWidth: 1,
    zIndex: 9999,
  },
  toastLight: { backgroundColor: '#111827', borderColor: '#374151' },
  toastDark: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
  toastTextLight: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#ffffff' },
  toastTextDark: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#111827' },
});
