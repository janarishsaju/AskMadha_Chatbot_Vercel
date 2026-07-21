import { useCallback, useEffect } from 'react';
import { Platform, UIManager, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  EBGaramond_400Regular,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
  EBGaramond_400Regular_Italic,
  EBGaramond_700Bold_Italic,
} from '@expo-google-fonts/eb-garamond';
import {
  CrimsonPro_400Regular,
  CrimsonPro_500Medium,
  CrimsonPro_600SemiBold,
} from '@expo-google-fonts/crimson-pro';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { useThemeStore } from './src/store/useThemeStore';

SplashScreen.preventAutoHideAsync();

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Make Android status bar translucent for edge-to-edge display
if (Platform.OS === 'android') {
  RNStatusBar.setTranslucent(true);
  RNStatusBar.setBackgroundColor('transparent');
}

export default function App() {
  const [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
    EBGaramond_400Regular_Italic,
    EBGaramond_700Bold_Italic,
    CrimsonPro_400Regular,
    CrimsonPro_500Medium,
    CrimsonPro_600SemiBold,
  });

  const { currentTheme } = useThemeStore();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      onLayoutRootView();
    }
  }, [fontsLoaded, onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  const statusBarStyle = currentTheme === 'dark' ? 'light' : 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <AppNavigator />
            <StatusBar style={statusBarStyle} />
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
