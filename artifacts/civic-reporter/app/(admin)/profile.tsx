import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/context/ComplaintsContext';
import { ConfirmModal } from '@/components/ConfirmModal';

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function AdminProfileScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const { complaints } = useComplaints();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showSignOut, setShowSignOut] = React.useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const pending = complaints.filter((c) => c.status === 'pending').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSignOut(true);
  }

  async function confirmLogout() {
    setShowSignOut(false);
    try {
      await logout();
    } finally {
      router.replace('/login');
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={['#0D2914', '#1A4A27']} style={[styles.header, { paddingTop: topPad + 20 }]}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'A'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="shield" size={12} color="#F1D775" />
          <Text style={styles.roleText}>Admin Officer</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: total },
            { label: 'Pending', value: pending },
            { label: 'Resolved', value: `${resolutionRate}%` },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.destructive, borderColor: colors.destructive }]}
          onPress={handleLogout}
          activeOpacity={0.8}
          testID="admin-sign-out"
        >
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Admin Information</Text>
          <InfoRow icon="person-outline" label="Full Name" value={user?.name ?? ''} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email ?? ''} />
          <InfoRow icon="call-outline" label="Helpline" value={user?.phone ?? ''} />
          <InfoRow icon="shield-checkmark-outline" label="Role" value="Admin Officer" />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>System Overview</Text>
          {[
            { icon: 'document-text-outline' as const, label: 'Total Complaints', value: `${total}` },
            { icon: 'checkmark-circle-outline' as const, label: 'Resolution Rate', value: `${resolutionRate}%` },
            { icon: 'people-outline' as const, label: 'Platform', value: 'Swachh Bharat Mission' },
          ].map((r, i) => (
            <View
              key={r.label}
              style={[styles.infoRow, { borderBottomColor: i < 2 ? colors.border : 'transparent' }]}
            >
              <View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name={r.icon} size={16} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{r.value}</Text>
              </View>
            </View>
          ))}
        </View>

      </View>
      <ConfirmModal
        visible={showSignOut}
        title="Sign out?"
        message="You can sign back in anytime with your administrator account."
        confirmLabel="Sign Out"
        icon="log-out-outline"
        destructive
        onCancel={() => setShowSignOut(false)}
        onConfirm={confirmLogout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 28, alignItems: 'center' },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,153,51,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
  name: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(241,215,117,0.16)', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginTop: 6,
  },
  roleText: { color: '#F1D775', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', gap: 32, marginTop: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  content: { padding: 16, gap: 14 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  infoIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.3 },
  infoValue: { fontSize: 15, fontFamily: 'Inter_500Medium', marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 16, paddingVertical: 14,
  },
  logoutText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
});
