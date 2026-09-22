import Phaser from 'phaser';
import { WORLD, pond } from '../data/world';

interface Firefly {
  glow: Phaser.GameObjects.Arc;
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
}

export class AtmosphereRenderer {
  private tint: Phaser.GameObjects.Rectangle;
  private vignette: Phaser.GameObjects.Graphics;
  private fireflies: Firefly[] = [];
  private riverGlow: Phaser.GameObjects.Graphics;
  private lastUpdate = -Infinity;

  constructor(private readonly scene: Phaser.Scene) {
    this.tint = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x1b284d, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(99990);

    this.vignette = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(99991);

    this.riverGlow = scene.add
      .graphics()
      .setDepth(-610);

    this.createFireflies();
    this.resize();

    scene.scale.on('resize', this.resize, this);
    scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.destroy,
      this,
    );
  }

  update(
    minuteOfDay: number,
    elapsedSeconds: number,
    riverEchoActive: boolean,
  ): void {
    if (elapsedSeconds - this.lastUpdate < 1 / 15) return;
    this.lastUpdate = elapsedSeconds;

    const phase = dayPhase(minuteOfDay);
    this.tint.setFillStyle(phase.color, 1);
    this.tint.setAlpha(phase.alpha);

    const nightStrength = phase.nightStrength;
    for (const fly of this.fireflies) {
      const bobX = Math.sin(elapsedSeconds * fly.speed + fly.phase) * 8;
      const bobY = Math.cos(elapsedSeconds * (fly.speed * 0.72) + fly.phase) * 5;
      fly.glow.setPosition(fly.baseX + bobX, fly.baseY + bobY);
      fly.glow.setAlpha(
        nightStrength *
          (0.28 + Math.abs(Math.sin(elapsedSeconds * 2.2 + fly.phase)) * 0.5),
      );
      fly.glow.setScale(
        0.85 + Math.sin(elapsedSeconds * 1.7 + fly.phase) * 0.12,
      );
    }

    this.riverGlow.clear();
    if (riverEchoActive) {
      const pulse = 0.16 + Math.abs(Math.sin(elapsedSeconds * 1.35)) * 0.12;
      this.riverGlow.fillStyle(0x76dce7, pulse);
      this.riverGlow.fillEllipse(
        pond.x + pond.w / 2,
        pond.y + pond.h / 2,
        pond.w * 0.76,
        pond.h * 0.58,
      );

      this.riverGlow.lineStyle(2, 0xa79ae8, 0.22);
      for (let i = 0; i < 3; i += 1) {
        const radius = 22 + ((elapsedSeconds * 18 + i * 35) % 105);
        this.riverGlow.strokeCircle(
          pond.x + 72 + i * 58,
          pond.y + 74 + (i % 2) * 22,
          radius * 0.22,
        );
      }
    }
  }

  destroy(): void {
    this.scene.scale.off('resize', this.resize, this);
    this.tint.destroy();
    this.vignette.destroy();
    this.riverGlow.destroy();
    for (const fly of this.fireflies) fly.glow.destroy();
    this.fireflies = [];
  }

  private createFireflies(): void {
    const positions = [
      [525, 520], [585, 850], [1010, 560], [1460, 640],
      [1540, 1080], [355, 1110], [1320, 990], [1760, 720],
    ];

    positions.forEach(([x, y], index) => {
      const glow = this.scene.add
        .circle(x, y, index % 3 === 0 ? 3.2 : 2.3, 0xf1ce78, 0)
        .setDepth(8500);

      this.fireflies.push({
        glow,
        baseX: x,
        baseY: y,
        phase: index * 0.83,
        speed: 0.55 + (index % 4) * 0.13,
      });
    });
  }

  private readonly resize = (): void => {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.tint.setSize(width, height);

    this.vignette.clear();
    this.vignette.fillStyle(0x08110d, 0.08);
    this.vignette.fillRect(0, 0, width, 10);
    this.vignette.fillRect(0, height - 10, width, 10);
    this.vignette.fillRect(0, 0, 10, height);
    this.vignette.fillRect(width - 10, 0, 10, height);
  };
}

function dayPhase(minute: number): {
  color: number;
  alpha: number;
  nightStrength: number;
} {
  if (minute < 330) {
    return { color: 0x17264d, alpha: 0.34, nightStrength: 1 };
  }

  if (minute < 450) {
    const t = (minute - 330) / 120;
    return {
      color: 0xf0aa74,
      alpha: 0.24 * (1 - t),
      nightStrength: 1 - t,
    };
  }

  if (minute < 960) {
    return { color: 0xf6dfad, alpha: 0.035, nightStrength: 0 };
  }

  if (minute < 1110) {
    const t = (minute - 960) / 150;
    return {
      color: 0xd98972,
      alpha: 0.04 + t * 0.18,
      nightStrength: 0,
    };
  }

  if (minute < 1230) {
    const t = (minute - 1110) / 120;
    return {
      color: 0x334a75,
      alpha: 0.18 + t * 0.16,
      nightStrength: t,
    };
  }

  return { color: 0x17264d, alpha: 0.34, nightStrength: 1 };
}
