import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Image,
  FlatList, useWindowDimensions
} from 'react-native';
import { Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedScrollHandler, runOnJS } from 'react-native-reanimated';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import NativeWide3DButton from '@/components/page7/NativeWide3DButton';
import ConnectingDots from '@/components/ConnectingDots';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const SLIDES_DATA = [
  {
    id: '1',
    step: 'STEP 1',
    dotHighlight: 'iris reflection',
    textPrefix: 'We detect the light angle and source through your ',
    textSuffix: ' — stripping bad lighting before your skin is ever read.',
  },
  {
    id: '2',
    step: 'STEP 2',
    dotHighlight: 'true skin',
    textPrefix: 'We recognize your face, strip the background entirely, and isolate your ',
    textSuffix: ' — nothing but you.',
  },
  {
    id: '3',
    step: 'STEP 3',
    dotHighlight: 'real insights',
    textPrefix: 'We scan through your true skin and surface ',
    textSuffix: ' — what your skin actually is, not what bad lighting showed.',
  },
];

// Branding colors defined at module scope (Strict Rule 11)
const primaryColor = '#937abd';
const shadowColor = '#735b9c';

export default function OnboardingPage12() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { navigate } = useNavigationGuard();
  const [, setActiveIndex] = useState(0);

  const SLIDE_WIDTH = Math.round(SCREEN_WIDTH - scale(44));
  const GAP = scale(12);
  const SLIDE_INTERVAL = SLIDE_WIDTH + GAP;

  const scrollX = useSharedValue(0);

  const updateIndex = useCallback((x: number) => {
    const nextIndex = Math.round(x / SLIDE_INTERVAL);
    setActiveIndex((prev) => (prev !== nextIndex ? nextIndex : prev));
  }, [SLIDE_INTERVAL]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollX.value = event.contentOffset.x;
      runOnJS(updateIndex)(event.contentOffset.x);
    },
  });

  const handleNext = useCallback(() => {
    navigate('/onboarding/page-13');
  }, [navigate]);

  return (
    <LinearGradient
      colors={['#ffffff', '#fcfafc', '#f5f0fa', '#ede5f5']}
      locations={[0.0, 0.4, 0.75, 1.0]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Title + Subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} maxFontSizeMultiplier={1.2}>Skinstory Spots the Light, Reads the Truth</Text>
            <Text style={styles.subtitleText} maxFontSizeMultiplier={1.2}>Bad lighting lies about your skin. We remove it.</Text>
          </View>

          {/* Center Illustration with Proportional Flex */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/tech_skin_layer_v2.webp')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* How This Works */}
          <Text style={styles.sectionHeading} maxFontSizeMultiplier={1.2}>How This Works:</Text>

          {/* Carousel Section */}
          <View style={styles.carouselWrapper}>
            <AnimatedFlatList
              data={SLIDES_DATA}
              keyExtractor={(item: any) => item.id}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={SLIDE_INTERVAL}
              snapToAlignment="start"
              disableIntervalMomentum={true}
              getItemLayout={(_, index) => ({
                length: SLIDE_INTERVAL,
                offset: SLIDE_INTERVAL * index,
                index,
              })}
              ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={({ item }: any) => (
                <View style={[styles.slideCard, { width: SLIDE_WIDTH }]}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText} maxFontSizeMultiplier={1.2}>{item.step}</Text>
                  </View>
                  <View style={styles.listItem}>
                    <View style={styles.dot} />
                    <Text style={styles.listItemText} maxFontSizeMultiplier={1.2}>
                      {item.textPrefix}
                      <Text style={styles.underline}>{item.dotHighlight}</Text>
                      {item.textSuffix}
                    </Text>
                  </View>
                </View>
              )}
              style={styles.carouselScroll}
            />

            {/* Connecting Animated Dots */}
            <View style={styles.paginationWrapper}>
              <ConnectingDots
                count={3}
                scrollX={scrollX}
                itemWidth={SLIDE_INTERVAL}
                isDark={false}
                dotSize={moderateScale(8, 0.3)}
                pillWidth={moderateScale(24, 0.3)}
                dotGap={scale(6)}
              />
            </View>
          </View>
        </View>

        {/* Bottom CTA Button */}
        <View style={styles.bottomBar}>
          <NativeWide3DButton
            label="Initiate Scanner"
            onPress={handleNext}
            primaryColor={primaryColor}
            shadowColor={shadowColor}
            width={SCREEN_WIDTH - scale(40)}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(22),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(6),
  },
  imageContainer: {
    flex: 1.4,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  titleText: {
    fontSize: moderateScale(25, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#1a1a1a',
    lineHeight: moderateScale(32, 0.3),
    textAlign: 'left',
    marginBottom: verticalScale(4),
  },
  subtitleText: {
    fontSize: moderateScale(16, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#666666',
    textAlign: 'left',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  sectionHeading: {
    fontSize: moderateScale(22, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#1a1a1a',
    textAlign: 'left',
    width: '100%',
    marginBottom: verticalScale(8),
  },
  carouselWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  carouselScroll: {
    width: '100%',
  },
  slideCard: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    backgroundColor: '#f7f6fa',
    borderRadius: moderateScale(22, 0.3),
    borderWidth: 2,
    borderColor: '#111111',
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d6cbe8',
    paddingHorizontal: scale(9),
    paddingVertical: verticalScale(3.5),
    borderRadius: moderateScale(6, 0.3),
    marginBottom: verticalScale(10),
  },
  stepBadgeText: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: moderateScale(12, 0.3),
    color: '#735b9c',
    letterSpacing: 0.5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
  },
  dot: {
    width: moderateScale(14, 0.3),
    height: moderateScale(14, 0.3),
    borderRadius: moderateScale(999, 0.3),
    backgroundColor: '#937abd',
    borderWidth: 2,
    borderColor: '#111111',
    marginTop: verticalScale(3.5),
  },
  listItemText: {
    fontSize: moderateScale(16.5, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: moderateScale(24, 0.3),
    flex: 1,
    textAlign: 'left',
  },
  paginationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(12),
    height: verticalScale(16),
  },
  bottomBar: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(35),
    height: verticalScale(75),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
