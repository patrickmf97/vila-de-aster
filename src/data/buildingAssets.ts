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
    assetUrl: new URL(
      '../assets/buildings/tavern.svg',
      import.meta.url,
    ).href,
    width: 420,
    height: 300,
    offsetY: 18,
    glow: [
      { x: -88, y: -78, radius: 30, color: 0xf1b85b },
      { x: 88, y: -78, radius: 30, color: 0xf1b85b },
      { x: 0, y: -77, radius: 38, color: 0xffa33d },
    ],
  },
  smith: {
    key: 'building-smith',
    assetUrl: new URL(
      '../assets/buildings/smith.svg',
      import.meta.url,
    ).href,
    width: 420,
    height: 300,
    offsetY: 17,
    glow: [
      { x: 0, y: -58, radius: 52, color: 0xff7a24 },
      { x: -103, y: -86, radius: 20, color: 0xf0a13f },
      { x: 103, y: -86, radius: 20, color: 0xf0a13f },
    ],
  },
  shop: {
    key: 'building-shop',
    assetUrl: new URL(
      '../assets/buildings/shop.svg',
      import.meta.url,
    ).href,
    width: 430,
    height: 300,
    offsetY: 18,
    glow: [
      { x: -84, y: -64, radius: 26, color: 0xf2bd61 },
      { x: 84, y: -64, radius: 26, color: 0xf2bd61 },
    ],
  },
  home: {
    key: 'building-elena',
    assetUrl: new URL(
      '../assets/buildings/elena.svg',
      import.meta.url,
    ).href,
    width: 430,
    height: 270,
    offsetY: 16,
    glow: [
      { x: -71, y: -60, radius: 24, color: 0xf3c66f },
      { x: 71, y: -60, radius: 24, color: 0xf3c66f },
    ],
  },
  'fisher-home': {
    key: 'building-theo',
    assetUrl: new URL(
      '../assets/buildings/theo.svg',
      import.meta.url,
    ).href,
    width: 450,
    height: 275,
    offsetX: 18,
    offsetY: 20,
    glow: [
      { x: -88, y: -58, radius: 23, color: 0xf2c86c },
      { x: 47, y: -58, radius: 23, color: 0xf2c86c },
    ],
  },
};

export function isLandmarkBuildingId(
  value: string,
): value is LandmarkBuildingId {
  return value in BUILDING_VISUALS;
}
