import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Platform, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useComplaints, ComplaintStatus } from '@/context/ComplaintsContext';
import { StatusBadge } from '@/components/StatusBadge';

const CATEGORY_CONFIG = {
  garbage: { icon: 'trash-outline' as const, color: '#EF4444', label: 'Garbage' },
  pothole: { icon: 'warning-outline' as const, color: '#F97316', label: 'Pothole' },
  water_leakage: { icon: 'water-outline' as const, color: '#3B82F6', label: 'Water Leakage' },
  streetlight: { icon: 'bulb-outline' as const, color: '#F59E0B', label: 'Streetlight' },
  drainage: { icon: 'rainy-outline' as const, color: '#0891B2', label: 'Drainage' },
  transformer: { icon: 'flash-outline' as const, color: '#D97706', label: 'Transformer Issue' },
  dead_animals: { icon: 'paw-outline' as const, color: '#92400E', label: 'Dead Animals' },
  other: { icon: 'alert-circle-outline' as const, color: '#8B5CF6', label: 'Other' },
};

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.detailRow}>
      <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name={icon} size={15} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { user } = useAuth();
  const { getComplaintById, updateComplaint } = useComplaints();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const complaint = getComplaintById(id ?? '');
  const isAdmin = user?.role === 'admin';

  // Redirect unauthenticated users
  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else if (user.role === 'citizen' && complaint && complaint.userId !== user.id) {
      // Citizens can only view their own complaints
      router.back();
    }
  }, [user, complaint]);

  const [status, setStatus] = useState<ComplaintStatus>(complaint?.status ?? 'pending');
  const [adminNote, setAdminNote] = useState(complaint?.adminNote ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const botPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  if (!complaint) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Complaint not found</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[{ color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 15, marginTop: 8 }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cat = CATEGORY_CONFIG[complaint.category];

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateComplaint(id!, status, adminNote.trim() || undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (isAdmin) {
        router.replace('/(admin)/' as any);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      Alert.alert('Update failed', 'Could not save the complaint update. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Banner */}
      <View style={[styles.banner, { backgroundColor: cat.color + '12', borderBottomColor: cat.color + '30' }]}>
        <View style={[styles.bannerIcon, { backgroundColor: cat.color + '20' }]}>
          <Ionicons name={cat.icon} size={28} color={cat.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
          <Text style={[styles.complaintTitle, { color: colors.foreground }]}>{complaint.title}</Text>
        </View>
        <StatusBadge status={complaint.status} />
      </View>

      <View style={styles.content}>
        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
          <Text style={[styles.description, { color: colors.foreground }]}>{complaint.description}</Text>
        </View>

        {/* Details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Details</Text>
          {!isAdmin && <DetailRow icon="person-outline" label="Reported by" value={complaint.userName} />}
          <DetailRow icon="location-outline" label="Address" value={complaint.address} />
          <DetailRow icon="map-outline" label="Ward / Area" value={complaint.ward} />
          <DetailRow icon="time-outline" label="Reported on" value={formatDate(complaint.createdAt)} />
          <DetailRow icon="refresh-outline" label="Last updated" value={formatDate(complaint.updatedAt)} />
          <DetailRow icon="finger-print-outline" label="Complaint ID" value={complaint.id} />
        </View>

        {/* Admin note (read-only for citizens) */}
        {complaint.adminNote && !isAdmin && (
          <View style={[styles.section, { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}>
            <View style={styles.adminNoteHeader}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#2563EB" />
              <Text style={[styles.sectionTitle, { color: '#2563EB' }]}>Admin Response</Text>
            </View>
            <Text style={[styles.description, { color: '#1E3A8A' }]}>{complaint.adminNote}</Text>
          </View>
        )}

        {/* Admin update panel */}
        {isAdmin && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Update Status</Text>

            {saved && (
              <View style={styles.savedBox}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={styles.savedText}>Status updated successfully</Text>
              </View>
            )}

            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((opt) => {
                const sel = status === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.statusOpt,
                      { borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primary + '12' : colors.background },
                    ]}
                    onPress={() => { Haptics.selectionAsync(); setStatus(opt.value); }}
                    activeOpacity={0.75}
                  >
                    {sel && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
                    <Text style={[styles.statusOptText, { color: sel ? colors.primary : colors.foreground }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground, marginTop: 16 }]}>Admin Note</Text>
            <View style={[styles.noteWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.noteInput, { color: colors.foreground }]}
                placeholder="Add a note for the citizen (optional)..."
                placeholderTextColor={colors.mutedForeground}
                value={adminNote}
                onChangeText={setAdminNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.primaryForeground} />
                  <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Update Complaint</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  notFoundText: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  banner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    padding: 20, borderBottomWidth: 1,
  },
  bannerIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  complaintTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', lineHeight: 26, marginTop: 2 },
  content: { padding: 16, gap: 14 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.3 },
  rowValue: { fontSize: 14, fontFamily: 'Inter_500Medium', marginTop: 1 },
  adminNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  savedBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#DCFCE7', borderColor: '#86EFAC', borderWidth: 1,
    padding: 10, borderRadius: 10,
  },
  savedText: { color: '#166534', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOpt: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9,
  },
  statusOptText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  fieldLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  noteWrap: { borderRadius: 14, borderWidth: 1.5, padding: 12 },
  noteInput: { fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 72, padding: 0 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 16, paddingVertical: 14, marginTop: 4,
  },
  saveBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});
