import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme/tokens';
import { AppHeader } from '../components/common/AppHeader';
import { useAuthStore } from '../store/useAuthStore';
import { searchBible, BibleSearchResult } from '../services/madhaApi';

export function SearchBibleScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BibleSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SUGGESTIONS = ['love', 'faith', 'hope', 'forgiveness', 'strength', 'wisdom'];

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    setQuery(q);
    setSearching(true);
    setHasSearched(true);
    setError(null);
    try {
      const res = await searchBible(q, { limit: 10 });
      setResults(res);
    } catch (e) {
      console.warn('[searchbible] search failed:', e);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AppHeader
        onAvatarPress={() => navigation.navigate('Settings')}
        avatarUrl={profile?.avatarUrl}
        displayName={profile?.displayName}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={insets.top + 56}
      >
        <View style={styles.searchContainer}>
          <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
            Search Bible
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.serifRegular }]}>
            Find verses by keyword, book name, or topic
          </Text>
          <View style={styles.searchRow}>
            <View style={[styles.searchInputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={18} color={colors.mutedFaint} style={{ marginRight: SPACING.xs }} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifRegular }]}
                value={query}
                onChangeText={setQuery}
                placeholder="Search verses..."
                placeholderTextColor={colors.mutedFaint}
                onSubmitEditing={() => handleSearch()}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              onPress={() => handleSearch()}
              disabled={searching || !query.trim()}
              style={styles.searchButton}
            >
              <LinearGradient
                colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.searchButtonGradient}
              >
                {searching ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Ionicons name="arrow-forward" size={20} color={colors.white} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {!hasSearched && (
            <View style={styles.suggestionsRow}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => handleSearch(s)}
                  style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionChipText, { color: colors.primary, fontFamily: TYPOGRAPHY.fonts.serifSemiBold }]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {hasSearched && (
            <View style={styles.resultsContainer}>
              {error ? (
                <View style={styles.centerBox}>
                  <Ionicons name="alert-circle-outline" size={36} color={colors.mutedFaint} />
                  <Text style={[styles.emptyResult, { color: colors.muted }]}>
                    {error}
                  </Text>
                </View>
              ) : searching && results.length === 0 ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : results.length === 0 ? (
                <View style={styles.centerBox}>
                  <Ionicons name="search-outline" size={36} color={colors.mutedFaint} />
                  <Text style={[styles.emptyResult, { color: colors.muted }]}>
                    No verses found. Try a different search.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.resultsCount, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
                    {results.length} {results.length === 1 ? 'result' : 'results'}
                  </Text>
                  {results.map((result) => (
                    <View key={result.ref} style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.sm]}>
                      <View style={[styles.resultRefWrap, { backgroundColor: colors.primaryMuted }]}>
                        <Text style={[styles.resultRef, { color: colors.primary, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
                          {result.ref}
                        </Text>
                      </View>
                      <Text style={[styles.resultText, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifItalic }]}>
                        {result.text}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: SPACING.base },
  pageTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    marginBottom: SPACING.xxs,
  },
  pageSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.lg,
  },
  searchRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    paddingVertical: SPACING.sm,
  },
  searchButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  suggestionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.md,
    borderWidth: 0.5,
  },
  suggestionChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  scrollContent: { paddingHorizontal: SPACING.base, paddingBottom: 40 },
  resultsContainer: { gap: SPACING.sm, marginTop: SPACING.md },
  resultsCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  resultCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  resultRefWrap: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
  },
  resultRef: { fontSize: TYPOGRAPHY.sizes.sm },
  resultText: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 22,
    padding: SPACING.md,
  },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xl, gap: SPACING.md },
  emptyResult: { fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' },
});
