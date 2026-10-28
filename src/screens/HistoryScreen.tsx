import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../components/Icon';
import { MessageItem } from '../components/MessageItem';
import { HISTORY_LIMIT } from '../config/mqttConfig';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../themes/ThemeContext';
import { withAlpha } from '../utils/color';

function Separator() {
  return <View style={styles.separator} />;
}

export function HistoryScreen() {
  const { colors } = useTheme();
  const { history, status } = useMqtt();

  const emptyText =
    status === 'connected'
      ? 'Conectado. Aguardando mensagens do dispositivo...'
      : 'Nenhuma mensagem ainda. Conecte-se ao broker para receber as leituras.';

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      data={history}
      keyExtractor={(message) => message.id}
      renderItem={({ item }) => <MessageItem message={item} />}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={
        <View style={styles.summary}>
          <View style={styles.summaryText}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Últimas {HISTORY_LIMIT} mensagens</Text>
            <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>
              da mais recente para a mais antiga
            </Text>
          </View>

          <View style={[styles.counter, { backgroundColor: withAlpha(colors.accent, 0.12) }]}>
            <Text style={[styles.counterText, { color: colors.accent }]}>
              {history.length}/{HISTORY_LIMIT}
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View
          style={[
            styles.empty,
            { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: colors.cardShadow },
          ]}
        >
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Icon name="inbox" size={34} color={colors.muted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sem mensagens por enquanto</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyText}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  summarySubtitle: {
    fontSize: 13,
  },
  counter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '800',
  },
  separator: {
    height: 10,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    minHeight: 320,
    borderRadius: 24,
    borderWidth: 1,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
