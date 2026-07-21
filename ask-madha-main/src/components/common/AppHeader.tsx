import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY, SPACING } from '../../theme/tokens';
import { AvatarCircle } from './AvatarCircle';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onAvatarPress?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  avatarUrl?: string;
  displayName?: string;
}

export function AppHeader({
  title = 'Ask Madha',
  showBackButton = false,
  onBack,
  onAvatarPress,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  avatarUrl,
  displayName,
}: AppHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <LinearGradient
            colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.appIcon}
          >
            <Ionicons name="flame" size={18} color={colors.white} />
          </LinearGradient>
        )}
        <Text style={[styles.title, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          {title}
        </Text>
      </View>

      <View style={styles.right}>
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftPress}
            style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
          >
            <Ionicons name={leftIcon} size={20} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
          >
            <Ionicons name={rightIcon} size={20} color={colors.foreground} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onAvatarPress} accessibilityRole="button">
          <AvatarCircle size={36} uri={avatarUrl} displayName={displayName} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 0.5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
