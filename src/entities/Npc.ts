import Phaser from 'phaser';
import type { NpcDefinition, ScheduleEntry } from '../types';

export class Npc extends Phaser.GameObjects.Container {
  readonly definition: NpcDefinition;
  private phase = Math.random() * 100;

  constructor(scene: Phaser.Scene, definition: NpcDefinition) {
    super(scene, definition.x, definition.y);
    this.definition = definition;

    const shadow = scene.add.ellipse(0, 20, 32, 14, 0x000000, 0.18);
    const body = scene.add.circle(0, 4, 15, definition.color);
    const head = scene.add.circle(0, -13, 12, 0xf4c6a7);
    const icon = scene.add.text(0, -31, definition.emoji, {
      fontFamily: 'serif',
      fontSize: '16px',
    }).setOrigin(0.5);
    const label = scene.add.text(0, 38, definition.name, {
      fontFamily: 'system-ui',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#142014',
      backgroundColor: 'rgba(255,255,255,0.38)',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5);

    this.add([shadow, body, head, icon, label]);
    scene.add.existing(this);
    this.setDepth(this.y);
  }

  scheduleAt(minuteOfDay: number): ScheduleEntry {
    return this.definition.schedule.find(
      (entry) => minuteOfDay >= entry.from && minuteOfDay < entry.to,
    ) ?? this.definition.schedule[0];
  }

  updateRoutine(minuteOfDay: number, deltaSeconds: number): void {
    const target = this.scheduleAt(minuteOfDay);
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

    if (distance > 4) {
      const speed = 45;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
      this.x += Math.cos(angle) * speed * deltaSeconds;
      this.y += Math.sin(angle) * speed * deltaSeconds;
    }

    this.phase += deltaSeconds;
    this.y += Math.sin(this.phase * 4) * 0.02;
    this.setDepth(this.y);
  }
}
