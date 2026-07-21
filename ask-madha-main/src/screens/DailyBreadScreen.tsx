import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme/tokens';
import { AppHeader } from '../components/common/AppHeader';
import { useAuthStore } from '../store/useAuthStore';
import { getDailyVerse, DailyVerse } from '../services/madhaApi';

export function DailyBreadScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();

  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await getDailyVerse();
        if (!cancelled) setVerse(v);
      } catch (e) {
        console.warn('[dailybread] verse failed:', e);
      } finally {
        if (!cancelled) setVerseLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AppHeader
        onAvatarPress={() => navigation.navigate('Settings')}
        avatarUrl={profile?.avatarUrl}
        displayName={profile?.displayName}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          Daily Bread
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.serifRegular }]}>
          A verse to nourish your spirit today
        </Text>

        {verseLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : verse ? (
          <View style={styles.verseHeroCard}>
            <LinearGradient
              colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.verseHeroGradient}
            >
              <View style={styles.verseHeroContent}>
                <View style={styles.verseIconWrap}>
                  <Ionicons name="book" size={28} color={colors.white} />
                </View>
                <Text style={[styles.verseRef, { fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
                  {verse.ref}
                </Text>
                <Text style={[styles.verseText, { fontFamily: TYPOGRAPHY.fonts.serifItalic }]}>
                  {verse.text}
                </Text>
                <View style={styles.verseDivider} />
                <Text style={[styles.verseLabel, { fontFamily: TYPOGRAPHY.fonts.sansMedium }]}>
                  TODAY'S VERSE
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedFaint} />
            <Text style={[styles.errorText, { color: colors.muted }]}>
              Could not load today's verse.
            </Text>
            <Text style={[styles.errorSubtext, { color: colors.mutedFaint }]}>
              Check your connection and try again.
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('Chat')}
          style={[styles.ctaCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.sm]}
          activeOpacity={0.7}
        >
          <View style={[styles.ctaIcon, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.ctaContent}>
            <Text style={[styles.ctaTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifSemiBold }]}>
              Discuss this verse
            </Text>
            <Text style={[styles.ctaSubtitle, { color: colors.muted }]}>
              Start a conversation about today's verse
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedFaint} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: 40 },
  pageTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    marginBottom: SPACING.xxs,
  },
  pageSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.xl,
  },
  verseHeroCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  verseHeroGradient: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  verseHeroContent: {
    alignItems: 'center',
  },
  verseIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  verseRef: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  verseText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING.lg,
  },
  verseDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    marginBottom: SPACING.sm,
  },
  verseLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  errorCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 0.5,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  errorText: { fontSize: TYPOGRAPHY.sizes.base, textAlign: 'center' },
  errorSubtext: { fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 0.5,
    gap: SPACING.md,
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: { flex: 1 },
  ctaTitle: { fontSize: TYPOGRAPHY.sizes.base },
  ctaSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xxxl },
});
