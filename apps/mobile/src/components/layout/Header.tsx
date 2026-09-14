import React from 'react';
import { View, StyleSheet, Pressable, Appearance, Image } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/store/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sun, Moon, User, Compass } from 'lucide-react-native';
import Logo from '@/components/Logo';

export default function Header({ title, showBack = false, onBack }: { title: string, showBack?: boolean, onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();

  const toggleTheme = () => {
    useThemeStore.getState().setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <View style={[
      styles.header, 
      { paddingTop: Math.max(insets.top, 16) },
      isDark ? styles.headerDark : styles.headerLight
    ]}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={() => onBack ? onBack() : router.back()} style={[styles.iconBtn, { marginRight: 8 }]}>
            <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
          </Pressable>
        )}
        <View style={styles.logoContainer}>
          <Logo size={22} color={isDark ? '#ffffff' : '#111111'} />
          <Text style={[styles.logoText, { color: isDark ? '#ffffff' : '#111111' }]}>Skin Story</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <Pressable 
          onPress={() => router.push('/onboarding/page-1')} 
          style={[styles.actionBtn, isDark ? styles.actionBtnDark : styles.actionBtnLight]}
          accessibilityLabel="Onboarding"
        >
          <Compass size={18} color={isDark ? "#a1a1aa" : "#4b5563"} />
        </Pressable>
        <Pressable onPress={toggleTheme} style={[styles.actionBtn, isDark ? styles.actionBtnDark : styles.actionBtnLight]}>
          {isDark ? (
            <Sun size={18} color="#a1a1aa" />
          ) : (
            <Moon size={18} color="#4b5563" />
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/profile')} style={[styles.actionBtn, isDark ? styles.actionBtnDark : styles.actionBtnLight]}>
          <User size={18} color={isDark ? "#a1a1aa" : "#4b5563"} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  headerLight: {
    backgroundColor: '#FAF8F6',
    borderBottomColor: '#f3f4f6',
  },
  headerDark: {
    backgroundColor: '#0d0d0d',
    borderBottomColor: '#27272a',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#937abd',
    letterSpacing: 0.5,
    fontFamily: 'Outfit_800ExtraBold'
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLight: {
    backgroundColor: '#f3f4f6',
  },
  actionBtnDark: {
    backgroundColor: '#27272a',
  },
  iconBtn: {
    padding: 4,
    marginRight: -4,
  },
});
