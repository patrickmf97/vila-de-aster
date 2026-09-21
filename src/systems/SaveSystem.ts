import type {
  GeneratedNpcData,
  LifeEvent,
  BrainDecisionLog,
  ConversationTurn,
  MemoryFact,
  NpcBrainState,
  NpcConversationState,
  NpcLifeState,
  NpcMemory,
  NpcRelationship,
  SaveData,
} from '../types';

const SAVE_KEY = 'vila-aster-memory-v2';

export class SaveSystem {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    const fallback: SaveData = {
      npcs: {},
      relationships: {},
      life: {},
      brains: {},
      brainLogs: [],
      conversations: {},
      generatedNpcs: [],
      lifeEvents: [],
      eventTriggered: false,
      day: 1,
      gameMinutes: 8 * 60,
    };

    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const npcs: Record<string, NpcMemory> = {};

      for (const [id, memory] of Object.entries(parsed.npcs ?? {})) {
        npcs[id] = {
          talks: memory.talks ?? 0,
          affinity: memory.affinity ?? 0,
          lastDay: memory.lastDay ?? 0,
          facts: Array.isArray(memory.facts) ? memory.facts : [],
        };
      }

      return {
        npcs,
        relationships: parsed.relationships ?? {},
        life: parsed.life ?? {},
        brains: parsed.brains ?? {},
        brainLogs: Array.isArray(parsed.brainLogs) ? parsed.brainLogs : [],
        conversations: parsed.conversations ?? {},
        generatedNpcs: Array.isArray(parsed.generatedNpcs) ? parsed.generatedNpcs : [],
        lifeEvents: Array.isArray(parsed.lifeEvents) ? parsed.lifeEvents : [],
        eventTriggered: parsed.eventTriggered ?? false,
        day: parsed.day ?? 1,
        gameMinutes: parsed.gameMinutes ?? 8 * 60,
        player: parsed.player,
      };
    } catch {
      return fallback;
    }
  }

  get snapshot(): SaveData {
    return this.data;
  }

  memoryFor(id: string): NpcMemory {
    if (!this.data.npcs[id]) {
      this.data.npcs[id] = {
        talks: 0,
        affinity: 0,
        lastDay: 0,
        facts: [],
      };
    }

    this.pruneExpiredFacts(id);
    return this.data.npcs[id];
  }

  lifeFor(id: string): NpcLifeState | undefined {
    return this.data.life[id];
  }

  setLife(id: string, state: NpcLifeState): void {
    this.data.life[id] = state;
  }

  brainFor(id: string): NpcBrainState | undefined {
    return this.data.brains[id];
  }

  setBrain(id: string, state: NpcBrainState): void {
    this.data.brains[id] = state;
  }

  addBrainLog(log: BrainDecisionLog): void {
    this.data.brainLogs.push(log);
    this.data.brainLogs = this.data.brainLogs.slice(-160);
  }

  conversationFor(id: string): NpcConversationState {
    if (!this.data.conversations[id]) {
      this.data.conversations[id] = {
        summary: '',
        turns: [],
      };
    }
    return this.data.conversations[id];
  }

  appendConversationTurn(id: string, turn: ConversationTurn): void {
    const conversation = this.conversationFor(id);
    conversation.turns.push(turn);
    conversation.turns = conversation.turns.slice(-8);
  }

  setConversationSummary(id: string, summary: string): void {
    this.conversationFor(id).summary = summary.slice(0, 900);
  }

  addGeneratedNpc(data: GeneratedNpcData): void {
    if (this.data.generatedNpcs.some((npc) => npc.id === data.id)) return;
    this.data.generatedNpcs.push(data);
  }

  addLifeEvent(event: LifeEvent): void {
    if (this.data.lifeEvents.some((existing) => existing.id === event.id)) return;
    this.data.lifeEvents.push(event);
    this.data.lifeEvents = this.data.lifeEvents.slice(-120);
  }

  addFact(npcId: string, fact: MemoryFact): boolean {
    const memory = this.memoryFor(npcId);
    if (memory.facts.some((existing) => existing.id === fact.id)) return false;

    memory.facts.push(fact);
    memory.facts.sort((a, b) => b.importance - a.importance || b.createdDay - a.createdDay);
    memory.facts = memory.facts.slice(0, 20);
    return true;
  }

  knowsFact(npcId: string, factId: string): boolean {
    return this.memoryFor(npcId).facts.some((fact) => fact.id === factId);
  }

  mostImportantShareableFact(npcId: string): MemoryFact | null {
    const facts = this.memoryFor(npcId).facts
      .filter((fact) => fact.importance >= 2)
      .sort((a, b) => b.importance - a.importance || b.createdDay - a.createdDay);

    return facts[0] ?? null;
  }

  relationshipFor(a: string, b: string): NpcRelationship {
    const key = relationshipKey(a, b);
    if (!this.data.relationships[key]) {
      this.data.relationships[key] = {
        score: 0,
        interactions: 0,
        lastInteractionDay: 0,
      };
    }
    return this.data.relationships[key];
  }

  totalTalks(): number {
    return Object.values(this.data.npcs).reduce((sum, memory) => sum + memory.talks, 0);
  }

  patch(patch: Partial<SaveData>): void {
    this.data = { ...this.data, ...patch };
  }

  persist(): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
  }

  reset(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  private pruneExpiredFacts(npcId: string): void {
    const memory = this.data.npcs[npcId];
    if (!memory) return;

    memory.facts = memory.facts.filter((fact) => {
      if (fact.expiresAfterDays === undefined) return true;
      return this.data.day - fact.createdDay <= fact.expiresAfterDays;
    });
  }
}

export function relationshipKey(a: string, b: string): string {
  return [a, b].sort().join('::');
}
