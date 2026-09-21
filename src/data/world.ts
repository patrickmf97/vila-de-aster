import type { DoorDefinition, Rect } from '../types';

export const WORLD = {
  width: 1900,
  height: 1250,
};

export interface Building extends Rect {
  id: string;
  name: string;
  roof: number;
  wall: number;
  sign: string;
}

export const roads: Rect[] = [
  { x: 610, y: 0, w: 180, h: 1250 },
  { x: 0, y: 575, w: 1900, h: 170 },
  { x: 1180, y: 520, w: 180, h: 730 },
];

export const buildings: Building[] = [
  { id: 'inn', name: 'Taverna Lua Cheia', x: 260, y: 180, w: 310, h: 220, roof: 0x9b4a3c, wall: 0xe5c890, sign: '🍲' },
  { id: 'smith', name: 'Forja do Bram', x: 860, y: 160, w: 300, h: 220, roof: 0x425f76, wall: 0xd8bd87, sign: '⚒️' },
  { id: 'shop', name: 'Empório da Mira', x: 1370, y: 190, w: 300, h: 215, roof: 0x607a47, wall: 0xe2ca97, sign: '🧺' },
  { id: 'home', name: 'Casa da Elena', x: 165, y: 825, w: 270, h: 205, roof: 0x755a92, wall: 0xd9c696, sign: '🌸' },
];

export const doors: DoorDefinition[] = buildings.map((building) => ({
  id: `door-${building.id}`,
  buildingId: building.id,
  label: `Entrar em ${building.name}`,
  x: building.x + building.w / 2,
  y: building.y + building.h + 22,
  returnPoint: {
    x: building.x + building.w / 2,
    y: building.y + building.h + 58,
  },
}));

export const pond: Rect = { x: 1260, y: 745, w: 280, h: 160 };

export const trees = [
  [90,120],[145,180],[180,110],[80,450],[170,490],[330,500],[470,480],
  [1180,95],[1280,120],[1750,110],[1780,470],[1650,500],[1510,490],
  [80,1060],[530,1080],[650,1010],[810,1120],[1510,1080],[1740,1040],
  [1030,980],[1120,1040],[1160,930],[520,820],[460,900],
].map(([x, y]) => ({ x, y, r: 32 }));

export const collisionRects: Rect[] = [
  ...buildings.map((b) => ({ x: b.x + 10, y: b.y + 44, w: b.w - 20, h: b.h - 44 })),
  { x: 0, y: 0, w: 46, h: 1250 },
  { x: 1854, y: 0, w: 46, h: 1250 },
  { x: 0, y: 0, w: 1900, h: 46 },
  { x: 0, y: 1204, w: 1900, h: 46 },
  { x: 1260, y: 745, w: 280, h: 65 },
  ...trees.map((t) => ({ x: t.x - 22, y: t.y - 20, w: 44, h: 42 })),
];
