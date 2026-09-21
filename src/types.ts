export type Facing = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  w: number;
  h: number;
}

export type NpcActivity = 'sleep' | 'work' | 'walk' | 'socialize' | 'rest' | 'fish';

export interface ScheduleEntry extends Point {
  from: number;
  to: number;
  label: string;
  activity?: NpcActivity;
}

export interface NpcDefinition extends Point {
  id: string;
  name: string;
  emoji: string;
  role: string;
  color: number;
  intro: string;
  remembered: string;
  topic: string;
  schedule: ScheduleEntry[];
}

export interface NpcMemory {
  talks: number;
  affinity: number;
  lastDay: number;
}

export interface SaveData {
  player?: Point;
  npcs: Record<string, NpcMemory>;
  eventTriggered: boolean;
  day: number;
  gameMinutes: number;
}

export interface DoorDefinition extends Point {
  id: string;
  buildingId: string;
  label: string;
  returnPoint: Point;
}

export interface InteriorObjectDefinition extends Rect {
  id: string;
  label: string;
  emoji: string;
  text: string;
  solid?: boolean;
}

export interface InteriorDefinition {
  id: string;
  name: string;
  subtitle: string;
  wall: number;
  floor: number;
  accent: number;
  spawn: Point;
  exit: Point;
  objects: InteriorObjectDefinition[];
}
