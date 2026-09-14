import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Pressable, Image, useWindowDimensions, FlatList } from 'react-native';
import { Text, TitleText } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import Animated, { useSharedValue, useAnimatedScrollHandler, runOnJS } from 'react-native-reanimated';
import ConnectingDots from '@/components/ConnectingDots';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Branding colors:
const primaryColor = '#937abd'; // Darker stop
const secondaryColor = '#d6cbe8'; // Lighter stop
const shadowColor = '#735b9c';  // Darker shade for 3D shadow effect

export default function OnboardingFlow() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();


  const { navigate } = useNavigationGuard();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useRef([
    {
      id: '1',
      title: (
        <View style={styles.titleContainer}>
          <TitleText style={styles.titleOverride}>You looked in the mirror</TitleText>
          <TitleText style={styles.titleOverride}>and wished something</TitleText>
          <View style={styles.row}>
            <TitleText style={styles.titleOverride}>was </TitleText>
            <View style={styles.highlightWrapper}>
              <View style={[styles.highlightStripe, { backgroundColor: secondaryColor }]} />
              <TitleText style={styles.titleOverride}>different.</TitleText>
            </View>
          </View>
        </View>
      ),
      image: require('../../../assets/images/girl_mirror.png'),
      imageStyle: styles.illustrationStandard,
    },
    {
      id: '2',
      title: (
        <View style={styles.titleContainer}>
          <TitleText style={styles.titleOverride}>you've tried everything.</TitleText>
          <View style={styles.row}>
            <TitleText style={styles.titleOverride}>your skin still isn't </TitleText>
            <View style={styles.highlightWrapper}>
              <View style={[styles.highlightStripe, { backgroundColor: secondaryColor }]} />
              <TitleText style={styles.titleOverride}>listening.</TitleText>
            </View>
          </View>
        </View>
      ),
      image: require('../../../assets/images/girl_scrolling.png'),
      imageStyle: styles.illustrationStandard,
    },
    {
      id: '3',
      title: (
        <View style={styles.titleContainer}>
          <TitleText style={styles.titleOverride}>Your skin isn't broken.</TitleText>
          <View style={styles.row}>
            <TitleText style={styles.titleOverride}>It's been </TitleText>
            <View style={styles.highlightWrapper}>
              <View style={[styles.highlightStripe, { backgroundColor: secondaryColor }]} />
              <TitleText style={styles.titleOverride}>unheard.</TitleText>
            </View>
          </View>
        </View>
      ),
      image: require('../../../assets/images/girl_happy.png'),
      imageStyle: styles.illustrationMedium,
    },
  ]).current;

  // Reanimated shared value for smooth dot animation (used by ConnectingDots)
  const scrollX = useSharedValue(0);

  // Update JS-side activeIndex only when the slide actually transitions
  const updateIndex = useCallback((x: number) => {
    const nextIndex = Math.round(x / SCREEN_WIDTH);
    setActiveIndex(prev => (prev !== nextIndex ? nextIndex : prev));
  }, [SCREEN_WIDTH]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollX.value = event.contentOffset.x;
      runOnJS(updateIndex)(event.contentOffset.x);
    },
  });

  const handleNext = () => {
    if (activeIndex < 2) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Progress Indicator — animated ConnectingDots (same as VT Scan Overall Zone Performance) */}
      <View style={styles.topHeader}>
        <ConnectingDots
          count={3}
          scrollX={scrollX}
          itemWidth={SCREEN_WIDTH}
          isDark={false}
        />
      </View>

      {/* 2. Swipeable Slide FlatList */}
      <AnimatedFlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        getItemLayout={(_: any, index: number) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={{ width: SCREEN_WIDTH }}>
            <View style={styles.content}>
              {item.title}
              <View style={styles.imageContainer}>
                <Image
                  source={item.image}
                  style={item.imageStyle}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        )}
      />

      {/* 3. Bottom controls area — arrow button on all 3 slides */}
      <View style={styles.bottomBar}>
        <View style={styles.button3DContainer}>
          <Pressable
            style={styles.pressableArea}
            onPress={() => {
              if (activeIndex < 2) {
                handleNext();
              } else {
                navigate('/onboarding/page-4b');
              }
            }}
          >
            {({ pressed }) => (
              <>
                <View style={[styles.buttonShadow, { backgroundColor: shadowColor }]} />
                <View
                  style={[
                    styles.buttonMid,
                    {
                      backgroundColor: shadowColor,
                      top: pressed ? moderateScale(1, 0.3) : moderateScale(-2.5, 0.3),
                      left: pressed ? moderateScale(1, 0.3) : moderateScale(-2.5, 0.3),
                    }
                  ]}
                />
                <View
                  style={[
                    styles.nextButton,
                    {
                      backgroundColor: primaryColor,
                      top: pressed ? moderateScale(2, 0.3) : moderateScale(-5, 0.3),
                      left: pressed ? moderateScale(2, 0.3) : moderateScale(-5, 0.3),
                    }
                  ]}
                >
                  <ArrowRight size={moderateScale(22, 0.3)} color="#ffffff" strokeWidth={3} />
                </View>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    width: '100%',
    alignItems: 'center',
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(10),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  titleOverride: {
    color: '#1a1a1a',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: moderateScale(2, 0.3),
    left: scale(-2),
    right: scale(-2),
    height: moderateScale(10, 0.3),
    borderRadius: scale(2),
    zIndex: -1,
  },
  imageContainer: {
    flex: 2.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(-15),
  },
  illustrationStandard: {
    width: '85%',
    maxWidth: scale(320),
    aspectRatio: 320 / 380,
  },
  illustrationMedium: {
    width: '88%',
    maxWidth: scale(340),
    aspectRatio: 340 / 410,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(35),
    position: 'relative',
    height: verticalScale(75),
  },
  button3DContainer: {
    width: moderateScale(52, 0.3),
    height: moderateScale(52, 0.3),
    position: 'absolute',
    right: scale(20),
    bottom: verticalScale(32),
  },
  pressableArea: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  buttonShadow: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(26, 0.3),
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buttonMid: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(26, 0.3),
    position: 'absolute',
  },
  nextButton: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(26, 0.3),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  wideButton3DContainer: {
    width: '75%',
    height: moderateScale(48, 0.3),
    position: 'absolute',
    alignSelf: 'center',
    bottom: verticalScale(35),
  },
  wideButtonShadow: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(24, 0.3),
    position: 'absolute',
    top: 0,
    left: 0,
  },
  wideButtonMid: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(24, 0.3),
    position: 'absolute',
  },
  wideNextButton: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(24, 0.3),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    paddingHorizontal: scale(14),
  },
});

