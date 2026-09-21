import Phaser from 'phaser';
import { INTERIOR_SIZE } from '../data/interiors';
import type { InteriorDefinition, Rect } from '../types';

export class InteriorRenderer {
  readonly collisionRects: Rect[];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly definition: InteriorDefinition,
  ) {
    this.collisionRects = [
      { x: 0, y: 0, w: INTERIOR_SIZE.width, h: 34 },
      { x: 0, y: 0, w: 34, h: INTERIOR_SIZE.height },
      { x: INTERIOR_SIZE.width - 34, y: 0, w: 34, h: INTERIOR_SIZE.height },
      { x: 0, y: INTERIOR_SIZE.height - 34, w: 350, h: 34 },
      { x: 470, y: INTERIOR_SIZE.height - 34, w: 350, h: 34 },
      ...definition.objects
        .filter((object) => object.solid)
        .map((object) => ({ x: object.x, y: object.y, w: object.w, h: object.h })),
    ];
  }

  create(): void {
    const g = this.scene.add.graphics().setDepth(-1000);

    g.fillStyle(this.definition.wall, 1);
    g.fillRect(0, 0, INTERIOR_SIZE.width, INTERIOR_SIZE.height);

    g.fillStyle(this.definition.floor, 1);
    g.fillRect(34, 34, INTERIOR_SIZE.width - 68, INTERIOR_SIZE.height - 68);

    g.lineStyle(2, 0x000000, 0.08);
    for (let y = 50; y < INTERIOR_SIZE.height - 35; y += 34) {
      g.lineBetween(34, y, INTERIOR_SIZE.width - 34, y);
    }
    for (let x = 55; x < INTERIOR_SIZE.width - 34; x += 64) {
      g.lineBetween(x, 34, x, INTERIOR_SIZE.height - 34);
    }

    g.fillStyle(this.definition.accent, 1);
    g.fillRect(350, INTERIOR_SIZE.height - 42, 120, 42);
    g.fillStyle(0x171717, 0.3);
    g.fillRect(382, INTERIOR_SIZE.height - 34, 56, 16);

    this.scene.add.text(42, 44, this.definition.name, {
      fontFamily: 'system-ui',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#fffaf0',
      backgroundColor: 'rgba(22,22,22,0.38)',
      padding: { x: 12, y: 8 },
    }).setDepth(-800);

    this.scene.add.text(44, 91, this.definition.subtitle, {
      fontFamily: 'system-ui',
      fontSize: '12px',
      color: '#fff7df',
      backgroundColor: 'rgba(22,22,22,0.25)',
      padding: { x: 8, y: 5 },
    }).setDepth(-800);

    this.definition.objects.forEach((object) => {
      const objectGraphics = this.scene.add.graphics().setDepth(object.y);
      objectGraphics.fillStyle(0x000000, 0.12);
      objectGraphics.fillRoundedRect(object.x + 5, object.y + 7, object.w, object.h, 9);
      objectGraphics.fillStyle(this.definition.accent, object.solid ? 0.82 : 0.36);
      objectGraphics.fillRoundedRect(object.x, object.y, object.w, object.h, 9);

      this.scene.add.text(object.x + object.w / 2, object.y + object.h / 2 - 4, object.emoji, {
        fontFamily: 'serif',
        fontSize: object.w < 80 ? '24px' : '30px',
      }).setOrigin(0.5).setDepth(object.y + 1);

      this.scene.add.text(object.x + object.w / 2, object.y + object.h + 7, object.label, {
        fontFamily: 'system-ui',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#fff',
        backgroundColor: 'rgba(16,20,18,.72)',
        padding: { x: 5, y: 3 },
      }).setOrigin(0.5, 0).setDepth(object.y + 2);
    });
  }
}
