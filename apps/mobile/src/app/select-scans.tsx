import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  LayoutGrid,
  LayoutList,
  ChevronUp,
  Calendar,
  X,
  Check,
} from 'lucide-react-native';
import { MOCK_SCANS } from '@/constants/mockScans';

export default function SelectScansScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ selectedIds?: string }>();

  // Default: nothing selected — user picks both themselves
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // View mode: grid | list
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Timeline filter state
  const [timelineFilter, setTimelineFilter] = useState<'all' | '7days' | '30days' | '3months' | '6months' | 'custom'>('all');
  const [isTimelineDropdownOpen, setIsTimelineDropdownOpen] = useState(false);

  // Custom Date Modal State & Validation
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
        // 2026-7-1
        const m = parseInt(rest[0], 10);
        const d = parseInt(rest[1], 10);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${y}-0${m}-0${d}`;
        }
      } else if (rest.length === 3) {
        // e.g. 2026-07-1 or 2026-7-15
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
        // 20260701
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

  // Bottom panel collapsed/expanded state & animation
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const panelAnim = useRef(new Animated.Value(1)).current;

  const prevSelectedLengthRef = useRef(0);

  // Auto-expand panel ONLY when transitioning from 0 to 1 selected items
  useEffect(() => {
    console.log('[DEBUG-SELECT-SCANS] selectedIds changed:', selectedIds, 'prevCount:', prevSelectedLengthRef.current);
    if (prevSelectedLengthRef.current === 0 && selectedIds.length === 1) {
      console.log('[DEBUG-SELECT-SCANS] First scan selected -> Auto-expanding comparison panel.');
      setIsPanelExpanded(true);
      panelAnim.stopAnimation();
      Animated.timing(panelAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }
    prevSelectedLengthRef.current = selectedIds.length;
  }, [selectedIds.length]);

  const togglePanel = () => {
    console.log('[DEBUG-SELECT-SCANS] togglePanel clicked! Current isPanelExpanded:', isPanelExpanded);
    const nextState = !isPanelExpanded;
    setIsPanelExpanded(nextState);
    const targetValue = nextState ? 1 : 0;
    console.log('[DEBUG-SELECT-SCANS] Animating panelAnim to targetValue:', targetValue);
    panelAnim.stopAnimation();
    Animated.timing(panelAnim, {
      toValue: targetValue,
      duration: 220,
      useNativeDriver: false,
    }).start(({ finished }) => {
      console.log('[DEBUG-SELECT-SCANS] Panel animation completed. Finished:', finished, 'Final isPanelExpanded:', nextState);
    });
  };

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

  // Filter scans by timeline
  const filteredScans = MOCK_SCANS.filter((scan) => {
    const now = Date.now();
    if (timelineFilter === '7days') {
      return scan.timestamp >= now - 7 * 24 * 60 * 60 * 1000;
    } else if (timelineFilter === '30days') {
      return scan.timestamp >= now - 30 * 24 * 60 * 60 * 1000;
    } else if (timelineFilter === '3months') {
      return scan.timestamp >= now - 90 * 24 * 60 * 60 * 1000;
    } else if (timelineFilter === '6months') {
      return scan.timestamp >= now - 180 * 24 * 60 * 60 * 1000;
    } else if (timelineFilter === 'custom' && appliedCustomRange) {
      const start = new Date(appliedCustomRange.start).getTime();
      const end = new Date(appliedCustomRange.end).getTime() + 24 * 60 * 60 * 1000;
      return scan.timestamp >= start && scan.timestamp <= end;
    }
    return true;
  });

  const toggleScan = (id: string) => {
    console.log('[DEBUG-SELECT-SCANS] toggleScan called for scan ID:', id);
    setSelectedIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((s) => s !== id);
      } else if (prev.length >= 2) {
        next = [prev[1], id];
      } else {
        next = [...prev, id];
      }
      console.log('[DEBUG-SELECT-SCANS] Updated selectedIds array:', next);
      return next;
    });
  };

  const handleCompare = () => {
    if (selectedIds.length !== 2) return;
    router.navigate({
      pathname: '/(tabs)/progress',
      params: { compareScanIds: JSON.stringify(selectedIds) },
    });
  };

  const beforeScan = selectedIds[0] ? MOCK_SCANS.find((s) => s.id === selectedIds[0]) : null;
  const afterScan  = selectedIds[1] ? MOCK_SCANS.find((s) => s.id === selectedIds[1]) : null;

  // Animated panel height: expands to 175 when items are selected and expanded
  const panelContentHeight = panelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 175],
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f7', paddingTop: insets.top }]}>
      {/* ── Scan List ScrollView (Header inline inside content so it scrolls UPWARDS) ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
      >
        {/* Inline Header Row (Side-by-side title + controls) */}
        <View style={styles.headerInlineRow}>
          <Text style={[styles.headerTitleInline, { color: isDark ? '#ffffff' : '#111827' }]}>
            Select Scans
          </Text>

          {/* Right controls: Timeline filter + Grid/List toggle */}
          <View style={styles.headerRightActions}>
            {/* Timeline filter */}
            <View style={{ position: 'relative', zIndex: 100 }}>
              <Pressable
                onPress={() => setIsTimelineDropdownOpen(!isTimelineDropdownOpen)}
                style={[styles.filterChip, isDark ? styles.chipDark : styles.chipLight]}
              >
                <Text style={[styles.chipText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  {getTimelineLabel()}
                </Text>
                {isTimelineDropdownOpen ? (
                  <ChevronUp size={13} color={isDark ? '#a1a1aa' : '#6b7280'} />
                ) : (
                  <ChevronDown size={13} color={isDark ? '#a1a1aa' : '#6b7280'} />
                )}
              </Pressable>

              {/* Click-outside backdrop */}
              {isTimelineDropdownOpen && (
                <TouchableWithoutFeedback onPress={() => setIsTimelineDropdownOpen(false)}>
                  <View style={styles.dropdownBackdrop} />
                </TouchableWithoutFeedback>
              )}
              {isTimelineDropdownOpen && (
                <View style={[styles.dropdownMenu, isDark ? styles.dropdownDark : styles.dropdownLight]}>
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
                        styles.dropdownItem,
                        timelineFilter === item.key && (isDark ? styles.itemActiveDark : styles.itemActiveLight),
                      ]}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        { color: timelineFilter === item.key ? Colors.light.primary : (isDark ? '#ffffff' : '#111827') },
                        timelineFilter === item.key && { fontWeight: '700' },
                      ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Grid/List Toggle — pill shape */}
            <View style={[styles.viewToggle, isDark ? styles.toggleDark : styles.toggleLight]}>
              <Pressable
                onPress={() => setViewMode('grid')}
                style={[
                  styles.toggleBtn,
                  viewMode === 'grid'
                    ? (isDark ? styles.toggleActiveDark : styles.toggleActiveLight)
                    : styles.toggleInactiveBtn,
                ]}
              >
                <LayoutGrid size={15} color={viewMode === 'grid' ? (isDark ? '#fff' : '#111') : (isDark ? '#a1a1aa' : '#6b7280')} />
                {viewMode === 'grid' && (
                  <Text style={[styles.toggleBtnText, { color: isDark ? '#fff' : '#111' }]}>
                    Grid
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => setViewMode('list')}
                style={[
                  styles.toggleBtn,
                  viewMode === 'list'
                    ? (isDark ? styles.toggleActiveDark : styles.toggleActiveLight)
                    : styles.toggleInactiveBtn,
                ]}
              >
                <LayoutList size={15} color={viewMode === 'list' ? (isDark ? '#fff' : '#111') : (isDark ? '#a1a1aa' : '#6b7280')} />
                {viewMode === 'list' && (
                  <Text style={[styles.toggleBtnText, { color: isDark ? '#fff' : '#111' }]}>
                    List
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {viewMode === 'grid' ? (
          // Grid View — 2 columns (Full-card image with date pill inside)
          <View style={styles.grid}>
            {filteredScans.map((scan) => {
              const isSelected = selectedIds.includes(scan.id);
              const selIdx = selectedIds.indexOf(scan.id);
              return (
                <Pressable
                  key={scan.id}
                  onPress={() => toggleScan(scan.id)}
                  style={[
                    styles.gridCard,
                    {
                      borderColor: isSelected ? Colors.light.primary : (isDark ? '#27272a' : '#e4e4e7'),
                      borderWidth: isSelected ? 2.5 : 1.5,
                    },
                  ]}
                >
                  <View style={styles.gridImageWrapperFull}>
                    <Image source={scan.image} style={styles.gridImageFull} resizeMode="cover" />

                    {/* Before / After selection pill at top left */}
                    {isSelected && (
                      <View style={styles.selectionPillTopLeft}>
                        <Text style={styles.selectionPillText}>{selIdx === 0 ? 'Before' : 'After'}</Text>
                      </View>
                    )}

                    {/* Checkbox badge top right */}
                    <View style={styles.gridCheckboxWrapper}>
                      {isSelected ? (
                        <View style={styles.checkboxSelected}>
                          <Check size={13} color="#ffffff" strokeWidth={3.5} />
                        </View>
                      ) : (
                        <View style={styles.checkboxUnselected}>
                          <View style={styles.unselectedInnerCircle} />
                        </View>
                      )}
                    </View>

                    {/* Date Pill at bottom left — dark translucent background (rgba(0,0,0,0.55)) */}
                    <View style={styles.datePillBottomLeft}>
                      <Text style={styles.datePillText}>{scan.date}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          // List View — 1 column
          <View style={styles.list}>
            {filteredScans.map((scan) => {
              const isSelected = selectedIds.includes(scan.id);
              const selIdx = selectedIds.indexOf(scan.id);
              return (
                <Pressable
                  key={scan.id}
                  onPress={() => toggleScan(scan.id)}
                  style={[
                    styles.listCard,
                    {
                      backgroundColor: isDark ? '#18181b' : '#ffffff',
                      borderColor: isSelected ? Colors.light.primary : (isDark ? '#27272a' : '#e4e4e7'),
                      borderWidth: isSelected ? 2 : 1.5,
                    },
                  ]}
                >
                  <View style={styles.listThumbWrapper}>
                    <Image source={scan.image} style={styles.listThumb} resizeMode="cover" />
                    {isSelected && (
                      <View style={styles.selectionPillTopLeft}>
                        <Text style={styles.selectionPillText}>{selIdx === 0 ? 'Before' : 'After'}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={[styles.listDate, { color: isDark ? '#ffffff' : '#111827' }]}>{scan.date}</Text>
                  </View>
                  <View style={styles.listCheck}>
                    <View style={styles.listCheckboxWrapper}>
                      {isSelected ? (
                        <View style={styles.checkboxSelected}>
                          <Check size={13} color="#ffffff" strokeWidth={3.5} />
                        </View>
                      ) : (
                        <View style={styles.checkboxUnselected}>
                          <View style={styles.unselectedInnerCircle} />
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Custom Date Range Selection Modal ── */}
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

      {/* ── Collapsible Bottom Panel (Stuck at the bottom) ── */}
      <View
        style={[
          styles.bottomPanel,
          {
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            borderTopColor: isDark ? '#27272a' : '#e4e4e7',
            paddingBottom: insets.bottom + 12,
            paddingTop: 12,
            paddingHorizontal: 16,
          },
        ]}
      >
        {/* Expandable content for Big Before / After face image slots */}
        {selectedIds.length > 0 && (
          <Animated.View style={{ height: panelContentHeight, overflow: 'hidden' }}>
            <View style={styles.timelineRow}>
              {/* Before slot */}
              <View style={styles.timelineSlot}>
                {beforeScan ? (
                  <View style={styles.slotImageContainer}>
                    <Image source={beforeScan.image} style={styles.timelineThumbBig} resizeMode="cover" />
                    <View style={[styles.timelineLabelPillInside, { backgroundColor: Colors.light.primary }]}>
                      <Text style={styles.timelineLabelText}>Before</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.slotImageContainer}>
                    <View style={[styles.timelineEmptyBig, { borderColor: isDark ? '#3f3f46' : '#d1d5db' }]}>
                      <Text style={{ color: isDark ? '#52525b' : '#9ca3af', fontSize: 13, fontWeight: '700' }}>Before</Text>
                    </View>
                    <View style={[styles.timelineLabelPillInside, { backgroundColor: Colors.light.primary }]}>
                      <Text style={styles.timelineLabelText}>Before</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Thicker & Bigger Arrow divider */}
              <View style={styles.timelineDividerThick}>
                <View style={[styles.timelineLineThick, { backgroundColor: isDark ? '#52525b' : '#cbd5e1' }]} />
                <View style={[styles.timelineArrowHeadThick, { borderLeftColor: isDark ? '#52525b' : '#cbd5e1' }]} />
              </View>

              {/* After slot */}
              <View style={styles.timelineSlot}>
                {afterScan ? (
                  <View style={styles.slotImageContainer}>
                    <Image source={afterScan.image} style={styles.timelineThumbBig} resizeMode="cover" />
                    <View style={[styles.timelineLabelPillInside, { backgroundColor: Colors.light.primary }]}>
                      <Text style={styles.timelineLabelText}>After</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.slotImageContainer}>
                    <View style={[styles.timelineEmptyBig, { borderColor: isDark ? '#3f3f46' : '#d1d5db' }]}>
                      <Text style={{ color: isDark ? '#52525b' : '#9ca3af', fontSize: 13, fontWeight: '700' }}>After</Text>
                    </View>
                    <View style={[styles.timelineLabelPillInside, { backgroundColor: Colors.light.primary }]}>
                      <Text style={styles.timelineLabelText}>After</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Bottom Actions Row: Compare Scans Button + Chevron Toggle Circle on the Right Side */}
        <View style={styles.bottomActionsRow}>
          <Pressable
            onPress={handleCompare}
            disabled={selectedIds.length !== 2}
            style={[styles.compareBtn, { opacity: selectedIds.length !== 2 ? 0.45 : 1 }]}
          >
            <Text style={styles.compareBtnText}>Compare Scans</Text>
          </Pressable>

          {selectedIds.length > 0 && (
            <Pressable onPress={togglePanel} style={styles.handleCircleBtn}>
              <View style={[styles.handleIconBgCircle, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
                {isPanelExpanded ? (
                  <ChevronDown size={26} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={3} />
                ) : (
                  <ChevronUp size={26} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={3} />
                )}
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Inline Header inside ScrollView
  headerInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 100,
  },
  headerTitleInline: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Filter chip
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipLight: { backgroundColor: '#ffffff', borderColor: '#e4e4e7' },
  chipDark:  { backgroundColor: '#18181b', borderColor: '#27272a' },
  chipText: { fontSize: 12, fontWeight: '600' },

  // Dropdown
  dropdownBackdrop: {
    position: 'absolute',
    top: -9999, left: -9999, right: -9999, bottom: -9999,
    zIndex: 998,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 42,
    right: 0,
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
  dropdownLight: { backgroundColor: '#ffffff', borderColor: '#e4e4e7' },
  dropdownDark:  { backgroundColor: '#18181b', borderColor: '#27272a' },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },
  itemActiveLight: { backgroundColor: 'rgba(168,85,247,0.12)' },
  itemActiveDark:  { backgroundColor: 'rgba(168,85,247,0.25)' },
  dropdownItemText: { fontSize: 12, fontWeight: '500', textAlign: 'center' },

  // View toggle pill
  viewToggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 100,
    gap: 2,
  },
  toggleLight: { backgroundColor: '#e4e4e7' },
  toggleDark:  { backgroundColor: '#27272a' },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
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
  toggleInactiveBtn: {
    paddingHorizontal: 8,
  },

  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gridImageWrapperFull: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gridImageFull: {
    width: '100%',
    height: '100%',
  },

  // Selection Checkbox Badges
  gridCheckboxWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCheckboxWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedInnerCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.8,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },

  selectionPillTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  selectionPillText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },

  datePillBottomLeft: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  datePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },

  // List
  list: { gap: 12 },
  listCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  listThumbWrapper: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  listThumb: { width: '100%', height: '100%' },
  listInfo: { flex: 1, gap: 3 },
  listDate:   { fontSize: 15, fontWeight: '700' },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginTop: 4,
  },
  scoreBadgeText: { color: '#a855f7', fontSize: 13, fontWeight: '800' },
  listCheck: { paddingRight: 4 },

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

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  compareBtn: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    height: 52,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  compareBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  handleCircleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleIconBgCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.25)',
  },

  // Timeline inside panel
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    gap: 20,
  },
  timelineSlot: {
    alignItems: 'center',
  },
  slotImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  timelineThumbBig: {
    width: 155,
    height: 155,
    borderRadius: 22,
  },
  timelineEmptyBig: {
    width: 155,
    height: 155,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLabelPillInside: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  timelineLabelText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  timelineDividerThick: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 44,
  },
  timelineLineThick: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  timelineArrowHeadThick: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
