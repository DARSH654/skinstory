import { create } from 'zustand';
import { Appearance, ColorSchemeName } from 'react-native';

interface ThemeState {
  colorScheme: ColorSchemeName;
  selectedOption: 'light' | 'dark' | 'system';
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  colorScheme: (Appearance.getColorScheme() as ColorSchemeName) ?? 'light',
  selectedOption: 'system',
  setColorScheme: (scheme) => {
    const resolvedScheme = scheme === 'system' ? Appearance.getColorScheme() : scheme;
    
    set({
      colorScheme: resolvedScheme ?? 'light',
      selectedOption: scheme,
    });
  },
}));

// Listen for system-level theme changes when in system mode
Appearance.addChangeListener(({ colorScheme }) => {
  if (useThemeStore.getState().selectedOption === 'system') {
    useThemeStore.setState({ colorScheme });
  }
});
