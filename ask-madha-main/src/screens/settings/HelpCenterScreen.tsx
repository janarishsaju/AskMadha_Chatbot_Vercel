import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme/tokens';

export function HelpCenterScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          Help Center
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.welcomeCard, { backgroundColor: colors.surface }, SHADOWS.md]}>
          <Ionicons name="mail" size={48} color={colors.primary} />
          <Text style={[styles.welcomeTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
            Need Help?
          </Text>
          <Text style={[styles.welcomeDesc, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.serifItalic }]}>
            Our support team is here for you. Email us and we'll respond within 24 hours.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:support@askmadha.com')}
            style={[styles.emailButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={[styles.emailButtonText, { fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
              support@askmadha.com
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.md },
  scrollContent: { padding: SPACING.base, paddingBottom: 40 },
  welcomeCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  welcomeTitle: { fontSize: TYPOGRAPHY.sizes.lg, marginTop: SPACING.base },
  welcomeDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.base,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },
  emailButtonText: { color: '#fff', fontSize: TYPOGRAPHY.sizes.base },
});
