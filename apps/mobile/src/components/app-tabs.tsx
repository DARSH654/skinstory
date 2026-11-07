import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScanFace, BookOpenText, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { CustomProgressIcon, CustomHomeIcon } from './custom-icons';
import { Colors } from '@/constants/theme';

function TabItem({ routeName, isFocused, isDark, onPress, label, Icon }: any) {
  const textColor = isFocused
    ? (isDark ? '#ffffff' : '#000000') 
    : (isDark ? '#71717a' : '#9ca3af');

  const iconColor = isFocused
    ? Colors.light.primary
    : (isDark ? '#71717a' : '#9ca3af');

  const pillBgColor = isDark ? '#2d253c' : '#e8e3f1';

  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 160 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
    opacity: progress.value,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabItem}
    >
      <View style={styles.iconContainer}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.iconActivePill,
            { backgroundColor: pillBgColor },
            animatedStyle,
          ]}
        />
        <View>
          {Icon && (
            <Icon 
              size={26} 
              color={iconColor} 
              strokeWidth={isFocused ? 2.2 : 1.8} 
            />
          )}
        </View>
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
  const router = useRouter();

  const currentRouteName = state.routes[state.index]?.name;
  if (currentRouteName === 'profile' || currentRouteName === 'chat') {
    return null;
  }

  return (
    <View 
      style={[
        styles.container, 
        { paddingBottom: insets.bottom },
        isDark ? styles.tabBarDark : styles.tabBarLight
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route: any) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          if (!['index', 'progress', 'scan', 'journal', 'chat'].includes(route.name)) return null;

          // DETERMINISTIC: Only the single tab that matches the active route name is focused
          const isFocused = route.name === currentRouteName;

          const onPress = () => {
            if (route.name === 'scan') {
              navigation.navigate('camera');
              return;
            }

            if (route.name === 'chat') {
              router.push('/new-chat');
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
          else if (route.name === 'journal') Icon = BookOpenText;
          else if (route.name === 'chat') Icon = MessageSquare;
          else Icon = CustomHomeIcon;

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
    justifyContent: 'space-around',
    paddingHorizontal: 8,
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
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 1,
  },
  iconContainer: {
    width: 54,
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
    fontSize: 11,
    fontWeight: '500',
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
      <Tabs.Screen name="progress" options={{ title: 'Insights' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="routine" options={{ href: null, title: 'Routine' }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
