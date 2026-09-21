import type {
  GeneratedNpcData,
  LifeEvent,
  LifeStage,
  NpcActivity,
  NpcDefinition,
  NpcLifeState,
  Point,
} from '../types';
import { doors } from '../data/world';
import { settlementDoor } from '../data/economy';
import type { SaveSystem } from './SaveSystem';

const DAYS_PER_YEAR = 28;
const CHILD_NAMES = [
  'Nora', 'Cael', 'Iris', 'Noa', 'Lio', 'Maya', 'Téo', 'Lina',
  'Ari', 'Nina', 'Gael', 'Eli', 'Cora', 'Davi', 'Mila', 'Ravi',
];

export class LifeSimulationSystem {
  private lastEventCount = 0;

  constructor(
    private readonly save: SaveSystem,
    private readonly baseDefinitions: NpcDefinition[],
  ) {
    this.ensureAllProfiles();
    this.lastEventCount = this.save.snapshot.lifeEvents.length;
  }

  update(
    day: number,
    minuteOfDay: number,
    _deltaSeconds: number,
  ): LifeEvent[] {
    this.ensureAllProfiles();

    // The schedule remains the safe baseline. NpcBrainSystem is layered on top
    // and can override currentActivity/currentZone after this update.
    for (const definition of this.getAllDefinitions()) {
      const state = this.save.lifeFor(definition.id);
      if (!state) continue;

      const schedule = scheduleAt(definition, minuteOfDay);
      const activity = schedule.activity ?? inferActivity(schedule.label);

      state.currentActivity = activity;

      // currentZone represents the NPC's real physical location.
      // The desired destination is controlled by NpcBrainState.zone and
      // scene transition logic moves the NPC through doors before changing it.
    }

    this.processDaysUntil(day);

    const events = this.save.snapshot.lifeEvents.slice(this.lastEventCount);
    this.lastEventCount = this.save.snapshot.lifeEvents.length;
    if (events.length) this.save.persist();
    return events;
  }

  getAllDefinitions(): NpcDefinition[] {
    const generated = this.save.snapshot.generatedNpcs.map((npc) =>
      this.generatedDefinition(npc),
    );
    return [...this.baseDefinitions, ...generated];
  }

  getState(npcId: string): NpcLifeState | undefined {
    return this.save.lifeFor(npcId);
  }

  getResidenceDoor(npcId: string): Point | undefined {
    const residenceId = this.save.lifeFor(npcId)?.residenceId;
    if (!residenceId) return undefined;
    const staticDoor = doors.find(
      (door) => door.buildingId === residenceId,
    );
    if (staticDoor) return staticDoor.returnPoint;

    const dynamicBuilding =
      this.save.snapshot.settlementBuildings.find(
        (building) =>
          building.residenceId === residenceId,
      );

    return dynamicBuilding
      ? settlementDoor(dynamicBuilding).returnPoint
      : undefined;
  }

  getCurrentInteriorPosition(
    definition: NpcDefinition,
    minuteOfDay: number,
  ): Point | undefined {
    const state = this.save.lifeFor(definition.id);
    if (!state || state.currentZone === 'world') return undefined;

    const schedule = scheduleAt(definition, minuteOfDay);
    return schedule.interiorPosition;
  }

  private ensureAllProfiles(): void {
    for (const definition of this.baseDefinitions) {
      if (this.save.lifeFor(definition.id)) continue;
      this.save.setLife(
        definition.id,
        this.createInitialState(
          definition.id,
          definition.life.ageYears,
          definition.life.residenceId,
          definition.life.familyDesire,
          [],
        ),
      );
    }

    for (const generated of this.save.snapshot.generatedNpcs) {
      if (this.save.lifeFor(generated.id)) continue;
      this.save.setLife(
        generated.id,
        this.createInitialState(
          generated.id,
          0,
          generated.residenceId,
          generated.familyDesire,
          [...generated.parents],
        ),
      );
    }
  }

  private createInitialState(
    npcId: string,
    ageYears: number,
    residenceId: string,
    familyDesire: number,
    parents: string[],
  ): NpcLifeState {
    return {
      npcId,
      ageYears,
      ageProgressDays: 0,
      lifeStage: stageForAge(ageYears),
      residenceId,
      currentZone: 'world',
      currentActivity: 'rest',
      energy: 82,
      socialNeed: 30,
      familyDesire,
      relationshipStatus: 'single',
      parents,
      children: [],
      lastProcessedDay: this.save.snapshot.day,
    };
  }

  private processDaysUntil(day: number): void {
    let minimumProcessedDay = day;

    for (const state of Object.values(this.save.snapshot.life)) {
      minimumProcessedDay = Math.min(minimumProcessedDay, state.lastProcessedDay);
    }

    for (let targetDay = minimumProcessedDay + 1; targetDay <= day; targetDay += 1) {
      this.processOneDay(targetDay);
    }
  }

  private processOneDay(day: number): void {
    for (const state of Object.values(this.save.snapshot.life)) {
      if (state.lastProcessedDay >= day) continue;

      state.ageProgressDays += 1;
      if (state.ageProgressDays >= DAYS_PER_YEAR) {
        state.ageProgressDays = 0;
        state.ageYears += 1;
        state.lifeStage = stageForAge(state.ageYears);
      }

      state.lastProcessedDay = day;
    }

    this.formDatingPairs(day);
    this.progressDatingToMarriage(day);
    this.progressFamilies(day);
    this.processBirths(day);
  }

  private formDatingPairs(day: number): void {
    const definitions = this.getAllDefinitions();
    const eligible = definitions
      .map((definition) => ({
        definition,
        state: this.save.lifeFor(definition.id),
      }))
      .filter(
        (entry): entry is { definition: NpcDefinition; state: NpcLifeState } =>
          !!entry.state &&
          ['young-adult', 'adult'].includes(entry.state.lifeStage) &&
          entry.state.relationshipStatus === 'single',
      );

    const paired = new Set<string>();

    for (const candidate of eligible) {
      if (paired.has(candidate.definition.id)) continue;

      let best:
        | {
            other: typeof candidate;
            value: number;
          }
        | undefined;

      for (const other of eligible) {
        if (
          other.definition.id === candidate.definition.id ||
          paired.has(other.definition.id)
        ) {
          continue;
        }

        const relation = this.save.relationshipFor(
          candidate.definition.id,
          other.definition.id,
        );
        const compatibility = compatibilityScore(
          candidate.definition.id,
          other.definition.id,
        );
        const value = relation.score + compatibility;

        if (
          relation.score >= 12 &&
          compatibility >= 64 &&
          (!best || value > best.value)
        ) {
          best = { other, value };
        }
      }

      if (!best) continue;

      const a = candidate.state;
      const b = best.other.state;

      a.relationshipStatus = 'dating';
      b.relationshipStatus = 'dating';
      a.partnerId = best.other.definition.id;
      b.partnerId = candidate.definition.id;
      a.datingSinceDay = day;
      b.datingSinceDay = day;

      paired.add(candidate.definition.id);
      paired.add(best.other.definition.id);

      this.recordEvent({
        id: 'dating:' + pairKey(candidate.definition.id, best.other.definition.id) + ':' + day,
        type: 'dating',
        day,
        npcIds: [candidate.definition.id, best.other.definition.id],
        text: candidate.definition.name + ' e ' + best.other.definition.name + ' começaram a se aproximar de um jeito diferente.',
      });
    }
  }

  private progressDatingToMarriage(day: number): void {
    const definitions = this.getAllDefinitions();
    const byId = new Map(definitions.map((definition) => [definition.id, definition]));

    for (const state of Object.values(this.save.snapshot.life)) {
      if (
        state.relationshipStatus !== 'dating' ||
        !state.partnerId ||
        state.npcId > state.partnerId
      ) {
        continue;
      }

      const partner = this.save.lifeFor(state.partnerId);
      const a = byId.get(state.npcId);
      const b = byId.get(state.partnerId);
      if (!partner || !a || !b) continue;

      const relation = this.save.relationshipFor(state.npcId, state.partnerId);
      const daysDating = day - (state.datingSinceDay ?? day);
      const compatibility = compatibilityScore(state.npcId, state.partnerId);

      if (relation.score < 30 || daysDating < 2 || compatibility < 70) continue;

      state.relationshipStatus = 'married';
      partner.relationshipStatus = 'married';
      state.marriageDay = day;
      partner.marriageDay = day;

      const sharedResidence = chooseSharedResidence(state.residenceId, partner.residenceId);
      const movedNpcIds: string[] = [];

      if (state.residenceId !== sharedResidence) {
        state.residenceId = sharedResidence;
        movedNpcIds.push(state.npcId);
      }
      if (partner.residenceId !== sharedResidence) {
        partner.residenceId = sharedResidence;
        movedNpcIds.push(partner.npcId);
      }

      this.recordEvent({
        id: 'marriage:' + pairKey(state.npcId, partner.npcId) + ':' + day,
        type: 'marriage',
        day,
        npcIds: [state.npcId, partner.npcId],
        text: a.name + ' e ' + b.name + ' se casaram e decidiram construir uma vida juntos.',
      });

      if (movedNpcIds.length) {
        this.recordEvent({
          id: 'move:' + pairKey(state.npcId, partner.npcId) + ':' + day,
          type: 'moved-home',
          day,
          npcIds: movedNpcIds,
          text: a.name + ' e ' + b.name + ' agora compartilham a mesma casa.',
        });
      }
    }
  }

  private progressFamilies(day: number): void {
    for (const state of Object.values(this.save.snapshot.life)) {
      if (
        state.relationshipStatus !== 'married' ||
        !state.partnerId ||
        state.npcId > state.partnerId
      ) {
        continue;
      }

      const partner = this.save.lifeFor(state.partnerId);
      if (!partner) continue;

      const marriageDay = state.marriageDay ?? day;
      const familyDesire = (state.familyDesire + partner.familyDesire) / 2;
      const alreadyExpecting =
        state.expectingChildDueDay !== undefined ||
        partner.expectingChildDueDay !== undefined;

      if (
        day - marriageDay < 3 ||
        familyDesire < 55 ||
        alreadyExpecting ||
        Math.max(state.children.length, partner.children.length) >= 2
      ) {
        continue;
      }

      if ((day + stableHash(pairKey(state.npcId, partner.npcId))) % 3 !== 0) {
        continue;
      }

      const dueDay = day + 3;
      state.expectingChildDueDay = dueDay;
      partner.expectingChildDueDay = dueDay;

      const names = this.definitionNames();
      this.recordEvent({
        id: 'expecting:' + pairKey(state.npcId, partner.npcId) + ':' + day,
        type: 'expecting-child',
        day,
        npcIds: [state.npcId, partner.npcId],
        text: (names.get(state.npcId) ?? state.npcId) + ' e ' + (names.get(partner.npcId) ?? partner.npcId) + ' estão esperando uma criança.',
      });
    }
  }

  private processBirths(day: number): void {
    const definitions = this.getAllDefinitions();
    const byId = new Map(definitions.map((definition) => [definition.id, definition]));

    for (const state of Object.values(this.save.snapshot.life)) {
      if (
        state.expectingChildDueDay === undefined ||
        state.expectingChildDueDay > day ||
        !state.partnerId ||
        state.npcId > state.partnerId
      ) {
        continue;
      }

      const partner = this.save.lifeFor(state.partnerId);
      const parentA = byId.get(state.npcId);
      const parentB = byId.get(state.partnerId);
      if (!partner || !parentA || !parentB) continue;

      const child = this.createChild(parentA, parentB, state.residenceId, day);
      this.save.addGeneratedNpc(child);

      state.children.push(child.id);
      partner.children.push(child.id);
      state.expectingChildDueDay = undefined;
      partner.expectingChildDueDay = undefined;

      this.save.setLife(
        child.id,
        this.createInitialState(
          child.id,
          0,
          child.residenceId,
          child.familyDesire,
          [...child.parents],
        ),
      );

      this.recordEvent({
        id: 'born:' + child.id,
        type: 'child-born',
        day,
        npcIds: [child.id, state.npcId, partner.npcId],
        text: child.name + ' nasceu. A família de ' + parentA.name + ' e ' + parentB.name + ' cresceu.',
      });

      this.save.addFact(state.npcId, {
        id: 'child-born:' + child.id,
        text: child.name + ' nasceu e agora faz parte da família.',
        importance: 5,
        createdDay: day,
        source: state.npcId,
      });
      this.save.addFact(partner.npcId, {
        id: 'child-born:' + child.id,
        text: child.name + ' nasceu e agora faz parte da família.',
        importance: 5,
        createdDay: day,
        source: partner.npcId,
      });
    }
  }

  private createChild(
    parentA: NpcDefinition,
    parentB: NpcDefinition,
    residenceId: string,
    day: number,
  ): GeneratedNpcData {
    const existing = this.save.snapshot.generatedNpcs.length;
    const nameIndex =
      (stableHash(parentA.id + parentB.id) + existing + day) % CHILD_NAMES.length;
    const id =
      'child-' + day + '-' + pairKey(parentA.id, parentB.id) + '-' + (existing + 1);

    return {
      id,
      name: CHILD_NAMES[nameIndex],
      emoji: existing % 2 === 0 ? '🧒' : '👧',
      role: 'Criança',
      color: blendColors(parentA.color, parentB.color),
      parents: [parentA.id, parentB.id],
      residenceId,
      birthDay: day,
      familyDesire: Math.round(
        (parentA.life.familyDesire + parentB.life.familyDesire) / 2,
      ),
      sociability: Math.round(
        (parentA.life.sociability + parentB.life.sociability) / 2,
      ),
    };
  }

  private generatedDefinition(data: GeneratedNpcData): NpcDefinition {
    const door =
      doors.find((entry) => entry.buildingId === data.residenceId) ??
      doors[0];
    const homePoint = door?.returnPoint ?? { x: 700, y: 650 };

    return {
      id: data.id,
      name: data.name,
      emoji: data.emoji,
      role: data.role,
      color: data.color,
      x: homePoint.x,
      y: homePoint.y,
      generated: true,
      scale: 0.78,
      intro: 'Oi! Eu sou ' + data.name + '. Minha família mora aqui na vila.',
      remembered: 'Você voltou! Eu lembro de você.',
      topic: 'Eu gosto de brincar perto da praça e ouvir as histórias dos adultos.',
      life: {
        ageYears: 0,
        residenceId: data.residenceId,
        familyDesire: data.familyDesire,
        sociability: data.sociability,
      },
      schedule: [
        {
          from: 0,
          to: 450,
          x: homePoint.x,
          y: homePoint.y,
          label: 'dormindo em casa',
          activity: 'sleep',
          zone: 'home',
          interiorPosition: { x: 610, y: 360 },
        },
        {
          from: 450,
          to: 540,
          x: homePoint.x,
          y: homePoint.y,
          label: 'saindo de casa',
          activity: 'walk',
          homeTarget: true,
        },
        {
          from: 540,
          to: 1020,
          x: 700,
          y: 700,
          label: 'brincando na praça',
          activity: 'play',
        },
        {
          from: 1020,
          to: 1260,
          x: 720,
          y: 680,
          label: 'com a família e amigos',
          activity: 'socialize',
        },
        {
          from: 1260,
          to: 1320,
          x: homePoint.x,
          y: homePoint.y,
          label: 'voltando para casa',
          activity: 'walk',
          homeTarget: true,
        },
        {
          from: 1320,
          to: 1440,
          x: homePoint.x,
          y: homePoint.y,
          label: 'dormindo em casa',
          activity: 'sleep',
          zone: 'home',
          interiorPosition: { x: 610, y: 360 },
        },
      ],
    };
  }

  private definitionNames(): Map<string, string> {
    return new Map(this.getAllDefinitions().map((definition) => [definition.id, definition.name]));
  }

  private recordEvent(event: LifeEvent): void {
    this.save.addLifeEvent(event);
  }
}

function scheduleAt(
  definition: NpcDefinition,
  minuteOfDay: number,
) {
  return (
    definition.schedule.find(
      (entry) => minuteOfDay >= entry.from && minuteOfDay < entry.to,
    ) ?? definition.schedule[0]
  );
}

function stageForAge(ageYears: number): LifeStage {
  if (ageYears < 16) return 'child';
  if (ageYears < 25) return 'young-adult';
  if (ageYears < 65) return 'adult';
  return 'elder';
}

function inferActivity(label: string): NpcActivity {
  const value = label.toLowerCase();
  if (value.includes('dorm')) return 'sleep';
  if (value.includes('pesc')) return 'fish';
  if (value.includes('brinc')) return 'play';
  if (value.includes('família')) return 'family';
  if (value.includes('convers') || value.includes('praça')) return 'socialize';
  if (value.includes('caminh') || value.includes('voltando') || value.includes('saindo')) return 'walk';
  if (value.includes('trabalh') || value.includes('forja') || value.includes('empório') || value.includes('taverna')) return 'work';
  return 'rest';
}

function compatibilityScore(a: string, b: string): number {
  return 45 + (stableHash(pairKey(a, b)) % 56);
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function chooseSharedResidence(a: string, b: string): string {
  const quality = (id: string) =>
    id === 'home' || id === 'fisher-home' ? 3 :
    id === 'inn' ? 2 :
    1;

  return quality(a) >= quality(b) ? a : b;
}

function blendColors(a: number, b: number): number {
  const channel = (color: number, shift: number) => (color >> shift) & 0xff;
  const r = Math.round((channel(a, 16) + channel(b, 16)) / 2);
  const g = Math.round((channel(a, 8) + channel(b, 8)) / 2);
  const blue = Math.round((channel(a, 0) + channel(b, 0)) / 2);
  return (r << 16) | (g << 8) | blue;
}
