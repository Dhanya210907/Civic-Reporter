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
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Posted' }, { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'Active' }, { value: 'resolved', label: 'Resolved' },
];

export default function MyComplaintsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { complaints, refreshComplaints } = useComplaints();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 98 : insets.bottom + 82;
  const mine = complaints.filter((c) => c.userId === user?.id);
  const filtered = filter === 'all' ? mine : mine.filter((c) => c.status === filter);

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
      <LinearGradient
        colors={['#0D2914', '#1A4A27']}
        style={[
          styles.header,
          { paddingTop: Platform.OS === 'web' ? 60 : topPad + 16 },
        ]}
      >
        <View style={styles.portalTag}>
          <Ionicons name="shield-checkmark" size={12} color="#F1D775" />
          <Text style={styles.portalTagText}>Citizen Portal</Text>
        </View>
        <Text style={styles.headerTitle}>My Complaints</Text>
        <Text style={styles.headerSub}>Track every complaint you have posted</Text>
      </LinearGradient>
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <TouchableOpacity key={f.value} style={[styles.filter, { backgroundColor: active ? colors.primary : colors.secondary }]} onPress={() => setFilter(f.value)} activeOpacity={0.8}>
                <Text style={[styles.filterText, { color: active ? colors.primaryForeground : colors.foreground }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ComplaintCard complaint={item} />}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 73,
          paddingBottom: bottomPad,
        }}
        ListHeaderComponentStyle={{ paddingTop: 199 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={<Text style={[styles.resultCount, { color: colors.mutedForeground }]}>{filtered.length} complaint{filtered.length === 1 ? '' : 's'}</Text>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbox-ellipses-outline" size={46} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing posted yet</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Use the plus button below to report a civic issue.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 19, marginTop: 0, marginBottom: 0 },
  portalTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  portalTagText: { color: '#F1D775', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4, color: 'rgba(255,255,255,0.7)' },
  filterBar: { borderBottomWidth: 1 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 50,
    marginTop: 6,
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 6,
  },
  filter: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 18 },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  resultCount: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: -258,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 199,
    paddingBottom: 199,
    paddingHorizontal: 28,
    gap: 8,
    marginTop: -225,
    marginBottom: -133,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 6 },
  emptyBody: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 19 },
});