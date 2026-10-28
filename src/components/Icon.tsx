import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'dashboard'
  | 'list'
  | 'sliders'
  | 'thermometer'
  | 'droplet'
  | 'bulb'
  | 'sun'
  | 'moon'
  | 'inbox'
  | 'alert'
  | 'arrow-right';

interface IconProps {
  name: IconName;
  color: string;
  size?: number;
  strokeWidth?: number;
}

// Ícones de traço em uma grade 24x24; a cor segue o tema.
function glyph(name: IconName) {
  switch (name) {
    case 'dashboard':
      return (
        <>
          <Rect x="3" y="3" width="7" height="9" rx="1.5" />
          <Rect x="14" y="3" width="7" height="5" rx="1.5" />
          <Rect x="14" y="12" width="7" height="9" rx="1.5" />
          <Rect x="3" y="16" width="7" height="5" rx="1.5" />
        </>
      );
    case 'list':
      return (
        <>
          <Line x1="9" y1="6" x2="20" y2="6" />
          <Line x1="9" y1="12" x2="20" y2="12" />
          <Line x1="9" y1="18" x2="20" y2="18" />
          <Circle cx="4.5" cy="6" r="0.6" />
          <Circle cx="4.5" cy="12" r="0.6" />
          <Circle cx="4.5" cy="18" r="0.6" />
        </>
      );
    case 'sliders':
      return (
        <>
          <Line x1="21" y1="4" x2="14" y2="4" />
          <Line x1="10" y1="4" x2="3" y2="4" />
          <Line x1="21" y1="12" x2="12" y2="12" />
          <Line x1="8" y1="12" x2="3" y2="12" />
          <Line x1="21" y1="20" x2="16" y2="20" />
          <Line x1="12" y1="20" x2="3" y2="20" />
          <Line x1="14" y1="2" x2="14" y2="6" />
          <Line x1="8" y1="10" x2="8" y2="14" />
          <Line x1="16" y1="18" x2="16" y2="22" />
        </>
      );
    case 'thermometer':
      return <Path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />;
    case 'droplet':
      return (
        <Path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
      );
    case 'bulb':
      return (
        <>
          <Path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <Path d="M9 18h6" />
          <Path d="M10 22h4" />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx="12" cy="12" r="4" />
          <Path d="M12 2v2" />
          <Path d="M12 20v2" />
          <Path d="m4.93 4.93 1.41 1.41" />
          <Path d="m17.66 17.66 1.41 1.41" />
          <Path d="M2 12h2" />
          <Path d="M20 12h2" />
          <Path d="m6.34 17.66-1.41 1.41" />
          <Path d="m19.07 4.93-1.41 1.41" />
        </>
      );
    case 'moon':
      return <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />;
    case 'inbox':
      return (
        <>
          <Path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <Path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </>
      );
    case 'alert':
      return (
        <>
          <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <Line x1="12" y1="9" x2="12" y2="13" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      );
    case 'arrow-right':
      return (
        <>
          <Path d="M5 12h14" />
          <Path d="m12 5 7 7-7 7" />
        </>
      );
  }
}

export function Icon({ name, color, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyph(name)}
      </G>
    </Svg>
  );
}
