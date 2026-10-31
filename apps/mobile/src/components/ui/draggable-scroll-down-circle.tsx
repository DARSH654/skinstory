import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

export interface UseDraggableScrollProps {
  modalOpen: boolean;
  activeStep: any;
  scrollViewRef: React.RefObject<ScrollView | null>;
  shouldScrollToTop?: boolean;
  maxSheetHeight?: number;
  mode?: 'down-only' | 'bidirectional';
}

export function useDraggableScroll({
  modalOpen,
  activeStep,
  scrollViewRef,
  shouldScrollToTop = true,
  maxSheetHeight,
  mode = 'down-only',
}: UseDraggableScrollProps) {
  const [isSaveBtnVisible, setIsSaveBtnVisible] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const modalScrollY = useRef(0);
  const modalContentHeight = useRef(0);
  const modalScrollViewHeight = useRef(0);

  const updateSaveBtnVisibility = useCallback(() => {
    const overflows = modalContentHeight.current > modalScrollViewHeight.current + 10;
    setHasOverflow(overflows);

    if (!overflows) {
      setIsSaveBtnVisible(true);
      setIsAtBottom(false);
      return true;
    }
    // If sheet has dynamic sizing with a maxSheetHeight limit and content hasn't reached that limit,
    // the sheet is still expanding dynamically to fit its content without overflow.
    if (maxSheetHeight && modalContentHeight.current < maxSheetHeight - 20) {
      setIsSaveBtnVisible(true);
      setIsAtBottom(false);
      return true;
    }
    const atBottom = modalScrollY.current + modalScrollViewHeight.current >= modalContentHeight.current - 15;
    setIsAtBottom(atBottom);

    if (mode === 'bidirectional') {
      // In bidirectional mode, circle remains visible as long as content overflows
      setIsSaveBtnVisible(false);
    } else {
      setIsSaveBtnVisible(atBottom);
    }
    return atBottom;
  }, [maxSheetHeight, mode]);

  useEffect(() => {
    if (modalOpen) {
      modalScrollY.current = 0;
      modalContentHeight.current = 0;
      setIsSaveBtnVisible(true);
      if (shouldScrollToTop) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }
      
      const timer = setTimeout(() => {
        updateSaveBtnVisibility();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modalOpen, activeStep, scrollViewRef, updateSaveBtnVisibility, shouldScrollToTop]);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset ? e.nativeEvent.contentOffset.y : 0;
    modalScrollY.current = y;
    updateSaveBtnVisibility();
  }, [updateSaveBtnVisibility]);

  const handleContentSizeChange = useCallback((width: number, height: number) => {
    modalContentHeight.current = height;
    updateSaveBtnVisibility();
  }, [updateSaveBtnVisibility, maxSheetHeight]);

  const handleLayout = useCallback((e: any) => {
    const layoutH = e.nativeEvent.layout ? e.nativeEvent.layout.height : 0;
    modalScrollViewHeight.current = layoutH;
    updateSaveBtnVisibility();
  }, [updateSaveBtnVisibility]);

  return {
    scrollHandlers: {
      onScroll: handleScroll,
      onContentSizeChange: handleContentSizeChange,
      onLayout: handleLayout,
      scrollEventThrottle: 16,
    },
    isSaveBtnVisible,
    isAtBottom,
    hasOverflow,
  };
}

interface DraggableScrollDownCircleProps {
  scrollViewRef: React.RefObject<ScrollView | null>;
  isSaveBtnVisible: boolean;
  modalOpen: boolean;
  isDark: boolean;
  isFullScreenModal?: boolean;
  bottomOffset?: number;
  tag?: string;
  isAtBottom?: boolean;
  mode?: 'down-only' | 'bidirectional';
}

export function DraggableScrollDownCircle({
  scrollViewRef,
  isSaveBtnVisible,
  modalOpen,
  isDark,
  isFullScreenModal = false,
  bottomOffset = 0,
  tag = 'UnknownSheet',
  isAtBottom = false,
  mode = 'down-only',
}: DraggableScrollDownCircleProps) {
  const insets = useSafeAreaInsets();
  
  const modalWidthRef = useRef(Dimensions.get('window').width);
  const modalHeightRef = useRef(0);
  const currentSide = useRef<'left' | 'right'>('left');
  const currentYRatio = useRef<number>(1); // Relative position ratio (0 at minY, 1 at maxY)

  const circlePan = useRef(new Animated.ValueXY({ x: 16, y: 300 })).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (modalOpen) {
      currentSide.current = 'left';
      currentYRatio.current = 1;
    }
  }, [modalOpen]);

  useEffect(() => {
    Animated.timing(circleOpacity, {
      toValue: isSaveBtnVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSaveBtnVisible, circleOpacity]);

  // Keep live ref of isAtBottom so panResponder callbacks never read stale closure values
  const isAtBottomRef = useRef(isAtBottom);
  isAtBottomRef.current = isAtBottom;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const circlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        circlePan.extractOffset();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: circlePan.x, dy: circlePan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        const dx = Math.abs(gestureState.dx);
        const dy = Math.abs(gestureState.dy);
        const currentIsAtBottom = isAtBottomRef.current;
        const currentMode = modeRef.current;

        circlePan.flattenOffset();

        const circleSize = 48;
        const paddingX = 16;
        const paddingY = isFullScreenModal ? 24 : 0;
        
        const currentX = (circlePan.x as any)._value;
        const currentY = (circlePan.y as any)._value;
        
        const mWidth = modalWidthRef.current;
        const mHeight = modalHeightRef.current;
        
        const minX = paddingX;
        const maxX = mWidth - circleSize - paddingX;
        const minY = isFullScreenModal ? insets.top + 16 : insets.top + 70;
        const bottomLimit = bottomOffset > 0 ? bottomOffset : 72;
        const maxY = mHeight - circleSize - paddingY - bottomLimit;
        
        const isLeft = currentX < (mWidth / 2) - (circleSize / 2);
        currentSide.current = isLeft ? 'left' : 'right';
        
        let targetX = isLeft ? minX : maxX;
        let targetY = Math.max(minY, Math.min(maxY, currentY));

        // Save the Y position as a ratio between minY and maxY
        const totalHeightRange = maxY - minY;
        if (totalHeightRange > 0) {
          currentYRatio.current = (targetY - minY) / totalHeightRange;
        } else {
          currentYRatio.current = 1;
        }

        Animated.spring(circlePan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          tension: 80,
          friction: 8,
        }).start();

        if (dx < 5 && dy < 5) {
          if (currentMode === 'bidirectional' && currentIsAtBottom) {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          } else {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        }
      }
    })
  ).current;

  const handleParentLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    modalWidthRef.current = width;
    modalHeightRef.current = height;
    
    const paddingX = 16;
    const paddingY = isFullScreenModal ? 24 : 0;
    const circleSize = 48;
    
    const minX = paddingX;
    const maxX = width - circleSize - paddingX;
    const minY = isFullScreenModal ? insets.top + 16 : insets.top + 70;
    const bottomLimit = bottomOffset > 0 ? bottomOffset : 72;
    const maxY = height - circleSize - paddingY - bottomLimit;


    const targetX = currentSide.current === 'left' ? minX : maxX;
    const targetY = minY + currentYRatio.current * (maxY - minY);
    
    circlePan.setValue({ x: targetX, y: targetY });
  };

  const showChevronUp = mode === 'bidirectional' && isAtBottom;

  const effectivePointerEvents = (mode === 'bidirectional')
    ? 'auto'
    : (isSaveBtnVisible ? 'none' : 'auto');

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" onLayout={handleParentLayout}>
      <Animated.View 
        pointerEvents={effectivePointerEvents}
        style={[
          styles.scrollDownCircle,
          isDark ? styles.circleDark : styles.circleLight,
          {
            transform: [
              { translateX: circlePan.x },
              { translateY: circlePan.y }
            ],
            opacity: circleOpacity,
          }
        ]}
        {...circlePanResponder.panHandlers}
      >
        {showChevronUp ? (
          <ChevronUp size={24} color={isDark ? '#ffffff' : '#111827'} />
        ) : (
          <ChevronDown size={24} color={isDark ? '#ffffff' : '#111827'} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollDownCircle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  circleLight: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  circleDark: {
    backgroundColor: '#18181b',
    borderColor: '#3f3f46',
  },
});
