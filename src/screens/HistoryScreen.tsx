import { FlatList, StyleSheet, Text, View } from 'react-native';

import { MessageItem } from '../components/MessageItem';
import { HISTORY_LIMIT } from '../config/mqttConfig';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../themes/ThemeContext';

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
        <Text style={[styles.summary, { color: colors.textSecondary }]}>
          Últimas {HISTORY_LIMIT} mensagens, da mais recente para a mais antiga ({history.length}/
          {HISTORY_LIMIT})
        </Text>
      }
      ListEmptyComponent={
        <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyText}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  summary: {
    fontSize: 13,
    marginBottom: 12,
  },
  separator: {
    height: 10,
  },
  empty: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
