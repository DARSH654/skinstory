import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  PanResponder,
} from 'react-native';
import { Text } from '@/components/AppText';
import { Plus, X, SlidersHorizontal, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import SkinItemActionMenu from '@/components/journal/SkinItemActionMenu';
import SkinItemEditModal from '@/components/journal/SkinItemEditModal';
import SkinItemDeleteModal from '@/components/journal/SkinItemDeleteModal';

export interface ZoneConfig {
  id: string;
  name: string;
  conditions: string[];
  severity: number;
  isCustom?: boolean;
}

export interface SkinExperienceQuestionViewProps {
  isDark: boolean;
  primaryColor: string;
  currentAnswer?: string;
  onSelect: (val: string) => void;
  onContinue: () => void;
}

const DEFAULT_ZONES: { id: string; name: string; isCustom?: boolean }[] = [
  { id: 'forehead', name: 'Forehead' },
  { id: 'temples', name: 'Temples' },
  { id: 'nose', name: 'Nose' },
  { id: 'under_eye', name: 'Under-eye' },
  { id: 'cheeks', name: 'Cheeks' },
  { id: 'chin', name: 'Chin' },
  { id: 'jawline', name: 'Jawline' },
];

const DEFAULT_ZONE_CONDITIONS: Record<string, string[]> = {
  forehead: [
    'Active breakouts / pimples',
    'Excess oil & shine',
    'Flaky dry patches',
    'Hyperpigmentation',
  ],
  temples: [
    'Active pimples',
    'Dryness & peeling',
    'Subsurface texture',
  ],
  nose: [
    'Stubborn blackheads',
    'Enlarged visible pores',
    'Excess oiliness',
    'Redness around nostrils',
  ],
  under_eye: [
    'Puffy eyes',
    'Under-eye bags',
    'Dark circles',
    'Under-eye redness',
  ],
  cheeks: [
    'Redness & flushing',
    'Acne breakouts',
    'Dark spots / Melasma',
    'Enlarged pores',
  ],
  chin: [
    'Hormonal breakouts',
    'Deep painful cysts',
    'Post-acne marks',
    'Excess oil',
  ],
  jawline: [
    'Cystic acne',
    'Subsurface bumps',
    'Rough dry patches',
  ],
};

const DEFAULT_SEVERITY_LEVELS: { level: number; label: string }[] = [
  { level: 1, label: 'Minimal / Barely noticeable' },
  { level: 2, label: 'Just a bit / Mild' },
  { level: 3, label: 'Medium / Moderate' },
  { level: 4, label: 'Difficult / Strong' },
  { level: 5, label: 'Very severe' },
];

// ---------------------------------------------------------------------------
// SeveritySlider — Exact copy of the standard journal ScaleSliderQuestion slider
// ---------------------------------------------------------------------------
interface SeveritySliderProps {
  severity: number;
  maxScale: number;
  isDark: boolean;
  primaryColor: string;
  onSeverityChange: (lvl: number) => void;
}

function SeveritySlider({ severity, maxScale, isDark, primaryColor, onSeverityChange }: SeveritySliderProps) {
  const minVal = 1;
  const maxVal = maxScale;

  const [selectedValue, setSelectedValue] = useState(severity);
  const selectedValueRef = useRef(selectedValue);
  selectedValueRef.current = selectedValue;

  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);
  const trackViewRef = useRef<View>(null);

  // Sync when severity prop changes (switching zones)
  useEffect(() => {
    setSelectedValue(severity);
  }, [severity]);

  const THUMB_RADIUS = 19;

  const updateFromPosition = useCallback((pageX: number) => {
    const totalWidth = trackWidthRef.current;
    if (totalWidth <= THUMB_RADIUS * 2) return;
    const usableWidth = totalWidth - THUMB_RADIUS * 2;
    const relX = Math.max(0, Math.min(pageX - trackPageXRef.current - THUMB_RADIUS, usableWidth));
    const ratio = relX / usableWidth;
    const computedVal = Math.round(minVal + ratio * (maxVal - minVal));
    const clampedVal = Math.max(minVal, Math.min(maxVal, computedVal));
    if (clampedVal !== selectedValueRef.current) {
      setSelectedValue(clampedVal);
      onSeverityChange(clampedVal);
    }
  }, [minVal, maxVal, onSeverityChange]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        trackViewRef.current?.measure((_x, _y, width, _height, pageX) => {
          trackWidthRef.current = width;
          trackPageXRef.current = pageX;
          setTrackWidth(width);
          updateFromPosition(evt.nativeEvent.pageX);
        });
      },
      onPanResponderMove: (evt) => {
        updateFromPosition(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: (evt) => {
        updateFromPosition(evt.nativeEvent.pageX);
      },
    });
  }, [updateFromPosition]);

  const handleTrackLayout = useCallback((e: any) => {
    const w = e.nativeEvent.layout.width;
    trackWidthRef.current = w;
    setTrackWidth(w);
    trackViewRef.current?.measure((_x, _y, width, _height, pageX) => {
      trackWidthRef.current = width;
      trackPageXRef.current = pageX;
      setTrackWidth(width);
    });
  }, []);

  const percentage = maxVal === minVal ? 0 : ((selectedValue - minVal) / (maxVal - minVal)) * 100;
  const usableWidth = Math.max(0, trackWidth - THUMB_RADIUS * 2);
  const activeTrackWidth = (percentage / 100) * usableWidth;
  const thumbTranslateX = (percentage / 100) * usableWidth;

  return (
    <View style={sliderStyles.scaleContainer}>
      <View
        ref={trackViewRef}
        style={sliderStyles.sliderTrackWrapper}
        onLayout={handleTrackLayout}
        {...panResponder.panHandlers}
      >
        {/* Inactive Track */}
        <View
          style={[
            sliderStyles.sliderBaseTrack,
            {
              left: THUMB_RADIUS,
              right: THUMB_RADIUS,
              backgroundColor: isDark ? '#27272a' : '#e5e7eb',
            },
          ]}
        />
        {/* Active Filled Track */}
        <View
          style={[
            sliderStyles.sliderActiveTrack,
            {
              left: THUMB_RADIUS,
              width: activeTrackWidth,
              backgroundColor: primaryColor,
            },
          ]}
        />
        {/* Draggable Circle Thumb */}
        <View
          style={[
            sliderStyles.sliderThumb,
            {
              left: THUMB_RADIUS,
              transform: [{ translateX: thumbTranslateX }],
              backgroundColor: primaryColor,
              borderColor: '#ffffff',
            },
          ]}
        >
          <Text style={sliderStyles.sliderThumbText}>
            {selectedValue}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Slider styles — exact copy from JournalQuestionSheet ScaleSliderQuestion
const sliderStyles = StyleSheet.create({
  scaleContainer: {
    width: '100%',
    paddingTop: 0,
    marginTop: -4,
  },
  sliderTrackWrapper: {
    width: '100%',
    height: 38,
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 0,
  },
  sliderBaseTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
  },
  sliderActiveTrack: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 5,
  },
  sliderThumbText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default function SkinExperienceQuestionView({
  isDark,
  primaryColor,
  currentAnswer,
  onSelect,
  onContinue,
}: SkinExperienceQuestionViewProps) {
  // Parse initial answer if already stored
  const parsedInitial = useMemo<{ zones: ZoneConfig[]; maxSeverityScale: number }>(() => {
    if (!currentAnswer) return { zones: [], maxSeverityScale: 5 };
    try {
      const data = JSON.parse(currentAnswer);
      if (Array.isArray(data.zones)) {
        return {
          zones: data.zones,
          maxSeverityScale: data.maxSeverityScale || 5,
        };
      }
    } catch {
      // Not JSON
    }
    return { zones: [], maxSeverityScale: 5 };
  }, [currentAnswer]);

  const [selectedZones, setSelectedZones] = useState<ZoneConfig[]>(parsedInitial.zones);
  const [currentlySelectedZoneId, setCurrentlySelectedZoneId] = useState<string | null>(
    parsedInitial.zones.length > 0 ? parsedInitial.zones[0].id : null
  );
  const [customZones, setCustomZones] = useState<{ id: string; name: string; isCustom?: boolean }[]>(
    parsedInitial.zones.filter((z) => z.isCustom).map((z) => ({ id: z.id, name: z.name, isCustom: true }))
  );
  const [customConditionsByZone, setCustomConditionsByZone] = useState<Record<string, string[]>>({});
  const [maxSeverityScale, setMaxSeverityScale] = useState<number>(parsedInitial.maxSeverityScale || 5);

  // Modals with Android IME decoupled ref pattern
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const zoneDraftRef = useRef('');
  const [canAddZone, setCanAddZone] = useState(false);

  const zoneDraftCacheRef = useRef<Record<string, { conditions: string[]; severity: number }>>({});
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [scaleModalVisible, setScaleModalVisible] = useState(false);
  const [editingScaleLevel, setEditingScaleLevel] = useState<number>(6);
  const scaleDraftRef = useRef('');
  const [canAddScale, setCanAddScale] = useState(false);
  const [customScaleLabels, setCustomScaleLabels] = useState<Record<number, string>>({});
  const conditionDraftRef = useRef('');
  const [canAddCondition, setCanAddCondition] = useState(false);

  // Dropdown Action Menu State (Anchored at exact touch coordinates)
  const [actionMenu, setActionMenu] = useState<{
    visible: boolean;
    type: 'zone' | 'condition';
    id: string;
    name: string;
    parentZoneId?: string;
    anchorX: number;
    anchorY: number;
  }>({
    visible: false,
    type: 'zone',
    id: '',
    name: '',
    anchorX: 0,
    anchorY: 0,
  });

  // Edit Modal State
  const [editModal, setEditModal] = useState<{
    visible: boolean;
    type: 'zone' | 'condition';
    id: string;
    name: string;
    parentZoneId?: string;
  }>({
    visible: false,
    type: 'zone',
    id: '',
    name: '',
  });

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    type: 'zone' | 'condition';
    id: string;
    name: string;
    parentZoneId?: string;
  }>({
    visible: false,
    type: 'zone',
    id: '',
    name: '',
  });

  // Validation: Check if every selected zone has at least one condition added
  const [showIncompleteError, setShowIncompleteError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Combined zones list
  const allZones = useMemo(() => {
    return [...DEFAULT_ZONES, ...customZones];
  }, [customZones]);

  // Sync state upward to parent
  const emitState = useCallback((zones: ZoneConfig[], maxScale: number) => {
    const payload = JSON.stringify({
      zones,
      maxSeverityScale: maxScale,
      summary: zones.map((z) => `${z.name}: ${z.conditions.join(', ') || 'Reported'} (Severity: ${z.severity}/5)`).join('; '),
    });
    onSelect(payload);
  }, [onSelect]);

  // Remove / Deselect a zone completely (saving draft to cache first)
  const handleRemoveZone = useCallback((zoneId: string) => {
    const existing = selectedZones.find((z) => z.id === zoneId);
    if (existing) {
      zoneDraftCacheRef.current[zoneId] = {
        conditions: existing.conditions,
        severity: existing.severity,
      };
    }
    const updated = selectedZones.filter((z) => z.id !== zoneId);
    setSelectedZones(updated);
    if (currentlySelectedZoneId === zoneId) {
      setCurrentlySelectedZoneId(null);
    }
    emitState(updated, maxSeverityScale);
  }, [selectedZones, currentlySelectedZoneId, maxSeverityScale, emitState]);

  // Zone click handler:
  // - 1-tap on unselected -> selects & focuses it (restoring any cached draft)
  // - 1-tap on another selected zone -> immediately switches active focus to it (view/edit in 1 tap)
  // - 1-tap on currently active zone -> deselects it safely (caches draft so data is never lost)
  const handleZonePress = (zone: { id: string; name: string; isCustom?: boolean }) => {
    if (currentlySelectedZoneId === zone.id) {
      // Tapping the active zone again deselects it safely
      handleRemoveZone(zone.id);
    } else {
      const existing = selectedZones.find((z) => z.id === zone.id);
      if (existing) {
        // Already selected -> switch focus directly to it so user can view/edit in 1 tap
        setCurrentlySelectedZoneId(zone.id);
      } else {
        // Unselected -> restore cached draft if available, or initialize
        const cached = zoneDraftCacheRef.current[zone.id];
        const newZone: ZoneConfig = {
          id: zone.id,
          name: zone.name,
          conditions: cached ? cached.conditions : [],
          severity: cached ? cached.severity : 3,
          isCustom: zone.isCustom,
        };
        const updated = [...selectedZones, newZone];
        setSelectedZones(updated);
        setCurrentlySelectedZoneId(zone.id);
        emitState(updated, maxSeverityScale);
      }
    }
  };

  // Toggle condition for currently selected zone
  const toggleCondition = (cond: string) => {
    if (!currentlySelectedZoneId) return;

    const updated = selectedZones.map((z) => {
      if (z.id !== currentlySelectedZoneId) return z;
      const exists = z.conditions.includes(cond);
      return {
        ...z,
        conditions: exists ? z.conditions.filter((c) => c !== cond) : [...z.conditions, cond],
      };
    });

    setSelectedZones(updated);
    emitState(updated, maxSeverityScale);
  };

  // Set severity for currently selected zone
  const setSeverity = (lvl: number) => {
    if (!currentlySelectedZoneId) return;

    const updated = selectedZones.map((z) => {
      if (z.id !== currentlySelectedZoneId) return z;
      return { ...z, severity: lvl };
    });

    setSelectedZones(updated);
    emitState(updated, maxSeverityScale);
  };

  // Add Custom Zone
  const handleAddCustomZone = () => {
    const clean = zoneDraftRef.current.trim();
    if (!clean) return;

    const id = `custom_${Date.now()}`;
    const newCustom = { id, name: clean, isCustom: true };
    setCustomZones((prev) => [...prev, newCustom]);

    const newZoneConfig: ZoneConfig = {
      id,
      name: clean,
      conditions: [],
      severity: 3,
      isCustom: true,
    };
    const updated = [...selectedZones, newZoneConfig];
    setSelectedZones(updated);
    setCurrentlySelectedZoneId(id);
    emitState(updated, maxSeverityScale);

    zoneDraftRef.current = '';
    setCanAddZone(false);
    setZoneModalVisible(false);
  };

  // Add Custom Condition for currently active zone
  const handleAddCustomCondition = () => {
    const clean = conditionDraftRef.current.trim();
    if (!clean || !currentlySelectedZoneId) return;

    setCustomConditionsByZone((prev) => ({
      ...prev,
      [currentlySelectedZoneId]: [...(prev[currentlySelectedZoneId] || []), clean],
    }));

    // Auto-select the newly added condition
    toggleCondition(clean);

    conditionDraftRef.current = '';
    setCanAddCondition(false);
    setConditionModalVisible(false);
  };

  // Long-press trigger on custom pill with exact touch coordinates
  const handlePillLongPress = (
    type: 'zone' | 'condition',
    id: string,
    name: string,
    e: any,
    parentZoneId?: string
  ) => {
    const { pageX, pageY } = e.nativeEvent;
    setActionMenu({
      visible: true,
      type,
      id,
      name,
      parentZoneId,
      anchorX: pageX || 100,
      anchorY: pageY || 200,
    });
  };

  // Open Edit Modal from Action Menu
  const handleOpenEdit = () => {
    setEditModal({
      visible: true,
      type: actionMenu.type,
      id: actionMenu.id,
      name: actionMenu.name,
      parentZoneId: actionMenu.parentZoneId,
    });
  };

  // Open Delete Modal from Action Menu
  const handleOpenDelete = () => {
    setDeleteModal({
      visible: true,
      type: actionMenu.type,
      id: actionMenu.id,
      name: actionMenu.name,
      parentZoneId: actionMenu.parentZoneId,
    });
  };

  // Save Edit Changes (Invoked from SkinItemEditModal)
  const handleSaveEdit = (newName: string) => {
    if (editModal.type === 'zone') {
      const updatedCustom = customZones.map((z) =>
        z.id === editModal.id ? { ...z, name: newName } : z
      );
      setCustomZones(updatedCustom);

      const updatedSelected = selectedZones.map((z) =>
        z.id === editModal.id ? { ...z, name: newName } : z
      );
      setSelectedZones(updatedSelected);
      emitState(updatedSelected, maxSeverityScale);
    } else if (editModal.type === 'condition' && editModal.parentZoneId) {
      const pZone = editModal.parentZoneId;
      const oldName = editModal.name;

      setCustomConditionsByZone((prev) => ({
        ...prev,
        [pZone]: (prev[pZone] || []).map((c) => (c === oldName ? newName : c)),
      }));

      const updatedSelected = selectedZones.map((z) => {
        if (z.id !== pZone) return z;
        return {
          ...z,
          conditions: z.conditions.map((c) => (c === oldName ? newName : c)),
        };
      });
      setSelectedZones(updatedSelected);
      emitState(updatedSelected, maxSeverityScale);
    }

    setEditModal({ visible: false, type: 'zone', id: '', name: '' });
  };

  // Confirm Delete Item (Invoked from SkinItemDeleteModal)
  const handleConfirmDelete = () => {
    if (deleteModal.type === 'zone') {
      setCustomZones((prev) => prev.filter((z) => z.id !== deleteModal.id));
      const updatedSelected = selectedZones.filter((z) => z.id !== deleteModal.id);
      setSelectedZones(updatedSelected);
      if (currentlySelectedZoneId === deleteModal.id) {
        setCurrentlySelectedZoneId(null);
      }
      emitState(updatedSelected, maxSeverityScale);
    } else if (deleteModal.type === 'condition' && deleteModal.parentZoneId) {
      const pZone = deleteModal.parentZoneId;
      const condName = deleteModal.name;

      setCustomConditionsByZone((prev) => ({
        ...prev,
        [pZone]: (prev[pZone] || []).filter((c) => c !== condName),
      }));

      const updatedSelected = selectedZones.map((z) => {
        if (z.id !== pZone) return z;
        return {
          ...z,
          conditions: z.conditions.filter((c) => c !== condName),
        };
      });
      setSelectedZones(updatedSelected);
      emitState(updatedSelected, maxSeverityScale);
    }

    setDeleteModal({ visible: false, type: 'zone', id: '', name: '' });
  };

  // Save/Update Scale Level (1 to maxSeverityScale + 1)
  const handleSaveScaleLevel = () => {
    const clean = scaleDraftRef.current.trim();
    if (!clean) return;

    const newCustoms = {
      ...customScaleLabels,
      [editingScaleLevel]: clean,
    };
    setCustomScaleLabels(newCustoms);

    let newMax = maxSeverityScale;
    if (editingScaleLevel > maxSeverityScale) {
      newMax = editingScaleLevel;
      setMaxSeverityScale(newMax);
    }
    emitState(selectedZones, newMax);

    scaleDraftRef.current = '';
    setCanAddScale(false);
    setScaleModalVisible(false);
  };

  // Active zone object
  const activeZoneConfig = useMemo(() => {
    return selectedZones.find((z) => z.id === currentlySelectedZoneId);
  }, [selectedZones, currentlySelectedZoneId]);

  // Conditions list for active zone
  const activeZoneConditions = useMemo(() => {
    if (!currentlySelectedZoneId) return [];
    const defaults = DEFAULT_ZONE_CONDITIONS[currentlySelectedZoneId] || [];
    const customs = customConditionsByZone[currentlySelectedZoneId] || [];
    return [...defaults, ...customs];
  }, [currentlySelectedZoneId, customConditionsByZone]);

  // Severity levels array based on max scale and user-defined custom levels (1 to max)
  const severityLevels = useMemo(() => {
    const list: { level: number; label: string }[] = [];
    for (let lvl = 1; lvl <= maxSeverityScale; lvl++) {
      const defaultEntry = DEFAULT_SEVERITY_LEVELS.find((d) => d.level === lvl);
      const label = customScaleLabels[lvl] || defaultEntry?.label || (lvl === 6 ? 'Extreme flare-up' : `Level ${lvl} Severity`);
      list.push({ level: lvl, label });
    }
    return list;
  }, [maxSeverityScale, customScaleLabels]);

  // Mandatory: Continue is enabled ONLY if at least one zone is selected
  const hasSelectedZones = selectedZones.length > 0;

  const areAllSelectedZonesComplete = useMemo(() => {
    if (selectedZones.length === 0) return false;
    return selectedZones.every((z) => z.conditions && z.conditions.length > 0);
  }, [selectedZones]);

  useEffect(() => {
    if (areAllSelectedZonesComplete && showIncompleteError) {
      setShowIncompleteError(false);
    }
  }, [areAllSelectedZonesComplete, showIncompleteError]);

  const handleContinuePress = () => {
    if (!hasSelectedZones) return;

    const incompleteZone = selectedZones.find(
      (z) => !z.conditions || z.conditions.length === 0
    );

    if (incompleteZone) {
      setShowIncompleteError(true);
      triggerShake();
      if (currentlySelectedZoneId !== incompleteZone.id) {
        setCurrentlySelectedZoneId(incompleteZone.id);
      }
      return;
    }

    setShowIncompleteError(false);
    onContinue();
  };

  return (
    <View style={styles.container}>
      {/* Error Banner: Placed above the zone pills */}
      {showIncompleteError && (
        <Animated.View
          style={[
            styles.errorBannerWrap,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          <View style={styles.errorBannerPill}>
            <Text style={styles.errorBannerText} numberOfLines={2}>
              Add at least one detail to continue
            </Text>
          </View>
        </Animated.View>
      )}

      {/* 1. ZONE SELECTION PILLS */}
      <View style={styles.pillsWrap}>
        {allZones.map((zone) => {
          const isSelected = selectedZones.some((z) => z.id === zone.id);
          const isCurrentlySelected = currentlySelectedZoneId === zone.id;

          // 3 VISUAL STATES:
          // 1. Not Selected: Uplifted, default neutral background, no primary color, no border
          // 2. Selected: Uplifted, filled with primary color, NO border
          // 3. Currently Selected: Uplifted, filled with primary color, PURE WHITE border (2px)
          let bgColor = isDark ? '#18181b' : '#ffffff';
          let borderColor = isDark ? '#27272a' : '#e4e4e7';
          let borderWidth = 1;
          let textColor = isDark ? '#ffffff' : '#111827';

          if (isCurrentlySelected) {
            bgColor = primaryColor;
            borderColor = '#ffffff'; // Pure white border in both light and dark mode
            borderWidth = 2;
            textColor = '#ffffff';
          } else if (isSelected) {
            bgColor = primaryColor;
            borderColor = primaryColor; // No white border when just selected
            borderWidth = 1;
            textColor = '#ffffff';
          }

          return (
            <Pressable
              key={zone.id}
              onPress={() => handleZonePress(zone)}
              onLongPress={(e) => {
                if (zone.isCustom) {
                  handlePillLongPress('zone', zone.id, zone.name, e);
                }
              }}
              delayLongPress={280}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: bgColor,
                  borderColor,
                  borderWidth,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text style={[styles.pillText, { color: textColor }]}>
                {zone.name}
              </Text>
            </Pressable>
          );
        })}

        {/* + Add Custom Zone Pill */}
        <Pressable
          onPress={() => setZoneModalVisible(true)}
          style={({ pressed }) => [
            styles.pill,
            {
              backgroundColor: isDark ? '#1c1c20' : '#ffffff',
              borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.08)',
              borderWidth: 1,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Plus
            size={14}
            strokeWidth={3}
            color={isDark ? '#ffffff' : '#111827'}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.pillText, { color: isDark ? '#ffffff' : '#111827' }]}>
            Custom
          </Text>
        </Pressable>
      </View>

      {/* 2. DYNAMIC EXPANSION WHEN A ZONE IS "CURRENTLY SELECTED" — NO CARD */}
      {currentlySelectedZoneId && activeZoneConfig && (
        <View style={styles.expansionFlat}>
          {/* Active zone sub-header */}
          <View style={styles.expansionHeader}>
            <Text style={[styles.expansionZoneTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              {activeZoneConfig.name} Details
            </Text>
          </View>

          <View style={styles.pillsWrap}>
            {activeZoneConditions.map((cond) => {
              const isChecked = activeZoneConfig.conditions.includes(cond);
              const isCustomCond = (customConditionsByZone[currentlySelectedZoneId] || []).includes(cond);
              return (
                <Pressable
                  key={cond}
                  onPress={() => toggleCondition(cond)}
                  onLongPress={(e) => {
                    if (isCustomCond) {
                      handlePillLongPress('condition', cond, cond, e, currentlySelectedZoneId);
                    }
                  }}
                  delayLongPress={280}
                  style={({ pressed }) => [
                    styles.pill,
                    {
                      backgroundColor: isChecked ? primaryColor : (isDark ? '#1c1c20' : '#ffffff'),
                      borderWidth: 0,
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <Text style={[styles.pillText, { color: isChecked ? '#ffffff' : (isDark ? '#ffffff' : '#111827') }]}>
                    {cond}
                  </Text>
                </Pressable>
              );
            })}

            {/* + Add Custom Condition Pill */}
            <Pressable
              onPress={() => setConditionModalVisible(true)}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                  borderWidth: 0,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Plus
                size={14}
                strokeWidth={3}
                color={isDark ? '#ffffff' : '#111827'}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.pillText, { color: isDark ? '#ffffff' : '#111827' }]}>
                Condition
              </Text>
            </Pressable>
          </View>

          {/* Sub-Section B: Severity — Standard Journal Draggable Slider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[styles.severityLabelHeading, { color: isDark ? '#ffffff' : '#111827', marginBottom: 0 }]}>
              Severity:
            </Text>
            <Pressable
              onPress={() => {
                // If the user's slider is on the maximum scale level, open to the next level (to add new scale)
                // Otherwise open directly to the currently selected slider level
                const targetLvl = activeZoneConfig.severity >= maxSeverityScale
                  ? maxSeverityScale + 1
                  : activeZoneConfig.severity;

                setEditingScaleLevel(targetLvl);
                const existingVal = customScaleLabels[targetLvl] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === targetLvl)?.label || '';
                scaleDraftRef.current = existingVal;
                setCanAddScale(false); // Clean initial state -> Save disabled until text is altered!
                setScaleModalVisible(true);
              }}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                  borderWidth: 0,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Plus
                size={14}
                strokeWidth={3}
                color={isDark ? '#ffffff' : '#111827'}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.pillText, { color: isDark ? '#ffffff' : '#111827' }]}>
                Custom
              </Text>
            </Pressable>
          </View>

          <SeveritySlider
            severity={activeZoneConfig.severity}
            maxScale={maxSeverityScale}
            isDark={isDark}
            primaryColor={primaryColor}
            onSeverityChange={setSeverity}
          />

          {/* Uplifted Step Label Card (matches standard journal scale) */}
          <View
            style={[
              styles.scaleUpliftedCard,
              {
                backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                borderColor: isDark ? '#2b2b30' : '#e5e7eb',
              },
            ]}
          >
            <Text
              style={[
                styles.scaleStepLabelText,
                { textAlign: 'center' },
                { color: isDark ? '#ffffff' : '#111827' },
              ]}
            >
              {`"${severityLevels.find((l) => l.level === activeZoneConfig.severity)?.label || 'No description'}"`}
            </Text>
          </View>
        </View>
      )}

      {/* 3. CONTINUE BUTTON */}
      <View style={styles.continueBtnWrapper}>
        <Pressable
          onPress={handleContinuePress}
          disabled={!hasSelectedZones}
          style={({ pressed }) => [
            styles.continueBtn,
            {
              backgroundColor: !hasSelectedZones
                ? (isDark ? '#27272a' : '#e5e7eb')
                : (pressed ? '#a98fcc' : primaryColor),
            },
          ]}
        >
          <Text style={[styles.continueBtnText, !hasSelectedZones && { color: isDark ? '#71717a' : '#9ca3af' }]}>
            Continue
          </Text>
        </Pressable>
      </View>

      {/* 4. MODAL: ADD CUSTOM ZONE (Matches RenameChatModal layout) */}
      <Modal
        visible={zoneModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setZoneModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setZoneModalVisible(false)}>
          <Pressable
            style={[
              styles.modalCard,
              isDark ? styles.modalCardDark : styles.modalCardLight,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
              Add Custom Face Zone
            </Text>

            <View
              style={[
                styles.inputCard,
                isDark ? styles.inputCardDark : styles.inputCardLight,
              ]}
            >
              <TextInput
                key={zoneModalVisible ? 'zone-input-open' : 'zone-input-closed'}
                style={[
                  styles.modalInput,
                  isDark ? styles.inputTextDark : styles.inputTextLight,
                ]}
                defaultValue=""
                onChangeText={(text) => {
                  zoneDraftRef.current = text;
                  const hasContent = text.trim().length > 0;
                  if (hasContent !== canAddZone) {
                    setCanAddZone(hasContent);
                  }
                }}
                maxLength={40}
                multiline={false}
                numberOfLines={1}
                placeholder="e.g. Between lips & nose, Neck..."
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  zoneDraftRef.current = '';
                  setCanAddZone(false);
                  setZoneModalVisible(false);
                }}
                style={[
                  styles.modalActionBtn,
                  isDark ? styles.cancelBtnDark : styles.cancelBtnLight,
                ]}
              >
                <Text style={[styles.btnText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleAddCustomZone}
                disabled={!canAddZone}
                style={[
                  styles.modalActionBtn,
                  {
                    backgroundColor: !canAddZone
                      ? isDark ? '#27272a' : '#e5e7eb'
                      : primaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: !canAddZone
                        ? isDark ? '#71717a' : '#9ca3af'
                        : '#ffffff',
                    },
                  ]}
                >
                  Add Zone
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 5. MODAL: ADD CUSTOM CONDITION */}
      <Modal
        visible={conditionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          conditionDraftRef.current = '';
          setCanAddCondition(false);
          setConditionModalVisible(false);
        }}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            conditionDraftRef.current = '';
            setCanAddCondition(false);
            setConditionModalVisible(false);
          }}
        >
          <Pressable
            style={[
              styles.modalCard,
              isDark ? styles.modalCardDark : styles.modalCardLight,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
              Add Custom Skin Condition
            </Text>

            <View
              style={[
                styles.inputCard,
                isDark ? styles.inputCardDark : styles.inputCardLight,
              ]}
            >
              <TextInput
                key={conditionModalVisible ? 'cond-input-open' : 'cond-input-closed'}
                style={[
                  styles.modalInput,
                  isDark ? styles.inputTextDark : styles.inputTextLight,
                ]}
                defaultValue=""
                onChangeText={(text) => {
                  conditionDraftRef.current = text;
                  const hasContent = text.trim().length > 0;
                  if (hasContent !== canAddCondition) {
                    setCanAddCondition(hasContent);
                  }
                }}
                maxLength={40}
                multiline={false}
                numberOfLines={1}
                placeholder="e.g. Deep cystic bump, Whiteheads..."
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  conditionDraftRef.current = '';
                  setCanAddCondition(false);
                  setConditionModalVisible(false);
                }}
                style={[
                  styles.modalActionBtn,
                  isDark ? styles.cancelBtnDark : styles.cancelBtnLight,
                ]}
              >
                <Text style={[styles.btnText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleAddCustomCondition}
                disabled={!canAddCondition}
                style={[
                  styles.modalActionBtn,
                  {
                    backgroundColor: !canAddCondition
                      ? isDark ? '#27272a' : '#e5e7eb'
                      : primaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: !canAddCondition
                        ? isDark ? '#71717a' : '#9ca3af'
                        : '#ffffff',
                    },
                  ]}
                >
                  Add Condition
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 6. MODAL: EDIT / ADD SCALE LEVEL WITH CIRCULAR CHEVRONS */}
      <Modal
        visible={scaleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          scaleDraftRef.current = '';
          setCanAddScale(false);
          setScaleModalVisible(false);
        }}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            scaleDraftRef.current = '';
            setCanAddScale(false);
            setScaleModalVisible(false);
          }}
        >
          <Pressable
            style={[
              styles.modalCard,
              isDark ? styles.modalCardDark : styles.modalCardLight,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with circular left/right chevrons */}
            <View style={styles.scaleNavHeaderRow}>
              <Pressable
                disabled={editingScaleLevel <= 1}
                onPress={() => {
                  const prevLvl = editingScaleLevel - 1;
                  setEditingScaleLevel(prevLvl);
                  const existingVal = customScaleLabels[prevLvl] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === prevLvl)?.label || '';
                  scaleDraftRef.current = existingVal;
                  setCanAddScale(false); // Default texts are unchanged -> Save button disabled!
                }}
                style={({ pressed }) => [
                  styles.chevronCircleBtn,
                  {
                    backgroundColor: isDark ? '#27272a' : '#ffffff',
                    borderColor: isDark ? '#3f3f46' : '#d1d5db',
                    borderWidth: 1.5,
                    opacity: editingScaleLevel <= 1 ? 0.35 : (pressed ? 0.7 : 1),
                  },
                ]}
              >
                <ChevronLeft size={16} strokeWidth={2.2} color={isDark ? '#ffffff' : '#1f2937'} />
              </Pressable>

              <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight, { marginBottom: 0 }]}>
                Scale Number {editingScaleLevel}
              </Text>

              <Pressable
                disabled={editingScaleLevel >= maxSeverityScale + 1}
                onPress={() => {
                  const nextLvl = editingScaleLevel + 1;
                  setEditingScaleLevel(nextLvl);
                  const existingVal = customScaleLabels[nextLvl] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === nextLvl)?.label || '';
                  scaleDraftRef.current = existingVal;
                  setCanAddScale(false); // Default texts are unchanged -> Save button disabled!
                }}
                style={({ pressed }) => [
                  styles.chevronCircleBtn,
                  {
                    backgroundColor: isDark ? '#27272a' : '#ffffff',
                    borderColor: isDark ? '#3f3f46' : '#d1d5db',
                    borderWidth: 1.5,
                    opacity: editingScaleLevel >= maxSeverityScale + 1 ? 0.35 : (pressed ? 0.7 : 1),
                  },
                ]}
              >
                <ChevronRight size={16} strokeWidth={2.2} color={isDark ? '#ffffff' : '#1f2937'} />
              </Pressable>
            </View>

            <View
              style={[
                styles.inputCard,
                isDark ? styles.inputCardDark : styles.inputCardLight,
                { marginTop: 14 },
              ]}
            >
              <TextInput
                key={`scale-input-${editingScaleLevel}-${scaleModalVisible ? 'open' : 'closed'}`}
                style={[
                  styles.modalInput,
                  isDark ? styles.inputTextDark : styles.inputTextLight,
                ]}
                defaultValue={customScaleLabels[editingScaleLevel] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === editingScaleLevel)?.label || ''}
                multiline={false}
                numberOfLines={1}
                onChangeText={(text) => {
                  scaleDraftRef.current = text;
                  const curVal = (customScaleLabels[editingScaleLevel] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === editingScaleLevel)?.label || '').trim();
                  const clean = text.trim();
                  const isChangedAndValid = clean.length > 0 && clean !== curVal;
                  if (isChangedAndValid !== canAddScale) {
                    setCanAddScale(isChangedAndValid);
                  }
                }}
                maxLength={40}
                placeholder="Enter scale input..."
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  scaleDraftRef.current = '';
                  setCanAddScale(false);
                  setScaleModalVisible(false);
                }}
                style={[
                  styles.modalActionBtn,
                  isDark ? styles.cancelBtnDark : styles.cancelBtnLight,
                ]}
              >
                <Text style={[styles.btnText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveScaleLevel}
                disabled={!canAddScale}
                style={[
                  styles.modalActionBtn,
                  {
                    backgroundColor: !canAddScale
                      ? isDark ? '#27272a' : '#e5e7eb'
                      : primaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: !canAddScale
                        ? isDark ? '#71717a' : '#9ca3af'
                        : '#ffffff',
                    },
                  ]}
                >
                  {editingScaleLevel > maxSeverityScale ? 'Add Scale' : 'Save Scale'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Action Menu (Edit / Delete) positioned at exact touch coordinates */}
      <SkinItemActionMenu
        visible={actionMenu.visible}
        isDark={isDark}
        anchorX={actionMenu.anchorX}
        anchorY={actionMenu.anchorY}
        onClose={() => setActionMenu((prev) => ({ ...prev, visible: false }))}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Edit Item Modal */}
      <SkinItemEditModal
        visible={editModal.visible}
        isDark={isDark}
        primaryColor={primaryColor}
        itemType={editModal.type}
        initialValue={editModal.name}
        onCancel={() => setEditModal((prev) => ({ ...prev, visible: false }))}
        onSave={handleSaveEdit}
      />

      {/* Delete Item Modal */}
      <SkinItemDeleteModal
        visible={deleteModal.visible}
        isDark={isDark}
        itemType={deleteModal.type}
        itemName={deleteModal.name}
        onCancel={() => setDeleteModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    marginTop: -8,
    paddingBottom: 0,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
  },
  errorBannerWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  errorBannerPill: {
    backgroundColor: '#e03131',
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 9,
    shadowColor: '#e03131',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    alignSelf: 'center',
  },
  errorBannerText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 19,
    flexShrink: 0,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  expansionFlat: {
    marginBottom: 8,
  },
  expansionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expansionZoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
  },
  severityLabelHeading: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
    marginBottom: 8,
  },
  scaleUpliftedCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 14,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  scaleStepLabelText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  continueBtnWrapper: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 4,
  },
  continueBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 100,
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // Modal layout
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalCardLight: {
    backgroundColor: '#FAF8F6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalCardDark: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
  inputCard: {
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 16,
  },
  inputCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  inputCardDark: {
    backgroundColor: '#1c1c20',
    borderColor: '#2b2b30',
  },
  modalInput: {
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputTextLight: {
    color: '#111827',
  },
  inputTextDark: {
    color: '#ffffff',
  },
  scaleNavHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  chevronCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cancelBtnLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtnDark: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
