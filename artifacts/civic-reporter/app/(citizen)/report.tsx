import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useComplaints, ComplaintCategory } from '@/context/ComplaintsContext';

const CATEGORIES: { value: ComplaintCategory; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { value: 'garbage', label: 'Garbage', icon: 'trash-outline', color: '#EF4444' },
  { value: 'pothole', label: 'Pothole', icon: 'warning-outline', color: '#F97316' },
  { value: 'water_leakage', label: 'Water Leakage', icon: 'water-outline', color: '#3B82F6' },
  { value: 'streetlight', label: 'Streetlight', icon: 'bulb-outline', color: '#F59E0B' },
  { value: 'drainage', label: 'Drainage', icon: 'rainy-outline', color: '#0891B2' },
  { value: 'transformer', label: 'Transformer', icon: 'flash-outline', color: '#D97706' },
  { value: 'dead_animals', label: 'Dead Animals', icon: 'paw-outline', color: '#92400E' },
  { value: 'other', label: 'Other', icon: 'alert-circle-outline', color: '#8B5CF6' },
];

export default function ReportScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { addComplaint } = useComplaints();
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  async function handleSubmit() {
    setError('');
    if (!category) { setError('Please select a complaint category.'); return; }
    if (!title.trim()) { setError('Please enter a complaint title.'); return; }
    if (!description.trim()) { setError('Please describe the issue.'); return; }
    if (!address.trim()) { setError('Please enter the location/address.'); return; }
    if (!ward.trim()) { setError('Please enter the ward/area.'); return; }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await addComplaint({
        userId: user!.id,
        userName: user!.name,
        category,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        ward: ward.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      setCategory(null);
      setTitle(''); setDescription(''); setAddress(''); setWard('');
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Unable to save your complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 20, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Report Issue</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Submit a civic complaint for your area
        </Text>
      </View>

      <View style={styles.content}>
        {success && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            <Text style={styles.successText}>Complaint submitted successfully!</Text>
          </View>
        )}

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Category */}
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Select Category</Text>
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.catBtn,
                  { borderColor: selected ? cat.color : colors.border, backgroundColor: selected ? cat.color + '15' : colors.card },
                ]}
                onPress={() => { Haptics.selectionAsync(); setCategory(cat.value); }}
                activeOpacity={0.75}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={cat.icon} size={22} color={cat.color} />
                </View>
                <Text style={[styles.catLabel, { color: selected ? cat.color : colors.foreground }]}>
                  {cat.label}
                </Text>
                {selected && <Ionicons name="checkmark-circle" size={16} color={cat.color} style={styles.catCheck} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Form Fields */}
        {[
          { label: 'Complaint Title', icon: 'document-text-outline' as const, value: title, onChange: setTitle, placeholder: 'Brief title of the issue', multiline: false },
        ].map((f) => (
          <View key={f.label} style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{f.label}</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={f.icon} size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
                value={f.value}
                onChangeText={f.onChange}
              />
            </View>
          </View>
        ))}

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Description</Text>
          <View style={[styles.inputWrap, styles.textAreaWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.foreground }]}
              placeholder="Describe the issue in detail — what, where, since when..."
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Address / Location</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="location-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Street address, landmark"
              placeholderTextColor={colors.mutedForeground}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Ward / Area</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="map-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="e.g. Ward 12, Sector 7"
              placeholderTextColor={colors.mutedForeground}
              value={ward}
              onChangeText={setWard}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={18} color={colors.primaryForeground} />
              <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Submit Complaint</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 4 },
  content: { padding: 20, gap: 16 },
  successBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#DCFCE7', borderColor: '#86EFAC', borderWidth: 1,
    padding: 14, borderRadius: 14,
  },
  successText: { color: '#166534', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#DC2626', flex: 1 },
  sectionLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10,
    minWidth: '45%', flex: 1,
  },
  catIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1 },
  catCheck: { marginLeft: 'auto' },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  textAreaWrap: { alignItems: 'flex-start', paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', padding: 0 },
  textArea: { height: 90 },
  submitBtn: {
    borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
  },
  submitText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
});
