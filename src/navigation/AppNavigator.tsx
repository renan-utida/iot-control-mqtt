import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandTitle } from '../components/BrandTitle';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { LumenLogo } from '../components/LumenLogo';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../themes/ThemeContext';

export type RootTabParamList = {
  Dashboard: undefined;
  History: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_BAR_HEIGHT = 64;

function HeaderLogo() {
  return (
    <View style={styles.logo}>
      <LumenLogo size={32} />
    </View>
  );
}

function tabIcon(name: IconName) {
  return function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return <Icon name={name} color={color} size={22} strokeWidth={focused ? 2.3 : 1.8} />;
  };
}

export function AppNavigator() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Reaproveita as cores do tema do app (Light/Dark) na navegação.
  const navigationTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, isDark]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerLeft: HeaderLogo,
          headerTitleAlign: 'left',
          headerTitleStyle: { fontWeight: '800', fontSize: 18 },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
          // Altura própria (somando a área segura do aparelho): na altura padrão o rótulo era cortado na web.
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingTop: 2,
            paddingBottom: insets.bottom + 2,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          options={{
            title: 'IoT Control',
            headerTitle: BrandTitle,
            tabBarLabel: 'Painel',
            tabBarIcon: tabIcon('dashboard'),
          }}
        >
          {({ navigation }) => <DashboardScreen onOpenHistory={() => navigation.navigate('History')} />}
        </Tab.Screen>
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Histórico', tabBarIcon: tabIcon('list') }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Configurações', tabBarIcon: tabIcon('sliders') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    paddingLeft: 16,
  },
});
