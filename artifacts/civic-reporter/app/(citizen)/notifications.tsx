import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Complaint, ComplaintStatus, useComplaints } from '@/context/ComplaintsContext';
import { useColors } from '@/hooks/useColors';

type NotificationItem = {
  id: string;
  complaintId: string;
  event: 'submitted' | 'updated';
  title: string;
  message: string;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const STATUS_MESSAGES: Record<ComplaintStatus, string> = {
  pending: 'is waiting for review',
  in_progress: 'is being handled by the civic team',
  resolved: 'has been marked resolved',
  rejected: 'needs your attention',
};

const STATUS_ICONS: Record<ComplaintStatus, keyof typeof Ionicons.glyphMap> = {
  pending: 'time-outline',
  in_progress: 'sync-outline',
  resolved: 'checkmark-circle-outline',
  rejected: 'alert-circle-outline',
};

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  pending: '#B7791F',
  in_progress: '#2563EB',
  resolved: '#15803D',
  rejected: '#DC2626',
};

function buildNotifications(complaints: Complaint[]): NotificationItem[] {
  const items: NotificationItem[] = [];

  for (const complaint of complaints) {
    items.push({
      id: `${complaint.id}-submitted`,
      complaintId: complaint.id,
      event: 'submitted',
      title: 'Complaint received',
      message: `Your complaint “${complaint.title}” was submitted successfully.`,
      date: complaint.createdAt,
      icon: 'checkmark-circle-outline',
      color: '#15803D',
    });

    const createdAt = Date.parse(complaint.createdAt);
    const updatedAt = Date.parse(complaint.updatedAt);
    if (Number.isFinite(createdAt) && Number.isFinite(updatedAt) && updatedAt - createdAt > 1000) {
      items.push({
        id: `${complaint.id}-updated`,
        complaintId: complaint.id,
        event: 'updated',
        title: `Complaint ${STATUS_LABELS[complaint.status].toLowerCase()}`,
        message: `Your complaint “${complaint.title}” ${STATUS_MESSAGES[complaint.status]}.${complaint.adminNote ? ` ${complaint.adminNote}` : ''}`,
        date: complaint.updatedAt,
        icon: STATUS_ICONS[complaint.status],
        color: STATUS_COLORS[complaint.status],
      });
    }
  }

  return items.sort((a, b) => {
    const aTime = Date.parse(a.date);
    const bTime = Date.parse(b.date);
    return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 98 : insets.bottom + 82;
  const mine = complaints.filter((complaint) => complaint.userId === user?.id);
  const notifications = buildNotifications(mine);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#0D2914', '#1A4A27']} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            testID="notifications-back"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={21} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>Updates about your complaints</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent activity</Text>
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.notificationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/complaint/${item.complaintId}`)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.message}`}
                testID={`notification-${item.id}`}
                activeOpacity={0.8}
              >
                <View style={[styles.notificationIcon, { backgroundColor: `${item.color}18` }]}>
                  <Ionicons name={item.icon} size={21} color={item.color} />
                </View>
                <View style={styles.notificationCopy}>
                  <View style={styles.notificationTopLine}>
                    <Text style={[styles.notificationTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={17} color={colors.mutedForeground} />
                  </View>
                  <Text style={[styles.notificationMessage, { color: colors.mutedForeground }]}>{item.message}</Text>
                  <Text style={[styles.notificationDate, { color: colors.mutedForeground }]}>{formatDate(item.date)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="notifications-off-outline" size={30} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No notifications yet</Text>
            <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>
              Updates about complaints you submit will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 23, fontFamily: 'Inter_700Bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 3 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCopy: { flex: 1 },
  notificationTopLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  notificationTitle: { flex: 1, fontSize: 14, fontFamily: 'Inter_700Bold' },
  notificationMessage: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular', marginTop: 5 },
  notificationDate: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 9 },
  emptyState: { alignItems: 'center', paddingVertical: 86, paddingHorizontal: 24, gap: 8 },
  emptyIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  emptyMessage: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, textAlign: 'center', maxWidth: 290 },
});
