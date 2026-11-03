import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { Colors } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';

interface TemporaryChatInfoModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
}

export default function TemporaryChatInfoModal({
  visible,
  isDark,
  onClose,
}: TemporaryChatInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
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
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
                stroke={isDark ? '#ffffff' : '#09090b'}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="3 3.5"
              />
            </Svg>
          </View>

          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            Temporary chat
          </Text>

          <Text style={[styles.subtitle, isDark ? styles.subDark : styles.subLight]}>
            This chat won't appear in your chat history and will be deleted just after this session.
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.primaryBtnText}>OK</Text>
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
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
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
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  subLight: {
    color: '#6b7280',
  },
  subDark: {
    color: '#9ca3af',
  },
  actions: {
    width: '100%',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
