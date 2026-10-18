import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AppBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

export interface AppBottomSheetProps {
  snapPoints?: string[];
  isDark: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export const AppBottomSheet = forwardRef<AppBottomSheetRef, AppBottomSheetProps>(
  ({ snapPoints = ['45%'], isDark, onClose, children }, ref) => {
    const insets = useSafeAreaInsets();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        bottomSheetModalRef.current?.dismiss();
      },
    }));

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    );

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={snapPoints ? false : true}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        handleStyle={styles.handleContainer}
        handleIndicatorStyle={[
          styles.dragHandle,
          isDark ? styles.dragHandleDark : styles.dragHandleLight,
        ]}
        backgroundStyle={[
          isDark ? styles.bgDark : styles.bgLight,
          styles.roundedTop,
        ]}
        onDismiss={onClose}
      >
        <BottomSheetView style={[styles.sheetInner, { paddingBottom: insets.bottom }]}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default AppBottomSheet;

const styles = StyleSheet.create({
  roundedTop: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bgLight: {
    backgroundColor: '#FAF8F6',
  },
  bgDark: {
    backgroundColor: '#121212',
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
  dragHandleLight: {
    backgroundColor: '#d1d5db',
  },
  dragHandleDark: {
    backgroundColor: '#3f3f46',
  },
  sheetInner: {
    flex: 1,
  },
});
