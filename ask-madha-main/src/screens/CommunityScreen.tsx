import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { TYPOGRAPHY, SPACING } from '../theme/tokens';
import { AppHeader } from '../components/common/AppHeader';
import { useAuthStore } from '../store/useAuthStore';

export function CommunityScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AppHeader
        onAvatarPress={() => navigation.navigate('Settings')}
        avatarUrl={profile?.avatarUrl}
        displayName={profile?.displayName}
      />
      <View style={styles.center}>
        <Ionicons name="people-outline" size={48} color={colors.mutedFaint} />
        <Text style={[styles.label, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          Coming soon...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  label: { fontSize: TYPOGRAPHY.sizes.xl },
});
