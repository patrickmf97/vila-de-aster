import type {
  ConstructionProject,
  EconomyEvent,
  NpcDefinition,
  NpcEconomyState,
  ResourceKey,
  ResourceStock,
  SettlementBuilding,
} from '../types';
import {
  BASE_RESOURCE_PRICES,
  HOUSE_COST,
  economyProfileFor,
  residenceCapacity,
  resourceTarget,
  settlementLots,
  startingCoinsFor,
} from '../data/economy';
import type { SaveSystem } from './SaveSystem';
import type { LifeSimulationSystem } from './LifeSimulationSystem';

const GAME_MINUTES_PER_REAL_SECOND = 5.2;
const PRODUCTIVE_DAY_MINUTES = 360;
const RESOURCE_KEYS: ResourceKey[] = [
  'food',
  'wood',
  'stone',
  'metal',
  'goods',
];

export class EconomySystem {
  private lastEventCount = 0;

  constructor(
    private readonly save: SaveSystem,
    private readonly life: LifeSimulationSystem,
  ) {
    this.ensureEconomyProfiles();
    this.lastEventCount = this.save.snapshot.economyEvents.length;
  }

  update(
    day: number,
    _minuteOfDay: number,
    deltaSeconds: number,
  ): EconomyEvent[] {
    this.ensureEconomyProfiles();

    const deltaGameMinutes =
      deltaSeconds * GAME_MINUTES_PER_REAL_SECOND;

    if (deltaGameMinutes > 0) {
      this.accumulateWork(deltaGameMinutes);
    }

    this.processDaysUntil(day);

    const events = this.save.snapshot.economyEvents.slice(
      this.lastEventCount,
    );
    this.lastEventCount =
      this.save.snapshot.economyEvents.length;

    if (events.length) this.save.persist();
    return events;
  }

  getNpcState(npcId: string): NpcEconomyState | undefined {
    return this.save.economyFor(npcId);
  }

  getRecentEvents(limit = 6): EconomyEvent[] {
    return this.save.snapshot.economyEvents
      .slice(-limit)
      .reverse();
  }

  getSummaryLines(): string[] {
    const village = this.save.villageEconomy;
    const activeProject =
      this.save.snapshot.constructionProjects.find(
        (project) => project.status === 'building',
      );

    const resources =
      '📦 Comida ' +
      round(village.resources.food) +
      ' • Madeira ' +
      round(village.resources.wood) +
      ' • Pedra ' +
      round(village.resources.stone) +
      ' • Metal ' +
      round(village.resources.metal) +
      ' • Merc. ' +
      round(village.resources.goods);

    const prices =
      '🏷️ Preços: 🍞 ' +
      village.prices.food.toFixed(1) +
      ' • 🪵 ' +
      village.prices.wood.toFixed(1) +
      ' • 🪨 ' +
      village.prices.stone.toFixed(1) +
      ' • ⛓️ ' +
      village.prices.metal.toFixed(1) +
      ' • 📦 ' +
      village.prices.goods.toFixed(1);

    const lines = [
      '💰 Tesouro: ' +
        village.treasury +
        ' moedas • Prosperidade: ' +
        Math.round(village.prosperity) +
        '/100',
      resources,
      prices,
    ];

    if (activeProject) {
      lines.push(
        '🏗️ ' +
          activeProject.name +
          ' • ' +
          Math.round(activeProject.progress) +
          '%',
      );
    } else {
      lines.push(
        '🏠 ' +
          this.save.snapshot.settlementBuildings.length +
          ' casa(s) construída(s) pela simulação',
      );
    }

    const recent = this.getRecentEvents(3);
    for (const event of recent) {
      lines.push('• Dia ' + event.day + ': ' + event.text);
    }

    return lines;
  }

  private ensureEconomyProfiles(): void {
    for (const definition of this.life.getAllDefinitions()) {
      if (this.save.economyFor(definition.id)) continue;

      this.save.setEconomy(
        definition.id,
        this.createEconomyState(definition),
      );
    }
  }

  private createEconomyState(
    definition: NpcDefinition,
  ): NpcEconomyState {
    return {
      npcId: definition.id,
      coins: startingCoinsFor(definition),
      earnedTotal: 0,
      spentTotal: 0,
      workMinutesToday: 0,
      lastIncome: 0,
      lastExpenses: 0,
      lastProcessedDay: this.save.snapshot.day,
    };
  }

  private accumulateWork(deltaGameMinutes: number): void {
    for (const definition of this.life.getAllDefinitions()) {
      const lifeState = this.life.getState(definition.id);
      const economy = this.save.economyFor(definition.id);
      const brain = this.save.brainFor(definition.id);

      if (!lifeState || !economy) continue;
      if (lifeState.lifeStage === 'child') continue;

      const productive =
        brain?.currentAction === 'work' ||
        brain?.currentAction === 'fish' ||
        lifeState.currentActivity === 'work' ||
        lifeState.currentActivity === 'fish';

      if (!productive) continue;

      economy.workMinutesToday = Math.min(
        720,
        economy.workMinutesToday + deltaGameMinutes,
      );
    }
  }

  private processDaysUntil(day: number): void {
    const village = this.save.villageEconomy;

    for (
      let targetDay = village.lastProcessedDay + 1;
      targetDay <= day;
      targetDay += 1
    ) {
      this.processDay(targetDay);
    }
  }

  private processDay(day: number): void {
    const definitions = this.life.getAllDefinitions();

    this.processIncomeAndProduction(definitions, day);
    this.processHouseholdExpenses(definitions, day);
    this.consumeVillageResources(definitions, day);
    this.updateMarketPrices(definitions.length);
    this.progressConstruction(day);
    this.tryStartConstruction(definitions, day);
    this.updateProsperity(definitions);

    this.save.villageEconomy.lastProcessedDay = day;

    for (const economy of Object.values(
      this.save.snapshot.economy,
    )) {
      economy.lastProcessedDay = day;
      economy.workMinutesToday = 0;
    }
  }

  private processIncomeAndProduction(
    definitions: NpcDefinition[],
    day: number,
  ): void {
    const village = this.save.villageEconomy;

    for (const definition of definitions) {
      const economy = this.save.economyFor(definition.id);
      const life = this.life.getState(definition.id);
      if (!economy || !life) continue;

      const profile = economyProfileFor(definition);
      const workFactor =
        life.lifeStage === 'child'
          ? 0
          : clamp(
              economy.workMinutesToday /
                PRODUCTIVE_DAY_MINUTES,
              0,
              1.15,
            );

      const gross = Math.round(
        profile.baseDailyIncome * workFactor,
      );
      const tax = Math.round(gross * 0.08);
      const net = Math.max(0, gross - tax);

      economy.coins += net;
      economy.earnedTotal += net;
      economy.lastIncome = net;
      village.treasury += tax;

      for (const key of RESOURCE_KEYS) {
        const amount = profile.produces[key] ?? 0;
        if (!amount) continue;

        village.resources[key] +=
          Math.round(amount * workFactor * 10) / 10;
      }

      if (net > 0) {
        this.save.addEconomyEvent({
          id:
            'income:' +
            definition.id +
            ':' +
            day,
          day,
          type: 'income',
          npcIds: [definition.id],
          text:
            definition.name +
            ' recebeu ' +
            net +
            ' moedas pelo trabalho do dia.',
        });
      }
    }
  }

  private processHouseholdExpenses(
    definitions: NpcDefinition[],
    day: number,
  ): void {
    const byResidence = new Map<string, NpcDefinition[]>();

    for (const definition of definitions) {
      const residence =
        this.life.getState(definition.id)?.residenceId;
      if (!residence) continue;

      const group = byResidence.get(residence) ?? [];
      group.push(definition);
      byResidence.set(residence, group);
    }

    for (const members of byResidence.values()) {
      const adults = members.filter(
        (definition) =>
          this.life.getState(definition.id)?.lifeStage !==
          'child',
      );

      const totalExpense = members.reduce(
        (sum, definition) =>
          sum +
          economyProfileFor(definition).personalDailyCost +
          this.save.villageEconomy.prices.food * 0.45,
        0,
      );

      if (!adults.length) continue;

      let remaining = Math.max(
        0,
        Math.round(totalExpense),
      );

      const payers = adults
        .map((definition) => ({
          definition,
          economy: this.save.economyFor(definition.id),
        }))
        .filter(
          (
            entry,
          ): entry is {
            definition: NpcDefinition;
            economy: NpcEconomyState;
          } => !!entry.economy,
        )
        .sort((a, b) => b.economy.coins - a.economy.coins);

      if (!payers.length) continue;

      const fairShare = Math.ceil(
        remaining / payers.length,
      );

      for (const payer of payers) {
        const payment = Math.min(
          payer.economy.coins,
          fairShare,
          remaining,
        );

        payer.economy.coins -= payment;
        payer.economy.spentTotal += payment;
        payer.economy.lastExpenses = payment;
        remaining -= payment;
      }

      if (remaining > 0) {
        for (const payer of payers) {
          if (remaining <= 0) break;

          const extra = Math.min(
            payer.economy.coins,
            remaining,
          );
          payer.economy.coins -= extra;
          payer.economy.spentTotal += extra;
          payer.economy.lastExpenses += extra;
          remaining -= extra;
        }
      }

      if (remaining > 0) {
        this.save.villageEconomy.prosperity = clamp(
          this.save.villageEconomy.prosperity - 3,
          0,
          100,
        );

        for (const member of members) {
          const brain = this.save.brainFor(member.id);
          if (brain) {
            brain.needs.hunger = clamp(
              brain.needs.hunger + 12,
              0,
              100,
            );
          }
        }

        this.save.addEconomyEvent({
          id:
            'household-shortfall:' +
            members.map((member) => member.id).join('-') +
            ':' +
            day,
          day,
          type: 'expense',
          npcIds: members.map((member) => member.id),
          text:
            'Uma família não conseguiu cobrir todas as despesas do dia.',
        });
      }
    }
  }

  private consumeVillageResources(
    definitions: NpcDefinition[],
    day: number,
  ): void {
    const village = this.save.villageEconomy;
    const foodNeeded =
      Math.round(definitions.length * 1.15 * 10) / 10;
    const goodsNeeded =
      Math.round(definitions.length * 0.22 * 10) / 10;

    const foodShortfall = Math.max(
      0,
      foodNeeded - village.resources.food,
    );

    village.resources.food = Math.max(
      0,
      village.resources.food - foodNeeded,
    );
    village.resources.goods = Math.max(
      0,
      village.resources.goods - goodsNeeded,
    );

    if (foodShortfall > 0) {
      village.prosperity = clamp(
        village.prosperity - 8,
        0,
        100,
      );

      for (const definition of definitions) {
        const brain = this.save.brainFor(definition.id);
        if (brain) {
          brain.needs.hunger = clamp(
            brain.needs.hunger + 22,
            0,
            100,
          );
        }
      }

      this.save.addEconomyEvent({
        id: 'food-shortage:' + day,
        day,
        type: 'shortage',
        npcIds: definitions.map(
          (definition) => definition.id,
        ),
        text:
          'O estoque de comida não foi suficiente para toda a vila.',
      });
    }
  }

  private updateMarketPrices(population: number): void {
    const village = this.save.villageEconomy;

    for (const key of RESOURCE_KEYS) {
      const target = resourceTarget(key, population);
      const stock = Math.max(1, village.resources[key]);
      const pressure = clamp(
        target / stock,
        0.65,
        2.5,
      );

      village.prices[key] =
        Math.round(
          BASE_RESOURCE_PRICES[key] *
            pressure *
            10,
        ) / 10;
    }
  }

  private progressConstruction(day: number): void {
    const projects =
      this.save.snapshot.constructionProjects.filter(
        (project) => project.status === 'building',
      );

    for (const project of projects) {
      const bram = this.save.economyFor('bram');
      const bramWorked =
        (bram?.lastIncome ?? 0) > 0;

      project.progress = Math.min(
        100,
        project.progress + (bramWorked ? 30 : 22),
      );

      if (project.progress >= 100) {
        this.completeConstruction(project, day);
      } else {
        this.save.addEconomyEvent({
          id:
            'construction-progress:' +
            project.id +
            ':' +
            day,
          day,
          type: 'construction-progress',
          npcIds: project.ownerNpcIds,
          text:
            project.name +
            ' chegou a ' +
            Math.round(project.progress) +
            '% da construção.',
        });
      }
    }
  }

  private tryStartConstruction(
    definitions: NpcDefinition[],
    day: number,
  ): void {
    const active =
      this.save.snapshot.constructionProjects.some(
        (project) => project.status === 'building',
      );

    if (active) return;

    const usedLots = new Set([
      ...this.save.snapshot.constructionProjects.map(
        (project) => project.lotId,
      ),
      ...this.save.snapshot.settlementBuildings.map(
        (building) => building.lotId,
      ),
    ]);

    const lot = settlementLots.find(
      (entry) => !usedLots.has(entry.id),
    );
    if (!lot) return;

    const owners = this.findHousingNeed(definitions, day);
    if (!owners.length) return;

    if (!this.canAffordConstruction(owners)) return;

    this.commitConstructionCost(owners);

    const ownerNames = owners
      .map(
        (id) =>
          definitions.find(
            (definition) => definition.id === id,
          )?.name,
      )
      .filter((name): name is string => !!name);

    const name =
      ownerNames.length > 0
        ? 'Casa de ' +
          ownerNames.slice(0, 2).join(' e ')
        : 'Nova Casa de Aster';

    const project: ConstructionProject = {
      id: 'house-project:' + lot.id + ':' + day,
      type: 'house',
      lotId: lot.id,
      name,
      ownerNpcIds: owners,
      status: 'building',
      startedDay: day,
      progress: 8,
      costCoins: HOUSE_COST.coins,
      resourcesRequired: {
        ...HOUSE_COST.resources,
      },
    };

    this.save.addConstructionProject(project);
    this.save.addEconomyEvent({
      id: 'construction-start:' + project.id,
      day,
      type: 'construction-start',
      npcIds: owners,
      text:
        name +
        ' começou a ser construída em ' +
        lot.label +
        '.',
    });
  }

  private findHousingNeed(
    definitions: NpcDefinition[],
    day: number,
  ): string[] {
    const byResidence = new Map<string, string[]>();

    for (const definition of definitions) {
      const state = this.life.getState(definition.id);
      if (!state) continue;

      const group =
        byResidence.get(state.residenceId) ?? [];
      group.push(definition.id);
      byResidence.set(state.residenceId, group);
    }

    for (const [residenceId, members] of byResidence) {
      const dynamic =
        this.save.snapshot.settlementBuildings.some(
          (building) =>
            building.residenceId === residenceId,
        );

      const capacity = dynamic
        ? 4
        : residenceCapacity[residenceId] ?? 3;

      if (members.length > capacity) {
        return members;
      }

      if (
        ['smith', 'shop', 'inn'].includes(
          residenceId,
        ) &&
        members.length >= 2 &&
        members.some(
          (id) =>
            this.life.getState(id)
              ?.relationshipStatus === 'married',
        )
      ) {
        return members;
      }
    }

    if (
      definitions.length >= 6 &&
      day >= 4
    ) {
      const growingFamily = Array.from(
        byResidence.values(),
      ).find((members) =>
        members.some(
          (id) =>
            (this.life.getState(id)?.children.length ??
              0) > 0,
        ),
      );

      if (growingFamily && growingFamily.length >= 3) {
        return growingFamily;
      }
    }

    return [];
  }

  private canAffordConstruction(
    owners: string[],
  ): boolean {
    const village = this.save.villageEconomy;

    for (const [key, amount] of Object.entries(
      HOUSE_COST.resources,
    ) as Array<[ResourceKey, number]>) {
      if (village.resources[key] < amount) {
        return false;
      }
    }

    const householdCoins = owners.reduce(
      (sum, id) =>
        sum + (this.save.economyFor(id)?.coins ?? 0),
      0,
    );

    return (
      householdCoins + village.treasury >=
      HOUSE_COST.coins
    );
  }

  private commitConstructionCost(
    owners: string[],
  ): void {
    const village = this.save.villageEconomy;

    for (const [key, amount] of Object.entries(
      HOUSE_COST.resources,
    ) as Array<[ResourceKey, number]>) {
      village.resources[key] = Math.max(
        0,
        village.resources[key] - amount,
      );
    }

    const householdTarget = Math.round(
      HOUSE_COST.coins * 0.55,
    );
    let householdRemaining = householdTarget;

    const ownerEconomies = owners
      .map((id) => this.save.economyFor(id))
      .filter(
        (
          economy,
        ): economy is NpcEconomyState => !!economy,
      )
      .sort((a, b) => b.coins - a.coins);

    for (const economy of ownerEconomies) {
      if (householdRemaining <= 0) break;

      const payment = Math.min(
        economy.coins,
        householdRemaining,
      );
      economy.coins -= payment;
      economy.spentTotal += payment;
      householdRemaining -= payment;
    }

    const paidByHousehold =
      householdTarget - householdRemaining;
    const publicCost =
      HOUSE_COST.coins - paidByHousehold;

    village.treasury = Math.max(
      0,
      village.treasury - publicCost,
    );
  }

  private completeConstruction(
    project: ConstructionProject,
    day: number,
  ): void {
    const lot = settlementLots.find(
      (entry) => entry.id === project.lotId,
    );
    if (!lot) return;

    const seed = stableHash(project.id);

    const building: SettlementBuilding = {
      id: 'building:' + project.lotId,
      residenceId:
        'settlement-home:' + project.lotId,
      lotId: project.lotId,
      name: project.name,
      ownerNpcIds: [...project.ownerNpcIds],
      x: lot.x + 10,
      y: lot.y + 8,
      w: Math.min(225, lot.w - 20),
      h: Math.min(168, lot.h - 16),
      roof: roofColor(seed),
      wall: 0xd9c99d,
      sign: '🏠',
      completedDay: day,
    };

    this.save.addSettlementBuilding(building);

    for (const id of project.ownerNpcIds) {
      const life = this.life.getState(id);
      if (!life) continue;

      life.residenceId = building.residenceId;

      this.save.addFact(id, {
        id: 'new-home:' + building.id,
        text:
          'Mudou-se para ' +
          building.name +
          ', uma casa construída durante a expansão de Aster.',
        importance: 4,
        createdDay: day,
        source: id,
      });
    }

    project.status = 'completed';
    project.progress = 100;
    project.completionDay = day;

    this.save.villageEconomy.prosperity = clamp(
      this.save.villageEconomy.prosperity + 7,
      0,
      100,
    );

    this.save.addEconomyEvent({
      id: 'construction-complete:' + project.id,
      day,
      type: 'construction-complete',
      npcIds: project.ownerNpcIds,
      text:
        project.name +
        ' foi concluída. Aster ganhou uma nova residência.',
    });
  }

  private updateProsperity(
    definitions: NpcDefinition[],
  ): void {
    const village = this.save.villageEconomy;

    const averageResourceHealth =
      RESOURCE_KEYS.reduce((sum, key) => {
        const target = resourceTarget(
          key,
          definitions.length,
        );
        return (
          sum +
          clamp(
            village.resources[key] / target,
            0,
            1.4,
          )
        );
      }, 0) / RESOURCE_KEYS.length;

    const workingAdults = definitions.filter(
      (definition) => {
        const life = this.life.getState(definition.id);
        const economy =
          this.save.economyFor(definition.id);

        return (
          life?.lifeStage !== 'child' &&
          (economy?.lastIncome ?? 0) > 0
        );
      },
    ).length;

    const adults = Math.max(
      1,
      definitions.filter(
        (definition) =>
          this.life.getState(definition.id)
            ?.lifeStage !== 'child',
      ).length,
    );

    const employment = workingAdults / adults;

    const target =
      averageResourceHealth * 55 +
      employment * 35 +
      Math.min(10, village.treasury / 20);

    village.prosperity =
      Math.round(
        clamp(
          village.prosperity * 0.65 +
            target * 0.35,
          0,
          100,
        ) * 10,
      ) / 10;
  }
}

function roofColor(seed: number): number {
  const palette = [
    0x8b5d52,
    0x52708b,
    0x657c4f,
    0x765d8c,
    0x8a7246,
  ];
  return palette[seed % palette.length]!;
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.max(min, Math.min(max, value));
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
