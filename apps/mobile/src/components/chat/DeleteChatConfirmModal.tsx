import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { Trash2 } from 'lucide-react-native';

interface DeleteChatConfirmModalProps {
  visible: boolean;
  isDark: boolean;
  chatTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteChatConfirmModal({
  visible,
  isDark,
  chatTitle,
  onCancel,
  onConfirm,
}: DeleteChatConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.card,
            isDark ? styles.cardDark : styles.cardLight,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.iconCircle,
              isDark ? styles.iconCircleDark : styles.iconCircleLight,
            ]}
          >
            <Trash2 size={24} color="#ef4444" strokeWidth={2} />
          </View>

          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            Delete Chat?
          </Text>

          <Text style={[styles.subtitle, isDark ? styles.subDark : styles.subLight]}>
            This will permanently delete "{chatTitle}" and all its messages. This action cannot be undone.
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                isDark ? styles.cancelBtnDark : styles.cancelBtnLight,
                { opacity: pressed ? 0.75 : 1 },
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
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                styles.deleteBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.btnText, { color: '#ffffff' }]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardLight: {
    backgroundColor: '#FAF8F6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2b2b30',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircleLight: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  iconCircleDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  subLight: {
    color: '#6b7280',
  },
  subDark: {
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnLight: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtnDark: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
