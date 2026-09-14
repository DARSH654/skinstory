import React from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { Text } from '@/components/AppText';

interface RoutineDeleteModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function RoutineDeleteModal({
  visible,
  isDark,
  onClose,
  onDelete,
}: RoutineDeleteModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.deleteModalOverlay} onPress={onClose}>
        <View style={[styles.deleteModalContent, isDark ? styles.modalBgDark : styles.modalBgLight]} onStartShouldSetResponder={() => true}>
          <Text style={[styles.deleteModalTitle, isDark ? styles.textDark : styles.textLight]}>
            Delete Routine?
          </Text>
          <Text style={[styles.deleteModalDesc, isDark ? styles.subtextDark : styles.subtextLight]}>
            This will delete your routine and it will be permanently deleted.
          </Text>
          <View style={styles.deleteModalActions}>
            <Pressable
              onPress={onClose}
              style={[styles.deleteActionBtn, isDark ? styles.inputBgDark : styles.inputBgLight]}
            >
              <Text style={[styles.actionBtnText, isDark ? styles.textDark : styles.textLight]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={[styles.deleteActionBtn, { backgroundColor: '#ef4444' }]}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.2)',
    elevation: 10,
    alignItems: 'center',
  },
  modalBgLight: { backgroundColor: '#ffffff' },
  modalBgDark: { backgroundColor: '#18181b' },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  textDark: { color: '#ffffff' },
  textLight: { color: '#111827' },
  subtextDark: { color: '#a1a1aa' },
  subtextLight: { color: '#6b7280' },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputBgLight: {
    backgroundColor: '#f3f4f6',
  },
  inputBgDark: {
    backgroundColor: '#27272a',
  },
});
