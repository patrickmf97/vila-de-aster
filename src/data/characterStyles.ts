import type { NpcDefinition } from '../types';

export interface CharacterVisualStyle {
  skin: number;
  hair: number;
  hairLight: number;
  outfit: number;
  trim: number;
  shoes: number;
  bodyScaleX: number;
  bodyScaleY: number;
  headScale: number;
  hairStyle: 'soft' | 'short' | 'wave' | 'messy' | 'bun' | 'child';
  accessory?: string;
  workProp?: string;
  idleProp?: string;
}

const DEFAULT: CharacterVisualStyle = {
  skin: 0xf0bd98,
  hair: 0x5a4031,
  hairLight: 0x765846,
  outfit: 0x6f8f65,
  trim: 0xe8d7aa,
  shoes: 0x4f4338,
  bodyScaleX: 1,
  bodyScaleY: 1,
  headScale: 1,
  hairStyle: 'soft',
};

const NAMED: Record<string, CharacterVisualStyle> = {
  elena: {
    skin: 0xf4c7aa,
    hair: 0x6b4639,
    hairLight: 0x936556,
    outfit: 0xd782a7,
    trim: 0xf0d9a4,
    shoes: 0x6d5142,
    bodyScaleX: 0.94,
    bodyScaleY: 1.02,
    headScale: 1.02,
    hairStyle: 'wave',
    accessory: '🌸',
    workProp: '🌿',
  },
  bram: {
    skin: 0xdba17c,
    hair: 0x5b3828,
    hairLight: 0x7b5140,
    outfit: 0x9b6848,
    trim: 0x454b4d,
    shoes: 0x3e3430,
    bodyScaleX: 1.18,
    bodyScaleY: 1.04,
    headScale: 1.06,
    hairStyle: 'short',
    accessory: '🧔',
    workProp: '⚒️',
  },
  mira: {
    skin: 0xe8b790,
    hair: 0x3f302a,
    hairLight: 0x6b5046,
    outfit: 0x78a968,
    trim: 0xe4bd66,
    shoes: 0x544238,
    bodyScaleX: 0.96,
    bodyScaleY: 1.03,
    headScale: 1,
    hairStyle: 'bun',
    accessory: '🧺',
    workProp: '📦',
  },
  theo: {
    skin: 0xe7b184,
    hair: 0x725139,
    hairLight: 0x9b7455,
    outfit: 0x5c8ec7,
    trim: 0xd8c495,
    shoes: 0x4d5663,
    bodyScaleX: 0.98,
    bodyScaleY: 1.02,
    headScale: 1,
    hairStyle: 'messy',
    accessory: '🎣',
    workProp: '🎣',
    idleProp: '🐟',
  },
  luma: {
    skin: 0xefba91,
    hair: 0x743f35,
    hairLight: 0xa65d4f,
    outfit: 0xb85f50,
    trim: 0xf0d28a,
    shoes: 0x5b4036,
    bodyScaleX: 1.03,
    bodyScaleY: 1.02,
    headScale: 1.02,
    hairStyle: 'soft',
    accessory: '🍲',
    workProp: '🍵',
  },
};

const ROLE_FALLBACK: Record<string, Partial<CharacterVisualStyle>> = {
  Jardineira: {
    outfit: 0x7daa6f,
    trim: 0xe9d8a9,
    workProp: '🌿',
    hairStyle: 'wave',
  },
  Ferreiro: {
    outfit: 0x87604a,
    trim: 0x4c5556,
    workProp: '⚒️',
    bodyScaleX: 1.12,
    hairStyle: 'short',
  },
  Comerciante: {
    outfit: 0x7ea76b,
    trim: 0xe0bd65,
    workProp: '📦',
    hairStyle: 'bun',
  },
  Pescador: {
    outfit: 0x5f89ae,
    trim: 0xd5c497,
    workProp: '🎣',
    hairStyle: 'messy',
  },
  Taverneira: {
    outfit: 0xb96a52,
    trim: 0xe7c97b,
    workProp: '🍵',
    hairStyle: 'soft',
  },
  Criança: {
    outfit: 0x8d9ac7,
    trim: 0xf0dca9,
    bodyScaleX: 0.82,
    bodyScaleY: 0.82,
    headScale: 1.08,
    hairStyle: 'child',
    idleProp: '🪁',
  },
};

export function characterStyleFor(
  definition: NpcDefinition,
): CharacterVisualStyle {
  const named = NAMED[definition.id];
  if (named) return named;

  const role = ROLE_FALLBACK[definition.role] ?? {};
  const seed = stableHash(definition.id);

  const hairPalette = [
    [0x54392d, 0x75503f],
    [0x6b4e37, 0x8d694c],
    [0x3f342f, 0x62514a],
    [0x7b5943, 0xa07759],
  ] as const;
  const hair = hairPalette[seed % hairPalette.length]!;

  return {
    ...DEFAULT,
    ...role,
    hair: hair[0],
    hairLight: hair[1],
    skin: skinTone(seed),
    outfit:
      role.outfit ??
      colorFromSeed(seed),
  };
}

function skinTone(seed: number): number {
  const tones = [
    0xf2c5a4,
    0xe9b58f,
    0xdba27d,
    0xc98f6d,
  ];
  return tones[seed % tones.length]!;
}

function colorFromSeed(seed: number): number {
  const colors = [
    0x748fae,
    0x8b7caf,
    0x6f9b72,
    0xad7668,
    0x9d8a62,
  ];
  return colors[(seed >> 3) % colors.length]!;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}
