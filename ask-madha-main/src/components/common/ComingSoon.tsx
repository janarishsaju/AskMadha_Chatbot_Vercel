import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY, SPACING } from '../../theme/tokens';

interface ComingSoonProps {
  icon?: keyof typeof Ionicons.glyphMap;
}

export function ComingSoon({ icon = 'sparkles-outline' }: ComingSoonProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Ionicons name={icon} size={48} color={colors.mutedFaint} />
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
