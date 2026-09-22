import Phaser from 'phaser';
import {
  pond,
  plaza,
} from '../data/world';

interface Firefly {
  glow: Phaser.GameObjects.Arc;
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
}

interface MistPatch {
  shape: Phaser.GameObjects.Ellipse;
  baseX: number;
  baseY: number;
  phase: number;
}

export class AtmosphereRenderer {
  private tint: Phaser.GameObjects.Rectangle;
  private vignette: Phaser.GameObjects.Graphics;
  private riverGlow: Phaser.GameObjects.Graphics;
  private fireflies: Firefly[] = [];
  private mist: MistPatch[] = [];
  private lastUpdate = -Infinity;

  constructor(
    private readonly scene: Phaser.Scene,
  ) {
    this.tint = scene.add
      .rectangle(
        0,
        0,
        scene.scale.width,
        scene.scale.height,
        0x1b284d,
        0,
      )
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(99990);

    this.vignette = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(99991);

    this.riverGlow = scene.add
      .graphics()
      .setDepth(-905);

    this.createFireflies();
    this.createMist();
    this.resize();

    scene.scale.on(
      'resize',
      this.resize,
      this,
    );

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
    if (
      elapsedSeconds -
        this.lastUpdate <
      1 / 15
    ) {
      return;
    }

    this.lastUpdate =
      elapsedSeconds;

    const phase =
      dayPhase(
        minuteOfDay,
      );

    this.tint
      .setFillStyle(
        phase.color,
        1,
      )
      .setAlpha(
        phase.alpha,
      );

    this.updateFireflies(
      elapsedSeconds,
      phase.nightStrength,
    );

    this.updateMist(
      elapsedSeconds,
      phase.mistStrength,
    );

    this.drawRiverEcho(
      elapsedSeconds,
      riverEchoActive,
    );
  }

  destroy(): void {
    this.scene.scale.off(
      'resize',
      this.resize,
      this,
    );

    this.tint.destroy();
    this.vignette.destroy();
    this.riverGlow.destroy();

    for (const fly of this.fireflies) {
      fly.glow.destroy();
    }

    for (const patch of this.mist) {
      patch.shape.destroy();
    }

    this.fireflies = [];
    this.mist = [];
  }

  private createFireflies(): void {
    const positions = [
      [230, 850],
      [410, 875],
      [555, 910],
      [725, 780],
      [1110, 770],
      [1230, 900],
      [1260, 1110],
      [1620, 820],
      [1700, 930],
      [1850, 1040],
      [1010, 1010],
      [850, 1080],
    ];

    positions.forEach(
      ([x, y], index) => {
        const glow =
          this.scene.add
            .circle(
              x,
              y,
              index % 3 === 0
                ? 3.2
                : 2.3,
              0xf2d978,
              0,
            )
            .setDepth(8500);

        this.fireflies.push({
          glow,
          baseX: x,
          baseY: y,
          phase:
            index * 0.83,
          speed:
            0.55 +
            (index % 4) *
              0.13,
        });
      },
    );
  }

  private createMist(): void {
    const patches = [
      [1180, 720, 280, 90],
      [1470, 760, 300, 105],
      [1500, 1110, 330, 100],
      [720, 1110, 360, 115],
    ];

    patches.forEach(
      ([x, y, w, h], index) => {
        const shape =
          this.scene.add
            .ellipse(
              x,
              y,
              w,
              h,
              0xeaf4e4,
              0,
            )
            .setDepth(8200);

        this.mist.push({
          shape,
          baseX: x,
          baseY: y,
          phase:
            index * 1.47,
        });
      },
    );
  }

  private updateFireflies(
    elapsedSeconds: number,
    nightStrength: number,
  ): void {
    for (const fly of this.fireflies) {
      const bobX =
        Math.sin(
          elapsedSeconds *
            fly.speed +
            fly.phase,
        ) *
        9;

      const bobY =
        Math.cos(
          elapsedSeconds *
            (fly.speed *
              0.72) +
            fly.phase,
        ) *
        6;

      fly.glow
        .setPosition(
          fly.baseX + bobX,
          fly.baseY + bobY,
        )
        .setAlpha(
          nightStrength *
            (0.24 +
              Math.abs(
                Math.sin(
                  elapsedSeconds *
                    2.2 +
                    fly.phase,
                ),
              ) *
                0.52),
        )
        .setScale(
          0.84 +
            Math.sin(
              elapsedSeconds *
                1.7 +
                fly.phase,
            ) *
              0.14,
        );
    }
  }

  private updateMist(
    elapsedSeconds: number,
    strength: number,
  ): void {
    for (
      let index = 0;
      index <
      this.mist.length;
      index += 1
    ) {
      const patch =
        this.mist[index]!;

      patch.shape
        .setAlpha(
          strength *
            (0.055 +
              Math.abs(
                Math.sin(
                  elapsedSeconds *
                    0.28 +
                    patch.phase,
                ),
              ) *
                0.025),
        )
        .setPosition(
          patch.baseX +
            Math.sin(
              elapsedSeconds *
                0.12 +
                patch.phase,
            ) *
              18,
          patch.baseY +
            Math.cos(
              elapsedSeconds *
                0.09 +
                patch.phase,
            ) *
              4,
        );
    }
  }

  private drawRiverEcho(
    elapsedSeconds: number,
    active: boolean,
  ): void {
    this.riverGlow.clear();

    if (!active) return;

    const pulse =
      0.09 +
      Math.abs(
        Math.sin(
          elapsedSeconds *
            1.35,
        ),
      ) *
        0.08;

    this.riverGlow.fillStyle(
      0x78e0e8,
      pulse,
    );

    this.riverGlow.fillRoundedRect(
      pond.x + 18,
      pond.y + 24,
      pond.w - 36,
      pond.h - 48,
      35,
    );

    this.riverGlow.lineStyle(
      2,
      0xb2a5f0,
      0.2,
    );

    const centerX =
      pond.x +
      pond.w / 2;

    for (
      let index = 0;
      index < 4;
      index += 1
    ) {
      const y =
        pond.y +
        100 +
        index * 155;

      const radius =
        10 +
        ((elapsedSeconds *
          16 +
          index * 24) %
          38);

      this.riverGlow.strokeCircle(
        centerX +
          (index % 2 === 0
            ? -24
            : 24),
        y,
        radius,
      );
    }

    this.riverGlow.lineStyle(
      1,
      0xf3e8ff,
      0.14,
    );

    this.riverGlow.strokeCircle(
      plaza.x,
      plaza.y,
      48 +
        Math.sin(
          elapsedSeconds,
        ) *
          3,
    );
  }

  private readonly resize =
    (): void => {
      const width =
        this.scene.scale.width;

      const height =
        this.scene.scale.height;

      this.tint.setSize(
        width,
        height,
      );

      this.vignette.clear();

      this.vignette.fillStyle(
        0x06100c,
        0.075,
      );

      const edge = 13;

      this.vignette.fillRect(
        0,
        0,
        width,
        edge,
      );

      this.vignette.fillRect(
        0,
        height - edge,
        width,
        edge,
      );

      this.vignette.fillRect(
        0,
        0,
        edge,
        height,
      );

      this.vignette.fillRect(
        width - edge,
        0,
        edge,
        height,
      );
    };
}

function dayPhase(
  minute: number,
): {
  color: number;
  alpha: number;
  nightStrength: number;
  mistStrength: number;
} {
  if (minute < 300) {
    return {
      color: 0x142347,
      alpha: 0.35,
      nightStrength: 1,
      mistStrength: 0.18,
    };
  }

  if (minute < 450) {
    const t =
      (minute - 300) /
      150;

    return {
      color: 0xf0a775,
      alpha:
        0.23 *
        (1 - t),
      nightStrength:
        1 - t,
      mistStrength:
        1 - t * 0.65,
    };
  }

  if (minute < 930) {
    return {
      color: 0xf5dea9,
      alpha: 0.025,
      nightStrength: 0,
      mistStrength: 0,
    };
  }

  if (minute < 1080) {
    const t =
      (minute - 930) /
      150;

    return {
      color: 0xe18f67,
      alpha:
        0.03 +
        t * 0.15,
      nightStrength: 0,
      mistStrength: 0,
    };
  }

  if (minute < 1230) {
    const t =
      (minute - 1080) /
      150;

    return {
      color: 0x3b4a78,
      alpha:
        0.18 +
        t * 0.17,
      nightStrength: t,
      mistStrength:
        t * 0.16,
    };
  }

  return {
    color: 0x142347,
    alpha: 0.35,
    nightStrength: 1,
    mistStrength: 0.2,
  };
}
