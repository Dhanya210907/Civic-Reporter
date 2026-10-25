import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useComplaints, ComplaintStatus } from '@/context/ComplaintsContext';
import { ComplaintCard } from '@/components/ComplaintCard';

type Filter = 'all' | ComplaintStatus;

const FILTERS: { value: Filter; label: string; color?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending', color: '#D97706' },
  { value: 'in_progress', label: 'Active', color: '#2563EB' },
  { value: 'resolved', label: 'Resolved', color: '#16A34A' },
  { value: 'rejected', label: 'Rejected', color: '#DC2626' },
];

export default function AdminDashboardScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { complaints, refreshComplaints } = useComplaints();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const sorted = [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filtered = filter === 'all' ? sorted : sorted.filter((c) => c.status === filter);

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    rejected: complaints.filter((c) => c.status === 'rejected').length,
  };

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refreshComplaints();
    } catch {
      Alert.alert('Refresh failed', 'Could not reload complaints. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#0D2914', '#1A4A27']} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.adminTag}>
              <Ionicons name="shield" size={12} color="#F1D775" />
              <Text style={styles.adminTagText}>Admin Portal</Text>
            </View>
            <Text style={styles.headerTitle}>Complaint Dashboard</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'A'}</Text>
          </View>
        </View>

        {/* Stat cards */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total', value: counts.total, color: '#FFFFFF', icon: 'document-text-outline' as const },
            { label: 'Pending', value: counts.pending, color: '#F59E0B', icon: 'time-outline' as const },
            { label: 'Active', value: counts.in_progress, color: '#3B82F6', icon: 'refresh-outline' as const },
            { label: 'Resolved', value: counts.resolved, color: '#22C55E', icon: 'checkmark-circle-outline' as const },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '25' }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Filter bar */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
          renderItem={({ item: f }) => {
            const active = filter === f.value;
            const activeColor = f.color ?? colors.primary;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { backgroundColor: active ? activeColor : colors.secondary, borderColor: active ? activeColor : colors.border },
                ]}
                onPress={() => setFilter(f.value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterText, { color: active ? (f.value === 'all' ? colors.primaryForeground : '#fff') : colors.foreground }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ComplaintCard complaint={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
            {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All clear</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No complaints in this category.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  adminTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  adminTagText: { color: '#F1D775', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 4 },
  statIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.6)' },
  filterBar: { borderBottomWidth: 1 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  resultCount: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  empty: { alignItems: 'center', paddingVertical: 64, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
