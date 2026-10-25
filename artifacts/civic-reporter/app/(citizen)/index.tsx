import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/context/ComplaintsContext';
import { StatusBadge } from '@/components/StatusBadge';

const ACTIONS = [
  { title: 'Post A\nComplaint', body: 'We are committed to receiving your complaint', icon: 'chatbox-ellipses-outline' as const, colors: ['#ebbf00', '#99767682'], route: 'report' },
  { title: 'Rate Public\nToilet', body: 'Scan QR Code', icon: 'people-outline' as const, colors: ['#ebbf00', '#99767682'], route: 'alert' },
  { title: 'SBM Toilet\nLocator', body: 'Find the nearest toilet', icon: 'location-outline' as const, colors: ['#ebbf00', '#99767682'], route: 'alert' },
  { title: 'Provide\nFeedback', body: 'Tell us your experience of Swachhata App', icon: 'chatbubbles-outline' as const, colors: ['#ebbf00', '#99767682'], route: 'alert' },
];

function ActionTile({ item, onPress }: { item: typeof ACTIONS[number]; onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity style={[styles.actionTile, { backgroundColor: item.colors[0] }]} onPress={onPress} activeOpacity={0.82}>
      <View style={[styles.tileGlow, { backgroundColor: item.colors[1] }]} />
      <Ionicons name={item.icon} size={32} color={colors.foreground} />
      <Text style={[styles.tileTitle, { color: colors.foreground }]}>{item.title}</Text>
      <Text style={[styles.tileBody, { color: colors.foreground }]}>{item.body}</Text>
    </TouchableOpacity>
  );
}

export default function CitizenHomeScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mine = complaints.filter((c) => c.userId === user?.id);
  const latest = mine[0];
  const counts = {
    total: mine.length,
    pending: mine.filter((c) => c.status === 'pending').length,
    in_progress: mine.filter((c) => c.status === 'in_progress').length,
    resolved: mine.filter((c) => c.status === 'resolved').length,
  };
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 98 : insets.bottom + 82;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  function showAction(item: typeof ACTIONS[number]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.route === 'report') router.push('/(citizen)/report' as any);
    else Alert.alert(item.title.replace('\n', ' '), 'This citizen service is coming soon.');
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#0D2914', '#1A4A27']}
        style={[
          styles.topBar,
          { paddingTop: Platform.OS === 'web' ? 55 : topPad + 16 },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push('/(citizen)/profile' as any)} style={styles.topProfile} activeOpacity={0.8}>
            <View style={styles.miniAvatar}><Text style={styles.miniAvatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'C'}</Text></View>
            <View>
              <View style={styles.portalTag}>
                <Ionicons name="shield-checkmark" size={11} color="#F1D775" />
                <Text style={styles.citizenLabel}>Citizen Portal</Text>
              </View>
              <Text style={styles.brand}>My Civic Dashboard</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bell}
            onPress={() => router.push('/(citizen)/notifications' as any)}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            testID="open-notifications"
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
            {mine.length > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Posted', value: counts.total, color: '#FFFFFF', icon: 'document-text-outline' as const },
            { label: 'Pending', value: counts.pending, color: '#F1D775', icon: 'time-outline' as const },
            { label: 'Active', value: counts.in_progress, color: '#3B82F6', icon: 'refresh-outline' as const },
            { label: 'Resolved', value: counts.resolved, color: '#22C55E', icon: 'checkmark-circle-outline' as const },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '25' }]}>
                <Ionicons name={stat.icon} size={15} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={[styles.welcomeCard, { backgroundColor: '#d9ac23', borderColor: colors.border }]}>
          <View style={[styles.welcomeAvatar, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.welcomeAvatarText, { color: colors.primary }]}>{user?.name?.charAt(0).toUpperCase() ?? 'C'}</Text>
          </View>
          <Text style={[styles.welcomeTitle, { color: '#473a16' }]}>{greeting()}, Welcome{'\n'}{user?.name?.split(' ')[0] ?? 'Citizen'}</Text>
          <Text style={[styles.welcomeBody, { color: '#473a16' }]}>Here are today's actions for you</Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: '#ebbf00' }]}>
          <View style={styles.statusCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: '#473a16' }]}>{latest ? latest.title : 'No complaint posted yet'}</Text>
              <Text style={[styles.statusId, { color: '#473a16', opacity: 0.78 }]}>{latest ? `ID: ${latest.id.toUpperCase()}` : 'Post a complaint to track its progress'}</Text>
            </View>
            {latest ? (
              <TouchableOpacity style={[styles.viewStatus, { backgroundColor: '#000000' }]} onPress={() => router.push(`/complaint/${latest.id}`)} activeOpacity={0.8}>
                <Text style={[styles.viewStatusText, { color: '#ffffff' }]}>View Status</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.viewStatus, { backgroundColor: '#000000' }]} onPress={() => router.push('/(citizen)/report' as any)} activeOpacity={0.8}>
                <Text style={[styles.viewStatusText, { color: '#ffffff' }]}>Post Now</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.locationLine}>
            <Ionicons name="location" size={20} color="#473a16" />
            <Text style={[styles.locationText, { color: '#473a16', opacity: 0.88 }]} numberOfLines={2}>{latest?.address ?? 'Your locality, India'}</Text>
            {latest && <StatusBadge status={latest.status} size="sm" />}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Explore Swachhata</Text>
        <View style={styles.actionGrid}>
          {ACTIONS.map((item) => <ActionTile key={item.title} item={item} onPress={() => showAction(item)} />)}
        </View>

          <View style={[styles.missionBanner, { backgroundColor: '#473a16' }]}>
          <Ionicons name="leaf-outline" size={22} color="#ebbf00" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.missionTitle, { color: '#fff8ea' }]}>Together for a cleaner India</Text>
            <Text style={[styles.missionBody, { color: '#f4e3ae' }]}>Every complaint helps make your neighbourhood better.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingBottom: 13 },
  headerTop: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  topProfile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_700Bold' },
  portalTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  brand: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 2 },
  citizenLabel: { color: '#B9E3C5', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  bell: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  notificationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CE2AF', position: 'absolute', top: 8, right: 9 },
  statsGrid: { flexDirection: 'row', gap: 8, marginTop: 20 },
  statCard: { flex: 1, borderRadius: 12, padding: 9, alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
  statIcon: { width: 29, height: 29, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.65)' },
  content: { padding: 16, gap: 16 },
  welcomeCard: { borderRadius: 17, borderWidth: 1, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  welcomeAvatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  welcomeAvatarText: { fontSize: 25, fontFamily: 'Inter_700Bold' },
  welcomeTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', lineHeight: 23, textAlign: 'center' },
  welcomeBody: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  statusCard: { borderRadius: 15, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  statusCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', lineHeight: 21 },
  statusId: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  viewStatus: { borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9 },
  viewStatusText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  statusDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.27)', marginVertical: 12 },
  locationLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  locationText: { color: 'rgba(255,255,255,0.86)', fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 17 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginTop: 2 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionTile: { width: '47.8%', minHeight: 143, borderRadius: 16, padding: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.11, shadowRadius: 7, elevation: 3 },
  tileGlow: { width: 130, height: 130, borderRadius: 65, position: 'absolute', right: -45, bottom: -44, opacity: 0.6 },
  tileTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', lineHeight: 21, marginTop: 11 },
  tileBody: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 15, marginTop: 7, maxWidth: 130 },
  missionBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14 },
  missionTitle: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  missionBody: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3, lineHeight: 15 },
});