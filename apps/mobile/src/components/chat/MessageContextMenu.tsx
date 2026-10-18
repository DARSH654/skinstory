import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Keyboard,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, TextSelect, Pencil, X, Trash2 } from 'lucide-react-native';
import { Text } from '@/components/AppText';
import { Message } from './types';
import AppBottomSheet, { AppBottomSheetRef } from '@/components/common/AppBottomSheet';

interface MessageContextMenuProps {
  message: Message;
  anchorY: number;
  align: 'left' | 'right';
  isDark: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function MessageContextMenu({
  message,
  anchorY,
  align,
  isDark,
  onClose,
  onEdit,
}: MessageContextMenuProps) {
  const sheetRef = useRef<AppBottomSheetRef>(null);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.text);
    onClose();
  };

  const handleSelectText = () => {
    Keyboard.dismiss();
    sheetRef.current?.present();
  };

  const bgColor = isDark ? '#18181b' : '#ffffff';
  const textColor = isDark ? '#fafafa' : '#18181b';

  const screenH = Dimensions.get('window').height;
  const EST = 200;
  const top = Math.min(Math.max(anchorY - 48, 70), screenH - EST - 90);

  const formattedDate = new Date(message.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const headerTimestamp = `${formattedDate}, ${message.timestamp}`;

  return (
    <>
      <View style={styles.contextMenuOverlay}>
        <TouchableOpacity style={styles.contextMenuBackdrop} onPress={onClose} activeOpacity={1} />
        <View
          style={[
            styles.contextMenuCard,
            {
              backgroundColor: bgColor,
              top,
              ...(align === 'left' ? { left: 16 } : { right: 16 }),
            },
          ]}
        >
          <View
            style={[
              styles.contextMenuHeader,
              {
                borderBottomColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)',
              },
            ]}
          >
            <Text
              style={[
                styles.contextMenuTimestamp,
                { color: isDark ? '#a1a1aa' : '#71717a' },
              ]}
            >
              {headerTimestamp}
            </Text>
          </View>
          <View style={styles.itemsWrapper}>
            <TouchableOpacity style={styles.contextMenuItem} onPress={handleCopy}>
              <Copy size={16} color={textColor} />
              <Text style={[styles.contextMenuText, { color: textColor }]}>Copy message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contextMenuItem} onPress={handleSelectText}>
              <TextSelect size={16} color={textColor} />
              <Text style={[styles.contextMenuText, { color: textColor }]}>Select text</Text>
            </TouchableOpacity>
            {message.sender === 'user' && (
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => {
                  onEdit?.();
                  onClose();
                }}
              >
                <Pencil size={16} color={textColor} />
                <Text style={[styles.contextMenuText, { color: textColor }]}>Edit message</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <AppBottomSheet
        ref={sheetRef}
        snapPoints={['50%', '90%']}
        isDark={isDark}
        onClose={onClose}
      >
        <View style={styles.selectTextContainer}>
          <View
            style={[
              styles.selectTextHeader,
              {
                borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              },
            ]}
          >
            <Text style={[styles.selectTextTitle, { color: textColor }]}>Select text</Text>
            <TouchableOpacity
              onPress={() => sheetRef.current?.dismiss()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={textColor} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.selectTextScroll} showsVerticalScrollIndicator={false}>
            <Text selectable style={[styles.selectTextContent, { color: textColor }]}>
              {message.text}
            </Text>
          </ScrollView>
        </View>
      </AppBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  contextMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  contextMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  contextMenuCard: {
    position: 'absolute',
    maxWidth: 280,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  contextMenuHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextMenuTimestamp: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  itemsWrapper: {
    paddingTop: 6,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  contextMenuText: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectTextContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  selectTextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectTextTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  selectTextScroll: {
    flex: 1,
    paddingTop: 14,
  },
  selectTextContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});
