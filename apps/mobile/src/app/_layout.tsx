import '@/lib/globalNavigationGuard';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F5F5F7',
    card: '#F5F5F7',
    text: '#000000',
    border: 'rgba(0,0,0,0.08)',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212',
    card: '#121212',
    text: '#ffffff',
    border: 'rgba(255,255,255,0.08)',
  },
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/auth/AuthModal';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Authentication re-enabled with Supabase
  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!session) {
        setShowAuthModal(true);
      }
      setAuthChecked(true);
    }).catch(() => {
      setAuthChecked(true);
    });

    // Listen for auth changes (sign in / sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setShowAuthModal(true);
      } else {
        setShowAuthModal(false);
      }
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black: require('../../assets/fonts/Outfit_900Black.ttf'),
    Montserrat_600SemiBold: require('../../assets/fonts/Montserrat_600SemiBold.ttf'),
    Montserrat_700Bold: require('../../assets/fonts/Montserrat_700Bold.ttf'),
    Montserrat_800ExtraBold: require('../../assets/fonts/Montserrat_800ExtraBold.ttf'),
  });

  if (!fontsLoaded || !authChecked) {
    return <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#121212' : '#F5F5F7' }} />;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="camera" />
                <Stack.Screen name="insight" />
                <Stack.Screen name="select-scans" />
                <Stack.Screen name="scan/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="streak" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                <Stack.Screen name="badges" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="daily-journal" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="add-journal-question" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="new-chat" options={{ headerShown: false, animation: 'slide_from_right' }} />
              </Stack>
              <AuthModal
                visible={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => setShowAuthModal(false)}
              />
            </ThemeProvider>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
