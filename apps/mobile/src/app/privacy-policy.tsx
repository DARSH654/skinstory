import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldCheck, Lock } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, isDark ? styles.bgDark : styles.bgLight, { paddingTop: insets.top }]}>
      {/* Clean Top Back Chevron (non-bordered, fixed top) */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={15}>
          <ChevronLeft size={26} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Neutral Hero Icon */}
        <View style={[styles.iconHero, isDark ? styles.iconHeroDark : styles.iconHeroLight]}>
          <ShieldCheck size={36} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
        </View>

        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
          Privacy Policy
        </Text>
        <Text style={[styles.lastUpdated, isDark ? styles.subtextDark : styles.subtextLight]}>
          Effective Date: August 18, 2026
        </Text>

        {/* Overview Banner */}
        <View style={[styles.summaryCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Lock size={20} color={isDark ? '#a1a1aa' : '#4b5563'} style={{ marginTop: 2 }} />
          <Text style={[styles.summaryText, isDark ? styles.textDark : styles.textLight]}>
            We collect the information you provide and scan your skin metrics to generate personalized skincare routines, but we never share, sell, or disclose your scan images or personal data with anyone.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, isDark ? styles.textDark : styles.textLight]}>
            1. Introduction
          </Text>
          <Text style={[styles.paragraph, isDark ? styles.subtextDark : styles.subtextLight]}>
            Skin Story ("we", "our", or "us") provides a personalized skincare companion application designed to help users track their skincare progress, discover routines, and evaluate their skin health. This Privacy Policy governs your use of the Skin Story mobile application across Apple iOS and Google Android platforms.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, isDark ? styles.textDark : styles.textLight]}>
            2. Information We Collect
          </Text>
          <Text style={[styles.paragraph, isDark ? styles.subtextDark : styles.subtextLight]}>
            We collect only the information necessary to provide and personalize your skincare experience:
          </Text>
          
          <Text style={[styles.bulletTitle, isDark ? styles.textDark : styles.textLight]}>
            • Account & Profile Information:
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            Your display name, email address, avatar photo, and application preferences.
          </Text>

          <Text style={[styles.bulletTitle, isDark ? styles.textDark : styles.textLight]}>
            • Skincare Routines & Products:
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            Custom routines you create, product names, morning/evening steps, product photos, and personal dos and don'ts notes.
          </Text>

          <Text style={[styles.bulletTitle, isDark ? styles.textDark : styles.textLight]}>
            • Camera & Skin Scan Captures:
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            Photos taken with your camera exclusively to calculate skin health scores (hydration, oiliness, texture, redness). We do not use these images for any other purpose and never share them with anyone.
          </Text>

          <Text style={[styles.bulletTitle, isDark ? styles.textDark : styles.textLight]}>
            • Device & Diagnostic Metrics:
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            Non-identifiable technical data such as operating system version and crash reports to ensure app reliability.
          </Text>
        </View>

        {/* Section 3: Face & Scan Data Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, isDark ? styles.textDark : styles.textLight]}>
            3. Face & Camera Data Protection
          </Text>
          <Text style={[styles.paragraph, isDark ? styles.subtextDark : styles.subtextLight]}>
            In compliance with Apple App Store Guideline 5.1.1/5.1.2 and Google Play User Data Policies:
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • <Text style={{ fontWeight: '700' }}>Strictly Analytical Purpose:</Text> Facial photos are captured solely to measure regional skin quality (forehead, nose, chin) and provide routine guidance.
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • <Text style={{ fontWeight: '700' }}>No Biometric Identification:</Text> We do not generate facial recognition signatures, identity profiles, or surveillance templates.
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • <Text style={{ fontWeight: '700' }}>Zero Third-Party Sharing:</Text> Your facial scans and photos are never sold, rented, or shared with third-party advertisers, data brokers, or marketing partners.
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • <Text style={{ fontWeight: '700' }}>Local Control & Retention:</Text> All scan images remain stored securely in your private app environment. You can delete any individual scan or clear your full scan history anytime.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, isDark ? styles.textDark : styles.textLight]}>
            4. How We Use Your Information
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • To calculate and display personalized skin scores and progress trends.
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • To organize your daily skincare steps and reminder schedules.
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • If you choose to make routines public, they are shared anonymously with the community without attaching your name or email.
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • To provide customer support and troubleshoot technical issues.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, isDark ? styles.textDark : styles.textLight]}>
            5. Data Security & Storage
          </Text>
          <Text style={[styles.paragraph, isDark ? styles.subtextDark : styles.subtextLight]}>
            We implement industry-standard encryption protocols (HTTPS/TLS in transit and sandboxed encrypted storage on-device) to protect your personal information against unauthorized access, loss, or misuse.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, isDark ? styles.textDark : styles.textLight]}>
            6. Your Rights & Account Deletion
          </Text>
          <Text style={[styles.paragraph, isDark ? styles.subtextDark : styles.subtextLight]}>
            Under global privacy standards (including GDPR and CCPA), you have full control over your data:
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • <Text style={{ fontWeight: '700' }}>Edit & Export:</Text> You can view and update your profile details and routines anytime.
          </Text>
          <Text style={[styles.bulletBody, isDark ? styles.subtextDark : styles.subtextLight]}>
            • <Text style={{ fontWeight: '700' }}>Permanent Deletion:</Text> You can permanently erase your entire account, profile, routines, and all scan data directly via <Text style={{ fontWeight: '700' }}>Profile → Delete Account</Text>.
          </Text>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, isDark ? styles.textDark : styles.textLight]}>
            7. Children's Privacy
          </Text>
          <Text style={[styles.paragraph, isDark ? styles.subtextDark : styles.subtextLight]}>
            Skin Story is intended for users aged 13 and older (or 16 in the European Economic Area). We do not knowingly collect personal information from children under these age limits.
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, isDark ? styles.textDark : styles.textLight]}>
            8. Changes to This Policy
          </Text>
          <Text style={[styles.paragraph, isDark ? styles.subtextDark : styles.subtextLight]}>
            We may update this policy periodically. Any changes will be reflected with an updated Effective Date. Continued use of the app constitutes acceptance of any revisions.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgLight: { backgroundColor: '#FAF8F6' },
  bgDark: { backgroundColor: '#121212' },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  iconHero: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  iconHeroLight: {
    backgroundColor: '#f3f4f6',
  },
  iconHeroDark: {
    backgroundColor: '#27272a',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  lastUpdated: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Outfit_400Regular',
  },
  summaryCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium',
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
    borderColor: '#27272a',
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: -0.2,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Outfit_400Regular',
    marginBottom: 6,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
    fontFamily: 'Outfit_700Bold',
  },
  bulletBody: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Outfit_400Regular',
    marginBottom: 6,
    paddingLeft: 4,
  },
  textLight: { color: '#111827' },
  textDark: { color: '#ffffff' },
  subtextLight: { color: '#4b5563' },
  subtextDark: { color: '#a1a1aa' },
});
