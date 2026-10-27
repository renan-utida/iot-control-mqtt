import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemeMode } from '../themes/colors';

const BROKER_URL_KEY = '@iotcontrol/brokerUrl';
const THEME_MODE_KEY = '@iotcontrol/themeMode';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

// Falhas de leitura/escrita não devem derrubar o app: usa-se o valor padrão.
export async function loadBrokerUrl(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(BROKER_URL_KEY);

    return value && value.trim() ? value.trim() : null;
  } catch (error) {
    console.warn('Não foi possível ler a URL do broker salva', error);
    return null;
  }
}

export async function saveBrokerUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(BROKER_URL_KEY, url.trim());
  } catch (error) {
    console.warn('Não foi possível salvar a URL do broker', error);
  }
}

export async function loadThemeMode(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_MODE_KEY);

    return isThemeMode(value) ? value : null;
  } catch (error) {
    console.warn('Não foi possível ler a preferência de tema', error);
    return null;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  } catch (error) {
    console.warn('Não foi possível salvar a preferência de tema', error);
  }
}
