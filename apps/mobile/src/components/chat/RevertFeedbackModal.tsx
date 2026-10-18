import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from '@/components/AppText';
import { RotateCcw } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

interface RevertFeedbackModalProps {
  visible: boolean;
  isDark: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RevertFeedbackModal({
  visible,
  isDark,
  onCancel,
  onConfirm,
}: RevertFeedbackModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
            <RotateCcw size={22} color={isDark ? '#ffffff' : '#000000'} strokeWidth={2.2} />
          </View>

          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
            Revert Submitted Feedback?
          </Text>

          <Text style={[styles.subtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
            This will remove your submitted feedback and reset your rating for this AI response.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.7}
              style={[
                styles.btn,
                styles.cancelBtn,
                {
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                  backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                },
              ]}
            >
              <Text
                style={{
                  color: isDark ? '#fafafa' : '#18181b',
                  fontWeight: '700',
                  fontSize: 14,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              style={[
                styles.btn,
                styles.revertBtn,
                {
                  backgroundColor: Colors.light.primary,
                },
              ]}
            >
              <Text
                style={{
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: 14,
                }}
              >
                Revert
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  revertBtn: {},
});
