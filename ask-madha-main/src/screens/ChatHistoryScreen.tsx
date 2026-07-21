import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme/tokens';
import { AppHeader } from '../components/common/AppHeader';
import { useChatStore, toUiMessage } from '../store/useChatStore';
import {
  listSessions,
  getSessionMessages,
  deleteSession,
  renameSession,
  Session,
} from '../services/madhaApi';

function relativeTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
}

export function ChatHistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    sessions,
    sessionsLoading,
    currentSessionId,
    setSessions,
    setSessionsLoading,
    removeSession,
    setMessages,
    setCurrentSessionId,
    startNewChat,
  } = useChatStore();

  const [refreshing, setRefreshing] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [renameSessionTarget, setRenameSessionTarget] = useState<Session | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const fetchSessions = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setSessionsLoading(true);
      setLoadError(null);
      try {
        const list = await listSessions();
        setSessions(list);
      } catch (e) {
        console.warn('[history] list failed:', e);
        setLoadError('Could not load your conversations. Pull to retry.');
      } finally {
        setSessionsLoading(false);
        setRefreshing(false);
      }
    },
    [setSessions, setSessionsLoading],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleOpen = async (session: Session) => {
    if (openingId) return;
    setOpeningId(session.id);
    try {
      const apiMsgs = await getSessionMessages(session.id);
      setMessages(apiMsgs.map(toUiMessage));
      setCurrentSessionId(session.id);
      navigation.goBack();
    } catch (e) {
      console.warn('[history] open failed:', e);
      Alert.alert('Could not open', 'Failed to load this conversation. Please try again.');
    } finally {
      setOpeningId(null);
    }
  };

  const handleNewChat = () => {
    startNewChat();
    navigation.goBack();
  };

  const handleDelete = (session: Session) => {
    Alert.alert(
      'Delete conversation?',
      'This permanently removes this chat and its messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic removal; restore on failure.
            removeSession(session.id);
            if (currentSessionId === session.id) startNewChat();
            try {
              await deleteSession(session.id);
            } catch (e) {
              console.warn('[history] delete failed:', e);
              fetchSessions(); // resync truth from server
              Alert.alert('Delete failed', 'Could not delete this conversation. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleRename = (session: Session) => {
    setRenameInput(session.title?.trim() || '');
    setRenameSessionTarget(session);
  };

  const handleRenameSave = async () => {
    if (!renameSessionTarget) return;
    const newTitle = renameInput.trim();
    if (!newTitle) {
      Alert.alert('Title required', 'Please enter a name for the conversation.');
      return;
    }
    const session = renameSessionTarget;
    setRenameSessionTarget(null);
    // Optimistic update
    setSessions(sessions.map((s) => s.id === session.id ? { ...s, title: newTitle } : s));
    try {
      await renameSession(session.id, newTitle);
    } catch (e) {
      console.warn('[history] rename failed:', e);
      fetchSessions();
      Alert.alert('Rename failed', 'Could not rename this conversation. Please try again.');
    }
  };

  const renderItem = ({ item }: { item: Session }) => {
    const isCurrent = item.id === currentSessionId;
    const title = item.title?.trim() || 'New Chat';
    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.sm]}
        onPress={() => handleOpen(item)}
        disabled={!!openingId}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <View style={[styles.accentBar, { backgroundColor: isCurrent ? colors.primary : colors.border }]} />
        <View style={styles.rowMain}>
          <Text
            numberOfLines={1}
            style={[styles.rowTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifSemiBold }]}
          >
            {title}
          </Text>
          <View style={styles.rowMetaRow}>
            <Ionicons name="time-outline" size={12} color={colors.mutedFaint} />
            <Text style={[styles.rowMeta, { color: colors.mutedFaint }]}>
              {relativeTime(item.updated_at || item.created_at)}
              {isCurrent ? '  ·  current' : ''}
            </Text>
          </View>
        </View>

        {openingId === item.id ? (
          <ActivityIndicator color={colors.primary} style={styles.rowAction} />
        ) : (
          <View style={styles.rowActions}>
            <TouchableOpacity
              onPress={() => handleRename(item)}
              style={styles.rowAction}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Rename conversation"
            >
              <Ionicons name="create-outline" size={18} color={colors.mutedFaint} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.rowAction}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Delete conversation"
            >
              <Ionicons name="trash-outline" size={18} color={colors.mutedFaint} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (sessionsLoading) {
      return (
        <View style={styles.center}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="chatbubbles" size={32} color={colors.primary} />
          </View>
          <ActivityIndicator color={colors.primary} style={{ marginTop: SPACING.md }} />
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons name="chatbubbles" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          {loadError ? 'Something went wrong' : 'No conversations yet'}
        </Text>
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          {loadError || 'Start a new chat to begin your journey.'}
        </Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (sessions.length === 0) return null;
    return (
      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderText, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
          {sessions.length} {sessions.length === 1 ? 'conversation' : 'conversations'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AppHeader
        title="Chat History"
        showBackButton
        onBack={() => navigation.goBack()}
        rightIcon="add-circle-outline"
        onRightPress={handleNewChat}
      />

      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={sessions.length === 0 ? styles.listEmpty : styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSessions(true)}
            tintColor={colors.primary}
          />
        }
      />

      <Modal
        visible={!!renameSessionTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameSessionTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
              Rename Conversation
            </Text>
            <TextInput
              style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]}
              value={renameInput}
              onChangeText={setRenameInput}
              placeholder="Enter new name"
              placeholderTextColor={colors.mutedFaint}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setRenameSessionTarget(null)}
                style={styles.modalButton}
              >
                <Text style={[styles.modalButtonText, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansMedium }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRenameSave}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  listEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: SPACING.sm,
  },
  listHeaderText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
    marginRight: SPACING.md,
    marginLeft: SPACING.sm,
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  rowMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xxs,
  },
  rowMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rowAction: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.xl,
  },
  modalCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    marginBottom: SPACING.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  modalButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  modalButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
});
