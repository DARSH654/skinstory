import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
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

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
            <AnimatedSplashOverlay />
             <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="camera" />
              <Stack.Screen name="insight" />
              <Stack.Screen name="select-scans" />
              <Stack.Screen name="scan/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="routine/start" options={{ headerShown: false, animation: 'fade' }} />
            </Stack>
          </ThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
