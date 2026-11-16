import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/AppText';

export interface AddCustomConditionModalProps {
  visible: boolean;
  isDark: boolean;
  primaryColor: string;
  isValidating: boolean;
  isRetry?: boolean;
  onCancel: () => void;
  onSubmit: (condition: string) => void;
}

export default function AddCustomConditionModal({
  visible,
  isDark,
  primaryColor,
  isValidating,
  isRetry = false,
  onCancel,
  onSubmit,
}: AddCustomConditionModalProps) {
  const draftRef = useRef('');
  const [canAdd, setCanAdd] = useState(false);

  useEffect(() => {
    if (visible) {
      draftRef.current = '';
      setCanAdd(false);
    }
  }, [visible]);

  const handleSubmit = () => {
    const clean = draftRef.current.trim();
    if (!clean || isValidating) return;
    onSubmit(clean);
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
          {isRetry && !isValidating && (
            <View style={styles.errorPillWrapper}>
              <View style={styles.errorPill}>
                <Text style={styles.errorPillText}>
                  Something went wrong
                </Text>
              </View>
            </View>
          )}

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
              key={visible ? 'cond-input-open' : 'cond-input-closed'}
              style={[
                styles.modalInput,
                isDark ? styles.inputTextDark : styles.inputTextLight,
              ]}
              defaultValue=""
              editable={!isValidating}
              onChangeText={(text) => {
                draftRef.current = text;
                const hasContent = text.trim().length > 0;
                if (hasContent !== canAdd) {
                  setCanAdd(hasContent);
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
              onPress={canAdd && !isValidating ? handleSubmit : undefined}
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
                  {isRetry ? 'Try Again' : 'Add Condition'}
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
  errorPillWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  errorPill: {
    backgroundColor: '#ef4444',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  errorPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 12,
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
