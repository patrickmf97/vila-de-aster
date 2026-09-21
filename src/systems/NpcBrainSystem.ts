import type {
  BrainAction,
  BrainDecisionLog,
  NpcActivity,
  NpcBrainState,
  NpcDefinition,
  NpcPersonality,
  Point,
  ScheduleEntry,
} from '../types';
import type { SaveSystem } from './SaveSystem';
import type { LifeSimulationSystem } from './LifeSimulationSystem';

const GAME_MINUTES_PER_REAL_SECOND = 5.2;
const DECISION_INTERVAL_MINUTES = 30;

interface Candidate {
  action: BrainAction;
  score: number;
  reasons: string[];
}

interface Intent {
  activity: NpcActivity;
  zone: string;
  target?: Point;
  label: string;
}

export class NpcBrainSystem {
  private lastLogCount = 0;

  constructor(
    private readonly save: SaveSystem,
    private readonly life: LifeSimulationSystem,
  ) {
    this.ensureBrains();
    this.lastLogCount = this.save.snapshot.brainLogs.length;
  }

  update(
    day: number,
    minuteOfDay: number,
    deltaSeconds: number,
  ): BrainDecisionLog[] {
    this.ensureBrains();

    const absoluteMinute = day * 1440 + minuteOfDay;
    const deltaGameMinutes =
      deltaSeconds * GAME_MINUTES_PER_REAL_SECOND;

    for (const definition of this.life.getAllDefinitions()) {
      const lifeState = this.life.getState(definition.id);
      const brain = this.save.brainFor(definition.id);
      if (!lifeState || !brain) continue;

      this.updateNeeds(
        definition,
        brain,
        lifeState.energy,
        lifeState.socialNeed,
        deltaGameMinutes,
      );

      this.updateLifeNeeds(
        definition,
        brain,
        deltaGameMinutes,
      );

      if (absoluteMinute >= brain.nextDecisionAt) {
        const decision = this.decide(
          definition,
          day,
          minuteOfDay,
        );

        brain.currentAction = decision.action;
        brain.score = decision.score;
        brain.reasons = decision.reasons;

        const intent = this.intentFor(
          definition,
          decision.action,
          minuteOfDay,
        );

        brain.currentActivity = intent.activity;
        brain.zone = intent.zone;
        brain.target = intent.target;
        brain.label = intent.label;
        brain.decidedAt = absoluteMinute;
        brain.nextDecisionAt =
          absoluteMinute + this.decisionDuration(decision.action);

        const candidates = this.scoreCandidates(
          definition,
          day,
          minuteOfDay,
        )
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((candidate) => ({
            action: candidate.action,
            score: round(candidate.score),
          }));

        this.save.addBrainLog({
          id:
            definition.id +
            ':' +
            day +
            ':' +
            Math.floor(minuteOfDay),
          npcId: definition.id,
          day,
          minute: Math.floor(minuteOfDay),
          action: decision.action,
          label: intent.label,
          score: round(decision.score),
          reasons: decision.reasons,
          candidates,
        });
      }

      lifeState.currentActivity = brain.currentActivity;
      lifeState.currentZone = brain.zone;
    }

    const newLogs =
      this.save.snapshot.brainLogs.slice(this.lastLogCount);
    this.lastLogCount = this.save.snapshot.brainLogs.length;

    if (newLogs.length) this.save.persist();
    return newLogs;
  }

  getBrain(npcId: string): NpcBrainState | undefined {
    return this.save.brainFor(npcId);
  }

  getRecentLogs(limit = 8): BrainDecisionLog[] {
    return this.save.snapshot.brainLogs.slice(-limit).reverse();
  }

  private ensureBrains(): void {
    for (const definition of this.life.getAllDefinitions()) {
      if (this.save.brainFor(definition.id)) continue;

      const personality = this.personalityFor(definition);
      const now =
        this.save.snapshot.day * 1440 +
        this.save.snapshot.gameMinutes;

      this.save.setBrain(definition.id, {
        npcId: definition.id,
        needs: {
          hunger: 20 + stableHash(definition.id + ':hunger') % 18,
          safety: 8 + stableHash(definition.id + ':safety') % 12,
          purpose: 18 + stableHash(definition.id + ':purpose') % 22,
          curiosity:
            Math.round(personality.curiosity * 0.35),
        },
        currentAction: 'follow-schedule',
        currentActivity: 'rest',
        zone: 'world',
        label: 'seguindo a rotina',
        score: 0,
        reasons: ['início da simulação'],
        decidedAt: now - DECISION_INTERVAL_MINUTES,
        nextDecisionAt: now,
      });
    }
  }

  private updateNeeds(
    definition: NpcDefinition,
    brain: NpcBrainState,
    energy: number,
    socialNeed: number,
    deltaMinutes: number,
  ): void {
    const action = brain.currentAction;

    brain.needs.hunger = clamp(
      brain.needs.hunger +
        (action === 'eat' ? -0.42 : 0.048) * deltaMinutes,
    );

    brain.needs.safety = clamp(
      brain.needs.safety +
        (
          action === 'investigate-river'
            ? 0.075
            : brain.zone !== 'world'
              ? -0.06
              : -0.008
        ) * deltaMinutes,
    );

    brain.needs.purpose = clamp(
      brain.needs.purpose +
        (
          action === 'work' ||
          action === 'fish' ||
          action === 'investigate-river'
            ? -0.09
            : 0.018
        ) * deltaMinutes,
    );

    const knowsRiver =
      this.save.knowsFact(definition.id, 'river-echo');

    brain.needs.curiosity = clamp(
      brain.needs.curiosity +
        (
          action === 'investigate-river'
            ? -0.15
            : knowsRiver
              ? 0.032
              : 0.004
        ) * deltaMinutes,
    );

    // Keep these references intentional: energy/social live in LifeState,
    // while the brain reads them when scoring choices.
    void energy;
    void socialNeed;
  }

  private updateLifeNeeds(
    definition: NpcDefinition,
    brain: NpcBrainState,
    deltaMinutes: number,
  ): void {
    const lifeState = this.life.getState(definition.id);
    if (!lifeState) return;

    const action = brain.currentAction;

    const energyDelta =
      action === 'sleep'
        ? 0.22
        : action === 'rest'
          ? 0.11
          : action === 'family'
            ? 0.035
            : -0.038;

    lifeState.energy = clamp(
      lifeState.energy + energyDelta * deltaMinutes,
    );

    const socialDelta =
      action === 'socialize'
        ? -0.28
        : action === 'family'
          ? -0.22
          : 0.026;

    lifeState.socialNeed = clamp(
      lifeState.socialNeed + socialDelta * deltaMinutes,
    );
  }

  private decide(
    definition: NpcDefinition,
    day: number,
    minuteOfDay: number,
  ): Candidate {
    const candidates =
      this.scoreCandidates(definition, day, minuteOfDay)
        .sort((a, b) => b.score - a.score);

    return candidates[0] ?? {
      action: 'follow-schedule',
      score: 0,
      reasons: ['nenhuma necessidade urgente'],
    };
  }

  private scoreCandidates(
    definition: NpcDefinition,
    day: number,
    minuteOfDay: number,
  ): Candidate[] {
    const lifeState = this.life.getState(definition.id);
    const brain = this.save.brainFor(definition.id);
    if (!lifeState || !brain) return [];

    const personality = this.personalityFor(definition);
    const schedule = scheduleAt(definition, minuteOfDay);
    const scheduledActivity =
      schedule.activity ?? inferActivity(schedule.label);
    const child = lifeState.lifeStage === 'child';
    const economy = this.save.economyFor(definition.id);
    const moneyPressure = economy
      ? Math.max(0, Math.min(34, 32 - economy.coins))
      : 0;
    const night =
      minuteOfDay >= 1320 || minuteOfDay < 420;
    const evening =
      minuteOfDay >= 1020 && minuteOfDay < 1320;

    const candidates: Candidate[] = [];

    candidates.push(
      this.candidate(
        'follow-schedule',
        42 +
          personality.discipline * 0.42 +
          (scheduledActivity === 'work' ? 14 : 0) +
          this.jitter(definition.id, day, 'follow-schedule'),
        [
          'a rotina conhecida oferece estabilidade',
          personality.discipline >= 75
            ? 'é muito disciplinado'
            : 'mantém hábitos consistentes',
        ],
      ),
    );

    candidates.push(
      this.candidate(
        'sleep',
        12 +
          (100 - lifeState.energy) * 1.38 +
          (night ? 68 : 0) +
          brain.needs.safety * 0.18 +
          this.jitter(definition.id, day, 'sleep'),
        [
          lifeState.energy < 45
            ? 'energia está baixa'
            : 'quer preservar energia',
          night
            ? 'é horário natural de dormir'
            : 'ainda não é noite',
        ],
      ),
    );

    candidates.push(
      this.candidate(
        'eat',
        8 +
          brain.needs.hunger * 1.34 +
          (brain.needs.hunger >= 72 ? 38 : 0) +
          this.jitter(definition.id, day, 'eat'),
        [
          brain.needs.hunger >= 70
            ? 'a fome está alta'
            : 'a fome começou a incomodar',
        ],
      ),
    );

    candidates.push(
      this.candidate(
        'rest',
        10 +
          (100 - lifeState.energy) * 0.86 +
          brain.needs.safety * 0.28 +
          this.jitter(definition.id, day, 'rest'),
        [
          lifeState.energy < 55
            ? 'precisa recuperar energia'
            : 'um descanso evitaria desgaste',
        ],
      ),
    );

    candidates.push(
      this.candidate(
        'socialize',
        10 +
          lifeState.socialNeed * 1.02 +
          personality.sociability * 0.48 +
          (child ? 18 : 0) +
          this.jitter(definition.id, day, 'socialize'),
        [
          lifeState.socialNeed >= 55
            ? 'está sentindo falta de companhia'
            : 'gosta de manter vínculos',
          personality.sociability >= 75
            ? 'é naturalmente sociável'
            : 'aceita alguma interação social',
        ],
      ),
    );

    if (
      lifeState.partnerId ||
      lifeState.children.length > 0 ||
      lifeState.parents.length > 0
    ) {
      candidates.push(
        this.candidate(
          'family',
          16 +
            lifeState.socialNeed * 0.56 +
            personality.family * 0.82 +
            lifeState.familyDesire * 0.26 +
            (evening ? 28 : 0) +
            this.jitter(definition.id, day, 'family'),
          [
            lifeState.children.length
              ? 'quer passar tempo com os filhos'
              : lifeState.partnerId
                ? 'quer estar perto do parceiro'
                : 'valoriza os laços familiares',
            evening
              ? 'o fim do dia favorece tempo em família'
              : 'a família continua importante durante o dia',
          ],
        ),
      );
    }

    if (!child) {
      const workScore =
        18 +
        personality.discipline * 0.72 +
        brain.needs.purpose * 0.82 +
        moneyPressure +
        (scheduledActivity === 'work' ||
        scheduledActivity === 'fish'
          ? 42
          : 0) -
        (100 - lifeState.energy) * 0.22 -
        brain.needs.hunger * 0.12 +
        this.jitter(definition.id, day, 'work');

      candidates.push(
        this.candidate(
          definition.role === 'Pescador' ? 'fish' : 'work',
          workScore,
          [
            brain.needs.purpose >= 45
              ? 'quer sentir que o dia foi produtivo'
              : 'o trabalho mantém sua rotina',
            economy && economy.coins < 20
              ? 'está com poucas moedas e precisa reforçar a renda'
              : personality.discipline >= 75
                ? 'tem forte senso de responsabilidade'
                : 'leva o trabalho a sério',
          ],
        ),
      );
    }

    if (
      !child &&
      this.save.knowsFact(definition.id, 'river-echo')
    ) {
      candidates.push(
        this.candidate(
          'investigate-river',
          12 +
            personality.curiosity * 0.78 +
            brain.needs.curiosity * 0.88 +
            personality.courage * 0.38 -
            brain.needs.safety * 0.24 -
            (100 - lifeState.energy) * 0.18 +
            this.jitter(
              definition.id,
              day,
              'investigate-river',
            ),
          [
            'sabe que algo estranho aconteceu no rio',
            personality.curiosity >= 75
              ? 'a curiosidade é difícil de ignorar'
              : 'a informação ainda incomoda',
            personality.courage >= 75
              ? 'não costuma evitar riscos'
              : 'avalia o risco antes de agir',
          ],
        ),
      );
    }

    return candidates;
  }

  private intentFor(
    definition: NpcDefinition,
    action: BrainAction,
    minuteOfDay: number,
  ): Intent {
    const lifeState = this.life.getState(definition.id);
    const residenceId =
      lifeState?.residenceId ?? definition.life.residenceId;
    const residenceDoor =
      this.life.getResidenceDoor(definition.id);
    const schedule = scheduleAt(definition, minuteOfDay);

    if (action === 'follow-schedule') {
      const activity =
        schedule.activity ?? inferActivity(schedule.label);

      if (
        schedule.zone === 'home' ||
        activity === 'sleep'
      ) {
        return {
          activity,
          zone: residenceId,
          label: schedule.label,
        };
      }

      return {
        activity,
        zone: schedule.zone ?? 'world',
        target:
          schedule.homeTarget && residenceDoor
            ? residenceDoor
            : { x: schedule.x, y: schedule.y },
        label: schedule.label,
      };
    }

    if (action === 'sleep') {
      return {
        activity: 'sleep',
        zone: residenceId,
        label: 'dormindo porque decidiu descansar',
      };
    }

    if (action === 'eat') {
      const eatAtHome =
        minuteOfDay < 600 ||
        minuteOfDay >= 1200 ||
        brainUrgency(this.save.brainFor(definition.id), 'hunger') >= 90;

      return {
        activity: 'eat',
        zone: eatAtHome ? residenceId : 'inn',
        label: eatAtHome
          ? 'comendo em casa'
          : 'fazendo uma refeição na taverna',
      };
    }

    if (action === 'rest') {
      return {
        activity: 'rest',
        zone: residenceId,
        label: 'descansando em casa',
      };
    }

    if (action === 'family') {
      return {
        activity: 'family',
        zone: residenceId,
        label: 'passando tempo com a família',
      };
    }

    if (action === 'socialize') {
      const offset =
        (stableHash(definition.id) % 80) - 40;
      return {
        activity: 'socialize',
        zone: 'world',
        target: {
          x: 700 + offset,
          y: 650 + Math.round(offset * 0.35),
        },
        label: 'procurando companhia na praça',
      };
    }

    if (action === 'investigate-river') {
      return {
        activity: 'investigate',
        zone: 'world',
        target: {
          x: 1190 + (stableHash(definition.id) % 35),
          y: 820,
        },
        label: 'investigando sinais perto do rio',
      };
    }

    const workSchedule =
      definition.schedule.find((entry) => {
        const activity =
          entry.activity ?? inferActivity(entry.label);
        return action === 'fish'
          ? activity === 'fish'
          : activity === 'work';
      }) ?? schedule;

    return {
      activity: action === 'fish' ? 'fish' : 'work',
      zone: 'world',
      target: {
        x: workSchedule.x,
        y: workSchedule.y,
      },
      label:
        action === 'fish'
          ? 'decidiu ir pescar'
          : 'decidiu trabalhar',
    };
  }

  private personalityFor(
    definition: NpcDefinition,
  ): NpcPersonality {
    if (definition.brain?.personality) {
      return definition.brain.personality;
    }

    const h = stableHash(definition.id);
    return {
      curiosity: 45 + (h % 46),
      empathy: 45 + ((h >> 2) % 46),
      discipline: 45 + ((h >> 4) % 46),
      sociability: definition.life.sociability,
      family: definition.life.familyDesire,
      courage: 45 + ((h >> 6) % 46),
    };
  }

  private decisionDuration(action: BrainAction): number {
    return {
      'follow-schedule': 40,
      sleep: 60,
      eat: 30,
      rest: 35,
      socialize: 45,
      family: 55,
      work: 60,
      fish: 60,
      'investigate-river': 50,
    }[action];
  }

  private jitter(
    npcId: string,
    day: number,
    action: BrainAction,
  ): number {
    return (
      stableHash(npcId + ':' + day + ':' + action) % 11
    ) - 5;
  }

  private candidate(
    action: BrainAction,
    score: number,
    reasons: string[],
  ): Candidate {
    return {
      action,
      score: round(score),
      reasons,
    };
  }
}

function scheduleAt(
  definition: NpcDefinition,
  minuteOfDay: number,
): ScheduleEntry {
  return (
    definition.schedule.find(
      (entry) =>
        minuteOfDay >= entry.from &&
        minuteOfDay < entry.to,
    ) ?? definition.schedule[0]
  );
}

function inferActivity(label: string): NpcActivity {
  const value = label.toLowerCase();
  if (value.includes('dorm')) return 'sleep';
  if (value.includes('pesc')) return 'fish';
  if (value.includes('brinc')) return 'play';
  if (value.includes('família')) return 'family';
  if (
    value.includes('convers') ||
    value.includes('praça')
  ) {
    return 'socialize';
  }
  if (
    value.includes('caminh') ||
    value.includes('voltando') ||
    value.includes('saindo') ||
    value.includes('indo')
  ) {
    return 'walk';
  }
  if (
    value.includes('trabalh') ||
    value.includes('forja') ||
    value.includes('empório') ||
    value.includes('taverna')
  ) {
    return 'work';
  }
  return 'rest';
}

function brainUrgency(
  brain: NpcBrainState | undefined,
  key: keyof NpcBrainState['needs'],
): number {
  return brain?.needs[key] ?? 0;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}
