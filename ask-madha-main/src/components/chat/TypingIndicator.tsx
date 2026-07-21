import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { SPACING } from '../../theme/tokens';

export function TypingIndicator() {
  const { colors } = useTheme();

  const createDotStyle = (delay: number) =>
    useAnimatedStyle(() => ({
      transform: [
        {
          translateY: withRepeat(
            withDelay(
              delay,
              withSequence(
                withTiming(-6, { duration: 300 }),
                withTiming(0, { duration: 300 })
              )
            ),
            -1
          ),
        },
      ],
    }));

  const dot1Style = createDotStyle(0);
  const dot2Style = createDotStyle(150);
  const dot3Style = createDotStyle(300);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <Ionicons name="sparkles" size={16} color={colors.white} />
      </LinearGradient>
      <View style={[styles.dotsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dot1Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dot2Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dot3Style]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
