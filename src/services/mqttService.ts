import mqtt from 'mqtt';
import type { MqttClient } from 'mqtt';

import { SUBSCRIBE_TOPICS } from '../config/mqttConfig';
import type { ConnectionStatus, MessageDirection, MqttMessage } from '../types/mqtt';

export type Unsubscribe = () => void;
export type StatusListener = (status: ConnectionStatus, detail: string | null) => void;
export type MessageListener = (message: MqttMessage) => void;

const CONNECT_TIMEOUT_MS = 15000;
const RECONNECT_PERIOD_MS = 5000;
const PUBLISH_TIMEOUT_MS = 5000;
const SUBSCRIBE_REFUSED_QOS = 128;

// Retorna a mensagem de erro (ou null quando a URL é aceita).
export function validateBrokerUrl(url: string): string | null {
  const value = url.trim();

  if (!/^wss?:\/\/[^\s/?#]+(\/\S*)?$/i.test(value)) {
    return 'URL inválida. Use ws://host:porta/caminho ou wss://host:porta/caminho.';
  }

  if (/:(1883|8883)(\/|$)/.test(value)) {
    return 'As portas 1883 e 8883 são MQTT TCP. Use a porta WebSocket do broker (ex.: wss://broker.hivemq.com:8884/mqtt).';
  }

  return null;
}

function describeError(error: Error): string {
  if (error.message === 'connack timeout') {
    return 'Tempo esgotado ao conectar ao broker.';
  }

  return `Erro de conexão: ${error.message}`;
}

function ignoreError(): void {
  // Evita exceção não tratada se um cliente já descartado ainda emitir "error".
}

class MqttService {
  private client: MqttClient | null = null;
  private detachHandlers: (() => void) | null = null;
  private status: ConnectionStatus = 'disconnected';
  private detail: string | null = null;
  private messageCounter = 0;
  private readonly statusListeners = new Set<StatusListener>();
  private readonly messageListeners = new Set<MessageListener>();

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getDetail(): string | null {
    return this.detail;
  }

  isConnected(): boolean {
    return this.status === 'connected' && this.client?.connected === true;
  }

  onStatusChange(listener: StatusListener): Unsubscribe {
    this.statusListeners.add(listener);

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  onMessage(listener: MessageListener): Unsubscribe {
    this.messageListeners.add(listener);

    return () => {
      this.messageListeners.delete(listener);
    };
  }

  // Também é a ação de "reconectar": descarta o cliente atual e abre um novo.
  connect(url: string): void {
    const brokerUrl = url.trim();
    const validationError = validateBrokerUrl(brokerUrl);

    this.teardown();

    if (validationError) {
      this.setStatus('error', validationError);
      return;
    }

    this.setStatus('connecting', null);

    try {
      this.open(brokerUrl);
    } catch (error) {
      this.fail(error instanceof Error ? describeError(error) : 'Falha ao iniciar a conexão.');
    }
  }

  disconnect(): void {
    this.teardown();
    this.setStatus('disconnected', null);
  }

  publish(topic: string, payload: string): Promise<void> {
    const client = this.client;

    if (!client || !client.connected) {
      return Promise.reject(new Error('Sem conexão com o broker. Conecte antes de enviar comandos.'));
    }

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('O broker não confirmou o envio do comando.'));
      }, PUBLISH_TIMEOUT_MS);

      client.publish(topic, payload, { qos: 1 }, (error) => {
        clearTimeout(timer);

        if (error) {
          reject(error);
          return;
        }

        this.emitMessage(topic, payload, 'sent');
        resolve();
      });
    });
  }

  private open(url: string): void {
    const client = mqtt.connect(url, {
      clientId: `iotcontrol_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      keepalive: 60,
      connectTimeout: CONNECT_TIMEOUT_MS,
      reconnectPeriod: RECONNECT_PERIOD_MS,
      // A inscrição é refeita a cada "connect"; evita assinar duas vezes.
      resubscribe: false,
      forceNativeWebSocket: true,
    });

    // Falhas de WebSocket sem código chegam só como "close" (nunca como "error").
    let hasConnected = false;

    const onConnect = (): void => {
      hasConnected = true;
      this.setStatus('connected', null);

      client.subscribe(SUBSCRIBE_TOPICS, { qos: 1 }, (error, grants) => {
        // Conexão já caiu: o erro vem do pedido interrompido e a inscrição é refeita ao reconectar.
        if (this.client !== client || !client.connected) return;

        const refused = grants?.some((grant) => grant.qos === SUBSCRIBE_REFUSED_QOS) ?? true;

        if (error || refused) {
          this.setStatus('error', 'Não foi possível assinar os tópicos no broker.');
        }
      });
    };

    const onMessage = (topic: string, payload: { toString(): string }): void => {
      this.emitMessage(topic, payload.toString(), 'received');
    };

    const onReconnect = (): void => {
      this.setStatus('connecting', 'Reconectando ao broker...');
    };

    const onClose = (): void => {
      if (!hasConnected) {
        this.fail('Não foi possível conectar ao broker. Verifique a URL e a internet.');
        return;
      }

      if (this.status !== 'error') {
        this.setStatus('disconnected', 'Conexão perdida. Tentando reconectar...');
      }
    };

    const onError = (error: Error): void => {
      if (!hasConnected) {
        this.fail(describeError(error));
        return;
      }

      this.setStatus('error', describeError(error));
    };

    client.on('connect', onConnect);
    client.on('message', onMessage);
    client.on('reconnect', onReconnect);
    client.on('close', onClose);
    client.on('error', onError);

    this.client = client;
    this.detachHandlers = () => {
      client.off('connect', onConnect);
      client.off('message', onMessage);
      client.off('reconnect', onReconnect);
      client.off('close', onClose);
      client.off('error', onError);
      client.on('error', ignoreError);
    };
  }

  // Falha antes de conectar: para de tentar sozinho e deixa a ação "Reconectar" para o usuário.
  private fail(detail: string): void {
    this.teardown();
    this.setStatus('error', detail);
  }

  private teardown(): void {
    const client = this.client;

    this.detachHandlers?.();
    this.detachHandlers = null;
    this.client = null;

    if (!client) return;

    if (client.connected) {
      client.unsubscribe(SUBSCRIBE_TOPICS);
      client.end();
    } else {
      client.end(true);
    }
  }

  private setStatus(status: ConnectionStatus, detail: string | null): void {
    if (this.status === status && this.detail === detail) return;

    this.status = status;
    this.detail = detail;

    this.statusListeners.forEach((listener) => {
      try {
        listener(status, detail);
      } catch (error) {
        console.warn('Erro em listener de status MQTT', error);
      }
    });
  }

  private emitMessage(topic: string, payload: string, direction: MessageDirection): void {
    this.messageCounter += 1;

    const message: MqttMessage = {
      id: `${Date.now()}-${this.messageCounter}`,
      topic,
      payload,
      direction,
      timestamp: Date.now(),
    };

    this.messageListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.warn('Erro em listener de mensagem MQTT', error);
      }
    });
  }
}

export const mqttService = new MqttService();
