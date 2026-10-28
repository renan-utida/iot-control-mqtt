import Svg, { Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface LumenLogoProps {
  size?: number;
}

// Marca da Lumen: lâmpada com raios de luz sobre um selo âmbar.
export function LumenLogo({ size = 40 }: LumenLogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityRole="image"
      accessibilityLabel="Logo da Lumen"
    >
      <Defs>
        <LinearGradient id="lumenBadge" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FDE68A" />
          <Stop offset="1" stopColor="#F59E0B" />
        </LinearGradient>
      </Defs>

      <Rect width="64" height="64" rx="18" fill="url(#lumenBadge)" />

      <G
        stroke="#1F1500"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Line x1="32" y1="5" x2="32" y2="9" />
        <Line x1="12" y1="12" x2="15" y2="15" />
        <Line x1="52" y1="12" x2="49" y2="15" />
      </G>

      <G
        transform="translate(14 15) scale(1.5)"
        stroke="#1F1500"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <Path d="M9 18h6" />
        <Path d="M10 22h4" />
      </G>
    </Svg>
  );
}
