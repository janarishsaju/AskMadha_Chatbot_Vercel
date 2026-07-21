import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme/tokens';
import { useThemeStore } from '../store/useThemeStore';
import { themes, ThemeId } from '../theme/themes';

export function ThemeSelectionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { currentTheme, pendingTheme, setPendingTheme, applyPendingTheme, cancelPendingTheme } = useThemeStore();

  const selected = pendingTheme || currentTheme;

  const handleApply = () => {
    applyPendingTheme();
    navigation.goBack();
  };

  const handleCancel = () => {
    cancelPendingTheme();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>Theme</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
            Choose Your Theme
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.serifItalic }]}>
            Select a mode that best suits your reading comfort.
          </Text>
        </View>

        {(Object.keys(themes) as ThemeId[]).map((themeId) => {
          const theme = themes[themeId];
          const isActive = selected === themeId;

          return (
            <TouchableOpacity
              key={themeId}
              onPress={() => setPendingTheme(themeId)}
              style={[
                styles.themeCard,
                { backgroundColor: colors.surface, borderColor: isActive ? colors.primary : 'transparent' },
                SHADOWS.md,
              ]}
              activeOpacity={0.7}
            >
              {isActive && (
                <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.activeBadgeText, { fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>ACTIVE</Text>
                </View>
              )}

              <LinearGradient
                colors={theme.previewColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.previewBar}
              >
                <Text style={[styles.previewText, { color: theme.colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
                  Aa
                </Text>
              </LinearGradient>

              <Text style={[styles.themeName, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
                {theme.name}
              </Text>
              <Text style={[styles.themeDescription, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
                {theme.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity onPress={handleApply} disabled={!pendingTheme} style={styles.applyButton}>
          <LinearGradient
            colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.applyButtonGradient, !pendingTheme && styles.applyButtonDisabled]}
          >
            <Text style={[styles.applyText, { color: colors.white, fontFamily: TYPOGRAPHY.fonts.serifSemiBold }]}>
              APPLY THEME
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: colors.primary, fontFamily: TYPOGRAPHY.fonts.serifSemiBold }]}>
            Cancel Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.md },
  scrollContent: { paddingHorizontal: SPACING.base, paddingBottom: 20 },
  titleSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.sizes.xxl, textAlign: 'center' },
  subtitle: { fontSize: TYPOGRAPHY.sizes.base, textAlign: 'center', marginTop: SPACING.sm },
  themeCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, borderWidth: 2, position: 'relative' },
  activeBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, zIndex: 1 },
  activeBadgeText: { fontSize: 10, color: '#fff', letterSpacing: 1 },
  previewBar: { height: 56, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  previewText: { fontSize: TYPOGRAPHY.sizes.xl },
  themeName: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.md },
  themeDescription: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20, marginTop: SPACING.xs },
  buttons: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.base },
  applyButton: { height: 52, borderRadius: RADIUS.md, overflow: 'hidden' },
  applyButtonGradient: { flex: 1, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md },
  applyButtonDisabled: { opacity: 0.5 },
  applyText: { fontSize: TYPOGRAPHY.sizes.base },
  cancelButton: { height: 52, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: TYPOGRAPHY.sizes.base },
});
