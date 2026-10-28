// Converte uma cor "#RRGGBB" em "rgba(r, g, b, alpha)" para fundos translúcidos e brilhos.
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
