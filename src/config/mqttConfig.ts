// Identificador exclusivo do grupo (turma 3ESPW + RM), para não interferir
// com outros projetos que usam o mesmo broker público.
export const GROUP_TOPIC = 'fiap/3espw/rm558540';

export const TOPICS = {
  temperatura: `${GROUP_TOPIC}/sensor/temperatura`,
  umidade: `${GROUP_TOPIC}/sensor/umidade`,
  comando: `${GROUP_TOPIC}/lampada/comando`,
  estado: `${GROUP_TOPIC}/lampada/estado`,
} as const;

// Tópicos em que o app se inscreve (o comando é apenas publicado).
export const SUBSCRIBE_TOPICS: string[] = [TOPICS.temperatura, TOPICS.umidade, TOPICS.estado];

// Broker público da HiveMQ via WebSocket seguro (porta 8884, não é a porta MQTT TCP 1883).
export const DEFAULT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

export const HISTORY_LIMIT = 10;
