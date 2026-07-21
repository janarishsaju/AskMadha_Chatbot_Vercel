import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../theme/ThemeContext';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { ChatHistoryScreen } from '../screens/ChatHistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ThemeSelectionScreen } from '../screens/ThemeSelectionScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';
import { HelpCenterScreen } from '../screens/settings/HelpCenterScreen';
import { DeleteAccountScreen } from '../screens/settings/DeleteAccountScreen';
import { StreakScreen } from '../screens/settings/StreakScreen';

const Stack = createNativeStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="Streak" component={StreakScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();
  const { session, initializing, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (initializing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
