import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { BrandSplash } from '../components/BrandSplash';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { Icon } from '../components/Icon';
import { LampCard } from '../components/LampCard';
import { RecentActivity } from '../components/RecentActivity';
import { SensorCard } from '../components/SensorCard';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../themes/ThemeContext';
import type { LampAction } from '../types/mqtt';
import { withAlpha } from '../utils/color';
import { formatTime } from '../utils/format';

interface DashboardScreenProps {
  onOpenHistory?: () => void;
}

export function DashboardScreen({ onOpenHistory }: DashboardScreenProps) {
  const { colors } = useTheme();
  const {
    isReady,
    brokerUrl,
    status,
    statusDetail,
    temperature,
    humidity,
    lampState,
    history,
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
    return <BrandSplash message="Carregando preferências..." />;
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
        <SensorCard
          icon="thermometer"
          title="Temperatura"
          unit="°C"
          reading={temperature}
          color={colors.temperature}
          min={10}
          max={40}
        />
        <SensorCard
          icon="droplet"
          title="Umidade"
          unit="%"
          reading={humidity}
          color={colors.humidity}
          min={0}
          max={100}
        />
      </View>

      <LampCard
        lamp={lampState}
        commandStatus={commandStatus}
        sendingAction={sendingAction}
        errorMessage={commandError}
        onCommand={handleCommand}
      />

      {invalidMessage ? (
        <View style={[styles.notice, { backgroundColor: withAlpha(colors.warning, 0.12) }]}>
          <Icon name="alert" size={20} color={colors.warning} />
          <View style={styles.noticeText}>
            <Text style={[styles.noticeTitle, { color: colors.warning }]}>Mensagem inválida ignorada</Text>
            <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>
              {invalidMessage.reason} ({formatTime(invalidMessage.timestamp)})
            </Text>
          </View>
        </View>
      ) : null}

      <RecentActivity messages={history} onOpenHistory={onOpenHistory} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  noticeText: {
    flex: 1,
    gap: 2,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  noticeBody: {
    fontSize: 13,
  },
});
