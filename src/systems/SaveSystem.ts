import type { NpcMemory, SaveData } from '../types';

const SAVE_KEY = 'vila-aster-memory-v2';

export class SaveSystem {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return { npcs: {}, eventTriggered: false, day: 1, gameMinutes: 8 * 60 };
      }
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        npcs: parsed.npcs ?? {},
        eventTriggered: parsed.eventTriggered ?? false,
        day: parsed.day ?? 1,
        gameMinutes: parsed.gameMinutes ?? 8 * 60,
        player: parsed.player,
      };
    } catch {
      return { npcs: {}, eventTriggered: false, day: 1, gameMinutes: 8 * 60 };
    }
  }

  get snapshot(): SaveData {
    return this.data;
  }

  memoryFor(id: string): NpcMemory {
    if (!this.data.npcs[id]) {
      this.data.npcs[id] = { talks: 0, affinity: 0, lastDay: 0 };
    }
    return this.data.npcs[id];
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
}
