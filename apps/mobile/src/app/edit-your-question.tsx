import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  ChevronLeft,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useJournalStore } from '@/store/journalStore';

export default function EditYourQuestionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const primaryColor = Colors.light.primary;

  const updateQuestion = useJournalStore((state) => state.updateQuestion);

  const params = useLocalSearchParams<{
    key?: string;
    subtitle?: string;
    options?: string;
  }>();

  // Initial values
  const initialTitle = params.subtitle || 'How was your skin today?';
  const parsedOptions = React.useMemo(() => {
    if (params.options) {
      try {
        const decoded = JSON.parse(params.options);
        if (Array.isArray(decoded) && decoded.length > 0) {
          return decoded.map((o: any) => (typeof o === 'string' ? o : o.label || o.value || ''));
        }
      } catch (e) {
        // fallback
      }
    }
    return [
      'Morning & evening routine',
      'Morning routine only',
      'Evening routine only',
      'Morning, evening & night routine',
      'No - Skipped routine today',
    ];
  }, [params.options]);

  const [questionTitle, setQuestionTitle] = useState(initialTitle);
  const [options, setOptions] = useState<string[]>(parsedOptions);

  // Track if any changes have been made (triggers 50/50 bottom layout)
  const hasChanges =
    questionTitle !== initialTitle ||
    options.length !== parsedOptions.length ||
    options.some((opt, i) => opt !== parsedOptions[i]);

  // Modal State for Adding or Editing an Option
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // null = adding, number = editing
  const [modalOptionText, setModalOptionText] = useState('');

  // Delete Option Confirmation Modal State
  const [optionToDelete, setOptionToDelete] = useState<number | null>(null);

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setModalOptionText('');
    setOptionModalVisible(true);
  };

  const handleOpenEditModal = (index: number) => {
    setEditingIndex(index);
    setModalOptionText(options[index] || '');
    setOptionModalVisible(true);
  };

  const handleSaveModalOption = () => {
    const trimmed = modalOptionText.trim();
    if (!trimmed) return;

    if (editingIndex === null) {
      // Adding new option
      setOptions((prev) => [...prev, trimmed]);
    } else {
      // Editing existing option
      setOptions((prev) => {
        const next = [...prev];
        next[editingIndex] = trimmed;
        return next;
      });
    }

    setOptionModalVisible(false);
    setModalOptionText('');
    setEditingIndex(null);
  };

  const promptDeleteOption = (index: number) => {
    setOptionToDelete(index);
  };

  const handleConfirmDeleteOption = () => {
    if (optionToDelete === null) return;
    setOptions((prev) => prev.filter((_, i) => i !== optionToDelete));
    setOptionToDelete(null);
  };

  const handleSaveAll = () => {
    if (params.key) {
      updateQuestion(params.key, questionTitle.trim(), options);
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}
    >
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 6,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          hitSlop={12}
        >
          <ChevronLeft size={22} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
          Edit Your Question
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Question Title with 100 character smart limit */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
            Question Title
          </Text>
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.08)',
              },
            ]}
          >
            <TextInput
              defaultValue={questionTitle}
              onChangeText={setQuestionTitle}
              placeholder="Enter your question title..."
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              style={[
                styles.textInput,
                { color: isDark ? '#ffffff' : '#111827' },
              ]}
              maxLength={200}
              multiline
              textAlignVertical="top"
              scrollEnabled
            />
          </View>
        </View>

        {/* Section 2: Question Options in Separate Physical Horizontal Boxes */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
              Options
            </Text>
            <Text style={[styles.sectionSubCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
              {options.length} options
            </Text>
          </View>

          {/* Each option in its own individual separate physical card */}
          <View style={styles.optionsList}>
            {options.map((opt, idx) => (
              <View
                key={idx}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                    borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                {/* Index badge */}
                <View
                  style={[
                    styles.optionIndexBadge,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5' },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionIndexText,
                      { color: isDark ? '#d4d4d8' : '#71717a' },
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </View>

                {/* Option text: Truncates after 2 lines with '...' */}
                <Text
                  style={[
                    styles.optionTitleText,
                    { color: isDark ? '#ffffff' : '#111827' },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {opt}
                </Text>

                {/* Actions: Edit & Delete */}
                <View style={styles.optionActionsRow}>
                  <Pressable
                    onPress={() => handleOpenEditModal(idx)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.actionIconButton,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Pencil size={15} color={isDark ? '#e4e4e7' : '#52525b'} strokeWidth={2} />
                  </Pressable>

                  {options.length > 1 && (
                    <Pressable
                      onPress={() => promptDeleteOption(idx)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.actionIconButton,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5',
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Trash2 size={15} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={2} />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
            backgroundColor: isDark ? '#121212' : '#f5f5f7',
          },
        ]}
      >
        {hasChanges ? (
          /* 50/50 Layout: Add Option on left, Save Changes on right */
          <View style={styles.splitBottomRow}>
            {/* Add Option Pill (Left) */}
            <Pressable
              onPress={handleOpenAddModal}
              style={({ pressed }) => [
                styles.pillButton,
                styles.splitButton,
                {
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.1)',
                  borderWidth: 1.5,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <PlusCircle size={18} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
              <Text
                style={[
                  styles.pillButtonText,
                  { color: isDark ? '#ffffff' : '#111827' },
                ]}
              >
                Add Option
              </Text>
            </Pressable>

            {/* Save Changes Pill (Right, no icon) */}
            <Pressable
              onPress={handleSaveAll}
              style={({ pressed }) => [
                styles.pillButton,
                styles.splitButton,
                {
                  backgroundColor: primaryColor,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.pillButtonText, { color: '#ffffff' }]}>
                Save Changes
              </Text>
            </Pressable>
          </View>
        ) : (
          /* Default: Full Width Add Option Pill */
          <Pressable
            onPress={handleOpenAddModal}
            style={({ pressed }) => [
              styles.pillButton,
              styles.fullWidthButton,
              {
                backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.1)',
                borderWidth: 1.5,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <PlusCircle size={20} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
            <Text
              style={[
                styles.pillButtonText,
                { color: isDark ? '#ffffff' : '#111827' },
              ]}
            >
              Add Option
            </Text>
          </Pressable>
        )}
      </View>

      {/* Edit / Add Option Modal */}
      <Modal
        visible={optionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.optionModalCard,
                {
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e5e7eb',
                },
              ]}
            >
              {/* Modal Top Header with clean spacing */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  {editingIndex !== null ? 'Edit Option' : 'Add Option'}
                </Text>
                <Pressable
                  onPress={() => setOptionModalVisible(false)}
                  hitSlop={12}
                  style={({ pressed }) => [
                    styles.modalCloseBtn,
                    pressed && {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.10)'
                        : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                >
                  <X size={18} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={2.2} />
                </Pressable>
              </View>

              {/* Text Area for Option */}
              <View
                style={[
                  styles.modalInputWrapper,
                  {
                    backgroundColor: isDark ? '#27272a' : '#f9fafb',
                    borderColor: isDark ? '#3f3f46' : '#e5e7eb',
                  },
                ]}
              >
                <TextInput
                  key={`edit-opt-${editingIndex !== null ? editingIndex : 'new'}`}
                  defaultValue={modalOptionText}
                  onChangeText={setModalOptionText}
                  placeholder="Enter option text..."
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                  maxLength={125}
                  style={[
                    styles.modalTextInput,
                    { color: isDark ? '#ffffff' : '#111827' },
                  ]}
                  multiline
                  autoFocus
                  textAlignVertical="top"
                />
              </View>

              {/* Modal Save Button */}
              <Pressable
                onPress={handleSaveModalOption}
                disabled={!modalOptionText.trim()}
                style={({ pressed }) => [
                  styles.modalSaveBtn,
                  {
                    backgroundColor: modalOptionText.trim()
                      ? primaryColor
                      : isDark
                      ? '#27272a'
                      : '#e5e7eb',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalSaveBtnText,
                    {
                      color: modalOptionText.trim()
                        ? '#ffffff'
                        : isDark
                        ? '#71717a'
                        : '#9ca3af',
                    },
                  ]}
                >
                  {editingIndex !== null ? 'Update Option' : 'Add Option'}
                </Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Option Delete Confirmation Modal with Warning Sign */}
      <Modal
        visible={optionToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionToDelete(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionToDelete(null)}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.confirmDeleteCard,
                {
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <View style={styles.confirmDeleteIconWrapper}>
                <AlertTriangle size={28} color="#ef4444" strokeWidth={2.4} />
              </View>
              <Text style={[styles.confirmDeleteTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Delete Option?
              </Text>
              <Text
                style={[
                  styles.confirmDeleteSubtitle,
                  { color: isDark ? '#a1a1aa' : '#6b7280' },
                ]}
              >
                Do you really want to delete this option? You cannot undo this.
              </Text>
              <View style={styles.confirmDeleteActionsRow}>
                <Pressable
                  onPress={() => setOptionToDelete(null)}
                  style={({ pressed }) => [
                    styles.confirmCancelBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.confirmCancelText,
                      { color: isDark ? '#ffffff' : '#111827' },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmDeleteOption}
                  style={({ pressed }) => [
                    styles.confirmDeleteBtn,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 88,
    maxHeight: 125,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    padding: 0,
    flex: 1,
  },

  /* Separate Physical Horizontal Cards for Options */
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  optionIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 12,
    fontWeight: '700',
  },
  optionTitleText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    lineHeight: 20,
  },
  optionActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Sticky Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  splitBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 999, // Pill-shaped
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidthButton: {
    width: '100%',
  },
  splitButton: {
    flex: 1,
  },
  pillButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optionModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    paddingTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
  },
  modalTextInput: {
    fontSize: 15.5,
    fontWeight: '500',
    lineHeight: 22,
    padding: 0,
  },
  modalSaveBtn: {
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Delete Confirmation Modal */
  confirmDeleteCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmDeleteIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmDeleteTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmDeleteSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  confirmDeleteActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
  },
  confirmDeleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
