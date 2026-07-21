import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme/tokens';
import { AvatarCircle } from '../components/common/AvatarCircle';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

interface SettingsRowProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
}

function SettingsRow({ icon, label, subtitle, onPress, rightElement, isDestructive }: SettingsRowProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsRow} activeOpacity={0.6}>
      <Ionicons name={icon as any} size={20} color={isDestructive ? colors.primary : colors.muted} />
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: isDestructive ? colors.primary : colors.foreground, fontFamily: TYPOGRAPHY.fonts.sansMedium }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={colors.mutedFaint} />}
    </TouchableOpacity>
  );
}

function SectionLabel({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
      {title}
    </Text>
  );
}

export function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { profile, signOut, updateProfile } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const [bookFilterModalVisible, setBookFilterModalVisible] = useState(false);
  const [bookFilterInput, setBookFilterInput] = useState('');
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const themeNames: Record<string, string> = {
    'light': 'Light',
    'dark': 'Dark',
  };

  const handleBookFilterSave = () => {
    const value = bookFilterInput.trim() || 'all';
    updateProfile({ bookFilter: value });
    setBookFilterModalVisible(false);
    setBookFilterInput('');
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await signOut();
    } finally {
      setSignOutLoading(false);
      setShowSignOutDialog(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCardWrap}>
          <LinearGradient
            colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <AvatarCircle size={80} uri={profile?.avatarUrl} displayName={profile?.displayName} borderColor={colors.white} borderWidth={3} />
            <Text style={[styles.profileName, { fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
              {profile?.displayName || 'Dear Friend'}
            </Text>
            <Text style={[styles.profileEmail, { fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
              {profile?.email || 'Keep growing in faith'}
            </Text>
          </LinearGradient>
        </View>

        {/* Streak card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Streak')}
          style={[styles.streakCard, { backgroundColor: colors.surface }, SHADOWS.sm]}
          activeOpacity={0.6}
        >
          <View style={[styles.streakIconWrap, { backgroundColor: colors.accentMuted }]}>
            <Ionicons name="flame" size={24} color={colors.accent} />
          </View>
          <View style={styles.streakContent}>
            <Text style={[styles.streakLabel, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
              Current streak: {profile?.streak ?? 0} {profile?.streak === 1 ? 'day' : 'days'}
            </Text>
            <Text style={[styles.streakSubtext, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
              Open daily to maintain your streak
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedFaint} />
        </TouchableOpacity>

        <SectionLabel title="CHAT PREFERENCES" />
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
          <SettingsRow
            icon="book-outline"
            label="Book Filter"
            subtitle={`Current: ${profile?.bookFilter || 'all'}`}
            onPress={() => {
              setBookFilterInput(profile?.bookFilter && profile.bookFilter !== 'all' ? profile.bookFilter : '');
              setBookFilterModalVisible(true);
            }}
          />
        </View>

        <SectionLabel title="EXPERIENCE" />
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
          <SettingsRow
            icon="color-palette-outline"
            label="Theme Selection"
            subtitle={`Current: ${themeNames[currentTheme]}`}
            onPress={() => navigation.navigate('ThemeSelection')}
          />
        </View>

        <SectionLabel title="SUPPORT" />
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
          <SettingsRow icon="help-circle-outline" label="Help Center" onPress={() => navigation.navigate('HelpCenter')} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="information-circle-outline" label="About" onPress={() => navigation.navigate('About')} />
        </View>

        <SectionLabel title="ACCOUNT" />
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
          <SettingsRow
            icon="trash-outline"
            label="Delete Account"
            subtitle="Permanently remove your account and all data"
            isDestructive
            onPress={() => navigation.navigate('DeleteAccount')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            isDestructive
            onPress={() => setShowSignOutDialog(true)}
          />
        </View>
      </ScrollView>

      <Modal
        visible={bookFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBookFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
              Book Filter
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
              Enter a book name (e.g. Matthew, மத்தேயு) or leave empty for all books
            </Text>
            <TextInput
              style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]}
              value={bookFilterInput}
              onChangeText={setBookFilterInput}
              placeholder="e.g. John, யோவான்"
              placeholderTextColor={colors.mutedFaint}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setBookFilterModalVisible(false);
                  setBookFilterInput('');
                }}
                style={styles.modalButton}
              >
                <Text style={[styles.modalButtonText, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansMedium }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBookFilterSave}
                style={styles.modalButton}
              >
                <Text style={[styles.modalButtonText, { color: colors.primary, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSignOutDialog}
        transparent
        animationType="fade"
        onRequestClose={() => !signOutLoading && setShowSignOutDialog(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !signOutLoading && setShowSignOutDialog(false)}
        >
          <View style={[styles.signOutCard, { backgroundColor: colors.surface }]}>
            <View style={styles.signOutHeader}>
              <View style={[styles.signOutIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              </View>
              <View style={styles.signOutTextContent}>
                <Text style={[styles.signOutTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
                  Sign Out?
                </Text>
                <Text style={[styles.signOutMessage, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.serifRegular }]}>
                  You will be signed out of your account. You can sign back in anytime.
                </Text>
              </View>
            </View>
            <View style={styles.signOutButtons}>
              <TouchableOpacity
                onPress={() => setShowSignOutDialog(false)}
                disabled={signOutLoading}
                style={[styles.signOutCancelBtn, { backgroundColor: colors.surfaceHover }]}
              >
                <Text style={[styles.signOutCancelText, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansMedium }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignOut}
                disabled={signOutLoading}
                style={styles.signOutConfirmBtn}
              >
                {signOutLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.signOutConfirmText, { fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
                    Sign Out
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.md },
  scrollContent: { paddingBottom: 40 },
  profileCardWrap: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  profileName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: '#FFFFFF',
    marginTop: SPACING.md,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xxs,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  streakIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakContent: { flex: 1 },
  streakLabel: { fontSize: TYPOGRAPHY.sizes.base },
  streakSubtext: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  sectionLabel: { fontSize: TYPOGRAPHY.sizes.xs, letterSpacing: 2, textTransform: 'uppercase', marginTop: SPACING.xl, marginBottom: SPACING.sm, marginLeft: SPACING.base },
  section: { marginHorizontal: SPACING.base, borderRadius: RADIUS.md, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', height: 54, paddingHorizontal: SPACING.base, gap: SPACING.md },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: TYPOGRAPHY.sizes.base },
  rowSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  divider: { height: 0.5, marginLeft: 48 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: SPACING.xl },
  modalCard: { width: '100%', borderRadius: RADIUS.lg, padding: SPACING.lg },
  modalTitle: { fontSize: TYPOGRAPHY.sizes.lg, marginBottom: SPACING.sm },
  modalSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.md },
  modalInput: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: TYPOGRAPHY.sizes.base, marginBottom: SPACING.md },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md },
  modalButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  modalButtonText: { fontSize: TYPOGRAPHY.sizes.base },
  signOutCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  signOutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  signOutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutTextContent: {
    flex: 1,
  },
  signOutTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    marginBottom: SPACING.xs,
  },
  signOutMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  signOutButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  signOutCancelBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  signOutCancelText: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  signOutConfirmBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    backgroundColor: '#EF4444',
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutConfirmText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: '#FFFFFF',
  },
});
