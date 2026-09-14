import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TitleText, ButtonText } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useOnboardingStore } from '@/store/onboardingStore';
import OnboardingProgressBar from '@/components/OnboardingProgressBar';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import HighlightPhrase from '@/components/HighlightPhrase';
import Native3DButton from '@/components/page7/Native3DButton';

const OPTIONS = [
  'Under 5 hrs (Exhausted)',
  '5 – 6 hrs (Scraping by)',
  '6 – 7 hrs (Light rest)',
  '7 – 8 hrs (Good rest)',
  '8 – 9 hrs (Well rested)',
  '9 – 10 hrs (Deep recovery)',
  '10+ hrs (Max recharge)',
];

// Branding colors defined at module scope (Strict Rule 11)
const primaryColor = '#937abd';
const shadowColor = '#735b9c';
const secondaryColor = '#d6cbe8';

export default function OnboardingPage9() {
  const { navigate } = useNavigationGuard();
  const { setAnswer, answers } = useOnboardingStore.getState();
  const [selected, setSelected] = useState<string | null>(answers['q5_sleepHours'] || answers['ambient_level'] || null);

  const enabled = selected !== null;

  const handleSelect = (item: string) => {
    setSelected(prev => (prev === item ? null : item));
  };

  const handleNext = () => {
    if (selected) {
      setAnswer('ambient_level', selected);
      setAnswer('q5_sleepHours', selected);
      navigate('/onboarding/page-10');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgressBar step={4} total={7} />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <View style={styles.titleFlow}>
            <TitleText style={styles.titleOverride}>And </TitleText>
            <TitleText style={styles.titleOverride}>how </TitleText>
            <TitleText style={styles.titleOverride}>many </TitleText>
            <TitleText style={styles.titleOverride}>hours </TitleText>
            <TitleText style={styles.titleOverride}>of </TitleText>
            <HighlightPhrase
              words={['cellular ', 'repair ']}
              secondaryColor={secondaryColor}
              textStyle={styles.titleOverride}
            />
            <TitleText style={styles.titleOverride}>do </TitleText>
            <TitleText style={styles.titleOverride}>you </TitleText>
            <TitleText style={styles.titleOverride}>get?</TitleText>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.list}>
            {OPTIONS.map((item, index) => {
              const isSelected = selected === item;
              const currentBorderColor = isSelected ? primaryColor : '#111111';
              const currentShadowColor = isSelected ? shadowColor : '#111111';

              return (
                <Animated.View
                  key={item}
                  entering={FadeInDown.duration(320).delay(index * 50)}
                  style={styles.option3DContainer}
                >
                  <Pressable
                    style={styles.pressableArea}
                    onPress={() => handleSelect(item)}
                  >
                    {({ pressed }) => (
                      <>
                        <View style={[styles.optionShadow, { backgroundColor: currentShadowColor }]} />
                        <View
                          style={[
                            styles.optionMid,
                            {
                              backgroundColor: 'transparent',
                              borderColor: currentShadowColor,
                              borderWidth: 2,
                              top: pressed ? moderateScale(3.5, 0.3) : moderateScale(2, 0.3),
                              left: pressed ? moderateScale(3.5, 0.3) : moderateScale(2, 0.3),
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.optionTop,
                            {
                              backgroundColor: isSelected ? '#f0ebf8' : '#ffffff',
                              borderColor: currentBorderColor,
                              borderWidth: 3.5,
                              top: pressed ? moderateScale(4, 0.3) : 0,
                              left: pressed ? moderateScale(4, 0.3) : 0,
                            },
                          ]}
                        >
                          <View style={styles.row}>
                            <ButtonText style={styles.pillText} numberOfLines={1}>
                              {item}
                            </ButtonText>
                            {isSelected && (
                              <View style={styles.checkWrapper}>
                                <Check
                                  size={moderateScale(20, 0.3)}
                                  color="#111111"
                                  strokeWidth={4}
                                />
                              </View>
                            )}
                          </View>
                        </View>
                      </>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.bottomBar}>
        <Native3DButton
          enabled={enabled}
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
    paddingLeft: scale(38),
    paddingRight: scale(20),
    paddingTop: verticalScale(4),
    marginBottom: verticalScale(16),
    width: '100%',
  },
  titleFlow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: moderateScale(2, 0.3),
    left: 0,
    right: 0,
    height: moderateScale(10, 0.3),
    backgroundColor: secondaryColor,
    borderRadius: scale(2),
    zIndex: -1,
  },
  titleOverride: {
    color: '#111111',
    textAlign: 'left',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  listContent: {
    paddingBottom: verticalScale(15),
  },
  list: {
    width: '100%',
  },
  option3DContainer: {
    width: '100%',
    height: moderateScale(56, 0.3),
    position: 'relative',
    marginBottom: verticalScale(18),
  },
  pressableArea: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  optionShadow: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(28, 0.3),
    position: 'absolute',
    top: moderateScale(4, 0.3),
    left: moderateScale(4, 0.3),
  },
  optionMid: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(28, 0.3),
    position: 'absolute',
    top: moderateScale(2, 0.3),
    left: moderateScale(2, 0.3),
  },
  optionTop: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(28, 0.3),
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  pillText: {
    color: '#111111',
    width: '100%',
    paddingRight: moderateScale(28, 0.3),
  },
  checkWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(35),
    height: verticalScale(75),
  },
});

