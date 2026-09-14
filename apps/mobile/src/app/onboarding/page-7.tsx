import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, BackHandler } from 'react-native';
import { Text, TitleText } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useOnboardingStore } from '@/store/onboardingStore';
import OnboardingProgressBar from '@/components/OnboardingProgressBar';
import HighlightPhrase from '@/components/HighlightPhrase';
import FaceZoneMap from '@/components/page7/FaceZoneMap';
import Native3DButton from '@/components/page7/Native3DButton';
import ZoneFollowUpView from '@/components/page7/ZoneFollowUpView';
import { ZONE_FOLLOW_UP } from '@/components/page7/zoneData';

// Branding colors defined at module scope
const primaryColor = '#937abd';
const shadowColor = '#735b9c';
const secondaryColor = '#d6cbe8';

export default function OnboardingPage7() {
  const { navigate } = useNavigationGuard();
  const name = useOnboardingStore(state => state.name);
  const { setAnswer, answers } = useOnboardingStore.getState();
  const [selectedZones, setSelectedZones] = useState<string[]>(answers['q3_skinZones'] || []);
  const [activeFollowUpZone, setActiveFollowUpZone] = useState<string | null>(null);
  const [zoneConcerns, setZoneConcerns] = useState<Record<string, string[]>>(answers['q3_skinZoneConcerns'] || {});

  const enabled = selectedZones.length > 0;

  // Handle hardware / system back button on Android
  useEffect(() => {
    const backAction = () => {
      if (activeFollowUpZone) {
        const currentConcerns = zoneConcerns[activeFollowUpZone] || [];
        if (currentConcerns.length === 0) {
          setSelectedZones((prev) => prev.filter((z) => z !== activeFollowUpZone));
        }
        setActiveFollowUpZone(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeFollowUpZone, zoneConcerns]);

  const handleSelectZone = useCallback((id: string) => {
    setActiveFollowUpZone(id);
  }, []);

  const handleToggleConcernOption = useCallback((zoneId: string, option: string) => {
    setZoneConcerns((prev) => {
      const current = prev[zoneId] || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [zoneId]: next };
    });
  }, []);

  const handleConfirmFollowUp = useCallback(() => {
    if (!activeFollowUpZone) return;

    const currentConcerns = zoneConcerns[activeFollowUpZone] || [];
    if (currentConcerns.length > 0) {
      setSelectedZones((prev) => (prev.includes(activeFollowUpZone) ? prev : [...prev, activeFollowUpZone]));
    } else {
      setSelectedZones((prev) => prev.filter((z) => z !== activeFollowUpZone));
    }

    setActiveFollowUpZone(null);
  }, [activeFollowUpZone, zoneConcerns]);

  const handleNext = useCallback(() => {
    if (!enabled) return;

    setAnswer('q3_skinZones', selectedZones);
    setAnswer('q3_skinZoneConcerns', zoneConcerns);
    navigate('/onboarding/page-8');
  }, [enabled, selectedZones, zoneConcerns, navigate, setAnswer]);

  const currentFollowUp = activeFollowUpZone ? ZONE_FOLLOW_UP[activeFollowUpZone] : null;
  const currentSelectedOptions = activeFollowUpZone ? (zoneConcerns[activeFollowUpZone] || []) : [];

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgressBar step={3} total={7} />

      <View style={styles.titleContainer}>
        <TitleText style={styles.titleOverride}>Ok so where does your skin</TitleText>
        <View style={styles.titleLine2}>
          <HighlightPhrase
            words={['act ', 'up']}
            secondaryColor={secondaryColor}
            textStyle={styles.titleOverride}
          />
          <TitleText style={styles.titleOverride}> the most?</TitleText>
        </View>
      </View>

      <FaceZoneMap
        selectedZones={selectedZones}
        onSelectZone={handleSelectZone}
        primaryColor={primaryColor}
        shadowColor={shadowColor}
      />

      <View style={styles.bottomBar}>
        <Native3DButton
          enabled={enabled}
          onPress={handleNext}
          primaryColor={primaryColor}
          shadowColor={shadowColor}
        />
      </View>

      {activeFollowUpZone && currentFollowUp && (
        <ZoneFollowUpView
          followUp={currentFollowUp}
          selectedOptions={currentSelectedOptions}
          onToggleOption={(opt) => handleToggleConcernOption(activeFollowUpZone, opt)}
          onConfirm={handleConfirmFollowUp}
          primaryColor={primaryColor}
          shadowColor={shadowColor}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(6),
    marginBottom: verticalScale(8),
    alignItems: 'center',
  },
  titleLine2: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
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
    borderRadius: scale(2),
    zIndex: -1,
  },
  titleOverride: {
    color: '#111111',
    textAlign: 'center',
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
