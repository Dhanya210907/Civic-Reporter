import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView,
  Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/context/ComplaintsContext';
import { ConfirmModal } from '@/components/ConfirmModal';

function DetailRow({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.detailText, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function CitizenProfileScreen() {
  const colors = useColors();
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const { complaints, resolvePendingComplaintsForUser } = useComplaints();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mine = complaints.filter((c) => c.userId === user?.id);
  const pendingMine = mine.filter((c) => c.status === 'pending');
  const activeMine = mine.filter((c) => c.status === 'in_progress');
  const resolvedMine = mine.filter((c) => c.status === 'resolved');
  const [showSignOut, setShowSignOut] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [form, setForm] = React.useState({ name: '', email: '', phone: '' });
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 98 : insets.bottom + 82;

  function openEdit() {
    setForm({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });
    setFormError('');
    setShowEdit(true);
  }

  async function handleSaveProfile() {
    setSaving(true);
    setFormError('');
    try {
      const result = await updateProfile(form);
      if (!result.success) {
        setFormError(result.error ?? 'Unable to update your profile.');
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowEdit(false);
    } catch {
      setFormError('Unable to update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    setSaving(true);
    const deletionNote = 'Account deleted by citizen; complaint automatically resolved.';
    await resolvePendingComplaintsForUser(user.id, deletionNote);
    const result = await deleteAccount();
    setSaving(false);
    if (!result.success) {
      setFormError(result.error ?? 'Unable to delete your account.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowDelete(false);
    router.replace('/login');
  }

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
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0D2914', '#1A4A27']} style={[styles.header, { paddingTop: topPad + 20 }]}>
        <View style={styles.profilePhoto}>
          <Text style={styles.profileInitial}>{user?.name?.charAt(0).toUpperCase() ?? 'C'}</Text>
          <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}><Ionicons name="camera" size={14} color={colors.accentForeground} /></View>
        </View>
        <View style={styles.portalTag}>
          <Ionicons name="shield-checkmark" size={12} color="#F1D775" />
          <Text style={styles.portalTagText}>Citizen Portal</Text>
        </View>
        <Text style={styles.profileName}>Citizen Profile</Text>
        <Text style={styles.profileIntro}>Post a complaint in your locality to become a{'\n'}Swachhata Champion</Text>
        <Text style={styles.profileSupport}>Thank you for your support to Swachh Bharat Mission. Update your profile to experience enhanced features.</Text>
        <TouchableOpacity style={styles.postLinkButton} onPress={() => router.push('/(citizen)/report' as any)} activeOpacity={0.7}>
          <Text style={styles.postLink}>Post a Complaint Now</Text>
        </TouchableOpacity>
        <View style={styles.profileStats}>
          {[
            { label: 'Posted', value: mine.length },
            { label: 'Pending', value: pendingMine.length },
            { label: 'Active', value: activeMine.length },
            { label: 'Resolved', value: resolvedMine.length },
          ].map((stat) => (
            <View key={stat.label} style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{stat.value}</Text>
              <Text style={styles.profileStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.detailHeading}>
          <Text style={[styles.headingText, { color: colors.foreground }]}>Your Details</Text>
          <TouchableOpacity onPress={openEdit} activeOpacity={0.7} testID="edit-profile">
            <Text style={[styles.editText, { color: colors.primary }]}>EDIT</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <DetailRow icon="call-outline" value={user?.phone ?? 'Add a phone number'} />
          <DetailRow icon="mail-outline" value={user?.email ?? 'Add an email address'} />
          <DetailRow icon="location-outline" value="Your locality, India" />
        </View>

        <Text style={[styles.alsoTitle, { color: colors.foreground }]}>You can also</Text>
        <TouchableOpacity
          style={[styles.optionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(citizen)/notifications' as any)}
          accessibilityRole="button"
          testID="check-notifications"
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.foreground }]}>Check Notifications</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionRow, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={[styles.optionText, { color: colors.destructive }]}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteRow, { borderColor: colors.destructive }]}
          onPress={() => { setFormError(''); setShowDelete(true); }}
          activeOpacity={0.8}
          testID="delete-account"
        >
          <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          <Text style={[styles.optionText, { color: colors.destructive }]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.destructive} />
        </TouchableOpacity>
        <Text style={[styles.complaintCount, { color: colors.mutedForeground }]}>{mine.length} complaint{mine.length === 1 ? '' : 's'} posted from this account</Text>
      </View>

      <ConfirmModal
        visible={showSignOut}
        title="Sign out?"
        message="You can sign back in anytime with your citizen account."
        confirmLabel="Sign Out"
        icon="log-out-outline"
        destructive
        onCancel={() => setShowSignOut(false)}
        onConfirm={confirmLogout}
      />

      <ConfirmModal
        visible={showDelete}
        title="Delete your account?"
        message={`${pendingMine.length} pending complaint${pendingMine.length === 1 ? '' : 's'} will be marked resolved and kept as civic records. This action cannot be undone.`}
        confirmLabel="Delete Account"
        icon="trash-outline"
        destructive
        busy={saving}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDeleteAccount}
      />

      <Modal visible={showEdit} transparent animationType="slide" onRequestClose={() => setShowEdit(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.editCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: insets.bottom }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Profile</Text>
                <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Keep your contact details up to date</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEdit(false)} disabled={saving} testID="close-edit-profile">
                <Ionicons name="close-circle-outline" size={27} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            {[
              { key: 'name' as const, label: 'Full Name', icon: 'person-outline' as const, placeholder: 'Your full name' },
              { key: 'email' as const, label: 'Email Address', icon: 'mail-outline' as const, placeholder: 'you@example.com', keyboardType: 'email-address' as const },
              { key: 'phone' as const, label: 'Phone Number', icon: 'call-outline' as const, placeholder: 'Your phone number', keyboardType: 'phone-pad' as const },
            ].map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>{field.label}</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name={field.icon} size={18} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={form[field.key]}
                    onChangeText={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                    editable={!saving}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSaveProfile} disabled={saving} activeOpacity={0.85} testID="save-profile">
              {saving ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  profilePhoto: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#E6F1EC', alignItems: 'center', justifyContent: 'center', marginBottom: 9, borderWidth: 4, borderColor: 'rgba(255,255,255,0.55)' },
  profileInitial: { fontSize: 43, fontFamily: 'Inter_700Bold', color: '#1A4A27' },
  cameraBadge: { position: 'absolute', right: -2, bottom: 2, width: 31, height: 31, borderRadius: 16, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  profileName: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' },
  portalTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  portalTagText: { color: '#F1D775', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  profileIntro: { color: 'rgba(255,255,255,0.96)', fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 20, textAlign: 'center', marginTop: 13 },
  profileSupport: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, textAlign: 'center', marginTop: 10 },
  postLink: { color: '#F1D775', fontSize: 14, fontFamily: 'Inter_600SemiBold', textDecorationLine: 'underline', marginTop: 14 },
  postLinkButton: { minHeight: 44, alignSelf: 'center', justifyContent: 'center' },
  profileStats: { flexDirection: 'row', gap: 24, marginTop: 20 },
  profileStat: { alignItems: 'center' },
  profileStatValue: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter_700Bold' },
  profileStatLabel: { color: 'rgba(255,255,255,0.68)', fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 2 },
  content: { padding: 18, gap: 13 },
  detailHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  headingText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  editText: { fontSize: 13, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  detailsCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  detailRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  detailText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  alsoTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginTop: 10 },
  optionRow: { minHeight: 54, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16 },
  deleteRow: { minHeight: 54, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16 },
  optionText: { fontSize: 14, fontFamily: 'Inter_500Medium', flex: 1 },
  complaintCount: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 20, 0.48)', padding: 12 },
  editCard: { borderRadius: 22, borderWidth: 1, padding: 20, gap: 13, maxWidth: 520, width: '100%', alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  modalSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 3 },
  formError: { color: '#DC2626', fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 18 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  inputWrap: { minHeight: 50, borderRadius: 13, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', paddingVertical: 0 },
  saveButton: { borderRadius: 14, minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});