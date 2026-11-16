import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { Text } from '@/components/AppText';

export interface SeveritySliderProps {
  severity: number;
  maxScale: number;
  isDark: boolean;
  primaryColor: string;
  onSeverityChange: (lvl: number) => void;
}

export default function SeveritySlider({
  severity,
  maxScale,
  isDark,
  primaryColor,
  onSeverityChange,
}: SeveritySliderProps) {
  const minVal = 1;
  const maxVal = maxScale;

  const [selectedValue, setSelectedValue] = useState(severity);
  const selectedValueRef = useRef(selectedValue);
  selectedValueRef.current = selectedValue;

  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);
  const trackViewRef = useRef<View>(null);

  // Sync when severity prop changes (switching zones)
  useEffect(() => {
    setSelectedValue(severity);
  }, [severity]);

  const THUMB_RADIUS = 19;

  const updateFromPosition = useCallback(
    (pageX: number) => {
      const totalWidth = trackWidthRef.current;
      if (totalWidth <= THUMB_RADIUS * 2) return;
      const usableWidth = totalWidth - THUMB_RADIUS * 2;
      const relX = Math.max(0, Math.min(pageX - trackPageXRef.current - THUMB_RADIUS, usableWidth));
      const ratio = relX / usableWidth;
      const computedVal = Math.round(minVal + ratio * (maxVal - minVal));
      const clampedVal = Math.max(minVal, Math.min(maxVal, computedVal));
      if (clampedVal !== selectedValueRef.current) {
        setSelectedValue(clampedVal);
        onSeverityChange(clampedVal);
      }
    },
    [minVal, maxVal, onSeverityChange]
  );

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        return Math.abs(gestureState.dx) > 2;
      },
      onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
        return Math.abs(gestureState.dx) > 2;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        trackViewRef.current?.measure((_x, _y, width, _height, pageX) => {
          trackWidthRef.current = width;
          trackPageXRef.current = pageX;
          setTrackWidth(width);
          if (evt.nativeEvent && typeof evt.nativeEvent.pageX === 'number') {
            updateFromPosition(evt.nativeEvent.pageX);
          }
        });
      },
      onPanResponderMove: (evt) => {
        if (evt.nativeEvent && typeof evt.nativeEvent.pageX === 'number') {
          updateFromPosition(evt.nativeEvent.pageX);
        }
      },
      onPanResponderRelease: (evt) => {
        if (evt.nativeEvent && typeof evt.nativeEvent.pageX === 'number') {
          updateFromPosition(evt.nativeEvent.pageX);
        }
      },
      onPanResponderTerminate: (evt) => {
        if (evt.nativeEvent && typeof evt.nativeEvent.pageX === 'number') {
          updateFromPosition(evt.nativeEvent.pageX);
        }
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

  const percentage = maxVal === minVal ? 0 : ((selectedValue - minVal) / (maxVal - minVal)) * 100;
  const usableWidth = Math.max(0, trackWidth - THUMB_RADIUS * 2);
  const activeTrackWidth = (percentage / 100) * usableWidth;
  const thumbTranslateX = (percentage / 100) * usableWidth;

  return (
    <View style={sliderStyles.scaleContainer}>
      <View
        ref={trackViewRef}
        style={sliderStyles.sliderTrackWrapper}
        onLayout={handleTrackLayout}
        {...panResponder.panHandlers}
      >
        {/* Inactive Track */}
        <View
          style={[
            sliderStyles.sliderBaseTrack,
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
            sliderStyles.sliderActiveTrack,
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
            sliderStyles.sliderThumb,
            {
              left: THUMB_RADIUS,
              transform: [{ translateX: thumbTranslateX }],
              backgroundColor: primaryColor,
              borderColor: '#ffffff',
            },
          ]}
        >
          <Text style={sliderStyles.sliderThumbText}>{selectedValue}</Text>
        </View>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
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
});
