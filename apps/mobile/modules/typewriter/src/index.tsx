import React from 'react';
import { requireNativeViewManager } from 'expo-modules-core';
import { ViewProps, Platform, Text as RNText, StyleSheet } from 'react-native';

export interface NativeTypewriterViewProps extends ViewProps {
  text: string;
  isStreaming?: boolean;
  charsPerSecond?: number;
  textColor?: string;
  fontSize?: number;
  lineHeightMultiplier?: number;
  onStreamingComplete?: (event: { nativeEvent: { completed: boolean } }) => void;
}

const NativeComponent: React.ComponentType<NativeTypewriterViewProps> =
  Platform.OS === 'android'
    ? requireNativeViewManager('Typewriter')
    : (null as any);

export function NativeTypewriterText({
  text,
  isStreaming = false,
  charsPerSecond = 45,
  textColor = '#000000',
  fontSize = 14,
  lineHeightMultiplier = 1.43,
  onStreamingComplete,
  style,
  ...rest
}: NativeTypewriterViewProps) {
  if (Platform.OS === 'android' && NativeComponent) {
    return (
      <NativeComponent
        style={style}
        text={text}
        isStreaming={isStreaming}
        charsPerSecond={charsPerSecond}
        textColor={textColor}
        fontSize={fontSize}
        lineHeightMultiplier={lineHeightMultiplier}
        onStreamingComplete={onStreamingComplete}
        {...rest}
      />
    );
  }

  // Fallback for non-Android platforms
  return (
    <RNText
      style={[
        {
          color: textColor,
          fontSize,
          lineHeight: fontSize * lineHeightMultiplier,
        },
        style,
      ]}
      {...rest}
    >
      {text}
    </RNText>
  );
}

export default NativeTypewriterText;
