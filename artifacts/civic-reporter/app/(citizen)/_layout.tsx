import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ReferenceTabBar({ state, navigation }: any) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const labels: Record<string, string> = { index: 'Home', events: 'Events', complaints: 'Complaints', profile: 'Profile' };
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: 'home-outline',
    events: 'calendar-outline',
    complaints: 'chatbox-ellipses-outline',
    profile: 'person-outline',
  };
  const routes = state.routes.filter((route: any) => route.name !== 'report' && route.name !== 'notifications');
  const bottomInset = isWeb ? 34 : insets.bottom;
  const renderTab = (route: any, index: number) => {
    const isFocused = state.index === index;
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityLabel={labels[route.name]}
        accessibilityState={isFocused ? { selected: true } : {}}
        testID={`citizen-tab-${route.name}`}
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={0.8}
      >
        <View style={[styles.tabIcon, isFocused && { backgroundColor: `${colors.accent}26` }]}>
          <Ionicons
            name={icons[route.name]}
            size={21}
            color={isFocused ? colors.accent : '#473a16'}
            style={styles.tabIconGlyph}
          />
        </View>
        <Text style={[styles.tabLabel, { color: '#000000', fontFamily: isFocused ? 'Inter_700Bold' : 'Inter_500Medium' }]}>
          {labels[route.name]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.tabShell, { height: 74 + bottomInset, paddingBottom: bottomInset, backgroundColor: '#184323' }]}>
      <View style={[styles.floatingBar, { backgroundColor: '#2b6e37', opacity: 1 }]}>
        {routes.slice(0, 2).map((route: any, index: number) => renderTab(route, index))}
        <View style={styles.centerSlot}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Post a complaint"
            testID="citizen-post-complaint"
            onPress={() => router.push('/(citizen)/report' as any)}
            style={[styles.plusButton, { backgroundColor: '#ebbf00', borderColor: '#E8F1EA' }]}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={34} color="#473a16" />
          </TouchableOpacity>
        </View>
        {routes.slice(2).map((route: any, offset: number) => renderTab(route, offset + 2))}
      </View>
    </View>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <Tabs
      tabBar={(props) => <ReferenceTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: 'relative',
          height: 74 + bottomInset,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="events" options={{ title: 'Events' }} />
      <Tabs.Screen name="complaints" options={{ title: 'Complaints' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="report" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

export default function CitizenLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/');
      else if (user.role !== 'citizen') router.replace('/(admin)/' as any);
    }
  }, [user, loading]);

  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  tabShell: {
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 11,
    marginTop: -19,
    marginBottom: -19,
    backgroundColor: 'transparent',
  },
  floatingBar: {
    position: 'relative',
    height: 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 0,
    opacity: 1,
    paddingHorizontal: 8,
    shadowColor: '#102D19',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  centerSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 60,
    borderTopColor: '#000000',
    borderRightColor: '#000000',
    borderBottomColor: '#000000',
    borderLeftColor: '#000000',
  },
  tabIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  tabIconGlyph: {
    lineHeight: 21,
    textAlign: 'center',
    includeFontPadding: false,
  },
  tabLabel: {
    fontSize: 9,
  },
  plusButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});