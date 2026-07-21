import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, Keyboard, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, TYPOGRAPHY, RADIUS } from '../theme/tokens';
import { AppHeader } from '../components/common/AppHeader';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { ChatInputBar } from '../components/chat/ChatInputBar';
import { useChatStore, toUiMessage } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  createSession,
  streamMessage,
  getSessionMessages,
  detectLanguage,
  StreamHandle,
} from '../services/madhaApi';
import { Message } from '../types';
import { useTypewriter } from '../hooks/useTypewriter';

const GREETING = 'Hi, what can I do for you?';

const SUGGESTIONS = [
  { icon: 'heart-outline', prompt: 'What does the Bible say about love?' },
  { icon: 'shield-outline', prompt: 'How can I find strength in difficult times?' },
  { icon: 'bulb-outline', prompt: 'What is the meaning of grace?' },
  { icon: 'people-outline', prompt: 'How should I treat my neighbors?' },
];

export function ChatScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList>(null);
  const bootstrappedRef = useRef(false);
  const streamRef = useRef<StreamHandle | null>(null);
  const [hydrated, setHydrated] = useState(() => useChatStore.persist.hasHydrated());
  const [restoring, setRestoring] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    messages,
    isStreaming,
    streamingText,
    streamDone,
    currentSessionId,
    error,
    addUserMessage,
    appendStreamChunk,
    setStreamVerses,
    setStreamDone,
    finalizeStreamMessage,
    setStreaming,
    setError,
    setCurrentSessionId,
    setMessages,
    startNewChat,
  } = useChatStore();
  const { profile } = useAuthStore();

  console.log(messages,"messages", streamingText,"streamingText", streamDone,"streamDone");

  // Track keyboard height to push input bar above the keyboard.
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Track persisted-state hydration without racing onFinishHydration:
  // subscribe first, then re-check (covers "already hydrated before mount").
  useEffect(() => {
    if (hydrated) return;
    const unsub = useChatStore.persist.onFinishHydration(() => setHydrated(true));
    if (useChatStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);

  // Once hydrated, load the active session's history from the API (once).
  // A fresh chat (no session) just shows the greeting empty-state.
  useEffect(() => {
    if (!hydrated || bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const id = useChatStore.getState().currentSessionId;
    if (!id || useChatStore.getState().messages.length > 0) return;

    let mounted = true;
    setRestoring(true);
    (async () => {
      try {
        const apiMsgs = await getSessionMessages(id);
        if (mounted && apiMsgs.length) {
          setMessages(apiMsgs.map(toUiMessage));
        }
      } catch (e) {
        console.warn('[chat] history load failed:', e);
        if (mounted) setCurrentSessionId(null); // session gone/unreachable → fresh chat
      } finally {
        if (mounted) setRestoring(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [hydrated, setMessages, setCurrentSessionId]);

  const handleSend = async (text: string, selectedLanguage: 'auto' | 'english' | 'tamil' = 'auto') => {
    if (isStreaming) return; // guard against double-send
    addUserMessage(text);
    setStreaming(true);

    try {
      let id = currentSessionId;
      const actualLanguage = selectedLanguage === 'auto' ? detectLanguage(text) : selectedLanguage;
      if (!id) {
        id = await createSession(actualLanguage, profile?.bookFilter ?? 'all');
        setCurrentSessionId(id);
      }

      streamRef.current = await streamMessage(id, text, {
        onToken: (chunk) => appendStreamChunk(chunk),
        onVerses: (refs) => setStreamVerses(refs),
        onDone: () => {
          setStreamDone(true);
          streamRef.current = null;
        },
        onError: (message) => {
          finalizeStreamMessage();
          setStreaming(false);
          setError(message);
          streamRef.current = null;
        },
      }, actualLanguage);
    } catch (e) {
      console.warn('[chat] send failed:', e);
      finalizeStreamMessage();
      setStreaming(false);
      setError('Could not reach the server. Check your connection and try again.');
    }
  };

  const handleNewChat = () => {
    if (isStreaming) {
      streamRef.current?.cancel();
      streamRef.current = null;
    }
    startNewChat();
  };

  // Cancel any in-flight stream on unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.cancel();
    };
  }, []);

  // When stream is done and typewriter has caught up, commit the message.
  const typewriterDisplayed = useTypewriter(streamingText, streamDone);
  useEffect(() => {
    if (streamDone && streamingText && typewriterDisplayed === streamingText) {
      finalizeStreamMessage();
    }
  }, [streamDone, streamingText, typewriterDisplayed, finalizeStreamMessage]);

  // Bottom padding for the input bar.
  // - Keyboard open: lift the bar above the keyboard. On Android (edge-to-edge),
  //   the bar is anchored under the nav bar, so add the bottom inset so it isn't
  //   partially hidden behind the keyboard.
  // - Keyboard closed: keep the bar above the gesture nav bar via the bottom inset.
  const inputPaddingBottom =
    keyboardHeight > 0
      ? keyboardHeight + (Platform.OS === 'android' ? insets.bottom : 0)
      : 0;

  const renderItem = ({ item }: { item: Message }) => (
    // Assistant messages skip the entry animation so the typed streaming bubble
    // transitions seamlessly into the committed message (no fade pop).
    <MessageBubble message={item} animate={item.role === 'user'} />
  );

  const renderEmpty = () => {
    if (restoring) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (isStreaming) return null;
    return (
      <View style={styles.empty}>
        <LinearGradient
          colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyIcon}
        >
          <Ionicons name="sparkles" size={28} color={colors.white} />
        </LinearGradient>
        <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          Ask anything about the Bible
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.serifRegular }]}>
          Start a conversation with Ask Madha. Ask questions, explore verses, and receive scripture-based guidance.
        </Text>
        <View style={styles.suggestionsRow}>
          {SUGGESTIONS.map((s, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSend(s.prompt)}
              style={[styles.suggestionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name={s.icon as any} size={18} color={colors.primary} />
              <Text
                style={[styles.suggestionText, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifRegular }]}
                numberOfLines={2}
              >
                {s.prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isStreaming && !error) return null;

    if (error) {
      return (
        <View style={styles.statusRow}>
          <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
        </View>
      );
    }

    // Streaming: typewriter the live partial response, or typing dots before the first token.
    if (streamingText) {
      const liveMessage: Message = {
        id: 'streaming',
        role: 'assistant',
        content: typewriterDisplayed,
        timestamp: new Date(),
      };
      return <MessageBubble message={liveMessage} animate={false} showTimestamp={false} />;
    }

    return <TypingIndicator />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AppHeader
        leftIcon="time-outline"
        onLeftPress={() => navigation.navigate('ChatHistory')}
        rightIcon="add-circle-outline"
        onRightPress={handleNewChat}
        onAvatarPress={() => navigation.navigate('Settings')}
        avatarUrl={profile?.avatarUrl}
        displayName={profile?.displayName}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={messages.length === 0 ? styles.listEmpty : styles.listContent}
        showsVerticalScrollIndicator={false}
        extraData={{ typewriterDisplayed, streamingText, isStreaming, error }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        style={{ flex: 1 }}
      />

      <ChatInputBar
        onSend={handleSend}
        disabled={isStreaming}
        style={{ paddingBottom: inputPaddingBottom }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.base,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    flexGrow: 1,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
    maxWidth: 320,
    lineHeight: 20,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    maxWidth: 360,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 0.5,
    maxWidth: '100%',
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flexShrink: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.lg,
    textAlign: 'center',
  },
  statusRow: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.fonts.serifRegular,
  },
});
