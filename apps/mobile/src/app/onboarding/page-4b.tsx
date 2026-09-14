import React, { useCallback } from 'react';
import {
  StyleSheet, View, Image,
  useWindowDimensions
} from 'react-native';
import { Text, TitleText, BodyText } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import NativeWide3DButton from '@/components/page7/NativeWide3DButton';

// Branding colors defined at module scope (Strict Rule 11)
const primaryColor = '#937abd';
const shadowColor = '#735b9c';
const secondaryColor = '#d6cbe8';

export default function OnboardingPage4b() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { navigate } = useNavigationGuard();

  const handleNext = useCallback(() => {
    navigate('/onboarding/page-4');
  }, [navigate]);

  return (
    <LinearGradient
      colors={['#ffffff', '#fcfafc', '#f5f0fa', '#ede5f5']}
      locations={[0.0, 0.4, 0.75, 1.0]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Top Illustration */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/envelope_heart.webp')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <TitleText style={styles.titleOverride}>Your skin has been sending</TitleText>
            <View style={styles.row}>
              <View style={styles.highlightWrapper}>
                <View style={[styles.highlightStripe, { backgroundColor: secondaryColor }]} />
                <TitleText style={styles.titleOverride}>signals.</TitleText>
              </View>
              <TitleText style={styles.titleOverride}> It's time for you</TitleText>
            </View>
            <View style={styles.row}>
              <TitleText style={styles.titleOverride}>to finally </TitleText>
              <View style={styles.highlightWrapper}>
                <View style={[styles.highlightStripe, { backgroundColor: secondaryColor }]} />
                <TitleText style={styles.titleOverride}>decode it.</TitleText>
              </View>
            </View>
          </View>

          {/* Three pointers */}
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <View style={styles.dot} />
              <BodyText style={styles.listItemOverride}>
                Strip away the heavy emotional fatigue of trying endless remedies.
              </BodyText>
            </View>

            <View style={styles.listItem}>
              <View style={styles.dot} />
              <BodyText style={styles.listItemOverride}>
                Shift from exhausting self-blame to clear, logical insights.
              </BodyText>
            </View>

            <View style={styles.listItem}>
              <View style={styles.dot} />
              <BodyText style={styles.listItemOverride}>
                Step onto a predictable path where your skin finally feels understood.
              </BodyText>
            </View>
          </View>
        </View>

        {/* Bottom CTA Button */}
        <View style={styles.bottomBar}>
          <NativeWide3DButton
            label="Yes, Lets decode it!"
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
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(16),
  },
  imageContainer: {
    flex: 1.5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(14),
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
  listContainer: {
    width: '100%',
    gap: verticalScale(14),
    paddingHorizontal: scale(8),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(14),
  },
  dot: {
    width: moderateScale(13, 0.3),
    height: moderateScale(13, 0.3),
    borderRadius: moderateScale(6.5, 0.3),
    backgroundColor: '#937abd',
    borderWidth: 2,
    borderColor: '#111111',
    marginTop: verticalScale(4),
  },
  listItemOverride: {
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'left',
  },
  bottomBar: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(35),
    height: verticalScale(75),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
