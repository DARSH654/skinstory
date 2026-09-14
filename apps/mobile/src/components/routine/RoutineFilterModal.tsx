import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RoutineFilterModalProps {
  visible: boolean;
  isDark: boolean;
  filterMinSteps: string;
  filterMinDos: string;
  filterMinDonts: string;
  /** Apply enabled only when inputs differ from applied state */
  hasChanges: boolean;
  /** Clear enabled only when filters are actually applied */
  hasAnyApplied: boolean;
  onClose: () => void;
  onStepsChange: (val: string) => void;
  onDosChange: (val: string) => void;
  onDontsChange: (val: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export default function RoutineFilterModal({
  visible,
  isDark,
  filterMinSteps,
  filterMinDos,
  filterMinDonts,
  hasChanges,
  hasAnyApplied,
  onClose,
  onStepsChange,
  onDosChange,
  onDontsChange,
  onReset,
  onApply,
}: RoutineFilterModalProps) {
  const insets = useSafeAreaInsets();
  // Header: safeAreaTop + ~52px content/padding + 16px content paddingTop + 48px searchBar + 1px gap
  const dropdownTop = Math.max(insets.top, 16) + 52 + 16 + 48 + 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.dropdownContent,
            isDark ? styles.modalBgDark : styles.modalBgLight,
            { top: dropdownTop },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.modalTitle, isDark ? styles.subtextDark : styles.subtextLight]}>
            FILTER BY
          </Text>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, isDark ? styles.textDark : styles.textLight]}>Minimum Steps</Text>
            <TextInput
              style={[styles.filterInput, isDark ? styles.inputBgDark : styles.inputBgLight, isDark ? styles.inputTextDark : styles.inputTextLight]}
              keyboardType="numeric"
              value={filterMinSteps}
              onChangeText={onStepsChange}
              placeholder="0"
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              selectionColor={isDark ? '#a78bfa' : '#9333ea'}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, isDark ? styles.textDark : styles.textLight]}>Minimum Do's</Text>
            <TextInput
              style={[styles.filterInput, isDark ? styles.inputBgDark : styles.inputBgLight, isDark ? styles.inputTextDark : styles.inputTextLight]}
              keyboardType="numeric"
              value={filterMinDos}
              onChangeText={onDosChange}
              placeholder="0"
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              selectionColor={isDark ? '#a78bfa' : '#9333ea'}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, isDark ? styles.textDark : styles.textLight]}>Minimum Don'ts</Text>
            <TextInput
              style={[styles.filterInput, isDark ? styles.inputBgDark : styles.inputBgLight, isDark ? styles.inputTextDark : styles.inputTextLight]}
              keyboardType="numeric"
              value={filterMinDonts}
              onChangeText={onDontsChange}
              placeholder="0"
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              selectionColor={isDark ? '#a78bfa' : '#9333ea'}
            />
          </View>

          <View style={styles.modalActions}>
            {/* Clear: enabled only when filters are applied */}
            <Pressable
              onPress={onReset}
              disabled={!hasAnyApplied}
              style={[
                styles.actionBtn,
                isDark ? styles.clearBtnDark : styles.clearBtnLight,
                !hasAnyApplied && styles.disabledClearBtn,
              ]}
            >
              <Text style={[
                styles.clearBtnText,
                isDark ? styles.clearTextDark : styles.clearTextLight,
                !hasAnyApplied && styles.disabledClearText,
              ]}>
                Clear
              </Text>
            </Pressable>

            {/* Apply: enabled only when inputs differ from current applied state */}
            <Pressable
              onPress={onApply}
              disabled={!hasChanges}
              style={[
                styles.actionBtn,
                styles.applyBtn,
                !hasChanges && styles.disabledApplyBtn,
              ]}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContent: {
    position: 'absolute',
    right: 16,
    width: 220,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  modalBgLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  modalBgDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: 'Outfit_700Bold',
  },
  textDark: { color: '#ffffff' },
  textLight: { color: '#111827' },
  subtextDark: { color: '#a1a1aa' },
  subtextLight: { color: '#6b7280' },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
    flexShrink: 1,
    marginRight: 8,
  },
  filterInput: {
    width: 52,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputBgLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  inputBgDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    color: '#ffffff',
  },
  // Separate text color styles for inputs to avoid over-dark appearance on focus
  inputTextLight: {
    color: '#374151',  // gray-700: visible and bold without being pitch-black
  },
  inputTextDark: {
    color: '#f3f4f6',  // near-white for dark mode
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnLight: {
    backgroundColor: '#f3f4f6',
  },
  clearBtnDark: {
    backgroundColor: '#27272a',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
  },
  clearTextLight: {
    color: '#1f2937',
  },
  clearTextDark: {
    color: '#ffffff',
  },
  disabledClearBtn: {
    opacity: 0.38,
  },
  disabledClearText: {
    color: '#9ca3af',
  },
  applyBtn: {
    backgroundColor: Colors.light.primary,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
  },
  disabledApplyBtn: {
    opacity: 0.38,
  },
});
