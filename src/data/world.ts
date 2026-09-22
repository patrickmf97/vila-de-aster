import type { DoorDefinition, Point, Rect } from '../types';

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

export interface RoadPath {
  points: Point[];
  width: number;
}

export const plaza = {
  x: 930,
  y: 655,
  radius: 186,
};

/**
 * Visual roads use center-line paths instead of repeating rectangular tiles.
 * This lets the renderer build one continuous, organic road surface without
 * exposing the hard edges from the original asset-sheet crops.
 */
export const roadPaths: RoadPath[] = [
  {
    width: 126,
    points: [
      { x: 75, y: 645 },
      { x: 745, y: 645 },
      { x: 930, y: 655 },
      { x: 1235, y: 655 },
    ],
  },
  {
    width: 116,
    points: [
      { x: 930, y: 360 },
      { x: 930, y: 1120 },
    ],
  },
  {
    width: 100,
    points: [
      { x: 330, y: 395 },
      { x: 330, y: 585 },
    ],
  },
  {
    width: 100,
    points: [
      { x: 960, y: 375 },
      { x: 960, y: 540 },
    ],
  },
  {
    width: 100,
    points: [
      { x: 1590, y: 390 },
      { x: 1590, y: 565 },
    ],
  },
  {
    width: 96,
    points: [
      { x: 330, y: 715 },
      { x: 330, y: 1165 },
    ],
  },
  {
    width: 108,
    points: [
      { x: 1190, y: 835 },
      { x: 1850, y: 835 },
    ],
  },
  {
    width: 92,
    points: [
      { x: 1770, y: 835 },
      { x: 1770, y: 1245 },
    ],
  },
];

/**
 * Kept for systems that may still want broad road bounds. Rendering no longer
 * tiles these rectangles directly.
 */
export const roads: Rect[] = roadPaths.map((path) => {
  const xs = path.points.map((point) => point.x);
  const ys = path.points.map((point) => point.y);
  const half = path.width / 2;
  const minX = Math.min(...xs) - half;
  const maxX = Math.max(...xs) + half;
  const minY = Math.min(...ys) - half;
  const maxY = Math.max(...ys) + half;
  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  };
});

export const buildings: Building[] = [
  {
    id: 'inn',
    name: 'Taverna Lua Cheia',
    x: 135,
    y: 105,
    w: 390,
    h: 270,
    roof: 0xaa604c,
    wall: 0xddd0a9,
    sign: '🍲',
  },
  {
    id: 'smith',
    name: 'Forja do Bram',
    x: 760,
    y: 95,
    w: 400,
    h: 280,
    roof: 0x58789b,
    wall: 0xd5c39a,
    sign: '⚒️',
  },
  {
    id: 'shop',
    name: 'Empório da Mira',
    x: 1380,
    y: 105,
    w: 420,
    h: 270,
    roof: 0x718558,
    wall: 0xddd0a9,
    sign: '🧺',
  },
  {
    id: 'home',
    name: 'Casa da Elena',
    x: 115,
    y: 930,
    w: 430,
    h: 270,
    roof: 0x8d5a6d,
    wall: 0xded0aa,
    sign: '🌸',
  },
  {
    id: 'fisher-home',
    name: 'Casa do Theo',
    x: 1560,
    y: 960,
    w: 400,
    h: 285,
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
  y: building.y + building.h + 20,
  returnPoint: {
    x: building.x + building.w / 2,
    y: building.y + building.h + 54,
  },
}));

// River is a single visual surface. The renderer stretches one water crop
// across this footprint instead of tiling the non-seamless crop.
export const pond: Rect = {
  x: 1305,
  y: 535,
  w: 285,
  h: 865,
};

export const bridgeRect: Rect = {
  x: 1278,
  y: 760,
  w: 340,
  h: 150,
};

export const trees = [
  [74, 88], [118, 480], [222, 515], [570, 92], [610, 240],
  [1210, 100], [1280, 185], [1890, 105], [1910, 475], [1835, 610],
  [72, 820], [555, 815], [620, 1050], [735, 1200], [1070, 1085],
  [1160, 1245], [1215, 1025], [1880, 1300], [1490, 1225], [1215, 505],
  [520, 1280], [275, 1290], [1155, 470], [1880, 760],
].map(([x, y]) => ({ x, y, r: 30 }));

export const decorativeCollisions: WorldPropCollision[] = [
  { id: 'fountain', x: 858, y: 585, w: 144, h: 118 },
  { id: 'elena-fence-left', x: 65, y: 1190, w: 200, h: 28 },
  { id: 'elena-fence-right', x: 405, y: 1190, w: 175, h: 28 },
  { id: 'dock-edge', x: 1585, y: 1250, w: 380, h: 22 },
];

const buildingCollisions: Rect[] = buildings.map((building) => ({
  // Only the lower physical footprint blocks movement. Roofs remain visual,
  // so characters can correctly pass behind the upper part of a building.
  x: building.x + 28,
  y: building.y + Math.round(building.h * 0.52),
  w: building.w - 56,
  h: Math.round(building.h * 0.48),
}));

const treeCollisions: Rect[] = trees.map((tree) => ({
  x: tree.x - 16,
  y: tree.y + 10,
  w: 32,
  h: 28,
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

const boundaryCollisions: Rect[] = [
  { x: 0, y: 0, w: 38, h: WORLD.height },
  { x: WORLD.width - 38, y: 0, w: 38, h: WORLD.height },
  { x: 0, y: 0, w: WORLD.width, h: 38 },
  { x: 0, y: WORLD.height - 38, w: WORLD.width, h: 38 },
];

export const collisionRects: Rect[] = [
  ...buildingCollisions,
  ...riverCollisions,
  ...decorativeCollisions,
  ...boundaryCollisions,
  ...treeCollisions,
];

const navigationObstacles: Rect[] = [
  ...buildingCollisions,
  ...decorativeCollisions,
  ...treeCollisions,
];

export const zones = {
  tavernYard: { x: 95, y: 390, w: 470, h: 170 },
  forgeYard: { x: 725, y: 390, w: 470, h: 165 },
  marketYard: { x: 1345, y: 390, w: 500, h: 170 },
  elenaGarden: { x: 80, y: 775, w: 520, h: 445 },
  riverWalk: { x: 1110, y: 685, w: 175, h: 475 },
  theoDock: { x: 1580, y: 900, w: 395, h: 390 },
  southMeadow: { x: 680, y: 1010, w: 540, h: 320 },
};

export function isWorldWalkable(
  x: number,
  y: number,
  radius = 16,
): boolean {
  if (
    x - radius < 0 ||
    y - radius < 0 ||
    x + radius > WORLD.width ||
    y + radius > WORLD.height
  ) {
    return false;
  }

  return !collisionRects.some((rect) =>
    circleIntersectsRect(x, y, radius, rect),
  );
}

export function navigationWaypoint(
  from: Point,
  requestedTarget: Point,
): Point {
  const target = nearestWalkablePoint(requestedTarget);
  const westEdge = pond.x - 38;
  const eastEdge = pond.x + pond.w + 38;
  const bridgeY = bridgeRect.y + bridgeRect.h / 2;

  const fromWest = from.x < pond.x;
  const fromEast = from.x > pond.x + pond.w;
  const targetWest = target.x < pond.x;
  const targetEast = target.x > pond.x + pond.w;

  if (fromWest && targetEast) {
    if (Math.abs(from.y - bridgeY) > 28) {
      return { x: westEdge, y: bridgeY };
    }
    if (from.x < eastEdge - 18) {
      return { x: eastEdge, y: bridgeY };
    }
  }

  if (fromEast && targetWest) {
    if (Math.abs(from.y - bridgeY) > 28) {
      return { x: eastEdge, y: bridgeY };
    }
    if (from.x > westEdge + 18) {
      return { x: westEdge, y: bridgeY };
    }
  }

  const obstruction = navigationObstacles.find((rect) =>
    segmentIntersectsExpandedRect(from, target, rect, 20),
  );

  if (!obstruction) return target;

  const margin = 28;
  const candidates: Point[] = [
    {
      x: obstruction.x - margin,
      y: obstruction.y - margin,
    },
    {
      x: obstruction.x + obstruction.w + margin,
      y: obstruction.y - margin,
    },
    {
      x: obstruction.x - margin,
      y: obstruction.y + obstruction.h + margin,
    },
    {
      x: obstruction.x + obstruction.w + margin,
      y: obstruction.y + obstruction.h + margin,
    },
  ].filter((point) =>
    isWorldWalkable(point.x, point.y, 13),
  );

  if (!candidates.length) return target;

  return candidates.sort(
    (a, b) =>
      routeCost(from, a, target) -
      routeCost(from, b, target),
  )[0]!;
}

function nearestWalkablePoint(target: Point): Point {
  if (isWorldWalkable(target.x, target.y, 13)) {
    return target;
  }

  const angles = 12;
  for (const radius of [24, 42, 64, 88]) {
    for (let index = 0; index < angles; index += 1) {
      const angle =
        (Math.PI * 2 * index) /
        angles;
      const candidate = {
        x:
          target.x +
          Math.cos(angle) *
            radius,
        y:
          target.y +
          Math.sin(angle) *
            radius,
      };

      if (
        isWorldWalkable(
          candidate.x,
          candidate.y,
          13,
        )
      ) {
        return candidate;
      }
    }
  }

  return {
    x: PhaserClamp(
      target.x,
      50,
      WORLD.width - 50,
    ),
    y: PhaserClamp(
      target.y,
      50,
      WORLD.height - 50,
    ),
  };
}

function segmentIntersectsExpandedRect(
  from: Point,
  to: Point,
  rect: Rect,
  margin: number,
): boolean {
  const expanded = {
    x: rect.x - margin,
    y: rect.y - margin,
    w: rect.w + margin * 2,
    h: rect.h + margin * 2,
  };

  for (let step = 1; step <= 10; step += 1) {
    const t = step / 10;
    const x =
      from.x +
      (to.x - from.x) *
        t;
    const y =
      from.y +
      (to.y - from.y) *
        t;

    if (
      x >= expanded.x &&
      x <= expanded.x + expanded.w &&
      y >= expanded.y &&
      y <= expanded.y + expanded.h
    ) {
      return true;
    }
  }

  return false;
}

function circleIntersectsRect(
  x: number,
  y: number,
  radius: number,
  rect: Rect,
): boolean {
  const nearestX = PhaserClamp(
    x,
    rect.x,
    rect.x + rect.w,
  );
  const nearestY = PhaserClamp(
    y,
    rect.y,
    rect.y + rect.h,
  );
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

function routeCost(
  from: Point,
  via: Point,
  target: Point,
): number {
  return (
    distance(from, via) +
    distance(via, target)
  );
}

function distance(
  a: Point,
  b: Point,
): number {
  return Math.hypot(
    a.x - b.x,
    a.y - b.y,
  );
}

function PhaserClamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.max(
    min,
    Math.min(max, value),
  );
}
