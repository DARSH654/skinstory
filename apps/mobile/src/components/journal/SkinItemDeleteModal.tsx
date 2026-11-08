import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { AlertTriangle } from 'lucide-react-native';

interface SkinItemDeleteModalProps {
  visible: boolean;
  isDark: boolean;
  itemType: 'zone' | 'condition';
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SkinItemDeleteModal({
  visible,
  isDark,
  itemType,
  itemName,
  onCancel,
  onConfirm,
}: SkinItemDeleteModalProps) {
  const isZone = itemType === 'zone';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable
          style={[styles.modalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Circular Red Alert Icon Wrapper (Exact match to Insights / Progress modal) */}
          <View
            style={[
              styles.modalIconWrap,
              isDark ? { backgroundColor: '#3f1f1f' } : { backgroundColor: '#fee2e2' },
            ]}
          >
            <AlertTriangle size={28} color="#ef4444" strokeWidth={2.2} />
          </View>

          <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
            Delete {isZone ? 'Custom Zone' : 'Custom Condition'}
          </Text>

          <Text style={[styles.modalDescription, isDark ? styles.modalDescDark : styles.modalDescLight]}>
            Are you sure you want to delete? You will lose this {isZone ? 'custom zone' : 'custom condition'} which you are deleting.
          </Text>

          {/* Action Buttons: Cancel and Delete (Exact uplifted styling from Insights page) */}
          <View style={styles.modalBtnRow}>
            <Pressable
              style={({ pressed }) => [
                styles.modalActionBtn,
                isDark ? styles.cancelBtnDark : styles.cancelBtnLight,
                { opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelBtnText, isDark ? styles.textDark : styles.textLight]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modalActionBtn,
                styles.deleteBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmBtnText}>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalCardLight: {
    backgroundColor: '#FAF8F6', // Exact Insights modal card background
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalCardDark: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2b2b30',
  },
  modalIconWrap: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalDescLight: {
    color: '#4b5563',
  },
  modalDescDark: {
    color: '#a1a1aa',
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 6,
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
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
});
