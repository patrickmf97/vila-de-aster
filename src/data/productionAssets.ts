import { TAVERN, SMITH } from '../assets/production/buildingAssetsA';
import { SHOP, ELENA_HOUSE } from '../assets/production/buildingAssetsB';
import { THEO_HOUSE } from '../assets/production/buildingAssetsC';

import { PATRICK, ELENA } from '../assets/production/characterAssetsA';
import { BRAM, MIRA } from '../assets/production/characterAssetsB';
import { THEO, LUMA } from '../assets/production/characterAssetsC';

import {
  GRASS,
  STONE,
  WATER,
  FOUNTAIN,
  BRIDGE,
} from '../assets/production/environmentAssetsA';

import {
  FENCE,
  LAMP,
  TREE_GREEN,
  TREE_PINK,
  TREE_GOLD,
  BUSH,
  MARKET,
} from '../assets/production/environmentAssetsB';

export const ENVIRONMENT_ASSETS = {
  grass: GRASS,
  stone: STONE,
  water: WATER,
} as const;

export const PROP_ASSETS = {
  fountain: FOUNTAIN,
  bridge: BRIDGE,
  fence: FENCE,
  lamp: LAMP,
  treeGreen: TREE_GREEN,
  treePink: TREE_PINK,
  treeGold: TREE_GOLD,
  bush: BUSH,
  market: MARKET,
} as const;

export const BUILDING_IMAGE_ASSETS = {
  inn: TAVERN,
  smith: SMITH,
  shop: SHOP,
  home: ELENA_HOUSE,
  'fisher-home': THEO_HOUSE,
} as const;

export const CHARACTER_ASSETS = {
  patrick: PATRICK,
  elena: ELENA,
  bram: BRAM,
  mira: MIRA,
  theo: THEO,
  luma: LUMA,
} as const;

export const CHARACTER_FRAME_WIDTH = 84;
export const CHARACTER_FRAME_HEIGHT = 93;
