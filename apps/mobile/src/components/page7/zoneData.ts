import { Dimensions } from 'react-native';
import { getResponsiveValue } from '@/constants/theme';
import { Zone, ZoneCoord, ZoneFollowUpData } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CONTAINER_WIDTH = SCREEN_WIDTH * 0.98;
export const CONTAINER_HEIGHT = SCREEN_HEIGHT * 0.70;

export const BOX_WIDTH = getResponsiveValue(106, 120, 134, 144);
export const BOX_HEIGHT = getResponsiveValue(40, 44, 48, 52);

export const ZONES: Zone[] = [
  // 1. Forehead - perfectly centered between eyebrows and hairline
  {
    id: 'forehead',
    name: 'Forehead',
    dotX: 0.50,
    dotY: 0.32,
    boxX: 0.04,
    boxY: 0.08,
    align: 'left',
    connectionType: 'bottom-center-elbow',
  },
  // 2. Temple - top right, shifted inward
  {
    id: 'temple',
    name: 'Temples',
    dotX: 0.62,
    dotY: 0.360,
    boxX: 0.61,
    boxY: 0.22,
    align: 'right',
    connectionType: 'bottom-center-elbow',
  },
  // 3. Nose - moved upwards onto the bridge, line strictly horizontal
  {
    id: 'nose',
    name: 'Nose',
    dotX: 0.50,
    dotY: 0.385,
    boxX: 0.04,
    boxY: 0.365,
    align: 'left',
    connectionType: 'straight',
  },
  // 4. Under-eye - shifted slightly left and up
  {
    id: 'under_eye',
    name: 'Under-eye',
    dotX: 0.54,
    dotY: 0.395,
    boxX: 0.40,
    boxY: 0.05,
    align: 'right',
    connectionType: 'bottom-center-straight',
  },
  // 5. Jawline - positioned exactly at the jaw curve edge
  {
    id: 'jawline',
    name: 'Jawline',
    dotX: 0.435,
    dotY: 0.465,
    boxX: 0.04,
    boxY: 0.65,
    align: 'left',
    connectionType: 'top-center-elbow',
  },
  // 6. Cheeks - dot moved up onto the cheek apple, box vertically centered
  {
    id: 'cheeks',
    name: 'Cheeks',
    dotX: 0.58,
    dotY: 0.428,
    boxX: 0.61,
    boxY: 0.50,
    align: 'right',
    connectionType: 'top-center-elbow',
  },
  // 7. Chin - bottom right, moved upwards onto chin curve
  {
    id: 'chin',
    name: 'Chin',
    dotX: 0.50,
    dotY: 0.485,
    boxX: 0.60,
    boxY: 0.72,
    align: 'right',
    connectionType: 'vertical-then-horizontal',
  },
];

export const ZONE_COORDS: ZoneCoord[] = ZONES.map((zone) => {
  let dotPixelX = zone.dotX * CONTAINER_WIDTH;
  let dotPixelY = zone.dotY * CONTAINER_HEIGHT;

  if (zone.connectionType === 'bottom-center-elbow') {
    const boxPixelX = zone.boxX * CONTAINER_WIDTH + BOX_WIDTH / 2;
    const boxPixelY = zone.boxY * CONTAINER_HEIGHT + BOX_HEIGHT;
    const pathData = `M ${dotPixelX} ${dotPixelY} L ${boxPixelX} ${dotPixelY} L ${boxPixelX} ${boxPixelY}`;

    return {
      ...zone,
      dotPixelX,
      dotPixelY,
      boxPixelX,
      boxPixelY,
      pathData,
    };
  }

  if (zone.connectionType === 'top-center-elbow') {
    const boxPixelX = zone.boxX * CONTAINER_WIDTH + BOX_WIDTH / 2;
    const boxPixelY = zone.boxY * CONTAINER_HEIGHT;
    const pathData = `M ${dotPixelX} ${dotPixelY} L ${boxPixelX} ${dotPixelY} L ${boxPixelX} ${boxPixelY}`;

    return {
      ...zone,
      dotPixelX,
      dotPixelY,
      boxPixelX,
      boxPixelY,
      pathData,
    };
  }

  if (zone.connectionType === 'vertical-then-horizontal') {
    const boxPixelX = zone.align === 'left'
      ? zone.boxX * CONTAINER_WIDTH + BOX_WIDTH
      : zone.boxX * CONTAINER_WIDTH;
    const boxPixelY = zone.boxY * CONTAINER_HEIGHT + BOX_HEIGHT / 2;
    const pathData = `M ${dotPixelX} ${dotPixelY} L ${dotPixelX} ${boxPixelY} L ${boxPixelX} ${boxPixelY}`;

    return {
      ...zone,
      dotPixelX,
      dotPixelY,
      boxPixelX,
      boxPixelY,
      pathData,
    };
  }

  if (zone.connectionType === 'bottom-center-straight') {
    const boxPixelX = zone.boxX * CONTAINER_WIDTH + BOX_WIDTH / 2;
    const boxPixelY = zone.boxY * CONTAINER_HEIGHT + BOX_HEIGHT;
    dotPixelX = boxPixelX;
    const pathData = `M ${dotPixelX} ${dotPixelY} L ${boxPixelX} ${boxPixelY}`;

    return {
      ...zone,
      dotPixelX,
      dotPixelY,
      boxPixelX,
      boxPixelY,
      pathData,
    };
  }

  if (zone.connectionType === 'straight') {
    const boxPixelX = zone.align === 'left'
      ? zone.boxX * CONTAINER_WIDTH + BOX_WIDTH
      : zone.boxX * CONTAINER_WIDTH;
    const boxPixelY = zone.boxY * CONTAINER_HEIGHT + BOX_HEIGHT / 2;
    if (zone.id === 'nose') {
      dotPixelY = boxPixelY;
    }
    const pathData = `M ${dotPixelX} ${dotPixelY} L ${boxPixelX} ${boxPixelY}`;

    return {
      ...zone,
      dotPixelX,
      dotPixelY,
      boxPixelX,
      boxPixelY,
      pathData,
    };
  }

  const boxPixelX = zone.align === 'left' 
    ? zone.boxX * CONTAINER_WIDTH + BOX_WIDTH 
    : zone.boxX * CONTAINER_WIDTH;
  const boxPixelY = zone.boxY * CONTAINER_HEIGHT + BOX_HEIGHT / 2;

  const elbowPixelX = zone.elbowX !== undefined 
    ? zone.elbowX * CONTAINER_WIDTH 
    : (zone.align === 'left' ? dotPixelX - 50 : dotPixelX + 50);
  const elbowPixelY = dotPixelY;

  const pathData = `M ${dotPixelX} ${dotPixelY} L ${elbowPixelX} ${elbowPixelY} L ${boxPixelX} ${boxPixelY}`;

  return {
    ...zone,
    dotPixelX,
    dotPixelY,
    boxPixelX,
    boxPixelY,
    pathData,
  };
});

export const ZONE_FOLLOW_UP: Record<string, ZoneFollowUpData> = {
  under_eye: {
    title: 'Under-eye',
    subtitle: 'What are you noticing under your eyes?',
    options: [
      'Puffy eyes',
      'Under-eye bags',
      'Hollow eyes',
      'Dark circles',
      'Purple/blue veins',
      'Under-eye redness',
      'Other',
    ],
  },
  forehead: {
    title: 'Forehead',
    subtitle: 'What issues are you seeing on your forehead?',
    options: [
      'Horizontal forehead lines',
      'Active breakouts / pimples',
      'Excess oil & shine',
      'Hyperpigmentation spots',
      'Flaky dry patches',
      'Uneven skin tone',
      'Other',
    ],
  },
  nose: {
    title: 'Nose',
    subtitle: 'What’s bothering your nose area the most?',
    options: [
      'Stubborn blackheads',
      'Enlarged visible pores',
      'Excess oiliness / shine',
      'Redness around nostrils',
      'Flakiness & peeling',
      'Acne on nose / bridge',
      'Other',
    ],
  },
  cheeks: {
    title: 'Cheeks',
    subtitle: 'What are you experiencing on your cheeks?',
    options: [
      'Redness & flushing',
      'Acne breakouts',
      'Dark spots / Melasma',
      'Acne scars & marks',
      'Enlarged visible pores',
      'Dry, rough patches',
      'Other',
    ],
  },
  jawline: {
    title: 'Jawline',
    subtitle: 'What are you noticing along your jawline?',
    options: [
      'Hormonal cystic acne',
      'Blemishes & pimples',
      'Loss of firmness',
      'Post-acne dark marks',
      'Dryness / Flaking',
      'Uneven skin tone',
      'Other',
    ],
  },
  temple: {
    title: 'Temples',
    subtitle: 'What’s happening around your temples?',
    options: [
      'Tension & furrow lines',
      'Sun spots & marks',
      'Visible temple veins',
      'Dryness & tightness',
      'Skin redness',
      'Hollow / Sunken look',
      'Other',
    ],
  },
  chin: {
    title: 'Chin',
    subtitle: 'What are you experiencing on your chin?',
    options: [
      'Persistent acne breakouts',
      'Whiteheads & clogged pores',
      'Redness & irritation',
      'Post-inflammatory marks',
      'Flaking & peeling',
      'Excess oiliness',
      'Other',
    ],
  },
};
