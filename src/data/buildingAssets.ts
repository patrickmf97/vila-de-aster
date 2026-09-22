import { BUILDING_IMAGE_ASSETS } from './productionAssets';

export type LandmarkBuildingId =
  | 'inn'
  | 'smith'
  | 'shop'
  | 'home'
  | 'fisher-home';

export interface BuildingVisualConfig {
  key: string;
  assetUrl: string;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  glow?: {
    x: number;
    y: number;
    radius: number;
    color: number;
  }[];
}

export const BUILDING_VISUALS: Record<
  LandmarkBuildingId,
  BuildingVisualConfig
> = {
  inn: {
    key: 'building-tavern',
    assetUrl: BUILDING_IMAGE_ASSETS.inn,
    width: 420,
    height: 342,
    offsetY: 20,
    glow: [
      { x: -88, y: -74, radius: 28, color: 0xf1b85b },
      { x: 82, y: -74, radius: 28, color: 0xf1b85b },
    ],
  },
  smith: {
    key: 'building-smith',
    assetUrl: BUILDING_IMAGE_ASSETS.smith,
    width: 405,
    height: 358,
    offsetY: 18,
    glow: [
      { x: 0, y: -70, radius: 48, color: 0xff7a24 },
    ],
  },
  shop: {
    key: 'building-shop',
    assetUrl: BUILDING_IMAGE_ASSETS.shop,
    width: 420,
    height: 350,
    offsetY: 18,
    glow: [
      { x: -75, y: -72, radius: 26, color: 0xf2bd61 },
      { x: 72, y: -72, radius: 26, color: 0xf2bd61 },
    ],
  },
  home: {
    key: 'building-elena',
    assetUrl: BUILDING_IMAGE_ASSETS.home,
    width: 455,
    height: 275,
    offsetY: 14,
    glow: [
      { x: -66, y: -58, radius: 22, color: 0xf3c66f },
      { x: 66, y: -58, radius: 22, color: 0xf3c66f },
    ],
  },
  'fisher-home': {
    key: 'building-theo',
    assetUrl: BUILDING_IMAGE_ASSETS['fisher-home'],
    width: 485,
    height: 285,
    offsetX: 20,
    offsetY: 18,
    glow: [
      { x: -72, y: -62, radius: 22, color: 0xf2c86c },
      { x: 44, y: -62, radius: 22, color: 0xf2c86c },
    ],
  },
};

export function isLandmarkBuildingId(
  value: string,
): value is LandmarkBuildingId {
  return value in BUILDING_VISUALS;
}
