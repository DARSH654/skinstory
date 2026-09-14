import React, { useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import OnboardingProgressBar from '@/components/OnboardingProgressBar';
import Native3DButton from '@/components/page7/Native3DButton';
import { getResponsiveValue } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Onboarding20Vs98Page() {
  const { navigate } = useNavigationGuard();

  const primaryColor = '#937abd';
  const shadowColor = '#735b9c';

  // Animations
  const cardSlideAnim = useRef(new Animated.Value(0)).current;
  const leftBarAnim = useRef(new Animated.Value(0)).current;
  const rightBarAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      cardSlideAnim.setValue(0);
      leftBarAnim.setValue(0);
      rightBarAnim.setValue(0);
      textAnim.setValue(0);

      Animated.sequence([
        // 1. Entrance of the card
        Animated.timing(cardSlideAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // 2. Without SkinStory bar rises smoothly from bottom
        Animated.timing(leftBarAnim, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // 3. With SkinStory bar rises smoothly from bottom
        Animated.timing(rightBarAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // 4. Bottom text slides up & fades in
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    }, [])
  );

  const handleNext = () => {
    navigate('/onboarding/page-12');
  };

  const leftBarHeight = leftBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, getResponsiveValue(48, 54, 58, 64)],
  });

  const leftBarOpacity = leftBarAnim.interpolate({
    inputRange: [0, 0.05, 1],
    outputRange: [0, 1, 1],
  });

  const rightBarHeight = rightBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, getResponsiveValue(150, 158, 165, 172)],
  });

  const rightBarOpacity = rightBarAnim.interpolate({
    inputRange: [0, 0.05, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* 2. Content Area */}
      <View style={styles.content}>
        {/* Title Container */}
        <View style={styles.titleContainer}>
          <View style={styles.titleFlow}>
            <Text style={styles.pageTitle}>Get deep knowledge with </Text>
            <View style={styles.highlightWrapper}>
              <View style={styles.highlightStripe} />
              <Text style={styles.pageTitle}>SkinStory</Text>
            </View>
          </View>
        </View>

        {/* 3. Central Card Comparison Container */}
        <View style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardSlideAnim,
                transform: [
                  {
                    translateY: cardSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Comparison Columns */}
            <View style={styles.columnsRow}>
              {/* Column 1: Without SkinStory */}
              <View style={styles.columnCard}>
                <Text style={styles.columnHeaderWithout}>
                  Without{'\n'}SkinStory
                </Text>
                <View style={styles.barArea}>
                  <Animated.View
                    style={[
                      styles.withoutBar,
                      {
                        height: leftBarHeight,
                        opacity: leftBarOpacity,
                      },
                    ]}
                  >
                    <Animated.Text
                      style={[
                        styles.withoutBarText,
                        { opacity: leftBarAnim },
                      ]}
                    >
                      20%
                    </Animated.Text>
                  </Animated.View>
                </View>
              </View>

              {/* Column 2: With SkinStory */}
              <View style={[styles.columnCard, styles.columnCardActive]}>
                <Text style={styles.columnHeaderWith}>
                  With{'\n'}SkinStory
                </Text>
                <View style={styles.barArea}>
                  <Animated.View
                    style={[
                      styles.withBar,
                      {
                        height: rightBarHeight,
                        opacity: rightBarOpacity,
                      },
                    ]}
                  >
                    <Animated.Text
                      style={[
                        styles.withBarText,
                        { opacity: rightBarAnim },
                      ]}
                    >
                      98%
                    </Animated.Text>
                  </Animated.View>
                </View>
              </View>
            </View>

            {/* Bottom Insight / Accountability Text with Slide-Up Effect */}
            <Animated.View
              style={[
                styles.cardBottomTextContainer,
                {
                  opacity: textAnim,
                  transform: [
                    {
                      translateY: textAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.cardBottomText}>
                SkinStory makes it easy to understand and holds you accountable
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
      </View>

      {/* 4. Bottom Controls / 3D Next Button */}
      <View style={styles.bottomBar}>
        <Native3DButton
          enabled={true}
          onPress={handleNext}
          primaryColor={primaryColor}
          shadowColor={shadowColor}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 6,
    marginBottom: getResponsiveValue(16, 20, 24, 28),
    alignItems: 'center',
  },
  titleFlow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: getResponsiveValue(21, 24, 26, 28),
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#111111',
    textAlign: 'center',
    lineHeight: getResponsiveValue(28, 32, 35, 38),
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    height: 11,
    backgroundColor: '#d6cbe8',
    borderRadius: 2,
    zIndex: -1,
  },

  /* Big Card Container */
  cardContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginBottom: getResponsiveValue(30, 40, 48, 54),
  },
  card: {
    backgroundColor: '#f5f5f7',
    borderRadius: 28,
    paddingHorizontal: getResponsiveValue(16, 18, 20, 24),
    paddingTop: getResponsiveValue(22, 26, 28, 32),
    paddingBottom: getResponsiveValue(20, 24, 26, 30),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  /* Columns Layout */
  columnsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getResponsiveValue(12, 14, 16, 18),
  },
  columnCard: {
    width: '35%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingTop: getResponsiveValue(16, 18, 20, 22),
    height: getResponsiveValue(210, 225, 240, 255),
    justifyContent: 'space-between',
    alignItems: 'stretch',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  columnCardActive: {
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  /* Column Headers */
  columnHeaderWithout: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: getResponsiveValue(14, 15, 16, 17),
    color: '#333333',
    textAlign: 'center',
    lineHeight: getResponsiveValue(18, 20, 21, 22),
    paddingHorizontal: 8,
  },
  columnHeaderWith: {
    fontFamily: 'Outfit_700Bold',
    fontSize: getResponsiveValue(14, 15, 16, 17),
    color: '#111111',
    textAlign: 'center',
    lineHeight: getResponsiveValue(18, 20, 21, 22),
    paddingHorizontal: 8,
  },

  /* Bar Areas */
  barArea: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  withoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e1e1e6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  withoutBarText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: getResponsiveValue(15, 16, 17, 18),
    color: '#555558',
    paddingVertical: getResponsiveValue(6, 8, 8, 10),
  },
  withBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#937abd',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#735b9c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  withBarText: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: getResponsiveValue(24, 26, 28, 30),
    color: '#ffffff',
    letterSpacing: 0.5,
    paddingVertical: getResponsiveValue(8, 10, 12, 14),
  },

  /* Bottom Text */
  cardBottomTextContainer: {
    marginTop: getResponsiveValue(18, 22, 24, 26),
    paddingHorizontal: 8,
    minHeight: getResponsiveValue(40, 44, 46, 48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBottomText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: getResponsiveValue(14.5, 15.5, 16.5, 17.5),
    color: '#333333',
    textAlign: 'center',
    lineHeight: getResponsiveValue(20, 22, 23, 24),
  },

  /* Bottom Navigation */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: getResponsiveValue(15, 20, 20, 20),
    paddingBottom: getResponsiveValue(30, 40, 47, 50),
    height: getResponsiveValue(70, 80, 90, 100),
  },
});
