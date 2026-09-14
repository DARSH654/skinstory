import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, LayoutAnimation, Platform } from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, HelpCircle } from 'lucide-react-native';

const FAQ_ITEMS = [
  {
    q: 'How often should I scan my skin?',
    a: 'We recommend scanning 2 to 3 times a week under natural, even lighting. Doing this regularly provides accurate progress graphs and helps track skin changes over time.',
  },
  {
    q: 'Can I create a custom routine?',
    a: 'Yes! Navigate to the Routine tab where you can customize product steps, active ingredients, AM/PM timing, dos and don\'ts, and personal notes tailored to your daily skincare regimen.',
  },
  {
    q: 'What does "Make routines public" do?',
    a: 'When enabled in your Profile permissions, your custom routines are anonymously shared with the community so others dealing with similar skin concerns can discover and follow what works for you.',
  },
  {
    q: 'Is Skin Story a replacement for a dermatologist?',
    a: 'No. Skin Story offers AI-assisted skin insights, score trends, and routine organization. It is designed for daily skincare tracking and does not provide formal medical diagnosis or prescription treatments.',
  },
  {
    q: 'Is my facial scan data secure and private?',
    a: 'Yes. All face captures and skin texture analyses are encrypted. We never sell, broadcast, or share your raw images or facial recognition details with third parties.',
  },
  {
    q: 'How are the Skin Scores calculated?',
    a: 'Our scanning engine evaluates key facial zones for moisture balance, redness, texture uniformity, pore visibility, and overall barrier health against dermatological reference scales.',
  },
  {
    q: 'What should I do if my scan fails or gives blurry results?',
    a: 'Make sure your face is centered in the camera frame, remove heavy makeup or glasses, face a soft natural light source without harsh backlights, and hold your device steady.',
  },
  {
    q: 'Can I change between Light and Dark mode?',
    a: 'Yes. Go to Profile > Appearance and select Light Mode, Dark Mode, or System Default to automatically match your device theme.',
  },
  {
    q: 'How do I edit or delete a routine step?',
    a: 'Open the Routine tab, select the routine you want to edit, tap any product step to adjust usage frequency, active ingredients, or tap delete to remove it.',
  },
  {
    q: 'Will I receive routine reminders?',
    a: 'Ensure "Allow Notifications" is enabled in your Profile permissions. You will receive timely morning and evening prompts so you never miss a routine step.',
  },
  {
    q: 'Can I track product allergies or irritation?',
    a: 'Yes. When editing products in your routine, you can log personal notes, dos and don\'ts, and avoid specific active ingredients that cause irritation.',
  },
  {
    q: 'How can I submit feedback or request new features?',
    a: 'Go to Profile > Support & Feedback and tap "Feedback" or "Support" to send a direct message to our development team.',
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={[styles.root, isDark ? styles.bgDark : styles.bgLight, { paddingTop: insets.top }]}>
      {/* Header with simple clean back button (no redundant bar text) */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={15}>
          <ChevronLeft size={26} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={[styles.pageTitle, isDark ? styles.textDark : styles.textLight]}>
          Frequently Asked Questions
        </Text>

        {/* Icon on LEFT, then "How can we help?" */}
        <View style={styles.titleRow}>
          <HelpCircle size={22} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
          <Text style={[styles.title, isDark ? styles.subtextDark : styles.subtextLight]}>
            How can we help?
          </Text>
        </View>

        <View style={{ marginTop: 22, gap: 12 }}>
          {FAQ_ITEMS.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <Pressable
                key={idx}
                style={[styles.faqCard, isDark ? styles.cardDark : styles.cardLight]}
                onPress={() => toggleExpand(idx)}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, isDark ? styles.textDark : styles.textLight]}>
                    {item.q}
                  </Text>
                  <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
                    <ChevronDown size={18} color={isDark ? '#a1a1aa' : '#6b7280'} />
                  </View>
                </View>
                {isExpanded && (
                  <Text style={[styles.faqAnswer, isDark ? styles.subtextDark : styles.subtextLight]}>
                    {item.a}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgLight: { backgroundColor: '#F5F5F7' },
  bgDark: { backgroundColor: '#121212' },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 14,
    lineHeight: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
  },
  faqCard: {
    borderRadius: 16,
    padding: 16,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  textLight: { color: '#111827' },
  textDark: { color: '#ffffff' },
  subtextLight: { color: '#4b5563' },
  subtextDark: { color: '#a1a1aa' },
});
