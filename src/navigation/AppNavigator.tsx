import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return <Text style={[styles.icon, { opacity: focused ? 1 : 0.55 }]}>{symbol}</Text>;
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
        primary: colors.primary,
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
          headerTitleStyle: { fontWeight: '700' },
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
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
          component={DashboardScreen}
          options={{
            title: 'IoT Control',
            tabBarLabel: 'Painel',
            tabBarIcon: ({ focused }) => <TabIcon symbol="📊" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: 'Histórico',
            tabBarIcon: ({ focused }) => <TabIcon symbol="📜" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Configurações',
            tabBarIcon: ({ focused }) => <TabIcon symbol="⚙️" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Altura fixa: sem ela a linha do emoji é maior que o espaço do ícone e empurra o rótulo da aba.
  icon: {
    fontSize: 18,
    lineHeight: 22,
    height: 22,
    textAlign: 'center',
  },
});
