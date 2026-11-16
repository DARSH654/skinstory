import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/AppText';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { DEFAULT_SEVERITY_LEVELS } from './types';

export interface CustomScaleModalProps {
  visible: boolean;
  isDark: boolean;
  primaryColor: string;
  initialLevel?: number;
  maxSeverityScale: number;
  customScaleLabels: Record<number, string>;
  isValidating: boolean;
  onCancel: () => void;
  onSave: (level: number, label: string) => void;
}

export default function CustomScaleModal({
  visible,
  isDark,
  primaryColor,
  initialLevel,
  maxSeverityScale,
  customScaleLabels,
  isValidating,
  onCancel,
  onSave,
}: CustomScaleModalProps) {
  const [editingLevel, setEditingLevel] = useState<number>(6);
  const draftRef = useRef('');
  const [canAdd, setCanAdd] = useState(false);

  useEffect(() => {
    if (visible) {
      const defaultLvl = initialLevel !== undefined ? initialLevel : (maxSeverityScale + 1);
      setEditingLevel(defaultLvl);
      draftRef.current = customScaleLabels[defaultLvl] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === defaultLvl)?.label || '';
      setCanAdd(false);
    }
  }, [visible, initialLevel, maxSeverityScale, customScaleLabels]);

  const handleLevelChange = (newLvl: number) => {
    setEditingLevel(newLvl);
    const existingVal = customScaleLabels[newLvl] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === newLvl)?.label || '';
    draftRef.current = existingVal;
    setCanAdd(false);
  };

  const handleSave = () => {
    const clean = draftRef.current.trim();
    if (!clean || isValidating) return;
    onSave(editingLevel, clean);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isValidating ? undefined : onCancel}
    >
      <Pressable style={styles.modalBackdrop} onPress={isValidating ? undefined : onCancel}>
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
              disabled={editingLevel <= 1 || isValidating}
              onPress={() => handleLevelChange(editingLevel - 1)}
              style={({ pressed }) => [
                styles.chevronCircleBtn,
                {
                  backgroundColor: isDark ? '#27272a' : '#ffffff',
                  borderColor: isDark ? '#3f3f46' : '#d1d5db',
                  borderWidth: 1.5,
                  opacity: editingLevel <= 1 || isValidating ? 0.35 : (pressed ? 0.7 : 1),
                },
              ]}
            >
              <ChevronLeft size={16} strokeWidth={2.2} color={isDark ? '#ffffff' : '#1f2937'} />
            </Pressable>

            <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight, { marginBottom: 0 }]}>
              Scale Number {editingLevel}
            </Text>

            <Pressable
              disabled={editingLevel >= maxSeverityScale + 1 || isValidating}
              onPress={() => handleLevelChange(editingLevel + 1)}
              style={({ pressed }) => [
                styles.chevronCircleBtn,
                {
                  backgroundColor: isDark ? '#27272a' : '#ffffff',
                  borderColor: isDark ? '#3f3f46' : '#d1d5db',
                  borderWidth: 1.5,
                  opacity: editingLevel >= maxSeverityScale + 1 || isValidating ? 0.35 : (pressed ? 0.7 : 1),
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
              key={`scale-input-${editingLevel}-${visible ? 'open' : 'closed'}`}
              style={[
                styles.modalInput,
                isDark ? styles.inputTextDark : styles.inputTextLight,
              ]}
              defaultValue={customScaleLabels[editingLevel] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === editingLevel)?.label || ''}
              editable={!isValidating}
              multiline={false}
              numberOfLines={1}
              onChangeText={(text) => {
                draftRef.current = text;
                const curVal = (customScaleLabels[editingLevel] || DEFAULT_SEVERITY_LEVELS.find((d) => d.level === editingLevel)?.label || '').trim();
                const clean = text.trim();
                const isChangedAndValid = clean.length > 0 && clean !== curVal;
                if (isChangedAndValid !== canAdd) {
                  setCanAdd(isChangedAndValid);
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
              onPress={isValidating ? undefined : onCancel}
              disabled={isValidating}
              style={[
                styles.modalActionBtn,
                isDark ? styles.cancelBtnDark : styles.cancelBtnLight,
                { opacity: isValidating ? 0.5 : 1 },
              ]}
            >
              <Text style={[styles.btnText, { color: isDark ? '#ffffff' : '#111827' }]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={canAdd && !isValidating ? handleSave : undefined}
              disabled={!canAdd || isValidating}
              style={[
                styles.modalActionBtn,
                {
                  backgroundColor: !canAdd || isValidating
                    ? isDark ? '#27272a' : '#e5e7eb'
                    : primaryColor,
                },
              ]}
            >
              {isValidating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: !canAdd
                        ? isDark ? '#71717a' : '#9ca3af'
                        : '#ffffff',
                    },
                  ]}
                >
                  {editingLevel > maxSeverityScale ? 'Add Scale' : 'Save Scale'}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    borderColor: '#2b2b30',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
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
    marginBottom: 20,
  },
  inputCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  inputCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  modalInput: {
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'left',
  },
  inputTextLight: {
    color: '#111827',
  },
  inputTextDark: {
    color: '#ffffff',
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
