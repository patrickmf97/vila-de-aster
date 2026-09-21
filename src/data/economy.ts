import type {
  NpcDefinition,
  ResourceKey,
  ResourceStock,
  SettlementBuilding,
  DoorDefinition,
  Rect,
} from '../types';

export interface ProfessionEconomyProfile {
  baseDailyIncome: number;
  personalDailyCost: number;
  produces: Partial<ResourceStock>;
}

export interface SettlementLot extends Rect {
  id: string;
  label: string;
}

export const BASE_RESOURCE_PRICES: ResourceStock = {
  food: 2,
  wood: 3,
  stone: 4,
  metal: 6,
  goods: 5,
};

export const INITIAL_RESOURCES: ResourceStock = {
  food: 42,
  wood: 36,
  stone: 28,
  metal: 20,
  goods: 24,
};

export const professionEconomy: Record<string, ProfessionEconomyProfile> = {
  Jardineira: {
    baseDailyIncome: 18,
    personalDailyCost: 4,
    produces: { food: 7, goods: 1 },
  },
  Ferreiro: {
    baseDailyIncome: 27,
    personalDailyCost: 5,
    produces: { metal: 4, goods: 5 },
  },
  Comerciante: {
    baseDailyIncome: 25,
    personalDailyCost: 5,
    produces: { goods: 7, wood: 4, stone: 3 },
  },
  Pescador: {
    baseDailyIncome: 21,
    personalDailyCost: 4,
    produces: { food: 9 },
  },
  Taverneira: {
    baseDailyIncome: 24,
    personalDailyCost: 5,
    produces: { food: 3, goods: 4 },
  },
  Criança: {
    baseDailyIncome: 0,
    personalDailyCost: 3,
    produces: {},
  },
};

export const defaultEconomyProfile: ProfessionEconomyProfile = {
  baseDailyIncome: 16,
  personalDailyCost: 4,
  produces: { goods: 2 },
};

export const residenceCapacity: Record<string, number> = {
  inn: 2,
  smith: 1,
  shop: 1,
  home: 4,
  'fisher-home': 4,
};

export const settlementLots: SettlementLot[] = [
  { id: 'northwest-1', label: 'Clareira Noroeste', x: 20, y: 260, w: 220, h: 160 },
  { id: 'forge-lane-1', label: 'Rua da Forja', x: 900, y: 400, w: 230, h: 160 },
  { id: 'south-meadow-1', label: 'Prado Sul I', x: 850, y: 770, w: 240, h: 170 },
  { id: 'south-meadow-2', label: 'Prado Sul II', x: 850, y: 1000, w: 230, h: 150 },
];

export const HOUSE_COST = {
  coins: 90,
  resources: {
    wood: 18,
    stone: 12,
    goods: 5,
  } satisfies Partial<ResourceStock>,
};

export function economyProfileFor(
  definition: NpcDefinition,
): ProfessionEconomyProfile {
  return professionEconomy[definition.role] ?? defaultEconomyProfile;
}

export function startingCoinsFor(definition: NpcDefinition): number {
  const base =
    definition.role === 'Criança'
      ? 0
      : economyProfileFor(definition).baseDailyIncome * 3;

  return Math.max(
    0,
    Math.round(base + (stableHash(definition.id) % 23)),
  );
}

export function resourceTarget(
  resource: ResourceKey,
  population: number,
): number {
  const perPerson: Record<ResourceKey, number> = {
    food: 6,
    wood: 4,
    stone: 3,
    metal: 2,
    goods: 3,
  };

  return Math.max(1, population * perPerson[resource]);
}

export function settlementDoor(
  building: SettlementBuilding,
): DoorDefinition {
  return {
    id: 'door-' + building.residenceId,
    buildingId: building.residenceId,
    label: 'Entrar em ' + building.name,
    x: building.x + building.w / 2,
    y: building.y + building.h + 18,
    returnPoint: {
      x: building.x + building.w / 2,
      y: building.y + building.h + 52,
    },
  };
}

export function settlementCollisionRect(
  building: SettlementBuilding,
): Rect {
  return {
    x: building.x + 10,
    y: building.y + 42,
    w: building.w - 20,
    h: building.h - 42,
  };
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}
