import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Keyboard, ActivityIndicator, Platform, TextInputProps,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

type RegistrationFieldProps = {
  colors: ReturnType<typeof useColors>;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  secureTextEntry?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  inputRef?: React.Ref<TextInput>;
  onSubmitEditing?: () => void;
  editable?: boolean;
  extra?: React.ReactNode;
  testID: string;
};

function RegistrationField({
  colors,
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  secureTextEntry = false,
  returnKeyType = 'next',
  inputRef,
  onSubmitEditing,
  editable = true,
  extra,
  testID,
}: RegistrationFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name={icon} size={18} color={colors.mutedForeground} />
        <TextInput
          ref={inputRef}
          testID={testID}
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
        />
        {extra}
      </View>
    </View>
  );
}

function WebForm({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;

  return React.createElement(
    'form',
    {
      onSubmit: (event: React.FormEvent<HTMLFormElement>) => event.preventDefault(),
      style: { display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 },
    },
    children,
  );
}

export default function RegisterScreen() {
  const colors = useColors();
  const { register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nameRef = React.useRef<TextInput | null>(null);
  const phoneRef = React.useRef<TextInput | null>(null);
  const emailRef = React.useRef<TextInput | null>(null);
  const passwordRef = React.useRef<TextInput | null>(null);
  const confirmPasswordRef = React.useRef<TextInput | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleRegister() {
    setError('');
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const normalizedEmail = email.trim().toLowerCase();
    let normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length === 12 && normalizedPhone.startsWith('91')) {
      normalizedPhone = normalizedPhone.slice(2);
    } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('0')) {
      normalizedPhone = normalizedPhone.slice(1);
    }

    if (!normalizedName || !normalizedEmail || !phone.trim() || !password || !confirmPassword) {
      setError('Please complete every field, including password confirmation.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError('Enter a valid 10-digit mobile number, optionally with +91.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await register(normalizedName, normalizedEmail, normalizedPhone, password);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.error ?? 'Registration failed.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setError('Unable to create your account right now. Please try again.');
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
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>Register as a citizen</Text>
      </LinearGradient>

      <WebForm>
        <KeyboardAwareScrollViewCompat
          style={styles.scroll}
          contentContainerStyle={[styles.form, { paddingBottom: botPad + 80 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bottomOffset={72}
          showsVerticalScrollIndicator={false}
        >
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <RegistrationField
          colors={colors}
          label="Full Name"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          autoCapitalize="words"
          autoComplete="name"
          inputRef={nameRef}
          onSubmitEditing={() => phoneRef.current?.focus()}
          testID="register-name"
        />
        <RegistrationField
          colors={colors}
          label="Phone Number"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          autoComplete="tel"
          inputRef={phoneRef}
          onSubmitEditing={() => emailRef.current?.focus()}
          testID="register-phone"
        />
        <RegistrationField
          colors={colors}
          label="Email Address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
          inputRef={emailRef}
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="register-email"
        />
        <RegistrationField
          colors={colors}
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 6 characters"
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          inputRef={passwordRef}
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          testID="register-password"
          extra={
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.7}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          }
        />
        <RegistrationField
          colors={colors}
          label="Confirm Password"
          icon="shield-checkmark-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          returnKeyType="done"
          inputRef={confirmPasswordRef}
          onSubmitEditing={Keyboard.dismiss}
          testID="register-confirm-password"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Create Account</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.primaryForeground} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAwareScrollViewCompat>
      </WebForm>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 32 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  headerSub: { fontSize: 15, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  scroll: { flex: 1 },
  form: { padding: 24, gap: 14 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#DC2626', flex: 1 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', padding: 0 },
  primaryBtn: {
    borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8,
  },
  primaryBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  footerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
