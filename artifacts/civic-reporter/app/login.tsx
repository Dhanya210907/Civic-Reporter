import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await login(email.trim(), password);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.error ?? 'Login failed.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#0D3B1F', '#1A5C34']} style={[styles.header, { paddingTop: topPad + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome back</Text>
        <Text style={styles.headerSub}>Sign in to your account</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.form, { paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Admin hint */}
        <View style={[styles.hint, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Admin: </Text>
            admin@swachh.gov.in / admin123
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Your password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.7}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            New citizen?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.replace('/register')} activeOpacity={0.7}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  scroll: { flex: 1 },
  form: {
    padding: 24,
    gap: 16,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#DC2626',
    flex: 1,
  },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
