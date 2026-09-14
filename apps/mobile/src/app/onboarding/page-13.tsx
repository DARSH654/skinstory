import React, { useCallback } from 'react';
import {
  StyleSheet, View, Image,
  useWindowDimensions
} from 'react-native';
import { Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import NativeWide3DButton from '@/components/page7/NativeWide3DButton';

// Branding colors defined at module scope (Strict Rule 11)
const primaryColor = '#937abd';
const shadowColor = '#735b9c';
const secondaryColor = '#d6cbe8';

export default function OnboardingPage13() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { navigate } = useNavigationGuard();

  const handleNext = useCallback(() => {
    navigate('/onboarding/page-14');
  }, [navigate]);

  return (
    <LinearGradient
      colors={['#ffffff', '#fcfafc', '#f5f0fa', '#ede5f5']}
      locations={[0.0, 0.4, 0.75, 1.0]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Top Image Section with flex: 1 */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/shield_lock.webp')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Title & Subtitle Below Image */}
          <View style={styles.textContainer}>
            <View style={styles.titleFlow}>
              <Text style={styles.titleText} maxFontSizeMultiplier={1.2}>Built with </Text>
              <View style={styles.highlightWrapper}>
                <View style={[styles.highlightStripe, { backgroundColor: secondaryColor }]} />
                <Text style={styles.titleText} maxFontSizeMultiplier={1.2}>absolute privacy.</Text>
              </View>
            </View>
            <Text style={styles.subtitleText} maxFontSizeMultiplier={1.2}>Encrypted. Never sold. Delete anytime.</Text>

            {/* Three Full-Width Pill Cards */}
            <View style={styles.cardsContainer}>
              <View style={styles.cardItem}>
                <View style={styles.dot} />
                <View style={styles.cardTextRow}>
                  <Text style={styles.cardText} maxFontSizeMultiplier={1.2}>Never sold to </Text>
                  <View style={styles.inlineHighlight}>
                    <Text style={styles.cardText} maxFontSizeMultiplier={1.2}>third-party brokers</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardItem}>
                <View style={styles.dot} />
                <View style={styles.cardTextRow}>
                  <Text style={styles.cardText} maxFontSizeMultiplier={1.2}>Never used to train any </Text>
                  <View style={styles.inlineHighlight}>
                    <Text style={styles.cardText} maxFontSizeMultiplier={1.2}>AI model</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardItem}>
                <View style={styles.dot} />
                <View style={styles.cardTextRow}>
                  <Text style={styles.cardText} maxFontSizeMultiplier={1.2}>Never used for </Text>
                  <View style={styles.inlineHighlight}>
                    <Text style={styles.cardText} maxFontSizeMultiplier={1.2}>Identity Profiling</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom CTA Button */}
        <View style={styles.bottomBar}>
          <NativeWide3DButton
            label="Scan My Skin"
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(10),
  },
  imageContainer: {
    flex: 1.6,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  titleFlow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
  },
  titleText: {
    fontSize: moderateScale(24, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#1a1a1a',
    lineHeight: moderateScale(30, 0.3),
    textAlign: 'center',
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'flex-end',
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
  subtitleText: {
    fontSize: moderateScale(16, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#666666',
    textAlign: 'center',
    marginBottom: verticalScale(14),
  },
  cardsContainer: {
    width: '100%',
    gap: verticalScale(12),
    marginTop: verticalScale(4),
  },
  cardItem: {
    width: '100%',
    backgroundColor: '#f7f6fa',
    borderRadius: moderateScale(30, 0.3),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(18),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#111111',
    gap: scale(12),
  },
  dot: {
    width: moderateScale(13, 0.3),
    height: moderateScale(13, 0.3),
    borderRadius: moderateScale(999, 0.3),
    backgroundColor: '#937abd',
    borderWidth: 2,
    borderColor: '#111111',
  },
  cardTextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    flex: 1,
  },
  cardText: {
    fontSize: moderateScale(16, 0.3),
    fontFamily: 'Montserrat_700Bold',
    color: '#1a1a1a',
    textAlign: 'left',
  },
  inlineHighlight: {
    backgroundColor: '#d6cbe8',
    borderRadius: moderateScale(5, 0.3),
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(1),
    alignSelf: 'flex-start',
  },
  bottomBar: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(35),
    height: verticalScale(75),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
