import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ComplaintStatus } from '@/context/ComplaintsContext';

interface Props {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: '#FEF3C7', text: '#92400E' },
  in_progress: { label: 'In Progress', bg: '#DBEAFE', text: '#1E40AF' },
  resolved: { label: 'Resolved', bg: '#DCFCE7', text: '#166534' },
  rejected: { label: 'Rejected', bg: '#FEE2E2', text: '#991B1B' },
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const config = STATUS_CONFIG[status];
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.small]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }, isSmall && styles.smallText]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  smallText: {
    fontSize: 11,
  },
});
