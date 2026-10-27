function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

// Horário local no formato HH:MM:SS.
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Uma casa decimal no máximo, com vírgula (24,5 | 58).
export function formatNumber(value: number): string {
  return (Math.round(value * 10) / 10).toString().replace('.', ',');
}
