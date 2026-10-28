import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import type { MqttMessage } from '../types/mqtt';
import { withAlpha } from '../utils/color';
import { formatTime } from '../utils/format';
import { Icon } from './Icon';

interface RecentActivityProps {
  messages: MqttMessage[];
  limit?: number;
  onOpenHistory?: () => void;
}

// Mostra só o final do tópico (ex.: "lampada/estado") para caber na linha.
function shortTopic(topic: string): string {
  return topic.split('/').slice(-2).join('/');
}

export function RecentActivity({ messages, limit = 3, onOpenHistory }: RecentActivityProps) {
  const { colors } = useTheme();
  const recent = messages.slice(0, limit);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: colors.cardShadow },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>Atividade recente</Text>

        {onOpenHistory ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Abrir o histórico completo"
            onPress={onOpenHistory}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: colors.accent }]}>Ver histórico</Text>
            <Icon name="arrow-right" size={14} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>

      {recent.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="inbox" size={26} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma mensagem ainda. As leituras do dispositivo aparecem aqui.
          </Text>
        </View>
      ) : (
        recent.map((message) => {
          const isSent = message.direction === 'sent';
          const color = isSent ? colors.accent : colors.success;

          return (
            <View key={message.id} style={[styles.row, { borderTopColor: colors.border }]}>
              <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.14) }]}>
                <Text style={[styles.badgeText, { color }]}>{isSent ? '↑' : '↓'}</Text>
              </View>

              <View style={styles.rowText}>
                <Text style={[styles.topic, { color: colors.textSecondary }]} numberOfLines={1}>
                  {shortTopic(message.topic)}
                </Text>
                <Text style={[styles.payload, { color: colors.text }]} numberOfLines={1}>
                  {message.payload}
                </Text>
              </View>

              <Text style={[styles.time, { color: colors.muted }]}>{formatTime(message.timestamp)}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const monospace = Platform.select({ ios: 'Menlo', default: 'monospace' });

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 3,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  topic: {
    fontSize: 11,
    fontFamily: monospace,
  },
  payload: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: monospace,
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
