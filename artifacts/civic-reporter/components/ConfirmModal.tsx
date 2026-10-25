import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  icon,
  destructive = false,
  busy = false,
  onCancel,
  onConfirm,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: insets.bottom }]}>
          <View style={[styles.iconWrap, { backgroundColor: destructive ? colors.destructive + '15' : colors.secondary }]}>
            <Ionicons name={icon} size={25} color={destructive ? colors.destructive : colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={onCancel} disabled={busy} activeOpacity={0.8}>
              <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: destructive ? colors.destructive : colors.primary }]}
              onPress={onConfirm}
              disabled={busy}
              activeOpacity={0.85}
              testID="confirm-modal-confirm"
            >
              <Text style={[styles.confirmText, { color: destructive ? colors.destructiveForeground : colors.primaryForeground }]}>{busy ? 'Please wait…' : confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 20, 0.48)', justifyContent: 'center', padding: 20 },
  card: { borderRadius: 22, borderWidth: 1, padding: 22, alignItems: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' },
  iconWrap: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 19, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  message: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', width: '100%', gap: 10, marginTop: 22 },
  cancelButton: { flex: 1, borderWidth: 1.5, borderRadius: 13, paddingVertical: 13, alignItems: 'center' },
  cancelText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  confirmButton: { flex: 1, borderRadius: 13, paddingVertical: 13, alignItems: 'center' },
  confirmText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});