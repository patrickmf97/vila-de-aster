export type Facing = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  w: number;
  h: number;
}

export interface ScheduleEntry extends Point {
  from: number;
  to: number;
  label: string;
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
