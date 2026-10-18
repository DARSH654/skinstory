import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Text } from '@/components/AppText';
import { PRESET_SUGGESTIONS } from './constants';

interface SuggestionsListProps {
  isDark: boolean;
  onSelect: (text: string) => void;
}

export default function SuggestionsList({
  isDark,
  onSelect,
}: SuggestionsListProps) {
  return (
    <View style={styles.suggestionsWrapper}>
      <Text style={[styles.suggestionsHeader, { color: isDark ? '#71717a' : '#a1a1aa' }]}>
        Suggested questions:
      </Text>
      {PRESET_SUGGESTIONS.map((suggestion, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => onSelect(suggestion)}
          activeOpacity={0.75}
          style={[
            styles.suggestionPill,
            {
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
            },
          ]}
        >
          <Sparkles size={14} color={isDark ? '#a1a1aa' : '#71717a'} />
          <Text
            style={[
              styles.suggestionText,
              { color: isDark ? '#e4e4e7' : '#27272a' },
            ]}
          >
            {suggestion}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionsWrapper: {
    marginTop: 8,
    gap: 10,
  },
  suggestionsHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});
