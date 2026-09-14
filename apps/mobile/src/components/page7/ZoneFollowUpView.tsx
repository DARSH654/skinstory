import React from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Text, TitleText, ButtonText } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { getResponsiveValue } from '@/constants/theme';
import { ZoneFollowUpData } from './types';

interface ZoneFollowUpViewProps {
  followUp: ZoneFollowUpData;
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  onConfirm: () => void;
  primaryColor?: string;
  shadowColor?: string;
}

export default function ZoneFollowUpView({
  followUp,
  selectedOptions,
  onToggleOption,
  onConfirm,
  primaryColor = '#937abd',
  shadowColor = '#735b9c',
}: ZoneFollowUpViewProps) {
  const isDoneEnabled = selectedOptions.length > 0;

  return (
    <View style={styles.overlayRoot}>
      {/* Full Page Blur Background */}
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill}>
        <View style={styles.blurTint} />
      </BlurView>

      <SafeAreaView style={styles.fullScreen} edges={['top', 'bottom', 'left', 'right']}>
        {/* Question Header Box with Curved Edges */}
        <View style={styles.questionBoxWrapper}>
          <View style={styles.questionBoxShadow} />
          <View style={styles.questionBoxTop}>
            <TitleText style={styles.questionBoxTextOverride}>{followUp.subtitle}</TitleText>
          </View>
        </View>

        {/* Vertical Stack Option Boxes (One below the other) */}
        <ScrollView
          style={styles.optionsScrollView}
          contentContainerStyle={styles.optionsListContainer}
          showsVerticalScrollIndicator={false}
        >
          {followUp.options.map((option) => {
            const isOptSelected = selectedOptions.includes(option);
            const optBorderColor = isOptSelected ? primaryColor : '#111111';
            const optShadowColor = isOptSelected ? shadowColor : '#111111';

            return (
              <View key={option} style={styles.optionItemContainer}>
                <Pressable
                  style={styles.optionPressable}
                  onPress={() => onToggleOption(option)}
                >
                  {({ pressed }) => (
                    <>
                      <View
                        style={[
                          styles.optionShadow,
                          { backgroundColor: optShadowColor },
                        ]}
                      />
                      <View
                        style={[
                          styles.optionTop,
                          {
                            backgroundColor: isOptSelected ? '#f0ebf8' : '#ffffff',
                            borderColor: optBorderColor,
                            top: pressed ? 2.5 : 0,
                            left: pressed ? 2.5 : 0,
                          },
                        ]}
                      >
                        <View style={styles.optionRow}>
                          <ButtonText style={styles.optionTextOverride}>
                            {option}
                          </ButtonText>
                          {isOptSelected && (
                            <Check
                              size={getResponsiveValue(18, 20, 22, 22)}
                              color="#111111"
                              strokeWidth={3.5}
                            />
                          )}
                        </View>
                      </View>
                    </>
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>

        {/* Wide Full-Width 3D Done Button */}
        <View style={styles.bottomBar}>
          <View style={styles.done3DContainer}>
            <Pressable
              style={styles.pressableArea}
              onPress={() => isDoneEnabled && onConfirm()}
            >
              {({ pressed }) => (
                <>
                  <View
                    style={[
                      styles.doneShadow,
                      { backgroundColor: isDoneEnabled ? shadowColor : '#cccccc' },
                    ]}
                  />
                  <View
                    style={[
                      styles.doneMid,
                      {
                        backgroundColor: isDoneEnabled ? shadowColor : '#cccccc',
                        top: pressed && isDoneEnabled ? getResponsiveValue(1, 1, 1, 1) : getResponsiveValue(-2, -2.5, -2.5, -2.5),
                        left: pressed && isDoneEnabled ? getResponsiveValue(1, 1, 1, 1) : getResponsiveValue(-2, -2.5, -2.5, -2.5),
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.doneButton,
                      {
                        backgroundColor: isDoneEnabled ? primaryColor : '#d4d4d4',
                        top: pressed && isDoneEnabled ? getResponsiveValue(1.5, 2, 2, 2) : getResponsiveValue(-4, -5, -5, -5),
                        left: pressed && isDoneEnabled ? getResponsiveValue(1.5, 2, 2, 2) : getResponsiveValue(-4, -5, -5, -5),
                      },
                    ]}
                  >
                    <ButtonText
                      style={[
                        styles.doneButtonTextOverride,
                        { color: isDoneEnabled ? '#ffffff' : '#888888' },
                      ]}
                    >
                      Done
                    </ButtonText>
                  </View>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 999,
  },
  blurTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240, 235, 248, 0.78)',
  },
  fullScreen: {
    flex: 1,
    paddingTop: getResponsiveValue(16, 20, 24, 28),
  },
  questionBoxWrapper: {
    paddingHorizontal: 24,
    marginTop: getResponsiveValue(4, 6, 8, 10),
    marginBottom: getResponsiveValue(16, 20, 24, 28),
    position: 'relative',
  },
  questionBoxShadow: {
    position: 'absolute',
    top: 3,
    left: 27,
    right: 21,
    bottom: -3,
    backgroundColor: '#111111',
    borderRadius: 20,
  },
  questionBoxTop: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#111111',
    paddingVertical: getResponsiveValue(14, 16, 18, 20),
    paddingHorizontal: getResponsiveValue(16, 18, 20, 22),
  },
  questionBoxTextOverride: {
    color: '#111111',
    textAlign: 'center',
  },
  optionsScrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  optionsListContainer: {
    gap: getResponsiveValue(10, 12, 14, 16),
    paddingBottom: 20,
  },
  optionItemContainer: {
    width: '100%',
    height: getResponsiveValue(50, 54, 58, 62),
    position: 'relative',
  },
  optionPressable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  optionShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    position: 'absolute',
    top: 3,
    left: 3,
  },
  optionTop: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 3.5,
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextOverride: {
    color: '#111111',
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: getResponsiveValue(24, 32, 40, 44),
    paddingTop: 8,
  },
  done3DContainer: {
    width: '100%',
    height: getResponsiveValue(48, 52, 56, 60),
  },
  pressableArea: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  doneShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  doneMid: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    position: 'absolute',
  },
  doneButton: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  doneButtonTextOverride: {
    textAlign: 'center',
  },
});
