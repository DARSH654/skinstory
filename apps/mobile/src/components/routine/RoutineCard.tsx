import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  Platform,
  DimensionValue,
} from 'react-native';
import { Text } from '@/components/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { Copy, Pencil, Trash2 } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '@/constants/theme';

export function AvatarPlaceholder({ isDark }: { isDark: boolean }) {
  const bg = isDark ? '#27272a' : '#f0eef5';
  const personColor = isDark ? '#52525b' : '#94a3b8';

  return (
    <View style={{ width: 22, height: 22, borderRadius: 11, overflow: 'hidden' }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="50" fill={bg} />
        <Circle cx="50" cy="41" r="18" fill={personColor} />
        <Path
          d="M 5 105 C 5 72, 24 67, 50 67 C 76 67, 95 72, 95 105 Z"
          fill={personColor}
        />
      </Svg>
    </View>
  );
}

export const getRoutineImage = (routine: any) => {
  if (routine?.coverImage) return { uri: routine.coverImage };
  if (routine?.image) return { uri: routine.image };
  if (routine?.productImage) return { uri: routine.productImage };
  if (routine?.stepData) {
    for (const key of Object.keys(routine.stepData)) {
      if (routine.stepData[key]?.productImage) {
        return { uri: routine.stepData[key].productImage };
      }
    }
  }
  return require('../../../assets/images/routine_placeholder.jpg');
};

export const getRoutineSubtitle = (routine: any) => {
  if (routine?.description && routine.description.trim()) return routine.description.trim();
  if (routine?.subtitle && routine.subtitle.trim()) return routine.subtitle.trim();
  if (routine?.stepData) {
    for (const key of Object.keys(routine.stepData)) {
      const step = routine.stepData[key];
      if (step?.actionDesc && step.actionDesc.trim()) return step.actionDesc.trim();
      if (step?.productDesc && step.productDesc.trim()) return step.productDesc.trim();
    }
  }
  return "My go-to sequence for deeply nourishing dry winter skin. Focuses on layering...";
};

interface RoutineCardProps {
  routine: any;
  isDark: boolean;
  userProfile?: { name?: string; avatarUri?: string | null } | null;
  copiedId?: string | null;
  onCopyCode?: (code: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
  onStartRoutine?: () => void;
  cardWidth?: DimensionValue;
}

export default function RoutineCard({
  routine,
  isDark,
  userProfile,
  copiedId,
  onCopyCode,
  onEdit,
  onDelete,
  onPress,
  onStartRoutine,
  cardWidth,
}: RoutineCardProps) {
  const stepsCount = routine?.stepsCount || (routine?.stepData ? Object.keys(routine.stepData).length : 1);
  const routineCode = routine?.id?.slice(-6).toUpperCase() || '429172';
  const routineImage = getRoutineImage(routine);
  const routineSubtitle = getRoutineSubtitle(routine);

  let rawHandle = 'noname';
  if (userProfile?.name && userProfile.name.trim().length > 0) {
    rawHandle = userProfile.name.trim().toLowerCase().replace(/\s+/g, '_');
  } else if (routine?.author && routine.author.trim().length > 0) {
    rawHandle = routine.author.trim().toLowerCase().replace(/\s+/g, '_');
  }

  const displayHandle = rawHandle.length > 15
    ? rawHandle.slice(0, 15) + '...'
    : rawHandle;

  const authorHandle = `@${displayHandle}`;

  const avatarSource = userProfile?.avatarUri
    ? { uri: userProfile.avatarUri }
    : (routine?.authorAvatar ? { uri: routine.authorAvatar } : null);

  return (
    <Pressable
      style={[styles.cardOuter, cardWidth ? { width: cardWidth } : null]}
      onPress={onPress}
    >
      <View style={styles.cardInnerContainer}>
        <ImageBackground
          source={routineImage}
          style={styles.cardImageBg}
          imageStyle={styles.cardImageStyle}
        >
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.25)', 'rgba(0, 0, 0, 0.45)', 'rgba(15, 18, 20, 0.92)']}
            locations={[0, 0.45, 1]}
            style={styles.cardGradientOverlay}
          >
            {/* Top Row: Author Pill + Start Routine Button */}
            <View style={styles.cardTopRow}>
              <View style={styles.authorPill}>
                {avatarSource ? (
                  <Image source={avatarSource} style={styles.authorAvatar} />
                ) : (
                  <AvatarPlaceholder isDark={isDark} />
                )}
                <Text style={styles.authorNameText} numberOfLines={1}>
                  {authorHandle}
                </Text>
              </View>

              <Pressable
                style={styles.startRoutineBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  onStartRoutine?.();
                }}
              >
                <Text style={styles.startRoutineBtnText}>Start Routine</Text>
              </Pressable>
            </View>

            {/* Middle Section: Title in 1 Line + Subtitle in Light Purple Backdrop */}
            <View style={styles.cardMiddleSection}>
              <Text style={styles.cardRoutineTitle} numberOfLines={1} ellipsizeMode="tail">
                {routine?.title}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={3}>
                {routineSubtitle}
              </Text>
            </View>

            {/* Separator Line */}
            <View style={styles.cardDividerLine} />

            {/* Bottom Row: Routine Code Pill + Step Pill beside it + Bare Action Icons */}
            <View style={styles.cardBottomRow}>
              <View style={styles.cardBottomLeftPills}>
                <Pressable
                  style={styles.routineCodePillBottom}
                  onPress={(e) => {
                    e.stopPropagation();
                    onCopyCode?.(routineCode);
                  }}
                >
                  <Copy size={13} color={Colors.light.primary} strokeWidth={2.4} />
                  <Text style={styles.routineCodeBottomText}>
                    {copiedId === routineCode ? 'COPIED!' : `ROUTINE: ${routineCode}`}
                  </Text>
                </Pressable>

                <View style={styles.stepsPillBottom}>
                  <Text style={styles.stepsPillBottomText}>
                    {stepsCount} {stepsCount === 1 ? 'STEP' : 'STEPS'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActionGroup}>
                {onEdit && (
                  <Pressable
                    style={styles.cardBareActionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    hitSlop={12}
                  >
                    <Pencil size={20} color="#ffffff" strokeWidth={2.4} />
                  </Pressable>
                )}

                {onDelete && (
                  <Pressable
                    style={styles.cardBareActionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    hitSlop={12}
                  >
                    <Trash2 size={20} color="#ffffff" strokeWidth={2.4} />
                  </Pressable>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 22,
    marginBottom: 16,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  cardInnerContainer: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  cardImageBg: {
    width: '100%',
    minHeight: 280,
  },
  cardImageStyle: {
    borderRadius: 22,
    resizeMode: 'cover',
  },
  cardGradientOverlay: {
    padding: 16,
    minHeight: 280,
    justifyContent: 'space-between',
    borderRadius: 22,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    paddingRight: 12,
    borderRadius: 20,
    gap: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  authorNameText: {
    color: '#2d3748',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
  },
  startRoutineBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 3,
  },
  startRoutineBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'Outfit_700Bold',
  },
  cardMiddleSection: {
    marginTop: 'auto',
    marginBottom: 4,
    backgroundColor: 'rgba(243, 232, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(243, 232, 255, 0.25)',
  },
  cardRoutineTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.94)',
    fontFamily: 'Outfit_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardDividerLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginTop: 6,
    marginBottom: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBottomLeftPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routineCodePillBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  routineCodeBottomText: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: 'Outfit_700Bold',
  },
  stepsPillBottom: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepsPillBottomText: {
    color: '#111111',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: 'Outfit_700Bold',
  },
  cardActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardBareActionBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
