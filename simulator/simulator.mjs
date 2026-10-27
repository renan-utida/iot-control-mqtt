#!/usr/bin/env node
// Simulador do dispositivo IoT do app IoT Control (não precisa de hardware).
//
//  - publica temperatura, umidade e o estado da lâmpada periodicamente;
//  - escuta os comandos da lâmpada e publica o novo estado;
//  - aceita comandos digitados no terminal (veja "help").
//
// Uso: npm run simulate -- [--url wss://host:porta/caminho] [--interval 5] [--topic-base fiap/3espw/rm558540]

import readline from 'node:readline';

import mqtt from 'mqtt';

const DEFAULT_URL = 'wss://broker.hivemq.com:8884/mqtt';
// Mantenha igual ao GROUP_TOPIC de src/config/mqttConfig.ts.
const DEFAULT_TOPIC_BASE = 'fiap/3espw/rm558540';
const DEFAULT_INTERVAL_SECONDS = 5;

const HELP = `
Uso: npm run simulate -- [opções]

Opções:
  --url <url>          URL WebSocket do broker (padrão: ${DEFAULT_URL})
  --interval <s>       segundos entre as leituras dos sensores (padrão: ${DEFAULT_INTERVAL_SECONDS})
  --topic-base <base>  prefixo dos tópicos (padrão: ${DEFAULT_TOPIC_BASE})
  -h, --help           mostra esta ajuda

Também é possível usar as variáveis BROKER_URL, TOPIC_BASE e SENSOR_INTERVAL.

Comandos no terminal enquanto o simulador roda:
  t <valor>   publica uma temperatura (ex.: t 31.5)
  u <valor>   publica uma umidade (ex.: u 70)
  on | off    liga/desliga a lâmpada como se fosse o interruptor físico
  status      mostra os valores atuais
  help        mostra esta lista
  q           encerra o simulador
`;

function fail(message) {
  console.error(`Erro: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    url: process.env.BROKER_URL ?? DEFAULT_URL,
    topicBase: process.env.TOPIC_BASE ?? DEFAULT_TOPIC_BASE,
    intervalSeconds: Number(process.env.SENSOR_INTERVAL ?? DEFAULT_INTERVAL_SECONDS),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      console.log(HELP);
      process.exit(0);
    } else if (arg === '--url') {
      options.url = argv[(i += 1)];
    } else if (arg === '--topic-base') {
      options.topicBase = argv[(i += 1)];
    } else if (arg === '--interval') {
      options.intervalSeconds = Number(argv[(i += 1)]);
    } else {
      fail(`opção desconhecida "${arg}". Use --help para ver as opções.`);
    }
  }

  if (!options.url || !/^wss?:\/\//i.test(options.url)) {
    fail('a URL deve começar com ws:// ou wss://.');
  }

  if (/:(1883|8883)(\/|$)/.test(options.url)) {
    fail(
      'as portas 1883 e 8883 são MQTT TCP. Use a porta WebSocket do broker ' +
        '(ex.: wss://broker.hivemq.com:8884/mqtt).',
    );
  }

  if (!options.topicBase || /\s/.test(options.topicBase)) {
    fail('o prefixo dos tópicos não pode ser vazio nem conter espaços.');
  }

  if (!Number.isFinite(options.intervalSeconds) || options.intervalSeconds <= 0) {
    fail('o intervalo (--interval) deve ser um número maior que zero.');
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));

const TOPICS = {
  temperatura: `${options.topicBase}/sensor/temperatura`,
  umidade: `${options.topicBase}/sensor/umidade`,
  comando: `${options.topicBase}/lampada/comando`,
  estado: `${options.topicBase}/lampada/estado`,
};

// Estado do dispositivo simulado.
let temperature = 24;
let humidity = 55;
let lampState = 'OFF';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function timestamp() {
  return new Date().toLocaleTimeString('pt-BR', { hour12: false });
}

function log(symbol, message) {
  console.log(`[${timestamp()}] ${symbol} ${message}`);
}

// Aceita {"action":"ON"} e também o valor puro (ON), como o app.
function parseAction(raw) {
  const text = raw.trim();
  let value = text;

  try {
    const data = JSON.parse(text);

    value = data !== null && typeof data === 'object' && !Array.isArray(data) ? data.action : data;
  } catch {
    // não é JSON: usa o texto puro
  }

  if (typeof value !== 'string') return null;

  const action = value.trim().toUpperCase();

  return action === 'ON' || action === 'OFF' ? action : null;
}

const client = mqtt.connect(options.url, {
  clientId: `iotcontrol_simulator_${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  keepalive: 60,
  connectTimeout: 15000,
  reconnectPeriod: 5000,
  // A inscrição é refeita a cada "connect".
  resubscribe: false,
});

function publish(topic, payload, label) {
  if (!client.connected) {
    log('!', `sem conexão, não foi possível publicar em ${label}`);
    return;
  }

  client.publish(topic, payload, { qos: 1 }, (error) => {
    if (error) {
      log('!', `falha ao publicar em ${label}: ${error.message}`);
      return;
    }

    log('↑', `${label.padEnd(11)} ${payload}`);
  });
}

function publishTemperature(value = temperature) {
  temperature = value;
  publish(TOPICS.temperatura, JSON.stringify({ value: temperature }), 'temperatura');
}

function publishHumidity(value = humidity) {
  humidity = value;
  publish(TOPICS.umidade, JSON.stringify({ value: humidity }), 'umidade');
}

function publishLampState() {
  publish(TOPICS.estado, JSON.stringify({ state: lampState }), 'estado');
}

function publishReadings() {
  // Variação suave, para a tela mostrar valores "vivos".
  publishTemperature(clamp(Math.round((temperature + (Math.random() - 0.5)) * 10) / 10, 18, 32));
  publishHumidity(clamp(Math.round(humidity + (Math.random() - 0.5) * 4), 35, 80));
}

let reportTimer = null;

// A cada ciclo envia as leituras e também o estado da lâmpada, como um dispositivo real faria.
// Assim o app mostra o estado mesmo que seja aberto depois do simulador.
function startTimers() {
  stopTimers();
  reportTimer = setInterval(() => {
    publishReadings();
    publishLampState();
  }, options.intervalSeconds * 1000);
}

function stopTimers() {
  clearInterval(reportTimer);
  reportTimer = null;
}

client.on('connect', () => {
  log('✓', `conectado em ${options.url}`);
  console.log(`    base dos tópicos: ${options.topicBase}`);

  client.subscribe(TOPICS.comando, { qos: 1 }, (error) => {
    if (error) {
      log('!', `não foi possível assinar ${TOPICS.comando}: ${error.message}`);
      return;
    }

    log('✓', `aguardando comandos em ${TOPICS.comando}`);
  });

  // Publica logo ao conectar para o app já ter o que mostrar.
  publishReadings();
  publishLampState();
  startTimers();
});

client.on('message', (topic, payload) => {
  if (topic !== TOPICS.comando) return;

  const raw = payload.toString();

  log('↓', `comando     ${raw}`);

  const action = parseAction(raw);

  if (!action) {
    log('!', 'comando inválido ignorado (esperado {"action":"ON"} ou {"action":"OFF"})');
    return;
  }

  lampState = action;
  publishLampState();
});

client.on('reconnect', () => log('…', 'reconectando ao broker'));
client.on('offline', () => log('!', 'sem conexão com o broker'));
client.on('error', (error) => log('!', `erro: ${error.message}`));

// ----- comandos digitados no terminal -----
function handleTerminalCommand(line) {
  const [command, argument] = line.trim().split(/\s+/);

  switch ((command ?? '').toLowerCase()) {
    case '':
      break;
    case 't': {
      const value = Number(argument);

      if (!Number.isFinite(value)) return log('!', 'uso: t <valor>   (ex.: t 31.5)');
      publishTemperature(value);
      break;
    }
    case 'u': {
      const value = Number(argument);

      if (!Number.isFinite(value)) return log('!', 'uso: u <valor>   (ex.: u 70)');
      publishHumidity(value);
      break;
    }
    case 'on':
    case 'off':
      lampState = command.toUpperCase();
      publishLampState();
      break;
    case 'status':
      console.log(`    temperatura=${temperature} umidade=${humidity} lâmpada=${lampState}`);
      break;
    case 'help':
      console.log(HELP);
      break;
    case 'q':
    case 'quit':
    case 'exit':
      shutdown();
      break;
    default:
      log('!', `comando desconhecido "${command}". Digite help.`);
  }
}

const terminal = readline.createInterface({ input: process.stdin });

terminal.on('line', handleTerminalCommand);

function shutdown() {
  stopTimers();
  terminal.close();
  log('•', 'encerrando o simulador');
  client.end(false, () => process.exit(0));
  // Garante a saída mesmo se o broker não responder.
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Simulador IoT Control — digite "help" para ver os comandos, "q" ou Ctrl+C para sair.');
