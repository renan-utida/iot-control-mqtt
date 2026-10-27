import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { DEFAULT_BROKER_URL, TOPICS } from '../config/mqttConfig';
import { buildLampCommand, parseLampState } from '../services/messageParser';
import { mqttService, validateBrokerUrl } from '../services/mqttService';
import { loadBrokerUrl, saveBrokerUrl } from '../services/storageService';
import { applyMessage, initialTelemetry } from '../services/telemetry';
import type { InvalidMessage } from '../services/telemetry';
import type {
  ConnectionStatus,
  LampAction,
  LampState,
  MqttMessage,
  TimedValue,
} from '../types/mqtt';

const CONFIRMATION_TIMEOUT_MS = 8000;

// idle: nenhum comando em andamento | sending: publicando no broker |
// waiting: publicado, aguardando o estado enviado pelo dispositivo | timeout: dispositivo não confirmou.
export type CommandStatus = 'idle' | 'sending' | 'waiting' | 'timeout';

export type CommandResult = { ok: true } | { ok: false; error: string };

interface MqttContextValue {
  brokerUrl: string;
  isReady: boolean;
  status: ConnectionStatus;
  statusDetail: string | null;
  temperature: TimedValue<number> | null;
  humidity: TimedValue<number> | null;
  lampState: TimedValue<LampState> | null;
  history: MqttMessage[];
  invalidMessage: InvalidMessage | null;
  commandStatus: CommandStatus;
  connect: () => void;
  disconnect: () => void;
  applyBrokerUrl: (url: string) => string | null;
  sendLampCommand: (action: LampAction) => Promise<CommandResult>;
}

const MqttContext = createContext<MqttContextValue | null>(null);

export function MqttProvider({ children }: { children: ReactNode }) {
  const [brokerUrl, setBrokerUrl] = useState(DEFAULT_BROKER_URL);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>(mqttService.getStatus());
  const [statusDetail, setStatusDetail] = useState<string | null>(mqttService.getDetail());
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [commandStatus, setCommandStatus] = useState<CommandStatus>('idle');

  const confirmationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConfirmationAt = useRef(0);
  const isSending = useRef(false);

  const clearConfirmationTimer = useCallback(() => {
    if (confirmationTimer.current) {
      clearTimeout(confirmationTimer.current);
      confirmationTimer.current = null;
    }
  }, []);

  // Assina o serviço MQTT uma única vez e cancela tudo ao desmontar (sem listeners duplicados).
  useEffect(() => {
    const unsubscribeStatus = mqttService.onStatusChange((nextStatus, detail) => {
      setStatus(nextStatus);
      setStatusDetail(detail);

      if (nextStatus !== 'connected') {
        clearConfirmationTimer();
        setCommandStatus('idle');
      }
    });

    const unsubscribeMessages = mqttService.onMessage((message) => {
      setTelemetry((previous) => applyMessage(previous, message));

      const isLampState =
        message.direction === 'received' &&
        message.topic === TOPICS.estado &&
        parseLampState(message.payload).ok;

      if (isLampState) {
        lastConfirmationAt.current = message.timestamp;
        clearConfirmationTimer();
        setCommandStatus('idle');
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
      clearConfirmationTimer();
      mqttService.disconnect();
    };
  }, [clearConfirmationTimer]);

  // Recupera a URL salva e conecta automaticamente ao abrir o app.
  useEffect(() => {
    let active = true;

    loadBrokerUrl().then((saved) => {
      if (!active) return;

      const url = saved ?? DEFAULT_BROKER_URL;

      setBrokerUrl(url);
      setIsReady(true);
      mqttService.connect(url);
    });

    return () => {
      active = false;
    };
  }, []);

  const connect = useCallback(() => {
    mqttService.connect(brokerUrl);
  }, [brokerUrl]);

  const disconnect = useCallback(() => {
    mqttService.disconnect();
  }, []);

  // Valida, salva e conecta. Retorna a mensagem de erro quando a URL é inválida.
  const applyBrokerUrl = useCallback((url: string): string | null => {
    const error = validateBrokerUrl(url);

    if (error) return error;

    const cleanUrl = url.trim();

    setBrokerUrl(cleanUrl);
    void saveBrokerUrl(cleanUrl);
    mqttService.connect(cleanUrl);

    return null;
  }, []);

  // A lâmpada só muda na tela quando o dispositivo publica o novo estado (não ao tocar no botão).
  const sendLampCommand = useCallback(
    async (action: LampAction): Promise<CommandResult> => {
      if (isSending.current) {
        return { ok: false, error: 'Aguarde o envio do comando anterior.' };
      }

      isSending.current = true;

      const startedAt = Date.now();

      clearConfirmationTimer();
      setCommandStatus('sending');

      try {
        await mqttService.publish(TOPICS.comando, buildLampCommand(action));
      } catch (error) {
        setCommandStatus('idle');

        return {
          ok: false,
          error: error instanceof Error ? error.message : 'Falha ao enviar o comando.',
        };
      } finally {
        isSending.current = false;
      }

      // O estado pode chegar antes da confirmação do envio; nesse caso já está confirmado.
      if (lastConfirmationAt.current >= startedAt) {
        setCommandStatus('idle');
        return { ok: true };
      }

      setCommandStatus('waiting');
      confirmationTimer.current = setTimeout(() => {
        confirmationTimer.current = null;
        setCommandStatus('timeout');
      }, CONFIRMATION_TIMEOUT_MS);

      return { ok: true };
    },
    [clearConfirmationTimer],
  );

  const value = useMemo<MqttContextValue>(
    () => ({
      brokerUrl,
      isReady,
      status,
      statusDetail,
      temperature: telemetry.temperature,
      humidity: telemetry.humidity,
      lampState: telemetry.lampState,
      history: telemetry.history,
      invalidMessage: telemetry.invalidMessage,
      commandStatus,
      connect,
      disconnect,
      applyBrokerUrl,
      sendLampCommand,
    }),
    [
      brokerUrl,
      isReady,
      status,
      statusDetail,
      telemetry,
      commandStatus,
      connect,
      disconnect,
      applyBrokerUrl,
      sendLampCommand,
    ],
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}

export function useMqtt(): MqttContextValue {
  const context = useContext(MqttContext);

  if (!context) {
    throw new Error('useMqtt deve ser usado dentro de um MqttProvider');
  }

  return context;
}
