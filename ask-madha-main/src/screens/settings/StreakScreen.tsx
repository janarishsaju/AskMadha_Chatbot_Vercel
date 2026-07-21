import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme/tokens';
import { getStreak, StreakData } from '../../services/madhaApi';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function StreakScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchStreak = useCallback(async () => {
    setError(null);
    try {
      const data = await getStreak(monthKey);
      setStreakData(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load streak data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [monthKey]);

  useEffect(() => {
    setLoading(true);
    fetchStreak();
  }, [fetchStreak]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStreak();
  };

  // Build calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayStr = now.toISOString().slice(0, 10);

  const visitSet = new Set(
    streakData?.monthlyVisits?.map((v) => v.date) || []
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isCurrentMonth = monthOffset === 0;
  const isFutureMonth = monthOffset > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          Your Streak
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero streak card */}
        <View style={styles.heroCardWrap}>
          <LinearGradient
            colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroIconWrap}>
              <Ionicons name="flame" size={32} color={colors.white} />
            </View>
            <Text style={[styles.heroStreakNumber, { fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
              {streakData?.streak ?? 0}
            </Text>
            <Text style={[styles.heroStreakLabel, { fontFamily: TYPOGRAPHY.fonts.sansMedium }]}>
              {streakData?.streak === 1 ? 'DAY STREAK' : 'DAY STREAK'}
            </Text>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { fontFamily: TYPOGRAPHY.fonts.serifSemiBold }]}>
                  {streakData?.longestStreak ?? 0}
                </Text>
                <Text style={[styles.heroStatLabel, { fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
                  Longest
                </Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { fontFamily: TYPOGRAPHY.fonts.serifSemiBold }]}>
                  {streakData?.totalVisits ?? 0}
                </Text>
                <Text style={[styles.heroStatLabel, { fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
                  Total
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() => setMonthOffset((m) => m - 1)}
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifSemiBold }]}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity
            onPress={() => !isFutureMonth && setMonthOffset((m) => m + 1)}
            disabled={isFutureMonth}
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: isFutureMonth ? 0.4 : 1 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={[styles.calendarCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
          {/* Day labels */}
          <View style={styles.dayLabelRow}>
            {DAY_LABELS.map((day, i) => (
              <Text
                key={i}
                style={[styles.dayLabel, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansMedium }]}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar cells */}
          <View style={styles.calendarGrid}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <View key={`pad-${idx}`} style={styles.calendarCell} />;
              }
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const visited = visitSet.has(dateStr);
              const isToday = isCurrentMonth && dateStr === todayStr;
              const isFuture = dateStr > todayStr;

              return (
                <View key={day} style={styles.calendarCell}>
                  {visited ? (
                    <LinearGradient
                      colors={[colors.gradientFrom, colors.gradientVia]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeCircle}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          {
                            color: colors.white,
                            fontFamily: TYPOGRAPHY.fonts.sansSemiBold,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </LinearGradient>
                  ) : isToday ? (
                    <View
                      style={[
                        styles.activeCircle,
                        { backgroundColor: colors.primaryMuted, borderWidth: 1.5, borderColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          {
                            color: colors.primary,
                            fontFamily: TYPOGRAPHY.fonts.sansSemiBold,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.dayNumber,
                        {
                          color: isFuture ? colors.mutedFaint : colors.muted,
                          fontFamily: TYPOGRAPHY.fonts.sansRegular,
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <LinearGradient
                colors={[colors.gradientFrom, colors.gradientVia]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.legendDot}
              />
              <Text style={[styles.legendText, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
                Visited
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primaryMuted, borderWidth: 1.5, borderColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
                Today
              </Text>
            </View>
          </View>
        </View>

        {/* Loading & error */}
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        {error && (
          <View style={styles.centerContent}>
            <Text style={[styles.errorText, { color: colors.primary, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Motivational message */}
        {!loading && !error && streakData && (
          <View style={[styles.motivationCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
            <Text style={[styles.motivationText, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.serifItalic }]}>
              {streakData.streak > 0
                ? `Current streak: ${streakData.streak} ${streakData.streak === 1 ? 'day' : 'days'}. Come back tomorrow to keep it alive!`
                : 'Open the app every day to build your streak and stay connected to your faith journey.'}
            </Text>
          </View>
        )}
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
  heroCardWrap: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroStreakNumber: {
    fontSize: TYPOGRAPHY.sizes.hero,
    color: '#FFFFFF',
  },
  heroStreakLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginTop: SPACING.xxs,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.xl,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: { fontSize: TYPOGRAPHY.sizes.lg },
  calendarCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  dayLabelRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: RADIUS.full,
  },
  legendText: { fontSize: TYPOGRAPHY.sizes.xs },
  centerContent: { alignItems: 'center', paddingVertical: SPACING.lg },
  errorText: { fontSize: TYPOGRAPHY.sizes.sm },
  motivationCard: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});
