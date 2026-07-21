import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight, FadeInLeft } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../theme/tokens';
import { Message } from '../../types';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  /** Whether to play the entry animation. Off for the live streaming bubble
   *  so it doesn't re-trigger (flicker) on every token. */
  animate?: boolean;
  /** Hide the timestamp (e.g. while the message is still streaming). */
  showTimestamp?: boolean;
}



// Parse verses from markdown content
function parseVerses(content: string): { cleanContent: string; verses: Array<{ ref: string; text: string }> } {
  const verses: Array<{ ref: string; text: string }> = [];
  
  // Remove "BIBLICAL REFERENCE:" header and everything after it for clean content
  const refIndex = content.search(/\*\*(BIBLICAL REFERENCE|ஆதார விவிலிய குறிப்புகள்):?\*\*|BIBLICAL REFERENCE:|ஆதார விவிலிய குறிப்புகள்:/i);
  let cleanContent = refIndex !== -1 ? content.substring(0, refIndex).trim() : content;
  
  // Match verse references like **JOHN 19:17** followed by text
  // Pattern: **BOOK CHAPTER:VERSE** text (must have colon for chapter:verse)
  const versePattern = /\*\*([A-Z0-9]+\s+\d+:\d+)\*\*\s+([^\n*]+)/g;
  let match;
  
  while ((match = versePattern.exec(content)) !== null) {
    const ref = match[1].trim();
    const text = match[2].trim();
    verses.push({ ref, text });
  }
  
  return { cleanContent, verses };
}

export function MessageBubble({ message, animate = true, showTimestamp = true }: MessageBubbleProps) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';
  
  // Only parse verses when streaming is complete (showTimestamp=true)
  // During streaming, show raw content to prevent UI shake
  const { cleanContent, verses: parsedVerses } = !isUser && showTimestamp 
    ? parseVerses(message.content) 
    : { cleanContent: message.content, verses: [] };

  const Container: any = animate ? Animated.View : View;
  const containerProps = animate
    ? { entering: isUser ? FadeInRight.duration(300).springify() : FadeInLeft.duration(300).springify() }
    : {};

  return (
    <Container
      {...containerProps}
      style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble]
            : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 0.5 }],
        ]}
      >
        {isUser ? (
          <LinearGradient
            colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userGradient}
          >
            <Text
              style={[
                styles.text,
                {
                  color: colors.white,
                  fontFamily: TYPOGRAPHY.fonts.serifRegular,
                },
              ]}
            >
              {message.content}
            </Text>
            {message.verses && message.verses.length > 0 && (
              <View style={styles.verses}>
                {message.verses.map((ref) => (
                  <View key={ref} style={[styles.verseItem, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={[styles.verseTitle, { color: colors.white }]}>{ref}</Text>
                  </View>
                ))}
              </View>
            )}
            {showTimestamp && (
              <Text style={[styles.timestamp, { color: 'rgba(255,255,255,0.7)' }]}>
                {format(new Date(message.timestamp), 'h:mm a')}
              </Text>
            )}
          </LinearGradient>
        ) : (
          <Markdown
            style={{
              body: {
                color: colors.foreground,
                fontSize: TYPOGRAPHY.sizes.base,
                lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.normal,
                fontFamily: TYPOGRAPHY.fonts.serifRegular,
              },
              strong: { fontFamily: TYPOGRAPHY.fonts.serifBold },
              em: { fontStyle: 'italic' },
              paragraph: { marginTop: 2, marginBottom: 2 },
              list_item: { marginTop: 0, marginBottom: 0 },
              bullet_list: { marginTop: 2, marginBottom: 2 },
              ordered_list: { marginTop: 2, marginBottom: 2 },
              code_inline: {
                backgroundColor: colors.surfaceHover,
                borderRadius: 4,
                paddingHorizontal: 4,
                fontSize: TYPOGRAPHY.sizes.sm,
              },
              fence: {
                backgroundColor: colors.surfaceHover,
                borderRadius: 6,
                padding: 8,
                fontSize: TYPOGRAPHY.sizes.sm,
              },
              blockquote: {
                borderLeftWidth: 2,
                borderLeftColor: colors.primary + '50',
                paddingLeft: 8,
                fontStyle: 'italic',
              },
            }}
          >
            {cleanContent}
          </Markdown>
        )}
        {!isUser && parsedVerses.length > 0 && (
          <View style={[styles.sourcesContainer, { borderTopColor: colors.border }]}>
            <View style={styles.sourcesTitleRow}>
              <Ionicons name="book" size={16} color={colors.primary} />
              <Text style={[styles.sourcesTitle, { color: colors.primary }]}>
                {cleanContent && /[\u0B80-\u0BFF]/.test(cleanContent) ? 'ஆதார விவிலிய குறிப்புகள்:' : 'Biblical References'}
              </Text>
            </View>
            {parsedVerses.map((verse) => (
              <View key={verse.ref} style={[styles.verseItem, { backgroundColor: colors.surfaceHover, borderColor: colors.border }]}>
                <Text style={[styles.verseTitle, { color: colors.primary }]}>{verse.ref}</Text>
                {verse.text ? (
                  <Text style={[styles.verseText, { color: colors.foreground }]}>
                    {verse.text.replace(/^["'']+|["'']+$/g, '')}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
        {!isUser && showTimestamp && (
          <Text style={[styles.timestamp, { color: colors.mutedFaint }]}>
            {format(new Date(message.timestamp), 'h:mm a')}
          </Text>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.base,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: SPACING.md,
  },
  userBubble: {
    borderRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.xs,
    overflow: 'hidden',
  },
  userGradient: {
    borderRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.xs,
    padding: SPACING.md,
    margin: -SPACING.md,
  },
  aiBubble: {
    maxWidth: '88%',
    borderRadius: RADIUS.lg,
    borderTopLeftRadius: RADIUS.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.normal,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  sourcesContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sourcesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sourcesTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.fonts.serifSemiBold,
  },
  verseItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 0.5,
    marginBottom: SPACING.sm,
  },
  verseTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.fonts.serifBold,
    marginBottom: SPACING.xs,
  },
  verseText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.fonts.serifRegular,
    lineHeight: 20,
  },
});
