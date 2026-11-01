import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { Trash2 } from 'lucide-react-native';

interface DeleteMessageModalProps {
  visible: boolean;
  isDark: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteMessageModal({
  visible,
  isDark,
  onCancel,
  onConfirm,
}: DeleteMessageModalProps) {
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
            <Trash2 size={24} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={2} />
          </View>

          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            Delete Message?
          </Text>

          <Text style={[styles.subtitle, isDark ? styles.subDark : styles.subLight]}>
            This will permanently remove this message from the chat conversation.
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconCircleDark: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
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
    color: '#4b5563',
  },
  subDark: {
    color: '#a1a1aa',
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  btn: {
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
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
