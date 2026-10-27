import { StyleSheet, Text, View } from 'react-native';

import type { CommandStatus } from '../context/MqttContext';
import { useTheme } from '../themes/ThemeContext';
import type { LampAction, LampState, TimedValue } from '../types/mqtt';
import { formatTime } from '../utils/format';
import { AppButton } from './AppButton';

interface LampCardProps {
  lamp: TimedValue<LampState> | null;
  commandStatus: CommandStatus;
  sendingAction: LampAction | null;
  errorMessage?: string | null;
  onCommand: (action: LampAction) => void;
}

const COMMAND_MESSAGES: Record<CommandStatus, string | null> = {
  idle: null,
  sending: 'Enviando comando...',
  waiting: 'Comando enviado. Aguardando a confirmação do dispositivo...',
  timeout: 'O dispositivo não confirmou o comando. Verifique se o simulador está em execução.',
};

export function LampCard({
  lamp,
  commandStatus,
  sendingAction,
  errorMessage,
  onCommand,
}: LampCardProps) {
  const { colors } = useTheme();

  const isOn = lamp?.value === 'ON';
  const stateText = lamp ? (isOn ? 'Ligada' : 'Desligada') : 'Aguardando estado do dispositivo...';
  const updatedText = lamp ? `Atualizado às ${formatTime(lamp.updatedAt)}` : null;
  const commandMessage = COMMAND_MESSAGES[commandStatus];
  const isSending = sendingAction !== null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View
        accessible
        accessibilityLabel={`Lâmpada: ${stateText}`}
        style={styles.header}
      >
        <View style={[styles.bulb, { backgroundColor: isOn ? colors.lampOn : colors.lampOff }]}>
          <Text style={styles.bulbIcon}>💡</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.textSecondary }]}>Lâmpada</Text>
          <Text style={[styles.state, { color: colors.text }]}>{stateText}</Text>
          {updatedText ? <Text style={[styles.updatedAt, { color: colors.muted }]}>{updatedText}</Text> : null}
        </View>
      </View>

      {commandMessage ? (
        <Text style={[styles.message, { color: commandStatus === 'timeout' ? colors.warning : colors.textSecondary }]}>
          {commandMessage}
        </Text>
      ) : null}

      {errorMessage ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          title="Ligar"
          style={styles.action}
          loading={sendingAction === 'ON'}
          disabled={isSending}
          onPress={() => onCommand('ON')}
        />
        <AppButton
          title="Desligar"
          variant="secondary"
          style={styles.action}
          loading={sendingAction === 'OFF'}
          disabled={isSending}
          onPress={() => onCommand('OFF')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bulb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulbIcon: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  state: {
    fontSize: 22,
    fontWeight: '700',
  },
  updatedAt: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
  },
});
