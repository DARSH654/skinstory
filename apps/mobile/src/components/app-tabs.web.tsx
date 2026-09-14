import { Tabs } from 'expo-router';
import { View, Text, Pressable, useColorScheme, StyleSheet, Platform } from 'react-native';
import { Home, ScanFace, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomHomeIcon, CustomClockIcon } from './custom-icons';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

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

          if (!['index', 'scan', 'routine'].includes(route.name)) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const textColor = isFocused 
            ? (isDark ? '#ffffff' : '#000000') 
            : (isDark ? '#71717a' : '#9ca3af'); 
          
          const iconColor = isFocused 
            ? (isDark ? '#ddc5f8' : '#6417b8')
            : (isDark ? '#71717a' : '#9ca3af');

          const pillBgColor = isDark ? '#3b0764' : '#e9d5ff';

          let Icon = null;
          if (route.name === 'index') Icon = CustomHomeIcon;
          else if (route.name === 'scan') Icon = ScanFace;
          else if (route.name === 'routine') Icon = CustomClockIcon;
          else Icon = CustomHomeIcon;

          return (
            <Pressable
              key={route.name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              // @ts-ignore
              style={({ pressed, hovered }: any) => [
                styles.tabItem,
                hovered && { opacity: 0.8 }
              ]}
            >
              {({ pressed, hovered }: any) => (
                <>
                  <View style={[
                    styles.iconContainer,
                    isFocused && (isDark ? { backgroundColor: pillBgColor } : styles.iconActiveLight),
                    (pressed || hovered) && !isFocused && (isDark ? styles.iconPressedDark : styles.iconPressedLight)
                  ]}>
                    {Icon && (
                      <Icon 
                        size={29} 
                        strokeWidth={isFocused ? 2.5 : 2} 
                        color={iconColor}
                      />
                    )}
                  </View>
                  <Text style={[
                    styles.tabLabel,
                    { color: textColor, fontWeight: isFocused ? '700' : '500' }
                  ]}>
                    {label as string}
                  </Text>
                </>
              )}
            </Pressable>
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
  },
  tabBar: {
    width: '100%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  tabBarLight: {
    backgroundColor: '#F5F5F7',
    borderColor: '#e5e7eb',
  },
  tabBarDark: {
    backgroundColor: '#121212',
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
    overflow: 'hidden',
  },
  iconActiveLight: {
    backgroundColor: '#f3e8ff',
  },
  iconActiveDark: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  iconPressedLight: {
    backgroundColor: '#e9d5ff',
  },
  iconPressedDark: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  }
});

export default function AppTabs() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="routine" options={{ title: 'Routine' }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
