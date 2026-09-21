import type { SaveSystem } from './SaveSystem';

export class EventSystem {
  constructor(private readonly save: SaveSystem) {}

  shouldTriggerRiverEcho(): boolean {
    return !this.save.snapshot.eventTriggered && this.save.totalTalks() >= 4;
  }

  triggerRiverEcho(): void {
    this.save.patch({ eventTriggered: true });
    this.save.persist();
  }

  get riverEchoActive(): boolean {
    return this.save.snapshot.eventTriggered;
  }
}
