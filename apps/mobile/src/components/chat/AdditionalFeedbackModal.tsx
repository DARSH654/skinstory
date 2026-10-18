import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Text } from '@/components/AppText';

interface AdditionalFeedbackModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit: (feedback: { categories: string[]; comment: string }) => void;
}

const FEEDBACK_SECTIONS = [
  {
    category: 'Feature issue',
    tags: ['Missing capability', 'Hard to understand', 'Feature not working', 'Slow to respond', 'Unhelpful suggestions'],
  },
  {
    category: 'Data issue',
    tags: ['Inaccurate skin advice', 'Outdated information', 'Repetitive answer', 'Inactive device data', 'Wrong product recommendation'],
  },
  {
    category: 'Technical issue',
    tags: ['Formatting problem', 'Broken layout', 'Text cut off', 'Response incomplete', 'Display glitch'],
  },
];

export default function AdditionalFeedbackModal({
  visible,
  isDark,
  onClose,
  onCancel,
  onSubmit,
}: AdditionalFeedbackModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const hasContent = comment.trim().length > 0 || selectedTags.length > 0;

  const handleClose = () => {
    setSelectedTags([]);
    setComment('');
    onCancel?.();
    onClose();
  };

  const handleSend = () => {
    if (!hasContent) return;
    onSubmit({ categories: selectedTags, comment: comment.trim() });
    setSelectedTags([]);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#141416' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
            },
          ]}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
              Provide Additional Feedback
            </Text>
            <Pressable
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeBtn}
            >
              <X size={18} color={isDark ? '#a1a1aa' : '#71717a'} />
            </Pressable>
          </View>

          {/* Subtitle with tight gap */}
          <Text style={[styles.subtitle, { color: isDark ? '#a1a1aa' : '#71717a' }]}>
            What was the issue with this AI response? Select all that apply.
          </Text>

          {/* Categorized Issues */}
          {FEEDBACK_SECTIONS.map((section) => (
            <View key={section.category} style={styles.categoryBlock}>
              <Text style={[styles.categoryHeader, { color: isDark ? '#d4d4d8' : '#374151' }]}>
                {section.category}
              </Text>
              <View style={styles.tagWrap}>
                {section.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      activeOpacity={0.7}
                      style={[
                        styles.tagChip,
                        {
                          backgroundColor: isSelected
                            ? '#937abd'
                            : isDark
                            ? '#1f1f23'
                            : '#f4f4f5',
                          borderColor: isSelected
                            ? isDark ? '#ffffff' : '#000000'
                            : isDark ? '#3f3f46' : '#e5e7eb',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          {
                            color: isSelected
                              ? '#ffffff'
                              : isDark
                              ? '#d4d4d8'
                              : '#374151',
                          },
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Specific Details Title */}
          <Text style={[styles.inputLabel, { color: isDark ? '#ffffff' : '#111111' }]}>
            Feel free to add specific details:
          </Text>

          {/* Single-line default textinput */}
          <TextInput
            key={`feedback-comment-${visible ? 'open' : 'closed'}`}
            style={[
              styles.input,
              {
                color: isDark ? '#ffffff' : '#000000',
                borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                backgroundColor: isDark ? '#1f1f23' : '#f9fafb',
              },
            ]}
            defaultValue={comment}
            onChangeText={setComment}
            placeholder="Having any other issue? Please let us know in short..."
            placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
            maxLength={2000}
          />

          {/* Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={[
                styles.actionBtn,
                styles.cancelBtn,
                {
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                  backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                },
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
              onPress={handleSend}
              disabled={!hasContent}
              activeOpacity={hasContent ? 0.8 : 1}
              style={[
                styles.actionBtn,
                styles.submitBtn,
                {
                  backgroundColor: '#937abd',
                  opacity: hasContent ? 1 : 0.4,
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
                Submit Feedback
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 17,
    marginBottom: 12,
  },
  categoryBlock: {
    marginBottom: 10,
  },
  categoryHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  submitBtn: {},
});
