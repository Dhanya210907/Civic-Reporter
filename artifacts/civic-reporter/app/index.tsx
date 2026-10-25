import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

export default function WelcomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.replace('/(admin)/' as any);
      } else {
        router.replace('/(citizen)/' as any);
      }
    }
  }, [user, loading]);

  if (loading || user) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.primary }]}>
        <Image source={require('@/assets/images/icon.png')} style={styles.loadingLogo} resizeMode="cover" />
        <ActivityIndicator color="#FFFFFF" size="small" />
      </View>
    );
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={['#0D3B1F', '#1A5C34', '#2D8B4A']}
      style={[styles.container, { paddingTop: topPad + 24, paddingBottom: botPad + 24 }]}
    >
      {/* Badge */}
      <View style={styles.badge}>
        <Ionicons name="shield-checkmark" size={14} color="#FF9933" />
        <Text style={styles.badgeText}>Government of India Initiative</Text>
      </View>

      {/* Logo */}
      <View style={styles.logoWrap}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Swachh Bharat</Text>
      <Text style={styles.subtitle}>Complaint Management System</Text>
      <Text style={styles.tagline}>
        Report civic issues. Track progress.{'\n'}Help build a cleaner India.
      </Text>

      {/* Feature chips */}
      <View style={styles.chips}>
        {['Report Issues', 'Track Status', 'Get Resolved'].map((label, i) => (
          <View key={i} style={styles.chip}>
            <Ionicons
              name={(['document-text-outline', 'time-outline', 'checkmark-circle-outline'] as const)[i]}
              size={14}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.chipText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Login to Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#1A5C34" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>New Citizen? Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminLink}
          onPress={() => router.push('/login')}
          activeOpacity={0.7}
        >
          <Ionicons name="lock-closed-outline" size={13} color="rgba(255,255,255,0.5)" />
          <Text style={styles.adminLinkText}>Admin Portal</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  loadingLogo: { width: 76, height: 76, borderRadius: 20 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,153,51,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,153,51,0.3)',
    marginBottom: 32,
  },
  badgeText: {
    color: '#FF9933',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  spacer: { flex: 1 },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#1A5C34',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 4,
  },
  adminLinkText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
