import { HISTORY_LIMIT, TOPICS } from '../config/mqttConfig';
import type { LampState, MqttMessage, TimedValue } from '../types/mqtt';
import { parseHumidity, parseLampState, parseTemperature } from './messageParser';

// Última mensagem recebida que foi descartada por não passar na validação.
export interface InvalidMessage {
  topic: string;
  payload: string;
  reason: string;
  timestamp: number;
}

export interface TelemetryState {
  temperature: TimedValue<number> | null;
  humidity: TimedValue<number> | null;
  lampState: TimedValue<LampState> | null;
  history: MqttMessage[];
  invalidMessage: InvalidMessage | null;
}

export const initialTelemetry: TelemetryState = {
  temperature: null,
  humidity: null,
  lampState: null,
  history: [],
  invalidMessage: null,
};

function accept(state: TelemetryState, history: MqttMessage[], topic: string): TelemetryState {
  const invalidMessage = state.invalidMessage?.topic === topic ? null : state.invalidMessage;

  return { ...state, history, invalidMessage };
}

function reject(
  state: TelemetryState,
  history: MqttMessage[],
  message: MqttMessage,
  reason: string,
): TelemetryState {
  const invalidMessage: InvalidMessage = {
    topic: message.topic,
    payload: message.payload,
    reason,
    timestamp: message.timestamp,
  };

  return { ...state, history, invalidMessage };
}

// Aplica uma mensagem (recebida ou enviada) ao estado. O histórico guarda as
// HISTORY_LIMIT mais recentes; sensores e lâmpada só mudam com mensagens recebidas válidas.
export function applyMessage(state: TelemetryState, message: MqttMessage): TelemetryState {
  const history = [message, ...state.history].slice(0, HISTORY_LIMIT);

  if (message.direction !== 'received') {
    return { ...state, history };
  }

  switch (message.topic) {
    case TOPICS.temperatura: {
      const result = parseTemperature(message.payload);

      if (!result.ok) return reject(state, history, message, result.reason);

      return {
        ...accept(state, history, message.topic),
        temperature: { value: result.value, updatedAt: message.timestamp },
      };
    }

    case TOPICS.umidade: {
      const result = parseHumidity(message.payload);

      if (!result.ok) return reject(state, history, message, result.reason);

      return {
        ...accept(state, history, message.topic),
        humidity: { value: result.value, updatedAt: message.timestamp },
      };
    }

    case TOPICS.estado: {
      const result = parseLampState(message.payload);

      if (!result.ok) return reject(state, history, message, result.reason);

      return {
        ...accept(state, history, message.topic),
        lampState: { value: result.value, updatedAt: message.timestamp },
      };
    }

    default:
      return { ...state, history };
  }
}
