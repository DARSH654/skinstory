import React, { useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  Animated, 
  PanResponder, 
  Linking, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import Header from '@/components/layout/Header';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScanStore, SkinConcern } from '@/store/scanStore';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Calendar,
  X,
  Check,
  Filter
} from 'lucide-react-native';
import { MOCK_SCANS } from '@/constants/mockScans';



const SEVERITY_COLOR: Record<string, string> = {
  None:     '#10b981',
  Mild:     '#f59e0b',
  Moderate: '#f97316',
  Severe:   '#ef4444',
};

function ConcernRow({ concern, isDark }: { concern: SkinConcern; isDark: boolean }) {
  const color = SEVERITY_COLOR[concern.severity] ?? '#6b7280';
  return (
    <View style={styles.concernRow}>
      <View style={[styles.severityDot, { backgroundColor: color }]} />
      <Text style={[styles.concernName, isDark ? styles.textDark : styles.textLight]}>
        {concern.name}
      </Text>
      <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.badgeText, { color }]}>{concern.severity}</Text>
      </View>
    </View>
  );
}

export default function ScanLandingScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted ?? false;

  // Zustand Store
  const imageUri = useScanStore(state => state.imageUri);
  const scanResult = useScanStore(state => state.scanResult);
  const isLoading = useScanStore(state => state.isLoading);
  const error = useScanStore(state => state.error);
  const runAnalysis = useScanStore(state => state.runAnalysis);
  const clearImage = useScanStore(state => state.clearImage);

  // Layout View State: 'grid' | 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Skin Type Filter State
  const [skinTypeFilter, setSkinTypeFilter] = useState<string>('All');
  const [isSkinDropdownOpen, setIsSkinDropdownOpen] = useState<boolean>(false);

  // Timeline Filter State
  const [timelineFilter, setTimelineFilter] = useState<'all' | '7days' | '30days' | '3months' | '6months' | 'custom'>('all');
  const [isTimelineDropdownOpen, setIsTimelineDropdownOpen] = useState<boolean>(false);

  // Custom Date Modal State & Smart Validation
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [appliedCustomRange, setAppliedCustomRange] = useState<{ start: string; end: string } | null>(null);

  // Ultra-smart date normalizer: turns "2026-7-1", "2026-07-1", "20260701", etc. into standard "YYYY-MM-DD"
  const normalizeSmartDate = (dateStr: string): string | null => {
    const trimmed = dateStr.trim();
    if (!trimmed) return null;

    // Case 1: Already has dashes or slashes or dots (e.g. 2026-7-1, 2026/7/1)
    const parts = trimmed.split(/[-/.]/);
    if (parts.length === 3) {
      let [y, m, d] = parts;
      if (y.length === 4) {
        const monthNum = parseInt(m, 10);
        const dayNum = parseInt(d, 10);
        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          const mm = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
          const dd = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
          const normalized = `${y}-${mm}-${dd}`;
          if (!isNaN(Date.parse(normalized))) return normalized;
        }
      }
    }

    // Case 2: Pure digits (e.g. 202671 or 20260701)
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length >= 6 && digits.length <= 8) {
      const y = digits.slice(0, 4);
      const rest = digits.slice(4);
      if (rest.length === 2) {
        const m = parseInt(rest[0], 10);
        const d = parseInt(rest[1], 10);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${y}-0${m}-0${d}`;
        }
      } else if (rest.length === 3) {
        const m1 = parseInt(rest.slice(0, 2), 10);
        const d1 = parseInt(rest.slice(2), 10);
        if (m1 >= 1 && m1 <= 12 && d1 >= 1 && d1 <= 31) {
          return `${y}-${m1 < 10 ? '0' + m1 : m1}-0${d1}`;
        }
        const m2 = parseInt(rest[0], 10);
        const d2 = parseInt(rest.slice(1), 10);
        if (m2 >= 1 && m2 <= 12 && d2 >= 1 && d2 <= 31) {
          return `${y}-0${m2}-${d2 < 10 ? '0' + d2 : d2}`;
        }
      } else if (rest.length === 4) {
        const m = parseInt(rest.slice(0, 2), 10);
        const d = parseInt(rest.slice(2), 10);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          const mm = m < 10 ? `0${m}` : `${m}`;
          const dd = d < 10 ? `0${d}` : `${d}`;
          return `${y}-${mm}-${dd}`;
        }
      }
    }

    return null;
  };

  const normalizedStart = normalizeSmartDate(startDate);
  const normalizedEnd = normalizeSmartDate(endDate);

  const isStartDateValid = normalizedStart !== null;
  const isEndDateValid = normalizedEnd !== null;

  const isRangeValid =
    isStartDateValid &&
    isEndDateValid &&
    new Date(normalizedStart!).getTime() <= new Date(normalizedEnd!).getTime();

  const isApplyCustomEnabled = isRangeValid;

  const getTimelineLabel = () => {
    if (timelineFilter === '7days') return 'Last 7 Days';
    if (timelineFilter === '30days') return 'Last 30 Days';
    if (timelineFilter === '3months') return 'Last 3 Months';
    if (timelineFilter === '6months') return 'Last 6 Months';
    if (timelineFilter === 'custom' && appliedCustomRange) {
      return `${appliedCustomRange.start} - ${appliedCustomRange.end}`;
    }
    return 'All Time';
  };

  // Filtered scans dataset based on skin type & timeline
  const filteredScans = MOCK_SCANS.filter(scan => {
    // 1. Skin type filter
    if (skinTypeFilter !== 'All' && scan.skinType !== skinTypeFilter) {
      return false;
    }
    // 2. Timeline filter
    const now = new Date().getTime();
    if (timelineFilter === '7days') {
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      return scan.timestamp >= sevenDaysAgo;
    } else if (timelineFilter === '30days') {
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      return scan.timestamp >= thirtyDaysAgo;
    } else if (timelineFilter === '3months') {
      const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
      return scan.timestamp >= threeMonthsAgo;
    } else if (timelineFilter === '6months') {
      const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;
      return scan.timestamp >= sixMonthsAgo;
    } else if (timelineFilter === 'custom' && appliedCustomRange) {
      const start = new Date(appliedCustomRange.start).getTime();
      const end = new Date(appliedCustomRange.end).getTime() + 24 * 60 * 60 * 1000; // End of that day
      return scan.timestamp >= start && scan.timestamp <= end;
    }
    return true;
  });

  // Scanning animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }
  }, [isLoading]);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  // Toast State (for permission denied)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    fadeAnim.stopAnimation();
    slideAnim.stopAnimation();
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    setToastMessage(msg);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      toastTimerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 20, duration: 220, useNativeDriver: true }),
        ]).start(() => {
          setToastMessage("");
          toastTimerRef.current = null;
        });
      }, 5000);
    });
  };

  const dismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 20, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setToastMessage("");
    });
  };

  const toastPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          slideAnim.setValue(g.dy);
          const opacity = Math.max(0, 1 - (g.dy / 60));
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 20) {
          dismissToast();
        } else {
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
          ]).start();
        }
      }
    })
  ).current;

  const [hasDeniedOnce, setHasDeniedOnce] = useState(false);

  const handleScanClick = async () => {
    if (hasPermission) {
      router.push('/camera');
      return;
    }

    if (hasDeniedOnce) {
      Linking.openSettings();
      return;
    }

    const granted = await requestPermission();
    if (granted) {
      router.push('/camera');
    } else {
      setHasDeniedOnce(true);
      showToast("Permission denied. Tap again to open Settings.");
    }
  };

  const result = scanResult;

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <Header title="Scan Skin" />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
        showsVerticalScrollIndicator={false}
      >
        {!imageUri ? (
          <View style={styles.historyContent}>
            {/* Header section with Title "Your Scans" & Action Controls */}
            <View style={styles.historyTopSection}>
              <View style={styles.historyHeaderRow}>
                <Text style={[styles.historyTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Your Scans
                </Text>

                <View style={styles.headerRightActions}>
                  {/* Timeline Filter Dropdown */}
                  <View style={{ position: 'relative', zIndex: 30 }}>
                    <Pressable 
                      onPress={() => setIsTimelineDropdownOpen(!isTimelineDropdownOpen)}
                      style={[styles.filterChipButton, isDark ? styles.chipDark : styles.chipLight]}
                    >
                      <Text style={[styles.filterChipText, { color: isDark ? '#ffffff' : '#111827' }]}>
                        {getTimelineLabel()}
                      </Text>
                      {isTimelineDropdownOpen ? (
                        <ChevronUp size={13} color={isDark ? '#a1a1aa' : '#6b7280'} />
                      ) : (
                        <ChevronDown size={13} color={isDark ? '#a1a1aa' : '#6b7280'} />
                      )}
                    </Pressable>

                    {/* Timeline Dropdown Overlay Menu */}
                    {isTimelineDropdownOpen && (
                      <TouchableWithoutFeedback onPress={() => setIsTimelineDropdownOpen(false)}>
                        <View style={styles.dropdownBackdrop} />
                      </TouchableWithoutFeedback>
                    )}
                    {isTimelineDropdownOpen && (
                      <View style={[styles.dropdownMenu, isDark ? styles.dropdownDark : styles.dropdownLight, { right: 0 }]}>
                        {[
                          { key: 'all', label: 'All Time' },
                          { key: '7days', label: 'Last 7 Days' },
                          { key: '30days', label: 'Last 30 Days' },
                          { key: '3months', label: 'Last 3 Months' },
                          { key: '6months', label: 'Last 6 Months' },
                        ].map((item) => (
                          <Pressable
                            key={item.key}
                            onPress={() => {
                              setIsTimelineDropdownOpen(false);
                              setTimelineFilter(item.key as any);
                            }}
                            style={[
                              styles.dropdownMenuItem,
                              timelineFilter === item.key && (isDark ? styles.menuItemActiveDark : styles.menuItemActiveLight)
                            ]}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              { color: timelineFilter === item.key ? Colors.light.primary : (isDark ? '#ffffff' : '#111827') },
                              timelineFilter === item.key && { fontWeight: '700' }
                            ]}>
                              {item.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* View Mode Toggle (Pill Shape: Grid vs List) */}
                  <View style={[styles.viewToggleGroupPill, isDark ? styles.viewToggleDark : styles.viewToggleLight]}>
                    <Pressable
                      onPress={() => setViewMode('grid')}
                      style={[
                        styles.toggleBtnPill,
                        viewMode === 'grid'
                          ? (isDark ? styles.toggleActiveDark : styles.toggleActiveLight)
                          : styles.toggleInactiveBtnPill,
                      ]}
                    >
                      <LayoutGrid size={15} color={viewMode === 'grid' ? (isDark ? '#ffffff' : '#111827') : (isDark ? '#a1a1aa' : '#6b7280')} />
                      {viewMode === 'grid' && (
                        <Text style={[styles.toggleBtnText, { color: isDark ? '#ffffff' : '#111827' }]}>
                          Grid
                        </Text>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => setViewMode('list')}
                      style={[
                        styles.toggleBtnPill,
                        viewMode === 'list'
                          ? (isDark ? styles.toggleActiveDark : styles.toggleActiveLight)
                          : styles.toggleInactiveBtnPill,
                      ]}
                    >
                      <LayoutList size={15} color={viewMode === 'list' ? (isDark ? '#ffffff' : '#111827') : (isDark ? '#a1a1aa' : '#6b7280')} />
                      {viewMode === 'list' && (
                        <Text style={[styles.toggleBtnText, { color: isDark ? '#ffffff' : '#111827' }]}>
                          List
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            {/* Scans Render (Grid vs List Layout) */}
            {filteredScans.length > 0 ? (
              viewMode === 'grid' ? (
                /* Grid View (2-Column Grid matching Select Scans style) */
                <View style={styles.scansGrid}>
                  {filteredScans.map((scan) => (
                    <Pressable
                      key={scan.id}
                      onPress={() => router.push(`/scan/${scan.id}` as any)}
                      style={[styles.scanBoxGrid, isDark ? styles.cardDark : styles.cardLight]}
                    >
                      <View style={styles.scanBoxGridImageWrapper}>
                        <Image source={scan.image} style={styles.scanBoxGridImage} resizeMode="cover" />

                        {/* Top-Right Chevron Arrow Button redirecting to Scan Details */}
                        <View style={styles.scanChevronBadgeTopRight}>
                          <ChevronRight size={15} color="#ffffff" strokeWidth={2.8} />
                        </View>

                        {/* Date Pill at bottom left — dark translucent background */}
                        <View style={styles.datePillBottomLeft}>
                          <Text style={styles.datePillText}>{scan.date}</Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                /* List View (1-Column Large Cards) */
                <View style={styles.scansList}>
                  {filteredScans.map((scan) => (
                    <Pressable
                      key={scan.id}
                      onPress={() => router.push(`/scan/${scan.id}` as any)}
                      style={[styles.scanBoxListCard, isDark ? styles.cardDark : styles.cardLight]}
                    >
                      <View style={styles.scanBoxListImageWrapper}>
                        <Image source={scan.image} style={styles.scanBoxListImage} resizeMode="cover" />
                      </View>
                      <View style={styles.scanBoxListBody}>
                        <View style={{ gap: 4, flex: 1 }}>
                          <Text style={[styles.scanBoxListDate, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                            {scan.date}
                          </Text>
                          <Text style={[styles.scanBoxListTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                            Overall Skin Scan
                          </Text>
                          <View style={[styles.scoreBadgePill, { backgroundColor: isDark ? 'rgba(147, 122, 189, 0.2)' : 'rgba(147, 122, 189, 0.12)' }]}>
                            <Text style={styles.scoreBadgePillText}>
                              Score {scan.score}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={18} color={isDark ? '#71717a' : '#9ca3af'} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              )
            ) : (
              /* Empty state if filtering yields no scans */
              <View style={styles.emptyScansContainer}>
                <Sparkles size={32} color="#a855f7" />
                <Text style={[styles.emptyScansTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  No scans found
                </Text>
                <Text style={[styles.emptyScansSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                  No scan records match your selected timeline or skin type filter.
                </Text>
                <Pressable
                  onPress={() => {
                    setSkinTypeFilter('All');
                    setTimelineFilter('all');
                  }}
                  style={styles.resetFiltersBtn}
                >
                  <Text style={styles.resetFiltersBtnText}>Reset Filters</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.scanContainer}>
            {/* Round Scanning Card */}
            <View style={[styles.previewCard, { borderColor: isDark ? '#a855f7' : Colors.light.primary }]}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              
              {/* Scan line visualizer */}
              {isLoading && (
                <Animated.View style={[
                  styles.scanLine, 
                  { transform: [{ translateY }] }
                ]} />
              )}

              {/* Status HUD overlay */}
              {isLoading && (
                <View style={styles.scanningBanner}>
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.scanningText}>Analyzing Skin...</Text>
                </View>
              )}
            </View>

            {/* Controls */}
            {!isLoading && (
              <View style={styles.actionsPanel}>
                <Pressable 
                  style={styles.resetButton} 
                  onPress={() => { clearImage(); router.push('/camera'); }}
                >
                  <Text style={styles.resetButtonText}>Scan Again</Text>
                </Pressable>
              </View>
            )}

            {/* Results Output */}
            {result && (
              <View style={styles.resultsContainer}>
                <View style={styles.resultsHeader}>
                  <CheckCircle2 size={24} color="#10b981" style={{ marginRight: 8 }} />
                  <Text style={[styles.resultsTitle, isDark ? styles.textDark : styles.textLight]}>
                    Analysis Complete
                  </Text>
                </View>

                {/* Overall Score */}
                {result.overall_score >= 0 && (
                  <View style={[styles.scoreCard, isDark ? styles.cardDark : styles.cardLight]}>
                    <View style={styles.scoreRow}>
                      <Sparkles size={20} color="#a855f7" style={{ marginRight: 8 }} />
                      <Text style={styles.cardHeader}>OVERALL SKIN HEALTH</Text>
                    </View>
                    <View style={styles.scoreCircleRow}>
                      <View style={styles.scoreCircle}>
                        <Text style={styles.scoreNumber}>{result.overall_score}</Text>
                        <Text style={styles.scoreUnit}>/100</Text>
                      </View>
                      <View style={styles.scoreInfo}>
                        <Text style={[styles.skinTypeLabel, isDark ? styles.textDark : styles.textLight]}>
                          Skin Type
                        </Text>
                        <Text style={styles.skinTypeValue}>{result.skin_type}</Text>
                        <Text style={[styles.summaryText, isDark ? { color: '#9ca3af' } : { color: '#6b7280' }]}>
                          {result.summary}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Concerns */}
                {result.concerns?.length > 0 && (
                  <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                    <Text style={styles.cardHeader}>SKIN CONCERNS</Text>
                    {result.concerns.map((c, i) => (
                      <ConcernRow key={i} concern={c} isDark={isDark} />
                    ))}
                  </View>
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                    <Text style={styles.cardHeader}>RECOMMENDATIONS</Text>
                    {result.recommendations.map((rec, i) => (
                      <View key={i} style={styles.recRow}>
                        <ChevronRight size={16} color="#a855f7" style={{ marginRight: 6, marginTop: 2 }} />
                        <Text style={[styles.recText, isDark ? { color: '#d1d5db' } : { color: '#374151' }]}>
                          {rec}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Powered by Gemini badge */}
                <View style={styles.metaBox}>
                  <Text style={styles.metaText}>✨ Powered by Gemini AI Vision</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {toastMessage ? (
        <Animated.View
          {...toastPanResponder.panHandlers}
          style={[
            styles.toastContainer,
            isDark ? styles.toastDark : styles.toastLight,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }], bottom: 24 }
          ]}
        >
          <Text style={isDark ? styles.toastTextDark : styles.toastTextLight}>
            {toastMessage}
          </Text>
        </Animated.View>
      ) : null}
      {/* Custom Date Range Selection Modal */}
      <Modal
        visible={isCustomModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCustomModalOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsCustomModalOpen(false)}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, isDark ? styles.modalDark : styles.modalLight]}>
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Calendar size={18} color={isDark ? '#ffffff' : '#111827'} />
                  <Text style={[styles.modalTitleText, { color: isDark ? '#ffffff' : '#111827' }]}>
                    Custom Timeline Range
                  </Text>
                </View>
                <Pressable onPress={() => setIsCustomModalOpen(false)} hitSlop={10}>
                  <X size={20} color={isDark ? '#a1a1aa' : '#6b7280'} />
                </Pressable>
              </View>

              {/* Date Inputs */}
              <View style={styles.inputsContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                    Start Date (YYYY-MM-DD)
                  </Text>
                  <TextInput
                    style={[styles.dateInput, isDark ? styles.inputDark : styles.inputLight]}
                    placeholder="e.g. 2026-07-01 or 2026-7-1"
                    placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                    value={startDate}
                    onChangeText={setStartDate}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                    End Date (YYYY-MM-DD)
                  </Text>
                  <TextInput
                    style={[styles.dateInput, isDark ? styles.inputDark : styles.inputLight]}
                    placeholder="e.g. 2026-07-28 or 2026-7-28"
                    placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                    value={endDate}
                    onChangeText={setEndDate}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Error Status Indicator (only if invalid dates or reversed order) */}
              {(startDate.trim().length >= 6 && !isStartDateValid) || (endDate.trim().length >= 6 && !isEndDateValid) ? (
                <View style={styles.validationBox}>
                  <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '500' }}>
                    ❌ Please enter dates in valid format (e.g. 2026-07-01 or 2026-7-1).
                  </Text>
                </View>
              ) : isStartDateValid && isEndDateValid && new Date(normalizedStart!).getTime() > new Date(normalizedEnd!).getTime() ? (
                <View style={styles.validationBox}>
                  <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '500' }}>
                    ❌ Start date cannot be after End date.
                  </Text>
                </View>
              ) : null}

              {/* Modal Buttons */}
              <View style={styles.modalActionsRow}>
                <Pressable
                  onPress={() => {
                    setStartDate('');
                    setEndDate('');
                    setIsCustomModalOpen(false);
                  }}
                  style={[styles.modalBtnSecondary, isDark ? styles.btnSecondaryDark : styles.btnSecondaryLight]}
                >
                  <Text style={[styles.modalBtnSecondaryText, { color: isDark ? '#ffffff' : '#111827' }]}>
                    Cancel
                  </Text>
                </Pressable>

                {/* Smart Apply Button */}
                <Pressable
                  disabled={!isApplyCustomEnabled}
                  onPress={() => {
                    if (isApplyCustomEnabled && normalizedStart && normalizedEnd) {
                      setAppliedCustomRange({ start: normalizedStart, end: normalizedEnd });
                      setTimelineFilter('custom');
                      setIsCustomModalOpen(false);
                    }
                  }}
                  style={[
                    styles.modalBtnPrimary,
                    !isApplyCustomEnabled && { opacity: 0.45, backgroundColor: isDark ? '#3f3f46' : '#d1d5db' }
                  ]}
                >
                  <Text style={styles.modalBtnPrimaryText}>Apply Filter</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgLight: { backgroundColor: '#f5f5f7' },
  bgDark: { backgroundColor: '#121212' },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 400 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  textLight: { color: '#111827' },
  textDark: { color: '#ffffff' },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 40 },
  button: { backgroundColor: Colors.light.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  
  // Scan view styles
  scanContainer: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  previewCard: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 3.5,
    position: 'relative',
    marginBottom: 24,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#c084fc',
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  scanningBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(147, 51, 234, 0.85)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scanningText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionsPanel: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  retakeButton: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.3)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  resultsContainer: {
    width: '100%',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  // Score card
  scoreCard: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 2,
    borderColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#a855f7',
  },
  scoreUnit: {
    fontSize: 11,
    color: '#a855f7',
    fontWeight: '600',
  },
  scoreInfo: {
    flex: 1,
  },
  skinTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 2,
  },
  skinTypeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a855f7',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Concern rows
  concernRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156,163,175,0.1)',
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  concernName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  // Recommendations
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  recText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a855f7',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  metricRow: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaBox: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.2)',
    elevation: 10,
    borderWidth: 1,
    zIndex: 9999,
  },
  toastLight: { backgroundColor: '#111827', borderColor: '#374151' },
  toastDark: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
  toastTextLight: { fontSize: 14, fontWeight: '500', fontFamily: 'Outfit_500Medium', textAlign: 'center', color: '#ffffff' },
  toastTextDark: { fontSize: 14, fontWeight: '500', fontFamily: 'Outfit_500Medium', textAlign: 'center', color: '#111827' },

  // New Scans History UI & Filtering Styles
  historyContent: {
    padding: 20,
    width: '100%',
  },
  historyTopSection: {
    marginBottom: 20,
    gap: 14,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  scanCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  scanCountText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Right-side action cluster (timeline filter + toggle)
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // View Toggle Group — Pill Shape
  viewToggleGroupPill: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 100,
    gap: 2,
  },
  viewToggleLight: {
    backgroundColor: '#e4e4e7',
  },
  viewToggleDark: {
    backgroundColor: '#27272a',
  },
  toggleBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 100,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleActiveDark: {
    backgroundColor: '#18181b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleInactiveBtnPill: {
    paddingHorizontal: 8,
  },

  // Filter Controls Row
  filterControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  filterChipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
  },
  chipDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Dropdown Overlay Menu
  dropdownBackdrop: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    right: -9999,
    bottom: -9999,
    zIndex: 998,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 42,
    minWidth: 120,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },
  dropdownLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
  },
  dropdownDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },
  menuItemActiveLight: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
  },
  menuItemActiveDark: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Grid View (2 Columns matching Select Scans)
  scansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  scanBoxGrid: {
    width: '48%',
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  scanBoxGridImageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  scanBoxGridImage: {
    width: '100%',
    height: '100%',
  },
  scanChevronBadgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  datePillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  // List View (1 Column / Big Cards)
  scansList: {
    gap: 14,
  },
  scanBoxListCard: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 14,
  },
  scanBoxListImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  scanBoxListImage: {
    width: '100%',
    height: '100%',
  },
  scanBoxListBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  scanBoxListTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scanBoxListDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  scoreBadgePillText: {
    color: '#937abd',
    fontSize: 12,
    fontWeight: '700',
  },
  statusTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  // Common Badges
  scanBoxScoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scanBoxScoreText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  scanBoxBody: {
    padding: 12,
    gap: 4,
  },
  scanBoxDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  scanBoxStatus: {
    fontSize: 11,
  },

  // Empty Scans View
  emptyScansContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyScansTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyScansSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetFiltersBtn: {
    marginTop: 10,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  resetFiltersBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Custom Date Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    gap: 16,
  },
  modalLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
  },
  modalDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitleText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  presetLight: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  presetDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputsContainer: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  inputLight: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    color: '#ffffff',
  },
  validationBox: {
    paddingVertical: 4,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalBtnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnSecondaryLight: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  btnSecondaryDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  modalBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnPrimary: {
    flex: 1.5,
    height: 48,
    borderRadius: 100,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

