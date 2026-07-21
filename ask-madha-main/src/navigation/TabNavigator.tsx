import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Keyboard } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { TYPOGRAPHY, SPACING } from '../theme/tokens';
import { ChatScreen } from '../screens/ChatScreen';
import { DailyBreadScreen } from '../screens/DailyBreadScreen';
import { SearchBibleScreen } from '../screens/SearchBibleScreen';
import { CommunityScreen } from '../screens/CommunityScreen';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  const tabs = [
    { key: 'Chat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
    { key: 'DailyBread', icon: 'book-outline', activeIcon: 'book' },
    { key: 'SearchBible', icon: 'search-outline', activeIcon: 'search' },
    { key: 'Community', icon: 'people-outline', activeIcon: 'people' },
  ];

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const tab = tabs[index];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem}>
              <Ionicons
                name={(isFocused ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isFocused ? colors.primary : colors.mutedFaint}
              />
              {isFocused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
              <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.mutedFaint }]}>
                {tab.key === 'DailyBread' ? 'Bread' : tab.key === 'SearchBible' ? 'Search' : tab.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ height: insets.bottom }} />
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Chat" tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}>
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="DailyBread" component={DailyBreadScreen} />
      <Tab.Screen name="SearchBible" component={SearchBibleScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    borderTopWidth: Platform.OS === 'android' ? 0 : 0.5,
    ...Platform.select({
      android: { elevation: 8, shadowColor: '#000' },
      ios: {},
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'android' ? 64 : 60,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fonts.sansMedium,
  },
  activeIndicator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 2,
  },
});
