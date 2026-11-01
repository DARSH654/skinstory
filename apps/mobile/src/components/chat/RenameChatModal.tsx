import React from 'react';
import { View, StyleSheet, Modal, TextInput, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { Colors } from '@/constants/theme';

interface RenameChatModalProps {
  isDark: boolean;
  visible: boolean;
  currentTitle: string;
  tempTitle: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function RenameChatModal({
  isDark,
  visible,
  currentTitle,
  tempTitle,
  onChangeText,
  onSave,
  onCancel,
}: RenameChatModalProps) {
  const clean = tempTitle.trim();
  const saveDisabled = clean.length === 0 || clean === currentTitle;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.modalCard,
            isDark ? styles.modalCardDark : styles.modalCardLight,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
            Rename Chat
          </Text>

          <View
            style={[
              styles.inputCard,
              isDark ? styles.inputCardDark : styles.inputCardLight,
            ]}
          >
            <TextInput
              key={`rename-${visible ? currentTitle : 'closed'}`}
              style={[
                styles.modalInput,
                isDark ? styles.inputTextDark : styles.inputTextLight,
              ]}
              defaultValue={tempTitle}
              onChangeText={onChangeText}
              maxLength={100}
              placeholder="Enter your chat title..."
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              autoFocus
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={[
                styles.modalActionBtn,
                isDark ? styles.cancelBtnDark : styles.cancelBtnLight,
              ]}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: isDark ? '#ffffff' : '#111827' },
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={saveDisabled ? undefined : onSave}
              disabled={saveDisabled}
              style={[
                styles.modalActionBtn,
                {
                  backgroundColor: saveDisabled
                    ? isDark
                      ? '#27272a'
                      : '#e5e7eb'
                    : Colors.light.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.btnText,
                  {
                    color: saveDisabled
                      ? isDark
                        ? '#71717a'
                        : '#9ca3af'
                      : '#ffffff',
                  },
                ]}
              >
                Save Changes
              </Text>
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
