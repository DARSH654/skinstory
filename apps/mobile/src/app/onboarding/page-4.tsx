import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Pressable, TextInput,
  KeyboardAvoidingView, Platform, useWindowDimensions, ScrollView
} from 'react-native';
import { Text, TitleText, CaptionText } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useOnboardingStore } from '@/store/onboardingStore';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import NativeWide3DButton from '@/components/page7/NativeWide3DButton';

const PAGE = '[Page4]';

// Branding colors defined at module scope (Strict Rule 11)
const primaryColor = '#937abd';
const secondaryColor = '#d6cbe8';
const shadowColor = '#735b9c';

export default function OnboardingPage4() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const router = useRouter();
  const { navigate } = useNavigationGuard();

  // Read store actions without hook subscription to eliminate off-screen background re-renders
  const { setName } = useOnboardingStore.getState();
  const storedName = useOnboardingStore.getState().name;
  const [localName, setLocalName] = useState(storedName);

  const enabled = localName.trim().length > 0;

  const handleTextChange = useCallback((text: string) => {
    const lettersOnly = text.replace(/[^a-zA-Z\s]/g, '').slice(0, 15);
    setLocalName(lettersOnly);
  }, []);

  const handleContinue = useCallback(() => {
    if (enabled) {
      setName(localName);
      navigate('/onboarding/page-5');
    }
  }, [enabled, localName, navigate, setName]);

  return (
    <LinearGradient
      colors={['#ffffff', '#fcfafc', '#f5f0fa', '#ede5f5']}
      locations={[0.0, 0.4, 0.75, 1.0]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backBtnPressed,
            ]}
            onPress={() => {
              console.log(`${PAGE} ← Back button pressed ts=${Date.now()}`);
              router.back();
            }}
            hitSlop={scale(6)}
          >
            <ArrowLeft
              size={moderateScale(20, 0.3)}
              color="#111111"
              strokeWidth={2.8}
            />
          </Pressable>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Small label */}
              <Text style={styles.label}>before everything else</Text>

              {/* Title — single line, highlight only on 'call' */}
              <View style={styles.titleContainer}>
                <View style={styles.row}>
                  <TitleText style={styles.titleOverride}>what should we </TitleText>
                  <View style={styles.highlightWrapper}>
                    <View style={[styles.highlightStripe, { backgroundColor: secondaryColor }]} />
                    <TitleText style={styles.titleOverride}>call</TitleText>
                  </View>
                  <TitleText style={styles.titleOverride}> you?</TitleText>
                </View>
              </View>

              {/* 3D Text input container */}
              <View style={[styles.input3DContainer, { width: SCREEN_WIDTH - scale(48) }]}>
                <View style={[styles.inputShadow, {
                  backgroundColor: shadowColor,
                  top: moderateScale(4, 0.3),
                  left: moderateScale(4, 0.3),
                }]} />
                <View style={[styles.inputMid, {
                  backgroundColor: 'transparent',
                  borderColor: shadowColor,
                  borderWidth: 2,
                  top: moderateScale(2, 0.3),
                  left: moderateScale(2, 0.3),
                }]} />
                <View style={[styles.inputTop, {
                  backgroundColor: '#ffffff',
                  borderColor: primaryColor,
                  borderWidth: 3.5,
                  top: 0,
                  left: 0,
                }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#b0b0b0"
                    value={localName}
                    onChangeText={handleTextChange}
                    maxLength={15}
                    autoFocus
                    autoCorrect={false}
                    maxFontSizeMultiplier={1.2}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Continue button */}
          <View style={styles.bottomBar}>
            <NativeWide3DButton
              label="continue"
              onPress={handleContinue}
              enabled={enabled}
              primaryColor={primaryColor}
              shadowColor={shadowColor}
              width={SCREEN_WIDTH - scale(40)}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(5),
  },
  backBtn: {
    width: moderateScale(38, 0.3),
    height: moderateScale(38, 0.3),
    borderRadius: moderateScale(19, 0.3),
    backgroundColor: '#efefef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    backgroundColor: '#e0e0e0',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: 'center',
    paddingBottom: verticalScale(60),
  },
  label: {
    fontSize: moderateScale(13, 0.3),
    fontFamily: 'Montserrat_700Bold',
    color: '#888888',
    marginBottom: verticalScale(1),
    textAlign: 'left',
  },
  titleContainer: {
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: verticalScale(10),
  },
  titleOverride: {
    fontSize: moderateScale(25, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#111111',
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: moderateScale(3, 0.3),
    left: scale(-2),
    right: scale(-2),
    height: moderateScale(11, 0.3),
    borderRadius: scale(2),
    zIndex: -1,
  },
  input3DContainer: {
    height: moderateScale(48, 0.3),
    position: 'relative',
  },
  inputShadow: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(24, 0.3),
    position: 'absolute',
  },
  inputMid: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(24, 0.3),
    position: 'absolute',
  },
  inputTop: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(24, 0.3),
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  input: {
    fontSize: moderateScale(19, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
    color: '#1a1a1a',
    paddingVertical: 0,
    paddingTop: verticalScale(1),
    paddingBottom: verticalScale(2),
    textAlignVertical: 'center',
  },
  bottomBar: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(35),
    alignItems: 'center',
  },
});
