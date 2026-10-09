import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Text } from '@/components/AppText';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Linking } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Logo from '@/components/Logo';

const WEB_CLIENT_ID = '1022693265360-2tgo1ov8q1fkdp5txcnfcqo3p5m6vpbai.apps.googleusercontent.com';

// Pure Native Google Sign-In Configuration
let NativeGoogleSignin: any = null;
try {
  const mod = require('@react-native-google-signin/google-signin');
  NativeGoogleSignin = mod.GoogleSignin;
  if (NativeGoogleSignin) {
    NativeGoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
    });
  }
} catch (e) {
  // Non-native environment guard
}

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function EyeIcon({ color = '#71717a' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </Svg>
  );
}

function EyeOffIcon({ color = '#71717a' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <Path d="M1 1l22 22" />
    </Svg>
  );
}

export default function AuthModal({ visible, onClose, onSuccess }: AuthModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const brandPrimary = Colors[isDark ? 'dark' : 'light'].primary;

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Rate-limiting resend timer (15 seconds)
  const [resendTimer, setResendTimer] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0 && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Success', 'Check your email to confirm registration!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (resendTimer > 0) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setEmailSent(true);
      setResendTimer(15);
      Alert.alert('Email Sent', 'Password reset instructions have been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://www.getskinstory.com/terms-of-service');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://www.getskinstory.com/privacy-policy');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      if (!NativeGoogleSignin) {
        Alert.alert('Native Error', 'Native Google Sign-In module is not loaded.');
        setLoading(false);
        return;
      }

      await NativeGoogleSignin.hasPlayServices();
      const response = await NativeGoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;

      if (idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (error) throw error;
        onSuccess();
        onClose();
      } else {
        Alert.alert('Google Sign-In Error', 'No ID token returned from Google.');
      }
    } catch (nativeErr: any) {
      if (nativeErr.code === 'SIGN_IN_CANCELLED') {
        setLoading(false);
        return;
      }
      Alert.alert('Google Sign-In Error', nativeErr.message || 'Native sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        // Prevent back button dismiss if compulsory
      }}
    >
      <View style={styles.overlay}>
        {/* Full Backdrop Blur Effect */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 100}
          tint={isDark ? 'dark' : 'regular'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.backdropTint, isDark ? styles.backdropDark : styles.backdropLight]} />

        {/* Auth Modal Card */}
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          
          {/* Top Row: Logo/Name on Left, Pill "Skip Login/Sign Up" on Right */}
          <View style={styles.topHeaderRow}>
            <View style={styles.brandHeaderContainer}>
              <Logo size={22} color={isDark ? '#ffffff' : '#111111'} />
              <Text style={[styles.brandTitleText, isDark ? styles.textDark : styles.textLight]}>
                Skin Story
              </Text>
            </View>

            {/* Pill "Skip Login/Sign Up" button */}
            <Pressable
              onPress={onClose}
              style={[styles.skipPillBtn, isDark ? styles.skipPillDark : styles.skipPillLight]}
            >
              <Text style={[styles.skipPillText, isDark ? styles.textDark : styles.textLight]}>
                Skip Login/Sign Up
              </Text>
            </Pressable>
          </View>

          {/* Render Forgot Password View */}
          {mode === 'forgot' ? (
            <View>
              <Text style={[styles.mainHeading, isDark ? styles.textDark : styles.textLight]}>
                Forgot Password
              </Text>

              <Text style={[styles.subTitleDescription, isDark ? styles.subtextDark : styles.subtextLight]}>
                Enter your registered email address to receive password reset instructions.
              </Text>

              {/* Email Input */}
              <Text style={[styles.fieldLabel, isDark ? styles.textDark : styles.textLight]}>Email</Text>
              <TextInput
                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {/* Send Reset Link / Resend Email Button with 15s Rate Limit */}
              <Pressable
                style={[
                  styles.submitBtn,
                  { backgroundColor: resendTimer > 0 ? '#9ca3af' : brandPrimary },
                ]}
                onPress={handleSendResetPassword}
                disabled={loading || resendTimer > 0}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {resendTimer > 0
                      ? `Resend email in ${resendTimer}s`
                      : emailSent
                      ? 'Resend reset link'
                      : 'Send Reset Link'}
                  </Text>
                )}
              </Pressable>

              {/* Back to Sign In Link */}
              <View style={styles.centerLinkRow}>
                <Pressable onPress={() => setMode('signin')}>
                  <Text style={[styles.linkTextNormal, isDark ? styles.textDark : styles.textLight]}>
                    Back to Sign In
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Render Main Sign In / Sign Up View */
            <View>
              {/* Main Title */}
              <Text style={[styles.mainHeading, isDark ? styles.textDark : styles.textLight]}>
                {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
              </Text>

              {/* Subtitle / Account Toggle link above Google Sign In (Normal color) */}
              <View style={styles.subTitleRow}>
                <Text style={[styles.subTitleText, isDark ? styles.subtextDark : styles.subtextLight]}>
                  {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                </Text>
                <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                  <Text style={[styles.linkTextNormal, isDark ? styles.textDark : styles.textLight]}>
                    {mode === 'signin' ? 'Create account' : 'Sign in'}
                  </Text>
                </Pressable>
              </View>

              {/* Continue with Google Button (Pure Native Sheet) */}
              <Pressable
                style={[styles.googleBtn, isDark ? styles.googleBtnDark : styles.googleBtnLight]}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <GoogleIcon />
                <Text style={[styles.googleBtnText, isDark ? styles.textDark : styles.textLight]}>
                  Continue with Google
                </Text>
              </Pressable>

              {/* OR Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, isDark ? styles.dividerDark : styles.dividerLight]} />
                <Text style={[styles.dividerText, isDark ? styles.subtextDark : styles.subtextLight]}>OR</Text>
                <View style={[styles.dividerLine, isDark ? styles.dividerDark : styles.dividerLight]} />
              </View>

              {/* Email Label & Input */}
              <Text style={[styles.fieldLabel, isDark ? styles.textDark : styles.textLight]}>Email</Text>
              <TextInput
                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {/* Password Label & Forgot Password Link */}
              <View style={styles.passwordLabelRow}>
                <Text style={[styles.fieldLabel, isDark ? styles.textDark : styles.textLight]}>Password</Text>
                {mode === 'signin' && (
                  <Pressable onPress={() => setMode('forgot')}>
                    <Text style={[styles.forgotPasswordNormal, isDark ? styles.textDark : styles.textLight]}>
                      Forgot password?
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Password Input with Pill Eye Icon Toggle */}
              <View style={[styles.passwordInputContainer, isDark ? styles.inputDark : styles.inputLight]}>
                <TextInput
                  style={[styles.passwordInput, isDark ? styles.passwordInputDark : styles.passwordInputLight]}
                  placeholder="Enter your password"
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={[styles.eyePillBtn, isDark ? styles.eyePillDark : styles.eyePillLight]}
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeOffIcon color={isDark ? '#d4d4d8' : '#4b5563'} />
                  ) : (
                    <EyeIcon color={isDark ? '#d4d4d8' : '#4b5563'} />
                  )}
                </Pressable>
              </View>

              {/* Sign In Submit Button */}
              <Pressable
                style={[styles.submitBtn, { backgroundColor: brandPrimary }]}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                  </Text>
                )}
              </Pressable>

              {/* Agreement Footer */}
              <Text style={[styles.termsText, isDark ? styles.subtextDark : styles.subtextLight]}>
                By signing in, you agree to our{' '}
                <Text style={[styles.termsLinkNormal, isDark ? styles.textDark : styles.textLight]} onPress={handleOpenTerms}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text style={[styles.termsLinkNormal, isDark ? styles.textDark : styles.textLight]} onPress={handleOpenPrivacy}>
                  Privacy Policy
                </Text>.
              </Text>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdropTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  backdropDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  cardLight: { backgroundColor: '#ffffff' },
  cardDark: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a' },
  
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitleText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'Outfit_800ExtraBold',
  },
  skipPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  skipPillLight: { backgroundColor: '#f4f4f5', borderColor: '#e4e4e7' },
  skipPillDark: { backgroundColor: '#27272a', borderColor: '#3f3f46' },
  skipPillText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Outfit_600SemiBold',
  },
  
  mainHeading: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
    marginBottom: 4,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  subTitleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'Outfit_400Regular',
  },
  subTitleText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
  },
  linkTextNormal: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: 'Outfit_600SemiBold',
  },
  centerLinkRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 20,
  },
  googleBtnLight: { backgroundColor: '#f4f4f5', borderColor: '#e4e4e7' },
  googleBtnDark: { backgroundColor: '#27272a', borderColor: '#3f3f46' },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Outfit_600SemiBold',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLight: { backgroundColor: '#e4e4e7' },
  dividerDark: { backgroundColor: '#27272a' },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium',
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'Outfit_600SemiBold',
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 16,
  },
  inputLight: { backgroundColor: '#f4f4f5', borderColor: '#e4e4e7', color: '#111827' },
  inputDark: { backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' },

  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPasswordNormal: {
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
    fontFamily: 'Outfit_500Medium',
  },

  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 8,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  passwordInputLight: { color: '#111827' },
  passwordInputDark: { color: '#ffffff' },

  eyePillBtn: {
    width: 32,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePillLight: { backgroundColor: '#e4e4e7' },
  eyePillDark: { backgroundColor: '#3f3f46' },

  submitBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Outfit_600SemiBold',
  },

  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Outfit_400Regular',
  },
  termsLinkNormal: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  textLight: { color: '#111827' },
  textDark: { color: '#ffffff' },
  subtextLight: { color: '#6b7280' },
  subtextDark: { color: '#9ca3af' },
});
