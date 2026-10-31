import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Modal,
  Text,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  PanResponder,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, ArrowLeftRight, X } from 'lucide-react-native';
import { styles } from '@/styles/daily-journal.styles';

function formatToDatePattern(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length === 0) return '';
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function checkDatePartialError(formatted: string): boolean {
  if (!formatted) return false;
  const digits = formatted.replace(/\D/g, '');
  if (digits.length === 0) return false;

  if (digits.length >= 4) {
    const year = parseInt(digits.slice(0, 4), 10);
    if (year < 1900 || year > 2100) return true;
  }

  if (digits.length >= 5) {
    const mFirst = parseInt(digits[4], 10);
    if (mFirst > 1) return true;
  }
  if (digits.length >= 6) {
    const month = parseInt(digits.slice(4, 6), 10);
    if (month < 1 || month > 12) return true;
  }

  if (digits.length >= 7) {
    const dFirst = parseInt(digits[6], 10);
    if (dFirst > 3) return true;
  }
  if (digits.length === 8) {
    const year = parseInt(digits.slice(0, 4), 10);
    const month = parseInt(digits.slice(4, 6), 10);
    const day = parseInt(digits.slice(6, 8), 10);
    const maxDays = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDays) return true;
  }

  return false;
}

function SmartDateInput({
  initialValue,
  placeholder,
  onChangeFormatted,
  isDark,
}: {
  initialValue: string;
  placeholder: string;
  onChangeFormatted: (val: string, isValid: boolean) => void;
  isDark: boolean;
}) {
  const [text, setText] = useState(() => formatToDatePattern(initialValue || ''));
  const inputRef = useRef<TextInput>(null);
  const isDeletingRef = useRef(false);

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    isDeletingRef.current = nativeEvent.key === 'Backspace';
  };

  const isInvalid = checkDatePartialError(text);

  const handleChangeText = (incoming: string) => {
    let sanitized = incoming;
    if (isDeletingRef.current && incoming.endsWith('-')) {
      sanitized = incoming.slice(0, -1);
    }
    isDeletingRef.current = false;

    const formatted = formatToDatePattern(sanitized);
    setText(formatted);
    const hasError = checkDatePartialError(formatted);
    const isComplete = formatted.length === 10;
    onChangeFormatted(formatted, isComplete && !hasError);
  };

  const handleClear = () => {
    setText('');
    onChangeFormatted('', true);
    inputRef.current?.focus();
  };

  return (
    <View style={{ width: '100%' }}>
      <View
        style={[
          styles.dateInputBox,
          isDark ? styles.inputBoxDark : styles.inputBoxLight,
          isInvalid && {
            borderColor: '#ef4444',
            borderWidth: 1.5,
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
          },
          { height: 48, paddingVertical: 0, justifyContent: 'center', position: 'relative' },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={text}
          onKeyPress={handleKeyPress}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
          style={[
            styles.dateBoxInput,
            { color: isDark ? '#ffffff' : '#111827', paddingRight: 32 },
          ]}
          keyboardType="numeric"
          maxLength={10}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {text.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={10}
            style={{ position: 'absolute', right: 14, top: 14 }}
          >
            <X size={16} color={isDark ? '#a1a1aa' : '#9ca3af'} strokeWidth={2.2} />
          </Pressable>
        )}
      </View>
      {isInvalid && (
        <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '600', marginTop: 3, marginLeft: 6 }}>
          Invalid date
        </Text>
      )}
    </View>
  );
}

export interface JournalTimelineFilterModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  primaryColor: string;
  appliedFrom: string;
  appliedTill: string;
  onApply: (from: string, till: string) => void;
}

export function JournalTimelineFilterModal({
  visible,
  onClose,
  isDark,
  primaryColor,
  appliedFrom,
  appliedTill,
  onApply,
}: JournalTimelineFilterModalProps) {
  const dateFilterRef = useRef({ from: appliedFrom, till: appliedTill });
  const [dateSwapKey, setDateSwapKey] = useState(0);
  const [timelineMode, setTimelineMode] = useState<'inputs' | 'calendar'>('inputs');
  const [calCurrentDate, setCalCurrentDate] = useState(() => new Date());
  const [calActiveTab, setCalActiveTab] = useState<'from' | 'until'>('from');
  const [calSelectedFrom, setCalSelectedFrom] = useState(appliedFrom);
  const [calSelectedTill, setCalSelectedTill] = useState(appliedTill);
  // Smart button state: track whether any date has been entered/selected
  const [hasInputContent, setHasInputContent] = useState(
    () => !!(appliedFrom || appliedTill)
  );

  const calendarCells = useMemo(() => {
    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();

    const cells: { day: number | null; dateStr: string }[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ day: null, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({ day: d, dateStr: `${year}-${mStr}-${dStr}` });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateStr: '' });
    }
    return cells;
  }, [calCurrentDate]);

  const monthSwipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 18 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -25) {
            setCalCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
          } else if (gestureState.dx > 25) {
            setCalCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
          }
        },
      }),
    []
  );

  const handleSwapDates = () => {
    const temp = dateFilterRef.current.from;
    dateFilterRef.current.from = dateFilterRef.current.till;
    dateFilterRef.current.till = temp;
    setCalSelectedFrom(dateFilterRef.current.from);
    setCalSelectedTill(dateFilterRef.current.till);
    setDateSwapKey((prev) => prev + 1);
  };

  const handleCalSelectDay = (dateStr: string) => {
    if (calActiveTab === 'from') {
      setCalSelectedFrom(dateStr);
      dateFilterRef.current.from = dateStr;
      if (calSelectedTill && dateStr > calSelectedTill) {
        setCalSelectedTill('');
        dateFilterRef.current.till = '';
      }
      setCalActiveTab('until');
    } else {
      if (calSelectedFrom && dateStr < calSelectedFrom) {
        setCalSelectedFrom(dateStr);
        dateFilterRef.current.from = dateStr;
        setCalSelectedTill('');
        dateFilterRef.current.till = '';
        setCalActiveTab('until');
      } else {
        setCalSelectedTill(dateStr);
        dateFilterRef.current.till = dateStr;
      }
    }
    setDateSwapKey((k) => k + 1);
    setHasInputContent(!!(dateFilterRef.current.from || dateFilterRef.current.till));
  };

  const handleReset = () => {
    const hasFilterToReset = !!(appliedFrom || appliedTill || dateFilterRef.current.from || dateFilterRef.current.till);
    
    if (hasFilterToReset) {
      dateFilterRef.current.from = '';
      dateFilterRef.current.till = '';
      setCalSelectedFrom('');
      setCalSelectedTill('');
      setHasInputContent(false);
      setDateSwapKey((k) => k + 1);
      onApply('', '');
    }
    onClose();
  };

  const handleApply = () => {
    onApply(dateFilterRef.current.from.trim(), dateFilterRef.current.till.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback>
          <View style={[styles.timelineModalCard, isDark ? styles.timelineModalCardDark : styles.timelineModalCardLight]}>
            {/* Top Row: Date on Left, Small Toggle Button on Right */}
            <View style={styles.timelineTopBar}>
              <View style={styles.timelineHeaderInfo}>
                <Calendar size={17} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
                <Text style={[styles.timelineDateText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>

              <Pressable
                onPress={() => setTimelineMode((prev) => (prev === 'calendar' ? 'inputs' : 'calendar'))}
                style={({ pressed }) => [
                  styles.timelineModeToggleBtn,
                  {
                    backgroundColor: pressed
                      ? (isDark ? '#27272a' : '#f0f0f2')
                      : (isDark ? '#18181b' : '#ffffff'),
                    borderColor: isDark ? '#27272a' : '#e5e7eb',
                  },
                ]}
                hitSlop={8}
              >
                <Text style={[styles.timelineModeToggleText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  {timelineMode === 'calendar' ? 'Manual' : 'Calendar'}
                </Text>
              </Pressable>
            </View>

            {/* VIEW 1: Smart Text Inputs */}
            {timelineMode === 'inputs' ? (
              <View style={styles.timelineBoxesWrapper}>
                <SmartDateInput
                  key={`from-${dateSwapKey}-${visible}`}
                  initialValue={calSelectedFrom}
                  placeholder="From: YYYY-MM-DD"
                  onChangeFormatted={(val) => {
                    dateFilterRef.current.from = val;
                    setCalSelectedFrom(val);
                    setHasInputContent(!!(val || dateFilterRef.current.till));
                  }}
                  isDark={isDark}
                />

                <View style={styles.arrowsBetweenRow}>
                  <Pressable 
                    onPress={handleSwapDates}
                    style={({ pressed }) => [
                      styles.oppositeArrowsBtn,
                      {
                        backgroundColor: pressed
                          ? (isDark ? '#27272a' : '#f0f0f2')
                          : (isDark ? '#18181b' : '#ffffff'),
                        borderColor: isDark ? '#27272a' : '#e5e7eb',
                      },
                    ]}
                    hitSlop={10}
                  >
                    <ArrowLeftRight size={16} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
                  </Pressable>
                </View>

                <SmartDateInput
                  key={`till-${dateSwapKey}-${visible}`}
                  initialValue={calSelectedTill}
                  placeholder="Until: YYYY-MM-DD"
                  onChangeFormatted={(val) => {
                    dateFilterRef.current.till = val;
                    setCalSelectedTill(val);
                    setHasInputContent(!!(dateFilterRef.current.from || val));
                  }}
                  isDark={isDark}
                />
              </View>
            ) : (
              /* VIEW 2: Visual Calendar Picker */
              <View style={styles.calPickerContainer}>
                <View style={styles.calSelectionRow}>
                  <Pressable
                    onPress={() => setCalActiveTab('from')}
                    style={[
                      styles.calSelectionBox,
                      calActiveTab === 'from'
                        ? {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            borderWidth: 1.5,
                            shadowColor: primaryColor,
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.35,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        : {
                            backgroundColor: isDark ? '#18181b' : '#ffffff',
                            borderColor: isDark ? '#27272a' : '#e5e7eb',
                            borderWidth: 1,
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.calSelectionLabel,
                        {
                          color:
                            calActiveTab === 'from'
                              ? 'rgba(255, 255, 255, 0.85)'
                              : isDark
                              ? '#a1a1aa'
                              : '#6b7280',
                        },
                      ]}
                    >
                      From
                    </Text>
                    <Text
                      style={[
                        styles.calSelectionDate,
                        {
                          color:
                            calActiveTab === 'from'
                              ? '#ffffff'
                              : isDark
                              ? '#ffffff'
                              : '#000000',
                        },
                      ]}
                    >
                      {calSelectedFrom || 'Select'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setCalActiveTab('until')}
                    style={[
                      styles.calSelectionBox,
                      calActiveTab === 'until'
                        ? {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            borderWidth: 1.5,
                            shadowColor: primaryColor,
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.35,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        : {
                            backgroundColor: isDark ? '#18181b' : '#ffffff',
                            borderColor: isDark ? '#27272a' : '#e5e7eb',
                            borderWidth: 1,
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.calSelectionLabel,
                        {
                          color:
                            calActiveTab === 'until'
                              ? 'rgba(255, 255, 255, 0.85)'
                              : isDark
                              ? '#a1a1aa'
                              : '#6b7280',
                        },
                      ]}
                    >
                      Until
                    </Text>
                    <Text
                      style={[
                        styles.calSelectionDate,
                        {
                          color:
                            calActiveTab === 'until'
                              ? '#ffffff'
                              : isDark
                              ? '#ffffff'
                              : '#000000',
                        },
                      ]}
                    >
                      {calSelectedTill || 'Select'}
                    </Text>
                  </Pressable>
                </View>

                {/* Slidable Calendar Area with PanResponder */}
                <View {...monthSwipePanResponder.panHandlers} style={{ overflow: 'hidden' }}>
                  <View style={styles.calMonthNavRow}>
                    <Pressable
                      onPress={() => setCalCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      hitSlop={10}
                      style={styles.calNavArrow}
                    >
                      <ChevronLeft size={18} color={isDark ? '#d4d4d8' : '#374151'} />
                    </Pressable>

                    <Text style={[styles.calMonthTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                      {calCurrentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>

                    <Pressable
                      onPress={() => setCalCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      hitSlop={10}
                      style={styles.calNavArrow}
                    >
                      <ChevronRight size={18} color={isDark ? '#d4d4d8' : '#374151'} />
                    </Pressable>
                  </View>

                  <View style={styles.calRow}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                      <View key={i} style={styles.calWeekdayCell}>
                        <Text style={[styles.calWeekdayText, { color: isDark ? '#71717a' : '#9ca3af' }]}>
                          {d}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Grid */}
                  {(() => {
                    const rangeColor = isDark ? 'rgba(192,132,252,0.18)' : 'rgba(139,92,246,0.12)';
                    const rows: typeof calendarCells[] = [];
                    for (let i = 0; i < calendarCells.length; i += 7) {
                      rows.push(calendarCells.slice(i, i + 7));
                    }
                    return rows.map((row, rowIdx) => {
                      let startCol = -1;
                      let endCol = -1;
                      let isRowStartFrom = false;
                      let isRowEndTill = false;

                      const bothSelected = !!(calSelectedFrom && calSelectedTill);
                      const isSameDay = calSelectedFrom === calSelectedTill;

                      if (bothSelected && !isSameDay) {
                        row.forEach((item, colIdx) => {
                          if (!item.day) return;
                          const inRange = item.dateStr > calSelectedFrom && item.dateStr < calSelectedTill;
                          const isFrom = item.dateStr === calSelectedFrom;
                          const isTill = item.dateStr === calSelectedTill;

                          if (isFrom || isTill || inRange) {
                            if (startCol === -1) {
                              startCol = colIdx;
                              if (isFrom) isRowStartFrom = true;
                            }
                            endCol = colIdx;
                            if (isTill) isRowEndTill = true;
                          }
                        });
                      }

                      let stripStyle = null;
                      if (startCol !== -1 && endCol !== -1) {
                        const cellPct = 100 / 7;
                        const leftPct = isRowStartFrom ? (startCol + 0.5) * cellPct : startCol * cellPct;
                        const rightPct = isRowEndTill ? (6 - endCol + 0.5) * cellPct : (6 - endCol) * cellPct;

                        stripStyle = {
                          left: `${leftPct}%`,
                          right: `${rightPct}%`,
                          borderTopLeftRadius: !isRowStartFrom && startCol === 0 ? 19 : 0,
                          borderBottomLeftRadius: !isRowStartFrom && startCol === 0 ? 19 : 0,
                          borderTopRightRadius: !isRowEndTill && endCol === 6 ? 19 : 0,
                          borderBottomRightRadius: !isRowEndTill && endCol === 6 ? 19 : 0,
                        };
                      }

                      return (
                        <View key={rowIdx} style={styles.calRow}>
                          {stripStyle && (
                            <View
                              pointerEvents="none"
                              style={[
                                styles.calStripBase,
                                { backgroundColor: rangeColor },
                                stripStyle as any,
                              ]}
                            />
                          )}

                          {row.map((item, colIdx) => {
                            const globalIdx = rowIdx * 7 + colIdx;
                            if (!item.day) {
                              return <View key={`e-${globalIdx}`} style={styles.calCell} />;
                            }
                            const isFrom = calSelectedFrom === item.dateStr;
                            const isTill = calSelectedTill === item.dateStr;
                            const isSelected = isFrom || isTill;

                            return (
                              <Pressable
                                key={item.dateStr}
                                onPress={() => handleCalSelectDay(item.dateStr)}
                                style={styles.calCell}
                              >
                                <View
                                  style={[
                                    styles.calDayInner,
                                    isSelected && { backgroundColor: primaryColor },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.calDayNum,
                                      { color: isSelected ? '#ffffff' : (isDark ? '#e4e4e7' : '#111827') },
                                      isSelected && { fontWeight: '700', fontSize: 13 },
                                    ]}
                                  >
                                    {item.day}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      );
                    });
                  })()}
                </View>
              </View>
            )}

            {/* Actions: Reset & Apply */}
            <View style={styles.timelineActionsRow}>
              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  styles.timelineBtnSecondary,
                  isDark ? styles.btnSecDark : styles.btnSecLight,
                  {
                    backgroundColor: pressed
                      ? (isDark ? '#27272a' : '#f0f0f2')
                      : (isDark ? '#18181b' : '#ffffff'),
                    borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.1)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timelineBtnSecondaryText,
                    { color: isDark ? '#ffffff' : '#111827' },
                  ]}
                >
                  Reset
                </Text>
              </Pressable>

              <Pressable
                onPress={hasInputContent ? handleApply : undefined}
                disabled={!hasInputContent}
                style={({ pressed }) => [
                  styles.timelineBtnPrimary,
                  {
                    backgroundColor: hasInputContent
                      ? primaryColor
                      : (isDark ? '#27272a' : '#e5e7eb'),
                    opacity: !hasInputContent ? 0.6 : (pressed ? 0.85 : 1),
                    shadowOpacity: hasInputContent ? 0.08 : 0,
                    elevation: hasInputContent ? 3 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timelineBtnPrimaryText,
                    { color: hasInputContent ? '#ffffff' : (isDark ? '#71717a' : '#9ca3af') },
                  ]}
                >
                  Apply Timeline
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

export default JournalTimelineFilterModal;
