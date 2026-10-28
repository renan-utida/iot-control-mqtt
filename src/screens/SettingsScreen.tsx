import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { DEFAULT_BROKER_URL, TOPICS } from '../config/mqttConfig';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../themes/ThemeContext';

interface Feedback {
  kind: 'error' | 'success';
  text: string;
}

interface BrokerFormProps {
  initialUrl: string;
  feedback: Feedback | null;
  onSave: (url: string) => void;
  onEdit: () => void;
}

const TOPIC_LIST = [
  { topic: TOPICS.temperatura, direction: 'Assinatura', example: '{"value":24.5}' },
  { topic: TOPICS.umidade, direction: 'Assinatura', example: '{"value":58}' },
  { topic: TOPICS.estado, direction: 'Assinatura', example: '{"state":"ON"}' },
  { topic: TOPICS.comando, direction: 'Publicação', example: '{"action":"ON"}' },
];

function BrokerForm({ initialUrl, feedback, onSave, onEdit }: BrokerFormProps) {
  const { colors } = useTheme();
  const [url, setUrl] = useState(initialUrl);

  const handleChange = (value: string) => {
    setUrl(value);
    onEdit();
  };

  const handleRestoreDefault = () => {
    setUrl(DEFAULT_BROKER_URL);
    onEdit();
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Broker MQTT</Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Use o endereço WebSocket do broker (ws:// ou wss://), não a porta MQTT TCP 1883.
      </Text>

      <TextInput
        accessibilityLabel="URL WebSocket do broker MQTT"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="url"
        returnKeyType="done"
        placeholder={DEFAULT_BROKER_URL}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        value={url}
        onChangeText={handleChange}
        onSubmitEditing={() => onSave(url)}
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
        ]}
      />

      {feedback ? (
        <Text
          accessibilityRole="alert"
          style={[styles.feedback, { color: feedback.kind === 'error' ? colors.danger : colors.success }]}
        >
          {feedback.text}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <AppButton title="Salvar e conectar" style={styles.action} onPress={() => onSave(url)} />
        <AppButton
          title="Padrão"
          variant="secondary"
          style={styles.actionSmall}
          onPress={handleRestoreDefault}
        />
      </View>
    </View>
  );
}

export function SettingsScreen() {
  const { colors, isDark, toggleMode } = useTheme();
  const { brokerUrl, status, statusDetail, connect, disconnect, applyBrokerUrl } = useMqtt();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const isActive = status === 'connected' || status === 'connecting';

  const handleSave = useCallback(
    (url: string) => {
      const error = applyBrokerUrl(url);

      setFeedback(
        error
          ? { kind: 'error', text: error }
          : { kind: 'success', text: 'URL salva no aparelho.' },
      );
    },
    [applyBrokerUrl],
  );

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <ConnectionStatus status={status} detail={statusDetail} brokerUrl={brokerUrl} />

      <AppButton
        title={isActive ? 'Desconectar' : status === 'error' ? 'Tentar novamente' : 'Conectar'}
        variant={isActive ? 'danger' : 'primary'}
        onPress={isActive ? disconnect : connect}
      />

      {/* A chave recria o formulário quando a URL salva muda, sem precisar de efeito para sincronizar. */}
      <BrokerForm
        key={brokerUrl}
        initialUrl={brokerUrl}
        feedback={feedback}
        onSave={handleSave}
        onEdit={clearFeedback}
      />

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.themeRow}>
          <View style={styles.themeText}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Tema escuro</Text>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Tema atual: {isDark ? 'Escuro' : 'Claro'}. A escolha fica salva no aparelho.
            </Text>
          </View>

          <Switch
            accessibilityLabel="Alternar tema escuro"
            value={isDark}
            onValueChange={toggleMode}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Tópicos MQTT</Text>

        {TOPIC_LIST.map((item) => (
          <View key={item.topic} style={styles.topic}>
            <Text style={[styles.topicDirection, { color: colors.primary }]}>{item.direction}</Text>
            <Text style={[styles.topicName, { color: colors.textSecondary }]}>{item.topic}</Text>
            <Text style={[styles.topicExample, { color: colors.muted }]}>{item.example}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const monospace = Platform.select({ ios: 'Menlo', default: 'monospace' });

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  feedback: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
  },
  actionSmall: {
    paddingHorizontal: 20,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeText: {
    flex: 1,
    gap: 4,
  },
  topic: {
    gap: 2,
    paddingTop: 6,
  },
  topicDirection: {
    fontSize: 12,
    fontWeight: '700',
  },
  topicName: {
    fontSize: 12,
    fontFamily: monospace,
  },
  topicExample: {
    fontSize: 12,
    fontFamily: monospace,
  },
});
