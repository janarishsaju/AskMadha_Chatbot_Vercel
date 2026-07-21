import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY } from '../../theme/tokens';

interface AvatarCircleProps {
  size?: number;
  uri?: string;
  initials?: string;
  displayName?: string;
  borderColor?: string;
  borderWidth?: number;
}

export function AvatarCircle({
  size = 36,
  uri,
  initials,
  displayName,
  borderColor,
  borderWidth = 0,
}: AvatarCircleProps) {
  const { colors } = useTheme();
  const displayInitials =
    initials ||
    (displayName && displayName !== 'Dear Friend'
      ? displayName.charAt(0).toUpperCase()
      : 'M');

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: borderColor || colors.primary,
          borderWidth,
          overflow: 'hidden',
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text
            style={[
              styles.initials,
              {
                color: colors.white,
                fontSize: size * 0.4,
                fontFamily: TYPOGRAPHY.fonts.serifBold,
              },
            ]}
          >
            {displayInitials}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    textAlign: 'center',
  },
});
