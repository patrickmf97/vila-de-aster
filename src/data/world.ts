import type { DoorDefinition, Rect } from '../types';

export const WORLD = {
  width: 2000,
  height: 1400,
};

export interface Building extends Rect {
  id: string;
  name: string;
  roof: number;
  wall: number;
  sign: string;
}

export interface WorldPropCollision extends Rect {
  id: string;
}

export const plaza = {
  x: 930,
  y: 665,
  radius: 205,
};

export const roads: Rect[] = [
  { x: 0, y: 575, w: 1320, h: 170 },
  { x: 885, y: 0, w: 170, h: 1400 },
  { x: 340, y: 335, w: 1320, h: 130 },
  { x: 270, y: 745, w: 130, h: 360 },
  { x: 1320, y: 795, w: 680, h: 115 },
  { x: 1630, y: 900, w: 120, h: 330 },
];

export const buildings: Building[] = [
  {
    id: 'inn',
    name: 'Taverna Lua Cheia',
    x: 150,
    y: 125,
    w: 360,
    h: 250,
    roof: 0xaa604c,
    wall: 0xddd0a9,
    sign: '🍲',
  },
  {
    id: 'smith',
    name: 'Forja do Bram',
    x: 780,
    y: 105,
    w: 360,
    h: 265,
    roof: 0x58789b,
    wall: 0xd5c39a,
    sign: '⚒️',
  },
  {
    id: 'shop',
    name: 'Empório da Mira',
    x: 1400,
    y: 125,
    w: 390,
    h: 250,
    roof: 0x718558,
    wall: 0xddd0a9,
    sign: '🧺',
  },
  {
    id: 'home',
    name: 'Casa da Elena',
    x: 135,
    y: 930,
    w: 390,
    h: 255,
    roof: 0x8d5a6d,
    wall: 0xded0aa,
    sign: '🌸',
  },
  {
    id: 'fisher-home',
    name: 'Casa do Theo',
    x: 1590,
    y: 965,
    w: 365,
    h: 265,
    roof: 0x58789b,
    wall: 0xd8caa8,
    sign: '🎣',
  },
];

export const doors: DoorDefinition[] = buildings.map((building) => ({
  id: 'door-' + building.id,
  buildingId: building.id,
  label: 'Entrar em ' + building.name,
  x: building.x + building.w / 2,
  y: building.y + building.h + 18,
  returnPoint: {
    x: building.x + building.w / 2,
    y: building.y + building.h + 52,
  },
}));

// Vertical river that divides the village from Theo's dock district.
// The bridge corridor (y 790–920) is intentionally left collision-free.
export const pond: Rect = {
  x: 1320,
  y: 620,
  w: 260,
  h: 780,
};

export const bridgeRect: Rect = {
  x: 1300,
  y: 790,
  w: 300,
  h: 130,
};

export const trees = [
  [70, 90], [120, 500], [225, 535], [560, 110], [610, 225],
  [1220, 105], [1300, 190], [1880, 110], [1910, 480], [1740, 500],
  [70, 820], [570, 820], [625, 1040], [725, 1190], [1060, 1080],
  [1140, 1240], [1240, 1020], [1885, 1280], [1500, 1220], [1250, 520],
  [515, 1260], [280, 1280], [1160, 470], [1820, 665],
].map(([x, y]) => ({ x, y, r: 30 }));

export const decorativeCollisions: WorldPropCollision[] = [
  { id: 'fountain', x: 845, y: 565, w: 170, h: 145 },
  { id: 'elena-fence-left', x: 70, y: 1180, w: 190, h: 30 },
  { id: 'elena-fence-right', x: 400, y: 1180, w: 165, h: 30 },
  { id: 'dock-edge', x: 1588, y: 1235, w: 360, h: 22 },
];

const buildingCollisions: Rect[] = buildings.map((b) => ({
  x: b.x + 20,
  y: b.y + Math.round(b.h * 0.34),
  w: b.w - 40,
  h: Math.round(b.h * 0.66),
}));

const riverCollisions: Rect[] = [
  {
    x: pond.x,
    y: pond.y,
    w: pond.w,
    h: bridgeRect.y - pond.y,
  },
  {
    x: pond.x,
    y: bridgeRect.y + bridgeRect.h,
    w: pond.w,
    h: WORLD.height - (bridgeRect.y + bridgeRect.h),
  },
];

export const collisionRects: Rect[] = [
  ...buildingCollisions,
  ...riverCollisions,
  ...decorativeCollisions,
  { x: 0, y: 0, w: 42, h: WORLD.height },
  { x: WORLD.width - 42, y: 0, w: 42, h: WORLD.height },
  { x: 0, y: 0, w: WORLD.width, h: 42 },
  { x: 0, y: WORLD.height - 42, w: WORLD.width, h: 42 },
  ...trees.map((t) => ({
    x: t.x - 17,
    y: t.y + 5,
    w: 34,
    h: 30,
  })),
];

export const zones = {
  tavernYard: { x: 120, y: 410, w: 420, h: 140 },
  forgeYard: { x: 755, y: 395, w: 420, h: 150 },
  marketYard: { x: 1360, y: 405, w: 470, h: 155 },
  elenaGarden: { x: 95, y: 780, w: 500, h: 400 },
  riverWalk: { x: 1120, y: 690, w: 180, h: 430 },
  theoDock: { x: 1590, y: 860, w: 380, h: 380 },
  southMeadow: { x: 690, y: 1010, w: 520, h: 300 },
};


export function navigationWaypoint(
  from: { x: number; y: number },
  target: { x: number; y: number },
): { x: number; y: number } {
  const westEdge = pond.x - 42;
  const eastEdge = pond.x + pond.w + 42;
  const bridgeY = bridgeRect.y + bridgeRect.h / 2;

  const fromWest = from.x < pond.x;
  const fromEast = from.x > pond.x + pond.w;
  const targetWest = target.x < pond.x;
  const targetEast = target.x > pond.x + pond.w;

  if (fromWest && targetEast) {
    if (Math.abs(from.y - bridgeY) > 34) {
      return { x: westEdge, y: bridgeY };
    }

    if (from.x < eastEdge - 20) {
      return { x: eastEdge, y: bridgeY };
    }
  }

  if (fromEast && targetWest) {
    if (Math.abs(from.y - bridgeY) > 34) {
      return { x: eastEdge, y: bridgeY };
    }

    if (from.x > westEdge + 20) {
      return { x: westEdge, y: bridgeY };
    }
  }

  return target;
}
