import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { LampCard } from '../components/LampCard';
import { SensorCard } from '../components/SensorCard';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../themes/ThemeContext';
import type { LampAction } from '../types/mqtt';
import { formatTime } from '../utils/format';

export function DashboardScreen() {
  const { colors } = useTheme();
  const {
    isReady,
    brokerUrl,
    status,
    statusDetail,
    temperature,
    humidity,
    lampState,
    commandStatus,
    commandError,
    invalidMessage,
    connect,
    sendLampCommand,
  } = useMqtt();

  const [sendingAction, setSendingAction] = useState<LampAction | null>(null);

  const handleCommand = useCallback(
    async (action: LampAction) => {
      setSendingAction(action);

      const result = await sendLampCommand(action);

      setSendingAction(null);

      // Sem conexão (ou falha no envio) nunca é silencioso: o usuário é avisado.
      // O Alert não existe na web; lá o aviso fica no texto do próprio cartão.
      if (!result.ok && Platform.OS !== 'web') {
        Alert.alert('Não foi possível enviar o comando', result.error);
      }
    },
    [sendLampCommand],
  );

  if (!isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando preferências...</Text>
      </View>
    );
  }

  const canConnect = status === 'disconnected' || status === 'error';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <ConnectionStatus status={status} detail={statusDetail} brokerUrl={brokerUrl} />

      {canConnect ? (
        <AppButton title={status === 'error' ? 'Tentar novamente' : 'Conectar'} onPress={connect} />
      ) : null}

      <View style={styles.row}>
        <SensorCard icon="🌡️" title="Temperatura" unit="°C" reading={temperature} />
        <SensorCard icon="💧" title="Umidade" unit="%" reading={humidity} />
      </View>

      <LampCard
        lamp={lampState}
        commandStatus={commandStatus}
        sendingAction={sendingAction}
        errorMessage={commandError}
        onCommand={handleCommand}
      />

      {invalidMessage ? (
        <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.warning }]}>
          <Text style={[styles.noticeTitle, { color: colors.warning }]}>Mensagem inválida ignorada</Text>
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            {invalidMessage.reason} ({formatTime(invalidMessage.timestamp)})
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  notice: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  noticeText: {
    fontSize: 13,
  },
});
