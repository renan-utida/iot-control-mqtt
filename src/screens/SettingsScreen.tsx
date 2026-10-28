import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { ReactNode } from 'react';

import { AppButton } from '../components/AppButton';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { DEFAULT_BROKER_URL, TOPICS } from '../config/mqttConfig';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../themes/ThemeContext';
import { withAlpha } from '../utils/color';

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

function SectionCard({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: colors.cardShadow },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.chip, { backgroundColor: withAlpha(colors.accent, 0.12) }]}>
          <Icon name={icon} size={18} color={colors.accent} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      </View>

      {children}
    </View>
  );
}

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
    <SectionCard icon="sliders" title="Broker MQTT">
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
        selectionColor={colors.accent}
        value={url}
        onChangeText={handleChange}
        onSubmitEditing={() => onSave(url)}
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.surfaceAlt, borderColor: colors.border },
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
    </SectionCard>
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

      <SectionCard icon={isDark ? 'moon' : 'sun'} title="Aparência">
        <View style={styles.themeRow}>
          <View style={styles.themeText}>
            <Text style={[styles.themeTitle, { color: colors.text }]}>Tema escuro</Text>
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
            {...webSwitchProps}
          />
        </View>
      </SectionCard>

      <SectionCard icon="list" title="Tópicos MQTT">
        {TOPIC_LIST.map((item) => {
          const isPublish = item.direction === 'Publicação';
          const color = isPublish ? colors.accent : colors.success;

          return (
            <View key={item.topic} style={[styles.topic, { backgroundColor: colors.surfaceAlt }]}>
              <View style={styles.topicHeader}>
                <Text
                  style={[
                    styles.topicDirection,
                    { color, backgroundColor: withAlpha(color, 0.14) },
                  ]}
                >
                  {item.direction}
                </Text>
                <Text style={[styles.topicExample, { color: colors.muted }]}>{item.example}</Text>
              </View>
              <Text style={[styles.topicName, { color: colors.textSecondary }]}>{item.topic}</Text>
            </View>
          );
        })}
      </SectionCard>
    </ScrollView>
  );
}

const monospace = Platform.select({ ios: 'Menlo', default: 'monospace' });

// No React Native Web a bolinha "ligada" usa activeThumbColor (propriedade só da web).
const webSwitchProps = Platform.OS === 'web' ? { activeThumbColor: '#FFFFFF' } : {};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 14,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  hint: {
    fontSize: 13,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
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
  themeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  topic: {
    gap: 6,
    padding: 12,
    borderRadius: 12,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicDirection: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  topicName: {
    fontSize: 12,
    fontFamily: monospace,
  },
  topicExample: {
    fontSize: 11,
    fontFamily: monospace,
  },
});
