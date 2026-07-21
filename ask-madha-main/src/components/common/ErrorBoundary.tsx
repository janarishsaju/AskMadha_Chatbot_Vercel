import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LIGHT_THEME } from '../../theme/tokens';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../theme/tokens';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    backgroundColor: LIGHT_THEME.background,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.serifBold,
    fontSize: TYPOGRAPHY.sizes.xl,
    color: LIGHT_THEME.foreground,
    marginBottom: SPACING.md,
  },
  message: {
    fontFamily: TYPOGRAPHY.fonts.sansRegular,
    fontSize: TYPOGRAPHY.sizes.base,
    color: LIGHT_THEME.muted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  button: {
    backgroundColor: LIGHT_THEME.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.fonts.serifSemiBold,
    fontSize: TYPOGRAPHY.sizes.base,
    color: LIGHT_THEME.white,
  },
});
