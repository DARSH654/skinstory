import React from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
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
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
            },
          ]}
        >
          <View style={styles.modalHeaderRow}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              Rename Chat
            </Text>
            <Pressable
              onPress={onCancel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                styles.closePressable,
                {
                  backgroundColor: pressed
                    ? isDark
                      ? '#27272a'
                      : '#f4f4f5'
                    : 'transparent',
                },
              ]}
            >
              <X size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
            </Pressable>
          </View>

          <TextInput
            key={`rename-${visible ? currentTitle : 'closed'}`}
            style={[
              styles.modalInput,
              {
                color: isDark ? '#ffffff' : '#000000',
                borderColor: isDark ? '#3f3f46' : '#e5e7eb',
                backgroundColor: isDark ? '#27272a' : '#f9fafb',
              },
            ]}
            defaultValue={tempTitle}
            onChangeText={onChangeText}
            maxLength={100}
            placeholder="Enter your chat title..."
            placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
            autoFocus
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[
                styles.modalBtn,
                styles.modalCancelBtn,
                { borderColor: isDark ? '#27272a' : '#e4e4e7' },
              ]}
            >
              <Text
                style={{
                  color: isDark ? '#a1a1aa' : '#71717a',
                  fontWeight: '700',
                  fontSize: 14,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={saveDisabled ? undefined : onSave}
              disabled={saveDisabled}
              style={[
                styles.modalBtn,
                styles.modalSaveBtn,
                {
                  backgroundColor: saveDisabled
                    ? isDark
                      ? '#27272a'
                      : '#e4e4e7'
                    : Colors.light.primary,
                  opacity: saveDisabled ? 0.6 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: saveDisabled
                    ? isDark
                      ? '#52525b'
                      : '#a1a1aa'
                    : '#ffffff',
                  fontWeight: '700',
                  fontSize: 14,
                }}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closePressable: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 10,
  },
  modalBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {},
  modalSaveBtn: {
    borderWidth: 0,
  },
});
