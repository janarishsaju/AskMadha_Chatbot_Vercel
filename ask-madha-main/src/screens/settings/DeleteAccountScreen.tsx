import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme/tokens';
import { useAuthStore } from '../../store/useAuthStore';

const ITEMS_DELETED = [
  { icon: 'person-circle-outline', label: 'Your account and profile information' },
  { icon: 'chatbubble-ellipses-outline', label: 'All chat history and conversation sessions' },
  { icon: 'settings-outline', label: 'Saved preferences (language, book filter, theme)' },
  { icon: 'flame-outline', label: 'Daily streak data and spiritual journey tracking' },
  { icon: 'card-outline', label: 'Any associated subscription and billing records' },
];

export function DeleteAccountScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { deleteAccount, deleteAccountLoading } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = async () => {
    Alert.alert(
      'Final Confirmation',
      'Please confirm one last time. Once deleted, your account and all data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete Forever',
          style: 'destructive',
          onPress: performDelete,
        },
      ],
    );
  };

  const performDelete = async () => {
    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    if (error) {
      Alert.alert('Deletion Failed', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          Delete Account
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Warning banner */}
        <View style={[styles.warningBanner, { backgroundColor: colors.primaryMuted }]}>
          <View style={[styles.warningIconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="trash-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.warningTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
            Delete Your Account
          </Text>
          <Text style={[styles.warningSubtitle, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
            This action is permanent and cannot be undone.
          </Text>
        </View>

        {/* What will be deleted */}
        <Text style={[styles.sectionLabel, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
          WHAT WILL BE DELETED
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.sm]}>
          {ITEMS_DELETED.map((item, index) => (
            <View key={item.label}>
              <View style={styles.deletedItem}>
                <View style={[styles.deletedItemIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.deletedItemText, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
                  {item.label}
                </Text>
              </View>
              {index < ITEMS_DELETED.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

        {/* Before you go */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
          <Text style={[styles.infoTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
            Before You Go
          </Text>
          <Text style={[styles.infoText, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
            Once you delete your account, all your data will be permanently removed from our servers. You will not be able to recover any of your chat history, preferences, or spiritual journey data. If you change your mind later, you will need to create a new account from scratch.
          </Text>
          <Text style={[styles.infoText, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansRegular, marginTop: SPACING.sm }]}>
            If you're experiencing any issues or have questions, consider reaching out to our support team at support@askmadha.com before deleting your account.
          </Text>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDeletePress}
          disabled={deleting || deleteAccountLoading}
          style={[styles.deleteButton, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
          activeOpacity={0.7}
        >
          {(deleting || deleteAccountLoading) ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color={colors.primary} />
              <Text style={[styles.deleteButtonText, { color: colors.primary, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
                Delete My Account
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
          Ask Madha v1.0.0
        </Text>
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
  warningBanner: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  warningIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  warningTitle: { fontSize: TYPOGRAPHY.sizes.xl, marginBottom: SPACING.xs },
  warningSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  section: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  deletedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  deletedItemIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletedItemText: { flex: 1, fontSize: TYPOGRAPHY.sizes.base },
  divider: { height: 0.5, marginLeft: 56 },
  infoCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  infoTitle: { fontSize: TYPOGRAPHY.sizes.base, marginBottom: SPACING.sm },
  infoText: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 22 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  deleteButtonText: { fontSize: TYPOGRAPHY.sizes.base },
  footerText: { fontSize: TYPOGRAPHY.sizes.xs, textAlign: 'center' },
});
