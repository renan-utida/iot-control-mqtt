import { StyleSheet, Text, View } from 'react-native';

import type { CommandStatus } from '../context/MqttContext';
import { useTheme } from '../themes/ThemeContext';
import type { LampAction, LampState, TimedValue } from '../types/mqtt';
import { withAlpha } from '../utils/color';
import { formatTime } from '../utils/format';
import { AppButton } from './AppButton';
import { Icon } from './Icon';

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

  const bulbColor = isOn ? colors.lampOn : colors.surfaceAlt;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: colors.cardShadow },
      ]}
    >
      <Text style={[styles.title, { color: colors.textSecondary }]}>Lâmpada</Text>

      <View accessible accessibilityLabel={`Lâmpada: ${stateText}`} style={styles.hero}>
        <View style={[styles.halo, { backgroundColor: withAlpha(colors.lampOn, isOn ? 0.18 : 0.06) }]}>
          <View
            style={[
              styles.bulb,
              { backgroundColor: bulbColor },
              isOn ? { boxShadow: `0px 0px 40px 8px ${withAlpha(colors.lampOn, 0.55)}` } : null,
            ]}
          >
            <Icon name="bulb" size={32} strokeWidth={1.8} color={isOn ? colors.onPrimary : colors.muted} />
          </View>
        </View>

        <Text style={[styles.state, { color: colors.text }]}>{stateText}</Text>
        {updatedText ? <Text style={[styles.updatedAt, { color: colors.muted }]}>{updatedText}</Text> : null}
      </View>

      {commandMessage ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: withAlpha(commandStatus === 'timeout' ? colors.warning : colors.textSecondary, 0.12),
            },
          ]}
        >
          {commandStatus === 'timeout' ? <Icon name="alert" size={18} color={colors.warning} /> : null}
          <Text
            style={[
              styles.bannerText,
              { color: commandStatus === 'timeout' ? colors.warning : colors.textSecondary },
            ]}
          >
            {commandMessage}
          </Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={[styles.banner, { backgroundColor: withAlpha(colors.danger, 0.1) }]}>
          <Icon name="alert" size={18} color={colors.danger} />
          <Text accessibilityRole="alert" style={[styles.bannerText, styles.errorText, { color: colors.danger }]}>
            {errorMessage}
          </Text>
        </View>
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
    flexGrow: 1,
    padding: 14,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  hero: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  halo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bulb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  state: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  updatedAt: {
    fontSize: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
  },
  errorText: {
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
