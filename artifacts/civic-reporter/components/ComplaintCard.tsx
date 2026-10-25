import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Complaint, ComplaintCategory } from '@/context/ComplaintsContext';
import { StatusBadge } from '@/components/StatusBadge';
import { useColors } from '@/hooks/useColors';

const CATEGORY_CONFIG: Record<ComplaintCategory, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  garbage: { icon: 'trash-outline', color: '#EF4444', label: 'Garbage' },
  pothole: { icon: 'warning-outline', color: '#F97316', label: 'Pothole' },
  water_leakage: { icon: 'water-outline', color: '#3B82F6', label: 'Water Leakage' },
  streetlight: { icon: 'bulb-outline', color: '#F59E0B', label: 'Streetlight' },
  drainage: { icon: 'rainy-outline', color: '#0891B2', label: 'Drainage' },
  transformer: { icon: 'flash-outline', color: '#D97706', label: 'Transformer Issue' },
  dead_animals: { icon: 'paw-outline', color: '#92400E', label: 'Dead Animals' },
  other: { icon: 'alert-circle-outline', color: '#8B5CF6', label: 'Other' },
};

interface Props {
  complaint: Complaint;
  showUser?: boolean;
}

export function ComplaintCard({ complaint, showUser = false }: Props) {
  const colors = useColors();
  const router = useRouter();
  const cat = CATEGORY_CONFIG[complaint.category];

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/complaint/${complaint.id}`);
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: cat.color + '18' }]}>
          <Ionicons name={cat.icon} size={20} color={cat.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.category, { color: cat.color }]}>{cat.label}</Text>
          {showUser && (
            <Text style={[styles.user, { color: colors.mutedForeground }]}>
              {complaint.userName}
            </Text>
          )}
        </View>
        <StatusBadge status={complaint.status} size="sm" />
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {complaint.title}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {complaint.ward}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {formatDate(complaint.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  category: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  user: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: 14,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
