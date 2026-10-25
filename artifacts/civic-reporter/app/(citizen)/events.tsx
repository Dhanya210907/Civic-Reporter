import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';

const EVENT_TILES = [
  { label: 'Yours', icon: 'person-add-outline' as const, color: '#ebbf00', message: 'Your joined events will appear here.' },
  { label: 'Upcoming', icon: 'calendar-outline' as const, color: '#ebbf00', message: 'Upcoming cleanliness drives in your city.' },
  { label: 'Popular', icon: 'ticket-outline' as const, color: '#ebbf00', message: 'Popular events near you.' },
  { label: 'Bookmarked', icon: 'bookmark-outline' as const, color: '#ebbf00', message: 'Save events to find them quickly.' },
  { label: 'All', icon: 'list-outline' as const, color: '#ebbf00', message: 'Browse all Swachhata events.' },
];

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 98 : insets.bottom + 82;

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0D2914', '#1A4A27']} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.portalTag}>
          <Ionicons name="shield-checkmark" size={12} color="#F1D775" />
          <Text style={styles.portalTagText}>Citizen Portal</Text>
        </View>
        <Text style={styles.headerTitle}>Community Events</Text>
        <Text style={styles.headerSub}>Join your community in keeping India clean</Text>
      </LinearGradient>
      <View style={styles.content}>
        <View style={styles.grid}>
          {EVENT_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.label}
              style={[styles.tile, { backgroundColor: tile.color }]}
              onPress={() => Alert.alert(tile.label, tile.message)}
              activeOpacity={0.8}
            >
              <Ionicons name={tile.icon} size={25} color={colors.foreground} />
              <Text style={[styles.tileText, { color: colors.foreground }]}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.emptyHint, { backgroundColor: colors.secondary }]}>
          <Ionicons name="calendar-clear-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.hintTitle, { color: colors.foreground }]}>Community events</Text>
            <Text style={[styles.hintBody, { color: colors.mutedForeground }]}>Discover cleanliness drives and local initiatives as they are announced.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 19 },
  portalTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  portalTagText: { color: '#F1D775', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4, lineHeight: 18, color: 'rgba(255,255,255,0.7)' },
  content: { padding: 20, gap: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: { width: '47.7%', height: 126, borderRadius: 16, padding: 16, justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 7, elevation: 3 },
  tileText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  emptyHint: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 15, borderRadius: 15 },
  hintTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  hintBody: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17, marginTop: 3 },
});