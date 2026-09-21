import Phaser from 'phaser';
import type { Npc } from '../entities/Npc';
import type { SaveSystem } from './SaveSystem';

export class RelationshipSystem {
  private accumulator = 0;

  constructor(private readonly save: SaveSystem) {}

  update(npcs: Npc[], deltaSeconds: number, day: number): void {
    this.accumulator += deltaSeconds;
    if (this.accumulator < 8) return;
    this.accumulator = 0;

    for (let i = 0; i < npcs.length; i += 1) {
      for (let j = i + 1; j < npcs.length; j += 1) {
        const a = npcs[i];
        const b = npcs[j];

        const distance = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
        if (distance > 105) continue;

        const sociallyAvailable = ['socialize', 'rest', 'work'].includes(a.currentActivity)
          && ['socialize', 'rest', 'work'].includes(b.currentActivity);

        if (!sociallyAvailable) continue;

        const relationship = this.save.relationshipFor(a.definition.id, b.definition.id);
        relationship.interactions += 1;
        relationship.score = Math.min(100, relationship.score + 1);
        relationship.lastInteractionDay = day;

        this.shareKnowledge(a.definition.id, b.definition.id, day);
        this.shareKnowledge(b.definition.id, a.definition.id, day);
      }
    }

    this.save.persist();
  }

  private shareKnowledge(sourceId: string, targetId: string, day: number): void {
    const fact = this.save.mostImportantShareableFact(sourceId);
    if (!fact || this.save.knowsFact(targetId, fact.id)) return;

    this.save.addFact(targetId, {
      ...fact,
      source: sourceId,
      createdDay: day,
      importance: Math.max(1, fact.importance - 1),
    });
  }
}
