import type { LampAction, LampCommandPayload, LampState, ParseResult } from '../types/mqtt';

export const TEMPERATURE_RANGE = { min: -50, max: 100 } as const;
export const HUMIDITY_RANGE = { min: 0, max: 100 } as const;

// Lê o campo esperado de um payload JSON (ex.: {"value":24.5}). Também aceita o
// valor "puro" (24.5 ou ON), útil para testes manuais em outros clientes MQTT.
function extractField(raw: string, field: string): unknown {
  const text = raw.trim();
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    return text;
  }

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return (data as Record<string, unknown>)[field];
  }

  return data;
}

function parseSensorValue(
  raw: string,
  range: { min: number; max: number },
  label: string,
): ParseResult<number> {
  const value = extractField(raw, 'value');

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { ok: false, reason: `${label} inválida: esperado {"value": número}` };
  }

  if (value < range.min || value > range.max) {
    return { ok: false, reason: `${label} fora do intervalo (${range.min} a ${range.max})` };
  }

  return { ok: true, value };
}

export function parseTemperature(raw: string): ParseResult<number> {
  return parseSensorValue(raw, TEMPERATURE_RANGE, 'Temperatura');
}

export function parseHumidity(raw: string): ParseResult<number> {
  return parseSensorValue(raw, HUMIDITY_RANGE, 'Umidade');
}

export function parseLampState(raw: string): ParseResult<LampState> {
  const value = extractField(raw, 'state');

  if (typeof value === 'string') {
    const state = value.trim().toUpperCase();

    if (state === 'ON' || state === 'OFF') {
      return { ok: true, value: state };
    }
  }

  return { ok: false, reason: 'Estado da lâmpada inválido: esperado {"state": "ON" | "OFF"}' };
}

export function buildLampCommand(action: LampAction): string {
  const payload: LampCommandPayload = { action };

  return JSON.stringify(payload);
}
