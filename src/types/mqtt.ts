export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export type LampState = 'ON' | 'OFF';
export type LampAction = LampState;

export type MessageDirection = 'sent' | 'received';

// Mensagem exibida no histórico (publicada pelo app ou recebida do broker).
export interface MqttMessage {
  id: string;
  topic: string;
  payload: string;
  direction: MessageDirection;
  timestamp: number;
}

// Último valor conhecido junto com o horário em que foi atualizado.
export interface TimedValue<T> {
  value: T;
  updatedAt: number;
}

// Formato dos payloads JSON trocados no broker.
export interface SensorPayload {
  value: number;
}

export interface LampStatePayload {
  state: LampState;
}

export interface LampCommandPayload {
  action: LampAction;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; reason: string };
