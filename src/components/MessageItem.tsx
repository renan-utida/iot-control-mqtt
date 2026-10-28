import { Platform, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import type { MqttMessage } from '../types/mqtt';
import { withAlpha } from '../utils/color';
import { formatTime } from '../utils/format';

interface MessageItemProps {
  message: MqttMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const { colors } = useTheme();

  const isSent = message.direction === 'sent';
  const directionColor = isSent ? colors.accent : colors.success;
  const directionLabel = isSent ? '↑ Enviada' : '↓ Recebida';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: colors.cardShadow },
      ]}
    >
      <View style={[styles.stripe, { backgroundColor: directionColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.direction,
              {
                color: directionColor,
                backgroundColor: withAlpha(directionColor, 0.12),
                borderColor: withAlpha(directionColor, 0.4),
              },
            ]}
          >
            {directionLabel}
          </Text>
          <Text style={[styles.time, { color: colors.muted }]}>{formatTime(message.timestamp)}</Text>
        </View>

        <Text style={[styles.topic, { color: colors.textSecondary }]}>{message.topic}</Text>

        <View style={[styles.payloadBox, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.payload, { color: colors.text }]}>{message.payload}</Text>
        </View>
      </View>
    </View>
  );
}

const monospace = Platform.select({ ios: 'Menlo', default: 'monospace' });

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stripe: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  direction: {
    fontSize: 12,
    fontWeight: '800',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
  },
  topic: {
    fontSize: 12,
    fontFamily: monospace,
  },
  payloadBox: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  payload: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: monospace,
  },
});
