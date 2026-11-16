import React from 'react';
import { View, StyleSheet, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/AppText';
import { AlertCircle } from 'lucide-react-native';
import { ClarificationModalState } from './types';

export interface ClarificationModalProps {
  state: ClarificationModalState;
  isDark: boolean;
  primaryColor: string;
  isValidating: boolean;
  onSelectSuggestion: (suggestion: string | null) => void;
  onCancel: () => void;
  onContinue: () => void;
}

export default function ClarificationModal({
  state,
  isDark,
  primaryColor,
  isValidating,
  onSelectSuggestion,
  onCancel,
  onContinue,
}: ClarificationModalProps) {
  if (!state.visible) return null;

  return (
    <Modal
      visible={state.visible}
      transparent
      animationType="fade"
      onRequestClose={isValidating ? undefined : onCancel}
    >
      <Pressable style={styles.modalBackdrop} onPress={isValidating ? undefined : onCancel}>
        <Pressable
          style={[
            styles.modalCard,
            isDark ? styles.modalCardDark : styles.modalCardLight,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header icon */}
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <AlertCircle size={28} strokeWidth={2} color={isDark ? '#f87171' : '#ef4444'} />
          </View>

          <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight, { marginBottom: 8 }]}>
            {state.title || "We couldn't recognize this input"}
          </Text>

          {/* Show what the user typed - Solid pure white uplifted card like Image 2, gray non-clickable text, no faded overlay */}
          <View
            style={[
              styles.clarificationUserInputWrap,
              {
                backgroundColor: isDark ? '#18181b' : '#ffffff',
                borderColor: isDark ? '#27272a' : '#e5e7eb',
              },
            ]}
          >
            <Text
              style={[
                styles.clarificationUserInputText,
                { color: isDark ? '#9ca3af' : '#9ca3af' },
              ]}
            >
              {`"${state.userInput}"`}
            </Text>
          </View>

          <Text style={[styles.clarificationSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
            Did you mean one of these?
          </Text>

          {/* Suggestion pills — single-choice with toggle/deselect */}
          <View style={styles.clarificationSuggestionsWrap}>
            {state.suggestions.map((suggestion) => {
              const isSelected = state.selectedSuggestion === suggestion;
              return (
                <Pressable
                  key={suggestion}
                  onPress={() => {
                    onSelectSuggestion(isSelected ? null : suggestion);
                  }}
                  style={({ pressed }) => [
                    styles.pill,
                    {
                      backgroundColor: isSelected ? primaryColor : (isDark ? '#1c1c20' : '#ffffff'),
                      borderWidth: 0,
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <Text style={[styles.pillText, { color: isSelected ? '#ffffff' : (isDark ? '#ffffff' : '#111827') }]}>
                    {suggestion}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <Pressable
              onPress={isValidating ? undefined : onCancel}
              disabled={isValidating}
              style={[
                styles.modalActionBtn,
                isDark ? styles.cancelBtnDark : styles.cancelBtnLight,
                { opacity: isValidating ? 0.5 : 1 },
              ]}
            >
              <Text style={[styles.btnText, { color: isDark ? '#ffffff' : '#111827' }]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={state.selectedSuggestion && !isValidating ? onContinue : undefined}
              disabled={!state.selectedSuggestion || isValidating}
              style={[
                styles.modalActionBtn,
                {
                  backgroundColor: !state.selectedSuggestion || isValidating
                    ? isDark ? '#27272a' : '#e5e7eb'
                    : primaryColor,
                },
              ]}
            >
              {isValidating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: !state.selectedSuggestion
                        ? isDark ? '#71717a' : '#9ca3af'
                        : '#ffffff',
                    },
                  ]}
                >
                  Continue
                </Text>
              )}
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
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalCardLight: {
    backgroundColor: '#FAF8F6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalCardDark: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2b2b30',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
  clarificationUserInputWrap: {
    width: '100%',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  clarificationUserInputText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  clarificationSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  clarificationSuggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 18,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
