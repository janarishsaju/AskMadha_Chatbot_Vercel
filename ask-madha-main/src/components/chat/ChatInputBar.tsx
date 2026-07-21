import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { impactMedium } from '../../utils/haptics';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../theme/tokens';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function ChatInputBar({ onSend, placeholder, disabled, style }: ChatInputBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    impactMedium();
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, SPACING.sm) }, style]}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.foreground,
              fontFamily: TYPOGRAPHY.fonts.serifRegular,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 0.5,
            },
          ]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder || 'What would you like to explore?'}
          placeholderTextColor={colors.mutedFaint}
          multiline
          maxLength={2000}
          editable={!disabled}
        />

        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          style={styles.sendButton}
        >
          {text.trim() && !disabled ? (
            <LinearGradient
              colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="arrow-up" size={20} color={colors.white} />
            </LinearGradient>
          ) : (
            <View style={[styles.sendButtonGradient, { backgroundColor: colors.border }]}>
              <Ionicons name="arrow-up" size={20} color={colors.white} />
            </View>
          )}
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 0.5,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    maxHeight: 100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
