import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable, StyleSheet, Platform, DeviceEventEmitter } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScanFace, Clock, Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated';
import { CustomProgressIcon, CustomHomeIcon, CustomClockIcon } from './custom-icons';
import { Colors } from '@/constants/theme';

let isRoutineCreateDirty = false;
DeviceEventEmitter.addListener('createRoutineDirtyState', (isDirty) => {
  isRoutineCreateDirty = isDirty;
});

function TabItem({ routeName, isFocused, isDark, onPress, label, Icon }: any) {
  const textColor = isFocused
    ? (isDark ? '#ffffff' : '#000000') 
    : (isDark ? '#71717a' : '#9ca3af');

  const iconColor = isFocused
    ? Colors.light.primary
    : (isDark ? '#71717a' : '#9ca3af');

  const pillBgColor = isDark ? '#2d253c' : '#e8e3f1';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isFocused ? 1 : 0.6, { duration: 150 }) },
      ],
      opacity: withTiming(isFocused ? 1 : 0, { duration: 150 }),
    };
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: isFocused ? withSequence(withTiming(1.12, { duration: 100 }), withTiming(1, { duration: 150 })) : withTiming(1, { duration: 150 }) },
      ],
    };
  }, [isFocused]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabItem}
    >
      <View style={styles.iconContainer}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.iconActivePill,
            { backgroundColor: pillBgColor },
            animatedStyle,
          ]}
        />
        <Animated.View style={animatedIconStyle}>
          {Icon && (
            <Icon 
              size={29} 
              color={iconColor} 
              strokeWidth={isFocused ? 2.2 : 1.8} 
            />
          )}
        </Animated.View>
      </View>
      <Text style={[
        styles.tabLabel,
        { color: textColor, fontWeight: isFocused ? '700' : '500' }
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const currentRouteName = state.routes[state.index]?.name;
  if (currentRouteName === 'profile') {
    return null;
  }

  return (
    <View style={[
      styles.container, 
      { paddingBottom: insets.bottom },
      isDark ? styles.tabBarDark : styles.tabBarLight
    ]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          if (!['index', 'progress', 'routine', 'scan'].includes(route.name)) return null;

          const isFocused = state.index === index;
          const isScan = route.name === 'scan';

          const onPress = () => {
            if (route.name === 'scan') {
              navigation.navigate('camera');
              return;
            }

            if (!isFocused && isRoutineCreateDirty) {
              DeviceEventEmitter.emit('showUnsavedWarning', { name: route.name, params: route.params });
              return;
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          let Icon = null;
          if (route.name === 'index') Icon = CustomHomeIcon;
          else if (route.name === 'progress') Icon = CustomProgressIcon;
          else if (route.name === 'scan') Icon = ScanFace;
          else if (route.name === 'routine') Icon = CustomClockIcon;
          else Icon = CustomHomeIcon;

          // ── Floating Scan FAB ──────────────────────────────────────────
          if (isScan) {
            return (
              <Pressable
                key={route.name}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.scanFab}
              >
                {({ pressed }) => (
                  <View style={[
                    styles.scanFabCircle,
                    isDark ? styles.scanFabDark : styles.scanFabLight,
                  ]}>
                    <ScanFace
                      size={28}
                      strokeWidth={2}
                      color={'#ffffff'}
                    />
                  </View>
                )}
              </Pressable>
            );
          }

          // ── Regular Home / Routine tabs ────────────────────────────────
          return (
            <TabItem
              key={route.name}
              routeName={route.name}
              isFocused={isFocused}
              isDark={isDark}
              onPress={onPress}
              label={label as string}
              Icon={Icon}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 50,
    borderTopWidth: 1,
    overflow: 'visible',
  },
  tabBar: {
    width: '100%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    overflow: 'visible',
  },
  tabBarLight: {
    backgroundColor: '#FAF8F6',
    borderColor: '#e5e7eb',
  },
  tabBarDark: {
    backgroundColor: '#0d0d0d',
    borderColor: '#27272a',
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 72, 
    height: '100%',
    gap: 1,
  },
  iconContainer: {
    width: 64,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActivePill: {
    borderRadius: 16,
  },
  iconActiveLight: {
    backgroundColor: '#e9d5ff',
  },
  iconActiveDark: {
    backgroundColor: 'rgba(192, 132, 252, 0.3)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Floating Scan FAB
  scanFab: {
    alignItems: 'center',
    justifyContent: 'center',
    // Lift the button above the tab bar
    marginTop: -36,
  },
  scanFabCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for elevation effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  scanFabLight: {
    backgroundColor: Colors.light.primary,
  },
  scanFabDark: {
    backgroundColor: Colors.light.primary,
  },
});

export default function AppTabs() {
  return (
    <Tabs
      backBehavior="history"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="routine" options={{ title: 'Routine' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
