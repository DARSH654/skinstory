import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Dimensions,
  Modal,
  BackHandler
} from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  ChevronLeft, 
  ToggleLeft, 
  SlidersHorizontal, 
  BarChart2, 
  ListFilter, 
  CheckSquare, 
  FileText, 
  Check,
  ArrowRight,
  X
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { AddJournalQuestionDetailsSheet, AddJournalQuestionDetailsSheetRef } from '@/components/AddJournalQuestionDetailsSheet';

export type QuestionDataType = 
  | 'multi_select'
  | 'boolean'
  | 'single_choice'
  | 'text'
  | 'scale'
  | 'numeric';

export interface DataTypeOption {
  type: QuestionDataType;
  title: string;
  subtitle: string;
  icon: any;
  badge: string;
  compactUseCases: string[];
  fullUseCases: string[];
}

export const DATA_TYPES: DataTypeOption[] = [
  {
    type: 'multi_select',
    title: 'Multi-Select',
    subtitle: 'Check all applicable products, symptoms, or triggers',
    icon: CheckSquare,
    badge: 'Multi-check',
    compactUseCases: [
      'Retinoids & AHAs',
      'Redness & irritation',
      'Acne & pustules',
      'Barrier creams',
      'Excess oiliness',
      'Dietary triggers',
    ],
    fullUseCases: [
      'Active skincare ingredients applied today',
      'Skin irritation symptoms noticed',
      'Types of breakouts present',
      'Skincare product layers used',
      'Dietary triggers consumed',
      'Environmental stressors encountered',
      'Makeup products worn',
    ],
  },
  {
    type: 'boolean',
    title: 'Yes / No',
    subtitle: 'Binary daily habit & compliance tracking',
    icon: ToggleLeft,
    badge: 'Habit',
    compactUseCases: [
      'Applied sunscreen',
      'Double cleansed',
      'Used retinoid',
      'Exfoliated skin',
      'Changed pillow',
      'Drank 2L water',
    ],
    fullUseCases: [
      'Applied sunscreen before going out',
      'Completed double cleansing routine',
      'Used prescription or active treatment',
      'Exfoliated with chemical exfoliant',
      'Changed to a fresh pillowcase',
      'Hit daily water intake goal',
      'Avoided touching or picking skin',
      'Completed full skincare routine',
    ],
  },
  {
    type: 'single_choice',
    title: 'Single Choice',
    subtitle: 'Choose exactly one mutually exclusive category',
    icon: ListFilter,
    badge: 'Category',
    compactUseCases: [
      'Barrier status',
      'Weather & climate',
      'Cycle phase',
      'Diet clean/cheat',
      'Indoor AC / heat',
      'Sleep position',
    ],
    fullUseCases: [
      'Current skin barrier status',
      'Weather and humidity conditions',
      'Menstrual cycle phase',
      'Dietary quality for the day',
      'Primary indoor environment type',
      'Sleep position last night',
      'Daytime sun exposure level',
    ],
  },
  {
    type: 'text',
    title: 'Text / Notes',
    subtitle: 'Freeform qualitative context & notes for AI skin correlation',
    icon: FileText,
    badge: 'Notes',
    compactUseCases: [
      'Patch test notes',
      'Allergic flare-up',
      'Dermatologist tips',
      'Travel climate shift',
      'Morning skin feel',
      'Breakout triggers',
    ],
    fullUseCases: [
      'Patch test reactions and observations',
      'Allergic flare-up or contact dermatitis notes',
      'Dermatologist visit takeaways',
      'Skin changes from travel or climate shift',
      'Morning skin feel before washing',
      'Suspected breakout triggers',
    ],
  },
  {
    type: 'scale',
    title: 'Scale (1-5)',
    subtitle: 'Subjective feeling, intensity, stress, or mood rating',
    icon: SlidersHorizontal,
    badge: 'Rating (1-5)',
    compactUseCases: [
      'Redness & sting',
      'Acne severity',
      'Daily stress',
      'Sleep quality',
      'Skin dryness',
      'Itchiness level',
    ],
    fullUseCases: [
      'Skin redness or flushing intensity',
      'Acne and breakout severity',
      'Daily stress level',
      'Sleep quality last night',
      'Skin dryness or tightness',
      'Itchiness or stinging sensation',
      'Overall energy and fatigue',
    ],
  },
  {
    type: 'numeric',
    title: 'Numeric',
    subtitle: 'Quantifiable counts, durations, and continuous metrics',
    icon: BarChart2,
    badge: 'Metric',
    compactUseCases: [
      'Water intake (L)',
      'Sleep hours',
      'Sunscreen SPF',
      'Direct sun (mins)',
      'Pimple count',
      'Coffee cups',
    ],
    fullUseCases: [
      'Water intake throughout the day',
      'Hours of sleep last night',
      'Sunscreen SPF rating applied',
      'Minutes in direct sunlight',
      'Active pimple or blemish count',
      'Daily caffeine consumption',
      'UV index during peak hours',
    ],
  },
];

export default function AddJournalQuestionScreen() {
  const componentExecTime = performance.now();
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { width: screenWidth } = Dimensions.get('window');
  const responsivePadding = Math.max(16, screenWidth * 0.05);

  const primaryColor = Colors.light.primary;

  const addNewClick = (globalThis as any).__addNewClickTime;
  const clickTime = addNewClick || performance.now();
  console.log(`[PERF ROOT-CAUSE] Screen Render #${renderCountRef.current} at ${(componentExecTime - clickTime).toFixed(1)}ms from click`);

  useEffect(() => {
    const mountTime = performance.now();
    console.log(`[PERF ROOT-CAUSE] Screen useEffect (Native Mounted) at ${(mountTime - clickTime).toFixed(1)}ms from click`);
  }, []);

  // By default, nothing is selected
  const [selectedType, setSelectedType] = useState<QuestionDataType | null>(null);

  // Slide open tracking for Android hardware back button
  const [isSlideOpen, setIsSlideOpen] = useState(false);

  // Long-press modal state
  const [modalItem, setModalItem] = useState<DataTypeOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Android hardware back button: when slide is open, close only the slide
  useEffect(() => {
    if (!isSlideOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      detailsSheetRef.current?.dismiss();
      setIsSlideOpen(false);
      return true; // Stop propagation to navigation
    });
    return () => sub.remove();
  }, [isSlideOpen]);

  // Invisible Warm-Up state to pre-measure BottomSheetModal height in background
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const warmUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toggle selection: clicking a selected card deselects it
  const handleCardPress = (type: QuestionDataType) => {
    console.log(`[PERF ROOT-CAUSE] Card pressed: ${type}`);
    if (warmUpTimerRef.current) {
      clearTimeout(warmUpTimerRef.current);
      warmUpTimerRef.current = null;
    }

    setSelectedType((prev) => {
      const nextType = prev === type ? null : type;

      // Trigger invisible warm-up when a card is selected
      if (nextType) {
        setIsWarmingUp(true);
        // Small delay to allow state update to propagate selectedType to sheet
        setTimeout(() => {
          detailsSheetRef.current?.present();
          warmUpTimerRef.current = setTimeout(() => {
            detailsSheetRef.current?.dismiss();
            setIsWarmingUp(false);
            warmUpTimerRef.current = null;
          }, 600);
        }, 50);
      } else {
        setIsWarmingUp(false);
      }

      return nextType;
    });
  };

  const handleOpenDetailModal = (item: DataTypeOption) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const detailsSheetRef = useRef<AddJournalQuestionDetailsSheetRef>(null);

  const handleContinue = () => {
    // If warm-up timer is still running when user clicks continue, cancel it
    if (warmUpTimerRef.current) {
      clearTimeout(warmUpTimerRef.current);
      warmUpTimerRef.current = null;
    }
    setIsWarmingUp(false);

    const t0 = performance.now();
    (globalThis as any).__continueClickTime = t0;
    console.log(`[PERF ROOT-CAUSE] "Continue" pressed. Calling present() immediately...`);
    if (!selectedType) return;
    setIsSlideOpen(true);
    detailsSheetRef.current?.present();
    console.log(`[PERF ROOT-CAUSE] present() call returned in ${(performance.now() - t0).toFixed(1)}ms`);
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      {/* ScrollView contains the header so it scrolls with content and doesn't stick to top */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + 10,
            paddingHorizontal: responsivePadding, 
            paddingBottom: selectedType ? insets.bottom + 100 : insets.bottom + 28 
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar / Header: Back Button + Centered Title */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={22} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
          </Pressable>

          <View style={styles.headerTitleCenterContainer}>
            <Text 
              style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]} 
              numberOfLines={1}
            >
              Choose Your Data Type
            </Text>
          </View>

          {/* Right spacer to balance the back button and keep title perfectly centered */}
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Horizontal Scrollable Data Type Cards List */}
        <View style={styles.cardsList}>
          {DATA_TYPES.map((item) => {
            const IconComp = item.icon;
            const isSelected = selectedType === item.type;
            return (
              <Pressable
                key={item.type}
                onPress={() => handleCardPress(item.type)}
                onLongPress={() => handleOpenDetailModal(item)}
                delayLongPress={350}
                style={({ pressed }) => [
                  styles.horizontalCard,
                  isDark ? styles.cardDark : styles.cardLight,
                  isSelected && {
                    borderColor: primaryColor,
                    borderWidth: 2.5, // Matches Select Photos border thickness
                  },
                  { opacity: pressed ? 0.88 : 1 }
                ]}
              >
                {/* Checkmark in top-right corner of the whole card (a bit above the title) */}
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: primaryColor }]}>
                    <Check size={13} color="#ffffff" strokeWidth={3} />
                  </View>
                )}

                {/* Card Top Row: Icon on left, Title + Pill in row 1, Subtitle in row 2 */}
                <View style={styles.cardHeaderRow}>
                  {/* Left: Icon container */}
                  <View 
                    style={[
                      styles.cardIconWrap, 
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
                    ]}
                  >
                    <IconComp 
                      size={22} 
                      color={isDark ? '#ffffff' : '#111827'} 
                      strokeWidth={2.4} 
                    />
                  </View>

                  {/* Middle Column: Title + Pill Row on line 1, Subtitle on line 2 */}
                  <View style={styles.cardHeaderContent}>
                    <View style={styles.titleAndPillRow}>
                      <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                        {item.title}
                      </Text>
                      {/* True Pill-shaped badge (borderRadius: 999) */}
                      <View 
                        style={[
                          styles.badgeWrap, 
                          { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                          {item.badge}
                        </Text>
                      </View>
                    </View>

                    {/* Subtitle spans full width cleanly without red debug outline */}
                    <Text style={[styles.cardSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Specific Real-World Skin Use Cases Section (exactly 3 lines with 6 concise bulleted examples) */}
                <View 
                  style={[
                    styles.useCasesBox,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                    }
                  ]}
                >
                  <Text style={[styles.useCaseHeading, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                    USE CASES:
                  </Text>
                  <View style={styles.useCasesGrid}>
                    {item.compactUseCases.map((uc, idx) => (
                      <View key={idx} style={styles.useCaseItem}>
                        {/* Primary colored dot: black border in light mode, white border in dark mode */}
                        <View 
                          style={[
                            styles.useCaseBulletDot, 
                            { 
                              backgroundColor: primaryColor,
                              borderColor: isDark ? '#ffffff' : '#000000',
                            }
                          ]} 
                        />
                        <Text 
                          style={[styles.useCaseText, { color: isDark ? '#d4d4d8' : '#374151' }]} 
                          numberOfLines={1}
                        >
                          {uc}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Continue Button (no bottom shadow effect, balanced vertical gaps) */}
      {selectedType && (
        <View 
          style={[
            styles.floatingBottomContainer, 
            { 
              left: responsivePadding,
              right: responsivePadding,
              bottom: Math.max(insets.bottom, 16) + 8,
            }
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: pressed ? '#a98fcc' : primaryColor,
              },
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      )}

      {/* Long-Press Pop-up Modal showing all comprehensive use cases */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <Pressable 
          style={styles.modalBackdrop}
          onPress={() => setIsModalOpen(false)}
        >
          <Pressable 
            style={[
              styles.modalCard,
              { 
                backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                maxHeight: Dimensions.get('window').height * 0.85,
              }
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {modalItem && (
              <>
                {/* Top-right close button */}
                <Pressable
                  onPress={() => setIsModalOpen(false)}
                  style={({ pressed }) => [
                    styles.modalCloseBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      opacity: pressed ? 0.7 : 1,
                    }
                  ]}
                  hitSlop={10}
                >
                  <X size={18} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
                </Pressable>

                {/* Modal Header */}
                <View style={styles.modalHeaderRow}>
                  <View style={[styles.cardIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                    {React.createElement(modalItem.icon, {
                      size: 22,
                      color: isDark ? '#ffffff' : '#111827',
                      strokeWidth: 2.4,
                    })}
                  </View>
                  <View style={styles.modalHeaderContent}>
                    <View style={styles.titleAndPillRow}>
                      <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                        {modalItem.title}
                      </Text>
                      {/* True Pill-shaped badge in modal */}
                      <View style={[styles.badgeWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }]}>
                        <Text style={[styles.badgeText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                          {modalItem.badge}
                        </Text>
                      </View>
                    </View>
                    {/* Subtitle area spacious across the modal */}
                    <Text style={[styles.modalSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                      {modalItem.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Modal Divider */}
                <View style={[styles.modalDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

                {/* All Detailed Use Cases List */}
                <Text style={[styles.modalSectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Use Cases
                </Text>

                <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalUseCasesList}>
                    {modalItem.fullUseCases.map((fuc, idx) => (
                      <View key={idx} style={styles.modalUseCaseItem}>
                        {/* Dot in modal: black border in light mode, white border in dark mode */}
                        <View 
                          style={[
                            styles.modalBulletDot, 
                            { 
                              backgroundColor: primaryColor,
                              borderColor: isDark ? '#ffffff' : '#000000',
                            }
                          ]} 
                        />
                        <Text style={[styles.modalUseCaseText, { color: isDark ? '#e4e4e7' : '#27272a' }]}>
                          {fuc}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {/* Modal Action: Select this option */}
                <Pressable
                  onPress={() => {
                    setSelectedType(modalItem.type);
                    setIsModalOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.modalSelectBtn,
                    {
                      backgroundColor: primaryColor,
                      opacity: pressed ? 0.88 : 1,
                    }
                  ]}
                >
                  <Text style={styles.modalSelectBtnText}>
                    Select {modalItem.title}
                  </Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      {/* Slide / Bottom Sheet for Question Details */}
      <AddJournalQuestionDetailsSheet
        ref={detailsSheetRef}
        selectedType={selectedType}
        isDark={isDark}
        isWarmingUp={isWarmingUp}
        onDismiss={() => setIsSlideOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitleCenterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  cardsList: {
    gap: 12,
    marginTop: 6,
  },
  horizontalCard: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 10,
    position: 'relative',
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#1c1c20',
    borderColor: '#2b2b30',
  },
  checkCircle: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  cardHeaderContent: {
    flex: 1,
    paddingRight: 28, // Reserves space for the top-right tick
    gap: 4,
  },
  titleAndPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  badgeWrap: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999, // True pill shape
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 17,
  },
  useCasesBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  useCaseHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  useCasesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 4,
  },
  useCaseItem: {
    width: '49%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  useCaseBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    marginRight: 6,
  },
  useCaseText: {
    fontSize: 11.5,
    fontWeight: '500',
    flex: 1,
  },
  floatingBottomContainer: {
    position: 'absolute',
    zIndex: 50,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 100,
    // Removed all drop-shadow / glow effects as requested
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Pop-up Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    gap: 14,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingRight: 36, // Reserves space for the top-right close button
  },
  modalHeaderContent: {
    flex: 1,
    gap: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 2,
  },
  modalDivider: {
    height: 1,
    width: '100%',
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalUseCasesList: {
    gap: 10,
    paddingVertical: 4,
  },
  modalUseCaseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  modalBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    marginTop: 6,
  },
  modalUseCaseText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  modalSelectBtn: {
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  modalSelectBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
