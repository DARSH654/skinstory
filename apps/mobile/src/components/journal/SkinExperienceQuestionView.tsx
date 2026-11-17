import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text } from '@/components/AppText';
import { Plus } from 'lucide-react-native';
import SkinItemActionMenu from '@/components/journal/SkinItemActionMenu';
import SkinItemEditModal from '@/components/journal/SkinItemEditModal';
import SkinItemDeleteModal from '@/components/journal/SkinItemDeleteModal';
import {
  validateCustomSkinCondition,
  validateCustomSkinZone,
  validateCustomSkinSeverity,
} from '@/services/stage2AiIngestionWorker';

import {
  ZoneConfig,
  SkinExperienceQuestionViewProps,
  ClarificationModalState,
  INITIAL_CLARIFICATION_MODAL,
  DEFAULT_ZONES,
  DEFAULT_ZONE_CONDITIONS,
  DEFAULT_SEVERITY_LEVELS,
} from './skinExperience/types';
import SeveritySlider from './skinExperience/SeveritySlider';
import AddCustomZoneModal from './skinExperience/AddCustomZoneModal';
import AddCustomConditionModal from './skinExperience/AddCustomConditionModal';
import ClarificationModal from './skinExperience/ClarificationModal';
import CustomScaleModal from './skinExperience/CustomScaleModal';

export type { ZoneConfig, SkinExperienceQuestionViewProps } from './skinExperience/types';

export default function SkinExperienceQuestionView({
  isDark,
  primaryColor,
  currentAnswer,
  onSelect,
  onContinue,
}: SkinExperienceQuestionViewProps) {
  // Parse initial answer if already stored
  const parsedInitial = useMemo<{
    zones: ZoneConfig[];
    maxSeverityScale: number;
    customScaleLabels: Record<number, string>;
    customConditionsByZone: Record<string, string[]>;
    customZones: { id: string; name: string; isCustom?: boolean }[];
  }>(() => {
    if (!currentAnswer) {
      return {
        zones: [],
        maxSeverityScale: 5,
        customScaleLabels: {},
        customConditionsByZone: {},
        customZones: [],
      };
    }
    try {
      const data = JSON.parse(currentAnswer);
      const zones: ZoneConfig[] = Array.isArray(data.zones) ? data.zones : (Array.isArray(data) ? data : []);
      const maxSeverityScale = data.maxSeverityScale || 5;
      const customScaleLabels = data.customScaleLabels || {};

      // 1. Reconstruct customZones from both data.customZones and zones with isCustom: true
      const explicitCustomZones: { id: string; name: string; isCustom?: boolean }[] = Array.isArray(data.customZones) ? data.customZones : [];
      const fromZones: { id: string; name: string; isCustom?: boolean }[] = zones.filter((z) => z.isCustom).map((z) => ({ id: z.id, name: z.name, isCustom: true }));
      const customZonesMap = new Map<string, { id: string; name: string; isCustom?: boolean }>();
      [...explicitCustomZones, ...fromZones].forEach((item) => customZonesMap.set(item.id, item));
      const customZones = Array.from(customZonesMap.values());

      // 2. Reconstruct customConditionsByZone from both data.customConditionsByZone and all non-default conditions in zones
      const explicitConditionsMap: Record<string, string[]> = data.customConditionsByZone || {};
      const reconstructedConditionsMap: Record<string, string[]> = { ...explicitConditionsMap };

      zones.forEach((z) => {
        if (Array.isArray(z.conditions) && z.conditions.length > 0) {
          const defaults = DEFAULT_ZONE_CONDITIONS[z.id] || [];
          const customs = z.conditions.filter((c) => !defaults.includes(c));
          if (customs.length > 0) {
            const existing = reconstructedConditionsMap[z.id] || [];
            reconstructedConditionsMap[z.id] = Array.from(new Set([...existing, ...customs]));
          }
        }
      });

      return {
        zones,
        maxSeverityScale,
        customScaleLabels,
        customConditionsByZone: reconstructedConditionsMap,
        customZones,
      };
    } catch {
      // Not JSON
    }
    return {
      zones: [],
      maxSeverityScale: 5,
      customScaleLabels: {},
      customConditionsByZone: {},
      customZones: [],
    };
  }, [currentAnswer]);

  const [selectedZones, setSelectedZones] = useState<ZoneConfig[]>(parsedInitial.zones);
  const [currentlySelectedZoneId, setCurrentlySelectedZoneId] = useState<string | null>(
    parsedInitial.zones.length > 0 ? parsedInitial.zones[0].id : null
  );
  const [customZones, setCustomZones] = useState<{ id: string; name: string; isCustom?: boolean }[]>(parsedInitial.customZones);
  const [customConditionsByZone, setCustomConditionsByZone] = useState<Record<string, string[]>>(parsedInitial.customConditionsByZone);
  const [maxSeverityScale, setMaxSeverityScale] = useState<number>(parsedInitial.maxSeverityScale || 5);
  const [customScaleLabels, setCustomScaleLabels] = useState<Record<number, string>>(parsedInitial.customScaleLabels || {});

  // Synchronize state when question sheet navigates back / currentAnswer is re-hydrated
  useEffect(() => {
    if (parsedInitial.zones.length > 0) {
      setSelectedZones(parsedInitial.zones);
      setCurrentlySelectedZoneId((prev) => {
        if (prev && parsedInitial.zones.some((z) => z.id === prev)) return prev;
        return parsedInitial.zones[0]?.id || null;
      });
    }
    if (parsedInitial.customZones.length > 0) {
      setCustomZones(parsedInitial.customZones);
    }
    if (Object.keys(parsedInitial.customConditionsByZone).length > 0) {
      setCustomConditionsByZone((prev) => ({
        ...prev,
        ...parsedInitial.customConditionsByZone,
      }));
    }
    if (Object.keys(parsedInitial.customScaleLabels).length > 0) {
      setCustomScaleLabels((prev) => ({
        ...prev,
        ...parsedInitial.customScaleLabels,
      }));
    }
    if (parsedInitial.maxSeverityScale) {
      setMaxSeverityScale(parsedInitial.maxSeverityScale);
    }
  }, [parsedInitial]);

  // Modal visibility states
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [zoneRetryState, setZoneRetryState] = useState<{ isRetry: boolean; attemptCount: number }>({ isRetry: false, attemptCount: 0 });
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [conditionRetryState, setConditionRetryState] = useState<{ isRetry: boolean; attemptCount: number }>({ isRetry: false, attemptCount: 0 });
  const [scaleModalVisible, setScaleModalVisible] = useState(false);
  const [scaleRetryState, setScaleRetryState] = useState<{ isRetry: boolean; attemptCount: number }>({ isRetry: false, attemptCount: 0 });
  const [editingScaleLevel, setEditingScaleLevel] = useState<number>(6);

  const zoneDraftCacheRef = useRef<Record<string, { conditions: string[]; severity: number }>>({});

  // AI Validation & Clarification Modal State
  const [isValidatingCondition, setIsValidatingCondition] = useState(false);
  const [clarificationModal, setClarificationModal] = useState<ClarificationModalState>(INITIAL_CLARIFICATION_MODAL);

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
  const [editRetryState, setEditRetryState] = useState<{ isRetry: boolean; attemptCount: number }>({ isRetry: false, attemptCount: 0 });

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
  const emitState = useCallback((
    zones: ZoneConfig[],
    maxScale: number,
    labelsOverride?: Record<number, string>,
    conditionsMapOverride?: Record<string, string[]>,
    customZonesOverride?: { id: string; name: string; isCustom?: boolean }[]
  ) => {
    const labels = labelsOverride !== undefined ? labelsOverride : customScaleLabels;
    const customsMap = conditionsMapOverride !== undefined ? conditionsMapOverride : customConditionsByZone;
    const cZones = customZonesOverride !== undefined ? customZonesOverride : customZones;

    const payload = JSON.stringify({
      zones,
      customZones: cZones,
      customConditionsByZone: customsMap,
      customScaleLabels: labels,
      maxSeverityScale: maxScale,
      summary: zones.map((z) => `${z.name}: ${z.conditions.join(', ') || 'Reported'} (Severity: ${z.severity}/${maxScale})`).join('; '),
    });
    onSelect(payload);
  }, [onSelect, customScaleLabels, customConditionsByZone, customZones]);

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

  // Zone click handler
  const handleZonePress = (zone: { id: string; name: string; isCustom?: boolean }) => {
    if (currentlySelectedZoneId === zone.id) {
      handleRemoveZone(zone.id);
    } else {
      const existing = selectedZones.find((z) => z.id === zone.id);
      if (existing) {
        setCurrentlySelectedZoneId(zone.id);
      } else {
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
  const toggleCondition = (cond: string, conditionsMapOverride?: Record<string, string[]>) => {
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
    emitState(updated, maxSeverityScale, undefined, conditionsMapOverride);
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

  // Add Custom Zone with AI validation
  const handleAddCustomZone = async (cleanName: string) => {
    const clean = cleanName.trim();
    if (!clean) return;

    console.log(`[SKIN_ZONE_AI] 🚀 [UI] Submitting custom zone: "${clean}" (attempt: ${zoneRetryState.attemptCount + 1})`);
    setIsValidatingCondition(true);

    try {
      const result = await validateCustomSkinZone(clean);
      console.log(`[SKIN_ZONE_AI] 🎯 [UI] Worker returned:`, JSON.stringify(result));

      if (result.isValid) {
        const id = `custom_${Date.now()}`;
        const newCustom = { id, name: clean, isCustom: true };
        const updatedCustomZones = [...customZones, newCustom];
        setCustomZones(updatedCustomZones);

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
        emitState(updated, maxSeverityScale, undefined, undefined, updatedCustomZones);
        setZoneRetryState({ isRetry: false, attemptCount: 0 });
        setZoneModalVisible(false);
      } else if (result.isNetworkError && zoneRetryState.attemptCount < 2) {
        // Network / 503 error on Attempt 1 or 2: Keep modal open, show Try Again
        console.warn(`[SKIN_ZONE_AI] ⚠️ Network error on attempt ${zoneRetryState.attemptCount + 1}. Prompting user to Try Again.`);
        setZoneRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
      } else {
        // Legitimate invalid input OR 3rd failed attempt: Show clarification modal with suggestions
        setZoneRetryState({ isRetry: false, attemptCount: 0 });
        setZoneModalVisible(false);
        setClarificationModal({
          visible: true,
          type: 'zone',
          title: "We couldn't recognize this skin zone",
          userInput: clean,
          suggestions: result.suggestions || ['Neck', 'Chest', 'Hands'],
          selectedSuggestion: null,
          targetZoneId: null,
          replaceOldCondition: null,
        });
      }
    } catch {
      if (zoneRetryState.attemptCount < 2) {
        setZoneRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
      } else {
        setZoneRetryState({ isRetry: false, attemptCount: 0 });
        setZoneModalVisible(false);
        setClarificationModal({
          visible: true,
          type: 'zone',
          title: "We couldn't recognize this skin zone",
          userInput: clean,
          suggestions: ['Neck', 'Chest', 'Hands'],
          selectedSuggestion: null,
          targetZoneId: null,
          replaceOldCondition: null,
        });
      }
    } finally {
      setIsValidatingCondition(false);
    }
  };

  // Add Custom Condition for currently active zone with AI validation
  const handleAddCustomCondition = async (cleanCondition: string) => {
    const clean = cleanCondition.trim();
    if (!clean || !currentlySelectedZoneId) return;

    const activeZone = allZones.find((z) => z.id === currentlySelectedZoneId);
    const zoneName = activeZone?.name || 'Skin Zone';

    console.log(`[SKIN_CONDITION_AI] 🚀 [UI] User submitted condition: "${clean}" for zone: "${zoneName}" (attempt: ${conditionRetryState.attemptCount + 1})`);
    setIsValidatingCondition(true);

    try {
      const result = await validateCustomSkinCondition(clean, zoneName);
      console.log(`[SKIN_CONDITION_AI] 🎯 [UI] Worker returned:`, JSON.stringify(result));

      if (result.isValid) {
        const finalConditionName = clean;
        console.log(`[SKIN_CONDITION_AI] ✅ [UI] Adding valid condition: "${finalConditionName}"`);

        const updatedConditionsMap = {
          ...customConditionsByZone,
          [currentlySelectedZoneId]: [...(customConditionsByZone[currentlySelectedZoneId] || []), finalConditionName],
        };
        setCustomConditionsByZone(updatedConditionsMap);

        toggleCondition(finalConditionName, updatedConditionsMap);
        setConditionRetryState({ isRetry: false, attemptCount: 0 });
        setConditionModalVisible(false);
      } else if (result.isNetworkError && conditionRetryState.attemptCount < 2) {
        // Network / 503 error on Attempt 1 or 2: Keep modal open, show Try Again
        console.warn(`[SKIN_CONDITION_AI] ⚠️ Network error on attempt ${conditionRetryState.attemptCount + 1}. Prompting user to Try Again.`);
        setConditionRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
      } else {
        // Legitimate invalid input OR 3rd failed attempt: Show clarification modal with suggestions
        setConditionRetryState({ isRetry: false, attemptCount: 0 });
        setConditionModalVisible(false);
        setClarificationModal({
          visible: true,
          type: 'condition',
          title: "We couldn't recognize this condition",
          userInput: clean,
          suggestions: result.suggestions || ['Acne / Breakout', 'Dryness / Flaking', 'Redness / Irritation'],
          selectedSuggestion: null,
          targetZoneId: currentlySelectedZoneId,
          replaceOldCondition: null,
        });
      }
    } catch (e: any) {
      console.error(`[SKIN_CONDITION_AI] 💥 [UI] Exception in handleAddCustomCondition:`, e);
      if (conditionRetryState.attemptCount < 2) {
        setConditionRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
      } else {
        setConditionRetryState({ isRetry: false, attemptCount: 0 });
        setConditionModalVisible(false);
        setClarificationModal({
          visible: true,
          type: 'condition',
          title: "We couldn't recognize this condition",
          userInput: clean,
          suggestions: ['Acne / Breakout', 'Dryness / Flaking', 'Redness / Irritation'],
          selectedSuggestion: null,
          targetZoneId: currentlySelectedZoneId,
          replaceOldCondition: null,
        });
      }
    } finally {
      setIsValidatingCondition(false);
    }
  };

  // Clarification modal: user selected a suggested condition/zone/severity and pressed Continue
  const handleClarificationContinue = async () => {
    const selected = clarificationModal.selectedSuggestion;
    if (!selected) return;

    if (clarificationModal.type === 'zone') {
      console.log(`[SKIN_ZONE_AI] ✅ [UI] Clarification zone chosen: "${selected}"`);

      if (clarificationModal.replaceOldZoneId) {
        const zoneId = clarificationModal.replaceOldZoneId;
        const updatedCustomZones = customZones.map((z) =>
          z.id === zoneId ? { ...z, name: selected } : z
        );
        setCustomZones(updatedCustomZones);

        const updatedSelected = selectedZones.map((z) =>
          z.id === zoneId ? { ...z, name: selected } : z
        );
        setSelectedZones(updatedSelected);
        emitState(updatedSelected, maxSeverityScale, undefined, undefined, updatedCustomZones);

        setClarificationModal(INITIAL_CLARIFICATION_MODAL);
        return;
      }

      const id = `custom_${Date.now()}`;
      const newCustom = { id, name: selected, isCustom: true };
      const updatedCustomZones = [...customZones, newCustom];
      setCustomZones(updatedCustomZones);

      const newZoneConfig: ZoneConfig = {
        id,
        name: selected,
        conditions: [],
        severity: 3,
        isCustom: true,
      };
      const updated = [...selectedZones, newZoneConfig];
      setSelectedZones(updated);
      setCurrentlySelectedZoneId(id);
      emitState(updated, maxSeverityScale, undefined, undefined, updatedCustomZones);

      setClarificationModal(INITIAL_CLARIFICATION_MODAL);
      return;
    }

    if (clarificationModal.type === 'severity') {
      const lvl = clarificationModal.scaleLevel || 6;
      console.log(`[SKIN_SEVERITY_AI] ✅ [UI] Clarification severity chosen: "${selected}" for level ${lvl}`);
      const newCustoms = {
        ...customScaleLabels,
        [lvl]: selected,
      };
      setCustomScaleLabels(newCustoms);

      let newMax = maxSeverityScale;
      if (lvl > maxSeverityScale) {
        newMax = lvl;
        setMaxSeverityScale(newMax);
      }
      emitState(selectedZones, newMax, newCustoms);

      setClarificationModal(INITIAL_CLARIFICATION_MODAL);
      return;
    }

    // Condition flow
    const targetZone = clarificationModal.targetZoneId || currentlySelectedZoneId;
    if (!targetZone) return;

    const activeZone = allZones.find((z) => z.id === targetZone);
    const zoneName = activeZone?.name || 'Skin Zone';
    const oldCond = clarificationModal.replaceOldCondition;

    console.log(`[SKIN_CONDITION_AI] 🔄 [UI] Clarification chosen: "${selected}" for zone: "${zoneName}" (replace: ${oldCond || 'none'})`);
    setIsValidatingCondition(true);

    try {
      const result = await validateCustomSkinCondition(selected, zoneName);
      const finalName = result.isValid && result.resolvedName ? result.resolvedName : selected;
      console.log(`[SKIN_CONDITION_AI] ✅ [UI] Clarification verified: "${finalName}"`);

      if (oldCond) {
        const updatedCustomConditions = {
          ...customConditionsByZone,
          [targetZone]: (customConditionsByZone[targetZone] || []).map((c) => (c === oldCond ? finalName : c)),
        };
        setCustomConditionsByZone(updatedCustomConditions);

        const updatedSelected = selectedZones.map((z) => {
          if (z.id !== targetZone) return z;
          return {
            ...z,
            conditions: z.conditions.map((c) => (c === oldCond ? finalName : c)),
          };
        });
        setSelectedZones(updatedSelected);
        emitState(updatedSelected, maxSeverityScale, undefined, updatedCustomConditions);
      } else {
        const updatedCustomConditions = {
          ...customConditionsByZone,
          [targetZone]: [...(customConditionsByZone[targetZone] || []), finalName],
        };
        setCustomConditionsByZone(updatedCustomConditions);

        toggleCondition(finalName, updatedCustomConditions);
      }
    } catch {
      const oldCondFallback = clarificationModal.replaceOldCondition;
      if (oldCondFallback) {
        const updatedCustomConditions = {
          ...customConditionsByZone,
          [targetZone]: (customConditionsByZone[targetZone] || []).map((c) => (c === oldCondFallback ? selected : c)),
        };
        setCustomConditionsByZone(updatedCustomConditions);

        const updatedSelected = selectedZones.map((z) => {
          if (z.id !== targetZone) return z;
          return {
            ...z,
            conditions: z.conditions.map((c) => (c === oldCondFallback ? selected : c)),
          };
        });
        setSelectedZones(updatedSelected);
        emitState(updatedSelected, maxSeverityScale, undefined, updatedCustomConditions);
      } else {
        const updatedCustomConditions = {
          ...customConditionsByZone,
          [targetZone]: [...(customConditionsByZone[targetZone] || []), selected],
        };
        setCustomConditionsByZone(updatedCustomConditions);

        toggleCondition(selected, updatedCustomConditions);
      }
    } finally {
      setIsValidatingCondition(false);
      setClarificationModal(INITIAL_CLARIFICATION_MODAL);
    }
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
  const handleSaveEdit = async (newName: string) => {
    if (editModal.type === 'zone') {
      const clean = newName.trim();
      if (!clean || clean === editModal.name.trim()) {
        setEditRetryState({ isRetry: false, attemptCount: 0 });
        setEditModal({ visible: false, type: 'zone', id: '', name: '' });
        return;
      }

      const zoneId = editModal.id;
      console.log(`[SKIN_ZONE_AI] 🚀 [UI] Submitting edited zone: "${clean}" (attempt: ${editRetryState.attemptCount + 1})`);
      setIsValidatingCondition(true);

      try {
        const result = await validateCustomSkinZone(clean);
        console.log(`[SKIN_ZONE_AI] 🎯 [UI] Worker returned:`, JSON.stringify(result));

        if (result.isValid) {
          const finalName = clean;
          const updatedCustomZones = customZones.map((z) =>
            z.id === zoneId ? { ...z, name: finalName } : z
          );
          setCustomZones(updatedCustomZones);

          const updatedSelected = selectedZones.map((z) =>
            z.id === zoneId ? { ...z, name: finalName } : z
          );
          setSelectedZones(updatedSelected);
          emitState(updatedSelected, maxSeverityScale, undefined, undefined, updatedCustomZones);
          setEditRetryState({ isRetry: false, attemptCount: 0 });
          setEditModal({ visible: false, type: 'zone', id: '', name: '' });
        } else if (result.isNetworkError && editRetryState.attemptCount < 2) {
          setEditRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
        } else {
          setEditRetryState({ isRetry: false, attemptCount: 0 });
          setEditModal({ visible: false, type: 'zone', id: '', name: '' });
          setClarificationModal({
            visible: true,
            type: 'zone',
            title: "We couldn't recognize this skin zone",
            userInput: clean,
            suggestions: result.suggestions || ['Neck', 'Chest', 'Hands'],
            selectedSuggestion: null,
            targetZoneId: null,
            replaceOldCondition: null,
            replaceOldZoneId: zoneId,
          });
        }
      } catch {
        if (editRetryState.attemptCount < 2) {
          setEditRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
        } else {
          setEditRetryState({ isRetry: false, attemptCount: 0 });
          setEditModal({ visible: false, type: 'zone', id: '', name: '' });
          setClarificationModal({
            visible: true,
            type: 'zone',
            title: "We couldn't recognize this skin zone",
            userInput: clean,
            suggestions: ['Neck', 'Chest', 'Hands'],
            selectedSuggestion: null,
            targetZoneId: null,
            replaceOldCondition: null,
            replaceOldZoneId: zoneId,
          });
        }
      } finally {
        setIsValidatingCondition(false);
      }
    } else if (editModal.type === 'condition' && editModal.parentZoneId) {
      const pZone = editModal.parentZoneId;
      const oldName = editModal.name;
      const clean = newName.trim();

      if (clean === oldName.trim()) {
        setEditRetryState({ isRetry: false, attemptCount: 0 });
        setEditModal({ visible: false, type: 'zone', id: '', name: '' });
        return;
      }

      const activeZone = allZones.find((z) => z.id === pZone);
      const zoneName = activeZone?.name || 'Skin Zone';

      console.log(`[SKIN_CONDITION_AI] 🚀 [UI] Submitting edited condition: "${clean}" (attempt: ${editRetryState.attemptCount + 1})`);
      setIsValidatingCondition(true);

      try {
        const result = await validateCustomSkinCondition(clean, zoneName);

        if (result.isValid) {
          const finalName = clean;

          const updatedCustomConditions = {
            ...customConditionsByZone,
            [pZone]: (customConditionsByZone[pZone] || []).map((c) => (c === oldName ? finalName : c)),
          };
          setCustomConditionsByZone(updatedCustomConditions);

          const updatedSelected = selectedZones.map((z) => {
            if (z.id !== pZone) return z;
            return {
              ...z,
              conditions: z.conditions.map((c) => (c === oldName ? finalName : c)),
            };
          });
          setSelectedZones(updatedSelected);
          emitState(updatedSelected, maxSeverityScale, undefined, updatedCustomConditions);
          setEditRetryState({ isRetry: false, attemptCount: 0 });
          setEditModal({ visible: false, type: 'zone', id: '', name: '' });
        } else if (result.isNetworkError && editRetryState.attemptCount < 2) {
          setEditRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
        } else {
          setEditRetryState({ isRetry: false, attemptCount: 0 });
          setEditModal({ visible: false, type: 'zone', id: '', name: '' });
          setClarificationModal({
            visible: true,
            type: 'condition',
            title: "We couldn't recognize this condition",
            userInput: clean,
            suggestions: result.suggestions || ['Acne / Breakout', 'Dryness / Flaking', 'Redness / Irritation'],
            selectedSuggestion: null,
            targetZoneId: pZone,
            replaceOldCondition: oldName,
          });
        }
      } catch {
        if (editRetryState.attemptCount < 2) {
          setEditRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
        } else {
          setEditRetryState({ isRetry: false, attemptCount: 0 });
          setEditModal({ visible: false, type: 'zone', id: '', name: '' });
          setClarificationModal({
            visible: true,
            type: 'condition',
            title: "We couldn't recognize this condition",
            userInput: clean,
            suggestions: ['Acne / Breakout', 'Dryness / Flaking', 'Redness / Irritation'],
            selectedSuggestion: null,
            targetZoneId: pZone,
            replaceOldCondition: oldName,
          });
        }
      } finally {
        setIsValidatingCondition(false);
      }
    }
  };

  // Confirm Delete Item (Invoked from SkinItemDeleteModal)
  const handleConfirmDelete = () => {
    if (deleteModal.type === 'zone') {
      const updatedCustomZones = customZones.filter((z) => z.id !== deleteModal.id);
      setCustomZones(updatedCustomZones);
      const updatedSelected = selectedZones.filter((z) => z.id !== deleteModal.id);
      setSelectedZones(updatedSelected);
      if (currentlySelectedZoneId === deleteModal.id) {
        setCurrentlySelectedZoneId(null);
      }
      emitState(updatedSelected, maxSeverityScale, undefined, undefined, updatedCustomZones);
    } else if (deleteModal.type === 'condition' && deleteModal.parentZoneId) {
      const pZone = deleteModal.parentZoneId;
      const condName = deleteModal.name;

      const updatedCustomConditions = {
        ...customConditionsByZone,
        [pZone]: (customConditionsByZone[pZone] || []).filter((c) => c !== condName),
      };
      setCustomConditionsByZone(updatedCustomConditions);

      const updatedSelected = selectedZones.map((z) => {
        if (z.id !== pZone) return z;
        return {
          ...z,
          conditions: z.conditions.filter((c) => c !== condName),
        };
      });
      setSelectedZones(updatedSelected);
      emitState(updatedSelected, maxSeverityScale, undefined, updatedCustomConditions);
    }

    setDeleteModal({ visible: false, type: 'zone', id: '', name: '' });
  };

  // Save/Update Scale Level (1 to maxSeverityScale + 1) with AI validation
  const handleSaveScaleLevel = async (level: number, label: string) => {
    const clean = label.trim();
    if (!clean) return;

    console.log(`[SKIN_SEVERITY_AI] 🚀 [UI] Submitting custom severity: "${clean}" for level ${level} (attempt: ${scaleRetryState.attemptCount + 1})`);
    setIsValidatingCondition(true);

    try {
      const result = await validateCustomSkinSeverity(clean, level);
      console.log(`[SKIN_SEVERITY_AI] 🎯 [UI] Worker returned:`, JSON.stringify(result));

      if (result.isValid) {
        const newCustoms = {
          ...customScaleLabels,
          [level]: clean,
        };
        setCustomScaleLabels(newCustoms);

        let newMax = maxSeverityScale;
        if (level > maxSeverityScale) {
          newMax = level;
          setMaxSeverityScale(newMax);
        }
        emitState(selectedZones, newMax, newCustoms);
        setScaleRetryState({ isRetry: false, attemptCount: 0 });
        setScaleModalVisible(false);
      } else if (result.isNetworkError && scaleRetryState.attemptCount < 2) {
        // Network / 503 error on Attempt 1 or 2: Keep modal open, show Try Again
        console.warn(`[SKIN_SEVERITY_AI] ⚠️ Network error on attempt ${scaleRetryState.attemptCount + 1}. Prompting user to Try Again.`);
        setScaleRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
      } else {
        // Legitimate invalid input OR 3rd failed attempt: Show clarification modal with suggestions
        setScaleRetryState({ isRetry: false, attemptCount: 0 });
        setScaleModalVisible(false);
        setClarificationModal({
          visible: true,
          type: 'severity',
          title: "We couldn't recognize this severity label",
          userInput: clean,
          suggestions: result.suggestions || ['Moderate discomfort', 'Mild irritation', 'Severe flare-up'],
          selectedSuggestion: null,
          scaleLevel: level,
        });
      }
    } catch {
      if (scaleRetryState.attemptCount < 2) {
        setScaleRetryState((prev) => ({ isRetry: true, attemptCount: prev.attemptCount + 1 }));
      } else {
        setScaleRetryState({ isRetry: false, attemptCount: 0 });
        setScaleModalVisible(false);
        setClarificationModal({
          visible: true,
          type: 'severity',
          title: "We couldn't recognize this severity label",
          userInput: clean,
          suggestions: ['Moderate discomfort', 'Mild irritation', 'Severe flare-up'],
          selectedSuggestion: null,
          scaleLevel: level,
        });
      }
    } finally {
      setIsValidatingCondition(false);
    }
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

          let bgColor = isDark ? '#18181b' : '#ffffff';
          let borderColor = isDark ? '#27272a' : '#e4e4e7';
          let borderWidth = 1;
          let textColor = isDark ? '#ffffff' : '#111827';

          if (isCurrentlySelected) {
            bgColor = primaryColor;
            borderColor = '#ffffff';
            borderWidth = 2;
            textColor = '#ffffff';
          } else if (isSelected) {
            bgColor = primaryColor;
            borderColor = primaryColor;
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

      {/* 2. DYNAMIC EXPANSION WHEN A ZONE IS "CURRENTLY SELECTED" */}
      {currentlySelectedZoneId && activeZoneConfig && (
        <View style={styles.expansionFlat}>
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
              onPress={() => {
                const zName = allZones.find((z) => z.id === currentlySelectedZoneId)?.name || 'Unknown Zone';
                console.log(`[SKIN_CONDITION_AI] 👆 [UI] Clicked "+ Condition" pill for zone: "${zName}" (id: ${currentlySelectedZoneId})`);
                setConditionModalVisible(true);
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
                Condition
              </Text>
            </Pressable>
          </View>

          {/* Sub-Section B: Severity Slider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[styles.severityLabelHeading, { color: isDark ? '#ffffff' : '#111827', marginBottom: 0 }]}>
              Severity:
            </Text>
            <Pressable
              onPress={() => {
                // If the slider is at the max scale level, open to the next level (to add new scale)
                // Otherwise open directly to the currently selected slider level
                const targetLvl = activeZoneConfig.severity >= maxSeverityScale
                  ? maxSeverityScale + 1
                  : activeZoneConfig.severity;

                setEditingScaleLevel(targetLvl);
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

      {/* 4. MODAL: ADD CUSTOM ZONE */}
      <AddCustomZoneModal
        visible={zoneModalVisible}
        isDark={isDark}
        primaryColor={primaryColor}
        isValidating={isValidatingCondition}
        isRetry={zoneRetryState.isRetry}
        onCancel={() => {
          setZoneRetryState({ isRetry: false, attemptCount: 0 });
          setZoneModalVisible(false);
        }}
        onSubmit={handleAddCustomZone}
      />

      {/* 5. MODAL: ADD CUSTOM CONDITION */}
      <AddCustomConditionModal
        visible={conditionModalVisible}
        isDark={isDark}
        primaryColor={primaryColor}
        isValidating={isValidatingCondition}
        isRetry={conditionRetryState.isRetry}
        onCancel={() => {
          setConditionRetryState({ isRetry: false, attemptCount: 0 });
          setConditionModalVisible(false);
        }}
        onSubmit={handleAddCustomCondition}
      />

      {/* 6. MODAL: CLARIFICATION */}
      <ClarificationModal
        state={clarificationModal}
        isDark={isDark}
        primaryColor={primaryColor}
        isValidating={isValidatingCondition}
        onSelectSuggestion={(suggestion) => {
          setClarificationModal((prev) => ({
            ...prev,
            selectedSuggestion: suggestion,
          }));
        }}
        onCancel={() => setClarificationModal(INITIAL_CLARIFICATION_MODAL)}
        onContinue={handleClarificationContinue}
      />

      {/* 7. MODAL: EDIT / ADD SCALE LEVEL */}
      <CustomScaleModal
        visible={scaleModalVisible}
        isDark={isDark}
        primaryColor={primaryColor}
        initialLevel={editingScaleLevel}
        maxSeverityScale={maxSeverityScale}
        customScaleLabels={customScaleLabels}
        isValidating={isValidatingCondition}
        isRetry={scaleRetryState.isRetry}
        onCancel={() => {
          setScaleRetryState({ isRetry: false, attemptCount: 0 });
          setScaleModalVisible(false);
        }}
        onSave={handleSaveScaleLevel}
      />

      {/* Action Menu (Edit / Delete) */}
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
        isLoading={isValidatingCondition}
        isRetry={editRetryState.isRetry}
        onCancel={() => {
          setEditRetryState({ isRetry: false, attemptCount: 0 });
          setEditModal((prev) => ({ ...prev, visible: false }));
        }}
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
});
