import React, { useState } from 'react';
import { View, StyleSheet, NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { Text } from '@/components/AppText';

interface ChartCardHeaderProps {
  title: string;
  unit?: string;
  isDark: boolean;
  colors: any;
  rightElement?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function ChartCardHeader({
  title,
  unit,
  isDark,
  colors,
  rightElement,
  icon,
}: ChartCardHeaderProps) {
  // If title has more than ~22 characters, it will wrap onto multiple lines on mobile screens.
  // We initialize to true for long titles so there is zero layout flash/delay on Android.
  const [isMultiLine, setIsMultiLine] = useState(() => (title ? title.length > 22 : false));

  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    const lineCount = e.nativeEvent.lines.length;
    if (lineCount > 1 && !isMultiLine) {
      setIsMultiLine(true);
    } else if (lineCount <= 1 && isMultiLine && title.length <= 22) {
      setIsMultiLine(false);
    }
  };

  const pill = rightElement || (unit ? (
    <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
      <Text style={[styles.unitText, { color: colors.textSecondary }]}>{unit}</Text>
    </View>
  ) : null);

  if (!pill) {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.titleRowFull}>
          {icon}
          <Text
            onTextLayout={handleTextLayout}
            style={[styles.cardTitleFull, { color: colors.text }]}
          >
            {title}
          </Text>
        </View>
      </View>
    );
  }

  if (isMultiLine) {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.titleRowFull}>
          {icon}
          <Text
            onTextLayout={handleTextLayout}
            style={[styles.cardTitleFull, { color: colors.text }]}
          >
            {title}
          </Text>
        </View>
        <View style={styles.pillRowBelow}>
          {pill}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.headerRow}>
      <View style={styles.titleRow}>
        {icon}
        <Text
          onTextLayout={handleTextLayout}
          style={[styles.cardTitle, { color: colors.text }]}
        >
          {title}
        </Text>
      </View>
      <View style={styles.pillRight}>
        {pill}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  titleRowFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardTitleFull: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pillRight: {
    flexShrink: 0,
  },
  pillRowBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  unitPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
