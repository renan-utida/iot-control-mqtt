import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandSplash } from './src/components/BrandSplash';
import { MqttProvider } from './src/context/MqttContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/themes/ThemeContext';

function Main() {
  const { isDark, isLoading } = useTheme();

  if (isLoading) {
    return <BrandSplash />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MqttProvider>
          <Main />
        </MqttProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
