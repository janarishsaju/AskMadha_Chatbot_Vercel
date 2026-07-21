import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/useAuthStore';

export function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { signIn, signInLoading, error, clearError, resetPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    const { error } = await signIn(email, password);
    if (error) {
      Alert.alert('Sign in failed', error);
    }
  }, [email, password, signIn]);

  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert('Enter email', 'Please enter your email address first to receive a reset link.');
      return;
    }
    const { error } = await resetPassword(email);
    if (error) {
      Alert.alert('Reset failed', error);
    } else {
      Alert.alert('Check your email', 'We sent you a password reset link.');
    }
  }, [email, resetPassword]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
            style={styles.logoCircle}
          >
            <Ionicons name="flame" size={32} color={colors.white} />
          </LinearGradient>
        </View>

        <Text style={[styles.title, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.serifBold }]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
          Sign in to continue your spiritual journey
        </Text>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansMedium }]}>
            Email
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.mutedFaint} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedFaint}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansMedium }]}>
            Password
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.mutedFaint} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedFaint}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.mutedFaint}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <View style={styles.forgotPasswordRow}>
          <TouchableOpacity onPress={handleForgotPassword} disabled={signInLoading}>
            <Text style={[styles.forgotPasswordText, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={signInLoading}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
            style={[styles.button, signInLoading && styles.buttonDisabled]}
          >
            {signInLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={[styles.buttonText, { fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
                Sign In
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedFaint, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
            or
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: colors.muted, fontFamily: TYPOGRAPHY.fonts.sansRegular }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => { clearError(); navigation.navigate('Signup'); }}>
            <Text style={[styles.signupLink, { color: colors.primary, fontFamily: TYPOGRAPHY.fonts.sansSemiBold }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    height: '100%',
  },
  buttonContainer: {
    marginTop: SPACING.md,
  },
  button: {
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginHorizontal: SPACING.md,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  signupLink: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
});
