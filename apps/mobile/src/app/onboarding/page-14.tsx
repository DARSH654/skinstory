import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Pressable,
  ActivityIndicator, Animated, Image, Alert, useWindowDimensions
} from 'react-native';
import { Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import NativeWide3DButton from '@/components/page7/NativeWide3DButton';

// Branding colors defined at module scope (Strict Rule 11)
const primaryColor = '#937abd';
const shadowColor = '#735b9c';

export default function OnboardingPage14() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { navigate } = useNavigationGuard();
  
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'weekly'>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<number>(0); 

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const showGooglePlaySheet = () => {
    setIsPurchasing(true);
    setPaymentStep(1);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const hideGooglePlaySheet = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsPurchasing(false);
      setPaymentStep(0);
    });
  };

  const handlePurchaseComplete = () => {
    setPaymentStep(2);
    setTimeout(() => {
      hideGooglePlaySheet();
      navigate('/onboarding/page-15');
    }, 1500);
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#fcfafc', '#f5f0fa', '#ede5f5']}
      locations={[0.0, 0.4, 0.75, 1.0]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Header & Illustration in Flex Container */}
        <View style={styles.topSection}>
          <View style={styles.topHeader}>
            <Text style={styles.mainTitle} maxFontSizeMultiplier={1.2}>Unlock Your SkinStory</Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.2}>Get personalized daily insights and scan analysis</Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/envelope_heart.webp')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Persistent Bottom Payment CTA Container with Plans & Commitment */}
        <View style={styles.bottomBar}>
          {/* Subscription Plan Options */}
          <View style={styles.plansContainer}>
            {/* Plan 1: Yearly */}
            <Pressable
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && styles.selectedPlanCard,
                { borderColor: selectedPlan === 'yearly' ? primaryColor : '#e1e1e6' }
              ]}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View style={styles.badgeWrapper}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText} maxFontSizeMultiplier={1.2}>70% OFF</Text>
                </View>
              </View>

              <View style={styles.planRadioRow}>
                <View style={styles.planDetails}>
                  <Text style={styles.planTitleText} maxFontSizeMultiplier={1.2}>Annual Plan</Text>
                  <Text style={styles.planPriceOriginal} maxFontSizeMultiplier={1.2}>$69.99</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.planMainPrice} maxFontSizeMultiplier={1.2}>$0.99</Text>
                  <Text style={styles.planPriceSub} maxFontSizeMultiplier={1.2}>/ week</Text>
                </View>
              </View>
            </Pressable>

            {/* Plan 2: Weekly */}
            <Pressable
              style={[
                styles.planCard,
                selectedPlan === 'weekly' && styles.selectedPlanCard,
                { borderColor: selectedPlan === 'weekly' ? primaryColor : '#e1e1e6' }
              ]}
              onPress={() => setSelectedPlan('weekly')}
            >
              <View style={styles.planRadioRow}>
                <View style={styles.planDetails}>
                  <Text style={styles.planTitleText} maxFontSizeMultiplier={1.2}>Weekly Plan</Text>
                  <Text style={styles.planPriceOriginalWeekly} maxFontSizeMultiplier={1.2}>$9.99</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.planMainPrice} maxFontSizeMultiplier={1.2}>$9.99</Text>
                  <Text style={styles.planPriceSub} maxFontSizeMultiplier={1.2}>/ week</Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Commitment Badge Directly Above Continue Button */}
          <View style={styles.commitmentRow}>
            <Check size={moderateScale(16, 0.3)} color="#666666" strokeWidth={3} />
            <Text style={styles.commitmentText} maxFontSizeMultiplier={1.2}>No commitment, cancel anytime</Text>
          </View>

          <NativeWide3DButton
            label="Continue"
            onPress={showGooglePlaySheet}
            primaryColor={primaryColor}
            shadowColor={shadowColor}
            width={SCREEN_WIDTH - scale(40)}
            enabled={true}
          />

          {/* Terms of Service and Privacy Policy Links */}
          <View style={styles.legalLinksRow}>
            <Pressable onPress={() => Alert.alert('Terms of Service', 'Terms and Conditions details here.')}>
              <Text style={styles.legalLinkText} maxFontSizeMultiplier={1.2}>Terms of Service</Text>
            </Pressable>
            <Text style={styles.legalDot}>•</Text>
            <Pressable onPress={() => Alert.alert('Privacy Policy', 'Privacy Policy details here.')}>
              <Text style={styles.legalLinkText} maxFontSizeMultiplier={1.2}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>

        {/* Simulated Google Play Slide-Over sheet */}
        {isPurchasing && (
          <View style={styles.bottomSheetOverlay}>
            <Pressable style={styles.dismissOverlay} onPress={hideGooglePlaySheet} />
            
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.playHeader}>
                <Image 
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg' }} 
                  style={styles.playLogo}
                  defaultSource={require('../../../assets/images/favicon.png')}
                />
                <Text style={styles.playHeaderText} maxFontSizeMultiplier={1.2}>Google Play</Text>
              </View>

              {paymentStep === 1 ? (
                <>
                  <View style={styles.appRow}>
                    <Image 
                      source={require('../../../assets/images/favicon.png')} 
                      style={styles.appIcon} 
                    />
                    <View style={styles.appInfo}>
                      <Text style={styles.appName} maxFontSizeMultiplier={1.2}>SkinStory Premium</Text>
                      <Text style={styles.appDeveloper} maxFontSizeMultiplier={1.2}>GlamUp Inc.</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel} maxFontSizeMultiplier={1.2}>
                      {selectedPlan === 'yearly' ? 'Annual Plan (1 Year)' : 'Weekly Plan (1 Week)'}
                    </Text>
                    <Text style={styles.priceVal} maxFontSizeMultiplier={1.2}>
                      {selectedPlan === 'yearly' ? '$139.99' : '$9.99'}
                    </Text>
                  </View>

                  <View style={styles.paymentMethodRow}>
                    <View style={styles.visaIconContainer}>
                      <Text style={styles.visaText}>VISA</Text>
                    </View>
                    <Text style={styles.paymentMethodText} maxFontSizeMultiplier={1.2}>Visa •••• 9876</Text>
                  </View>

                  <View style={styles.slideContainer}>
                    <Pressable style={styles.buyButton} onPress={handlePurchaseComplete}>
                      <Text style={styles.buyButtonText} maxFontSizeMultiplier={1.2}>1-TAP BUY</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <ActivityIndicator size="large" color="#4caf50" />
                  <Text style={styles.successText} maxFontSizeMultiplier={1.2}>Processing secure payment...</Text>
                </View>
              )}
            </Animated.View>
          </View>
        )}
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
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(10),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topHeader: {
    alignItems: 'center',
    marginVertical: verticalScale(6),
  },
  mainTitle: {
    fontSize: moderateScale(28, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#111111',
    textAlign: 'center',
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(15, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: scale(16),
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
  commitmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    marginTop: verticalScale(7),
    marginBottom: verticalScale(7),
  },
  commitmentText: {
    fontSize: moderateScale(14, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#666666',
  },
  plansContainer: {
    gap: verticalScale(10),
    marginTop: verticalScale(6),
    marginBottom: 0,
    width: '100%',
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderRadius: moderateScale(16, 0.3),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    position: 'relative',
  },
  selectedPlanCard: {
    backgroundColor: '#faf8fe',
  },
  badgeWrapper: {
    position: 'absolute',
    top: verticalScale(-12),
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    backgroundColor: '#937abd',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(10, 0.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadgeText: {
    color: '#ffffff',
    fontSize: moderateScale(12, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  planRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  planTitleText: {
    fontSize: moderateScale(17, 0.3),
    fontFamily: 'Montserrat_700Bold',
    color: '#111111',
    marginBottom: verticalScale(2),
  },
  planPriceOriginal: {
    fontSize: moderateScale(14, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#999999',
  },
  planPriceOriginalWeekly: {
    fontSize: moderateScale(14, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#999999',
  },
  priceColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  planMainPrice: {
    fontSize: moderateScale(20, 0.3),
    fontFamily: 'Montserrat_700Bold',
    color: '#111111',
  },
  planPriceSub: {
    fontSize: moderateScale(12, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#666666',
    marginTop: verticalScale(2),
  },
  bottomBar: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(6),
    alignItems: 'center',
    width: '100%',
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    marginTop: verticalScale(8),
    width: '100%',
  },
  legalLinkText: {
    fontSize: moderateScale(12, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#555555',
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: moderateScale(16, 0.3),
    color: '#555555',
    lineHeight: moderateScale(16, 0.3),
    textAlignVertical: 'center',
    includeFontPadding: false,
    marginTop: verticalScale(-2),
  },
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: moderateScale(24, 0.3),
    borderTopRightRadius: moderateScale(24, 0.3),
    padding: scale(24),
    paddingBottom: verticalScale(40),
  },
  playHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  playLogo: {
    width: scale(24),
    height: scale(24),
    marginRight: scale(10),
  },
  playHeaderText: {
    fontSize: moderateScale(18, 0.3),
    fontFamily: 'Montserrat_700Bold',
    color: '#5f6368',
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  appIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(10, 0.3),
    marginRight: scale(16),
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: moderateScale(16, 0.3),
    fontFamily: 'Montserrat_700Bold',
    color: '#202124',
  },
  appDeveloper: {
    fontSize: moderateScale(14, 0.3),
    fontFamily: 'Montserrat_500Medium',
    color: '#5f6368',
  },
  divider: {
    height: 1,
    backgroundColor: '#e8eaed',
    marginBottom: verticalScale(20),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  priceLabel: {
    fontSize: moderateScale(15, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#202124',
  },
  priceVal: {
    fontSize: moderateScale(16, 0.3),
    fontFamily: 'Montserrat_700Bold',
    color: '#202124',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: scale(12),
    borderRadius: moderateScale(12, 0.3),
    marginBottom: verticalScale(24),
  },
  visaIconContainer: {
    backgroundColor: '#1a1f71',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4, 0.3),
    marginRight: scale(12),
  },
  visaText: {
    color: '#ffffff',
    fontSize: moderateScale(10, 0.3),
    fontWeight: 'bold',
  },
  paymentMethodText: {
    fontSize: moderateScale(14, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    color: '#202124',
  },
  slideContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buyButton: {
    width: '100%',
    backgroundColor: '#00a173',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(30, 0.3),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00a173',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(16, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
    letterSpacing: 0.8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  successText: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(16, 0.3),
    fontFamily: 'Montserrat_700Bold',
    color: '#202124',
  },
});
