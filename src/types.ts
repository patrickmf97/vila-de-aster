export type Facing = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  w: number;
  h: number;
}

export type NpcActivity =
  | 'sleep'
  | 'work'
  | 'walk'
  | 'socialize'
  | 'rest'
  | 'fish'
  | 'play'
  | 'family'
  | 'eat'
  | 'investigate';

export type BrainAction =
  | 'follow-schedule'
  | 'sleep'
  | 'eat'
  | 'rest'
  | 'socialize'
  | 'family'
  | 'work'
  | 'fish'
  | 'investigate-river';

export type LifeStage = 'child' | 'young-adult' | 'adult' | 'elder';
export type RelationshipStatus = 'single' | 'dating' | 'married';
export type LifeEventType =
  | 'dating'
  | 'marriage'
  | 'expecting-child'
  | 'child-born'
  | 'moved-home';

export interface ScheduleEntry extends Point {
  from: number;
  to: number;
  label: string;
  activity?: NpcActivity;
  zone?: string;
  interiorPosition?: Point;
  homeTarget?: boolean;
}

export interface NpcLifeSeed {
  ageYears: number;
  residenceId: string;
  familyDesire: number;
  sociability: number;
}

export interface NpcPersonality {
  curiosity: number;
  empathy: number;
  discipline: number;
  sociability: number;
  family: number;
  courage: number;
}

export interface NpcBrainSeed {
  personality: NpcPersonality;
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
  life: NpcLifeSeed;
  brain?: NpcBrainSeed;
  generated?: boolean;
  scale?: number;
}

export interface MemoryFact {
  id: string;
  text: string;
  importance: number;
  createdDay: number;
  source: string;
  expiresAfterDays?: number;
}

export interface NpcMemory {
  talks: number;
  affinity: number;
  lastDay: number;
  facts: MemoryFact[];
}

export interface NpcRelationship {
  score: number;
  interactions: number;
  lastInteractionDay: number;
}

export interface NpcLifeState {
  npcId: string;
  ageYears: number;
  ageProgressDays: number;
  lifeStage: LifeStage;
  residenceId: string;
  currentZone: string;
  currentActivity: NpcActivity;
  energy: number;
  socialNeed: number;
  familyDesire: number;
  relationshipStatus: RelationshipStatus;
  partnerId?: string;
  parents: string[];
  children: string[];
  datingSinceDay?: number;
  marriageDay?: number;
  expectingChildDueDay?: number;
  lastProcessedDay: number;
}

export interface BrainNeeds {
  hunger: number;
  safety: number;
  purpose: number;
  curiosity: number;
}

export interface NpcBrainState {
  npcId: string;
  needs: BrainNeeds;
  currentAction: BrainAction;
  currentActivity: NpcActivity;
  target?: Point;
  zone: string;
  label: string;
  score: number;
  reasons: string[];
  decidedAt: number;
  nextDecisionAt: number;
}

export interface BrainDecisionLog {
  id: string;
  npcId: string;
  day: number;
  minute: number;
  action: BrainAction;
  label: string;
  score: number;
  reasons: string[];
  candidates: Array<{
    action: BrainAction;
    score: number;
  }>;
}

export interface GeneratedNpcData {
  id: string;
  name: string;
  emoji: string;
  role: string;
  color: number;
  parents: [string, string];
  residenceId: string;
  birthDay: number;
  familyDesire: number;
  sociability: number;
}

export interface LifeEvent {
  id: string;
  type: LifeEventType;
  day: number;
  npcIds: string[];
  text: string;
}

export interface SaveData {
  player?: Point;
  npcs: Record<string, NpcMemory>;
  relationships: Record<string, NpcRelationship>;
  life: Record<string, NpcLifeState>;
  brains: Record<string, NpcBrainState>;
  brainLogs: BrainDecisionLog[];
  generatedNpcs: GeneratedNpcData[];
  lifeEvents: LifeEvent[];
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
  residentSpots?: Point[];
  sleepSpots?: Point[];
  objects: InteriorObjectDefinition[];
}
