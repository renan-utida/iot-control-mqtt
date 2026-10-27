import { Platform, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import type { MqttMessage } from '../types/mqtt';
import { formatTime } from '../utils/format';

interface MessageItemProps {
  message: MqttMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const { colors } = useTheme();

  const isSent = message.direction === 'sent';
  const directionColor = isSent ? colors.primary : colors.success;
  const directionLabel = isSent ? '↑ Enviada' : '↓ Recebida';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.direction, { color: directionColor, borderColor: directionColor }]}>
          {directionLabel}
        </Text>
        <Text style={[styles.time, { color: colors.muted }]}>{formatTime(message.timestamp)}</Text>
      </View>

      <Text style={[styles.topic, { color: colors.textSecondary }]}>{message.topic}</Text>
      <Text style={[styles.payload, { color: colors.text }]}>{message.payload}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  direction: {
    fontSize: 12,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  time: {
    fontSize: 12,
  },
  topic: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  payload: {
    fontSize: 15,
    fontWeight: '600',
  },
});
