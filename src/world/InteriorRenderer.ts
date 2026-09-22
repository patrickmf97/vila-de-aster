import Phaser from 'phaser';
import {
  INTERIOR_SIZE,
} from '../data/interiors';
import type {
  InteriorDefinition,
  InteriorObjectDefinition,
  Rect,
} from '../types';

interface InteriorGlow {
  body: Phaser.GameObjects.Arc;
  phase: number;
  baseAlpha: number;
}

export class InteriorRenderer {
  readonly collisionRects: Rect[];

  private glows: InteriorGlow[] = [];
  private lastUpdate = -Infinity;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly definition: InteriorDefinition,
  ) {
    this.collisionRects = [
      {
        x: 0,
        y: 0,
        w: INTERIOR_SIZE.width,
        h: 34,
      },
      {
        x: 0,
        y: 0,
        w: 34,
        h: INTERIOR_SIZE.height,
      },
      {
        x:
          INTERIOR_SIZE.width -
          34,
        y: 0,
        w: 34,
        h: INTERIOR_SIZE.height,
      },
      {
        x: 0,
        y:
          INTERIOR_SIZE.height -
          34,
        w: 350,
        h: 34,
      },
      {
        x: 470,
        y:
          INTERIOR_SIZE.height -
          34,
        w: 350,
        h: 34,
      },
      ...definition.objects
        .filter(
          (object) =>
            object.solid,
        )
        .map(
          (object) => ({
            x: object.x,
            y: object.y,
            w: object.w,
            h: object.h,
          }),
        ),
    ];
  }

  create(): void {
    const base = this.scene.add
      .graphics()
      .setDepth(-1000);

    this.drawShell(base);
    this.drawFloor(base);
    this.drawArchitecture(base);
    this.drawRug(base);
    this.drawDoorway(base);
    this.drawHeader();

    for (const object of this.definition.objects) {
      this.drawFurniture(object);
    }
  }

  update(
    elapsedSeconds: number,
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

    for (
      let index = 0;
      index < this.glows.length;
      index += 1
    ) {
      const glow =
        this.glows[index]!;

      const pulse =
        0.86 +
        Math.sin(
          elapsedSeconds * 4.1 +
            glow.phase,
        ) *
          0.14;

      glow.body.setAlpha(
        glow.baseAlpha *
          pulse,
      );

      glow.body.setScale(
        0.94 +
          Math.sin(
            elapsedSeconds * 3.3 +
              glow.phase,
          ) *
            0.045,
      );
    }
  }

  private drawShell(
    g: Phaser.GameObjects.Graphics,
  ): void {
    g.fillStyle(
      this.definition.wall,
      1,
    );

    g.fillRect(
      0,
      0,
      INTERIOR_SIZE.width,
      INTERIOR_SIZE.height,
    );

    // Thick timber frame.
    g.fillStyle(
      0x2c251e,
      0.42,
    );

    g.fillRect(
      0,
      0,
      INTERIOR_SIZE.width,
      34,
    );

    g.fillRect(
      0,
      0,
      34,
      INTERIOR_SIZE.height,
    );

    g.fillRect(
      INTERIOR_SIZE.width - 34,
      0,
      34,
      INTERIOR_SIZE.height,
    );

    g.fillRect(
      0,
      INTERIOR_SIZE.height - 34,
      INTERIOR_SIZE.width,
      34,
    );

    g.lineStyle(
      3,
      0xf2e4bd,
      0.07,
    );

    g.strokeRoundedRect(
      38,
      38,
      INTERIOR_SIZE.width - 76,
      INTERIOR_SIZE.height - 76,
      12,
    );
  }

  private drawFloor(
    g: Phaser.GameObjects.Graphics,
  ): void {
    g.fillStyle(
      this.definition.floor,
      1,
    );

    g.fillRect(
      34,
      34,
      INTERIOR_SIZE.width - 68,
      INTERIOR_SIZE.height - 68,
    );

    const plankHeight = 24;

    for (
      let y = 42;
      y <
      INTERIOR_SIZE.height - 42;
      y += plankHeight
    ) {
      const row =
        Math.floor(
          y / plankHeight,
        );

      g.lineStyle(
        1,
        0x4a392d,
        0.15,
      );

      g.lineBetween(
        35,
        y,
        INTERIOR_SIZE.width - 35,
        y,
      );

      const start =
        row % 2 === 0
          ? 70
          : 120;

      for (
        let x = start;
        x <
        INTERIOR_SIZE.width - 35;
        x += 125
      ) {
        g.lineBetween(
          x,
          y,
          x,
          y +
            plankHeight,
        );
      }
    }

    g.fillStyle(
      this.definition.accent,
      0.3,
    );

    g.fillRect(
      35,
      35,
      INTERIOR_SIZE.width - 70,
      7,
    );
  }

  private drawArchitecture(
    g: Phaser.GameObjects.Graphics,
  ): void {
    const windows = [
      220,
      600,
    ];

    for (const x of windows) {
      g.fillStyle(
        0x4d392a,
        0.95,
      );

      g.fillRoundedRect(
        x - 44,
        54,
        88,
        64,
        7,
      );

      g.fillStyle(
        0x8bc6d1,
        0.88,
      );

      g.fillRoundedRect(
        x - 37,
        61,
        74,
        50,
        4,
      );

      g.fillStyle(
        0xf5dda1,
        0.13,
      );

      g.fillRect(
        x - 31,
        66,
        27,
        12,
      );

      g.lineStyle(
        3,
        0xe8d8ac,
        0.62,
      );

      g.lineBetween(
        x,
        62,
        x,
        110,
      );

      g.lineBetween(
        x - 36,
        86,
        x + 36,
        86,
      );
    }

    // Wall lamps.
    for (
      const x of [
        120,
        INTERIOR_SIZE.width - 120,
      ]
    ) {
      g.fillStyle(
        0x4f3b2c,
        1,
      );

      g.fillRoundedRect(
        x - 4,
        131,
        8,
        30,
        3,
      );

      g.fillStyle(
        0xf1bf5c,
        1,
      );

      g.fillCircle(
        x,
        127,
        7,
      );

      const glow =
        this.scene.add
          .circle(
            x,
            127,
            31,
            0xf2c96b,
            0.11,
          )
          .setDepth(
            -880,
          )
          .setBlendMode(
            Phaser.BlendModes.ADD,
          );

      this.glows.push({
        body: glow,
        phase: x * 0.01,
        baseAlpha: 0.12,
      });
    }
  }

  private drawRug(
    g: Phaser.GameObjects.Graphics,
  ): void {
    const color =
      rugColorFor(
        this.definition.id,
      );

    g.fillStyle(
      0x241b16,
      0.12,
    );

    g.fillRoundedRect(
      290,
      216,
      240,
      128,
      22,
    );

    g.fillStyle(
      color,
      0.68,
    );

    g.fillRoundedRect(
      284,
      210,
      240,
      128,
      22,
    );

    g.lineStyle(
      4,
      0xf0dba2,
      0.2,
    );

    g.strokeRoundedRect(
      296,
      221,
      216,
      106,
      16,
    );
  }

  private drawDoorway(
    g: Phaser.GameObjects.Graphics,
  ): void {
    g.fillStyle(
      this.definition.accent,
      0.92,
    );

    g.fillRoundedRect(
      350,
      INTERIOR_SIZE.height - 44,
      120,
      44,
      10,
    );

    g.fillStyle(
      0x19130f,
      0.32,
    );

    g.fillRoundedRect(
      382,
      INTERIOR_SIZE.height - 35,
      56,
      17,
      6,
    );

    g.fillStyle(
      0xf1d38a,
      0.08,
    );

    g.fillEllipse(
      410,
      INTERIOR_SIZE.height - 61,
      130,
      42,
    );
  }

  private drawFurniture(
    object: InteriorObjectDefinition,
  ): void {
    const g =
      this.scene.add
        .graphics()
        .setDepth(
          object.y +
            object.h,
        );

    const shadowAlpha =
      object.solid
        ? 0.19
        : 0.1;

    g.fillStyle(
      0x17120f,
      shadowAlpha,
    );

    g.fillRoundedRect(
      object.x + 5,
      object.y + 7,
      object.w,
      object.h,
      9,
    );

    if (
      object.id.includes(
        'forge',
      ) ||
      object.id.includes(
        'hearth',
      )
    ) {
      this.drawHearth(
        g,
        object,
      );
    } else if (
      object.id.includes(
        'bed',
      )
    ) {
      this.drawBed(
        g,
        object,
      );
    } else if (
      object.id.includes(
        'table',
      ) ||
      object.id.includes(
        'tea',
      )
    ) {
      this.drawTable(
        g,
        object,
      );
    } else if (
      object.id.includes(
        'counter',
      ) ||
      object.id.includes(
        'workbench',
      )
    ) {
      this.drawCounter(
        g,
        object,
      );
    } else if (
      object.id.includes(
        'shelf',
      ) ||
      object.id.includes(
        'books',
      ) ||
      object.id.includes(
        'rack',
      )
    ) {
      this.drawShelf(
        g,
        object,
      );
    } else if (
      object.id.includes(
        'plants',
      )
    ) {
      this.drawPlants(
        g,
        object,
      );
    } else if (
      object.id.includes(
        'nets',
      ) ||
      object.id.includes(
        'rod-rack',
      )
    ) {
      this.drawFishingGear(
        g,
        object,
      );
    } else if (
      object.id.includes(
        'anvil',
      ) ||
      object.id.includes(
        'ore',
      )
    ) {
      this.drawSmithProp(
        g,
        object,
      );
    } else {
      this.drawGeneric(
        g,
        object,
      );
    }

    this.scene.add
      .text(
        object.x +
          object.w / 2,
        object.y +
          object.h / 2,
        object.emoji,
        {
          fontFamily:
            'serif',
          fontSize:
            object.w < 80
              ? '21px'
              : '27px',
        },
      )
      .setOrigin(0.5)
      .setDepth(
        object.y +
          object.h +
          1,
      )
      .setAlpha(0.88);
  }

  private drawHearth(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      0x4b4844,
      1,
    );

    g.fillRoundedRect(
      object.x,
      object.y,
      object.w,
      object.h,
      9,
    );

    g.fillStyle(
      0x251b17,
      1,
    );

    g.fillRoundedRect(
      object.x + 20,
      object.y + 24,
      object.w - 40,
      object.h - 35,
      12,
    );

    g.fillStyle(
      0xff8a2c,
      0.96,
    );

    g.fillEllipse(
      object.x +
        object.w / 2,
      object.y +
        object.h * 0.63,
      Math.max(
        30,
        object.w * 0.45,
      ),
      Math.max(
        28,
        object.h * 0.42,
      ),
    );

    g.fillStyle(
      0xffd05d,
      0.9,
    );

    g.fillEllipse(
      object.x +
        object.w / 2,
      object.y +
        object.h * 0.58,
      Math.max(
        15,
        object.w * 0.24,
      ),
      Math.max(
        22,
        object.h * 0.3,
      ),
    );

    const glow =
      this.scene.add
        .circle(
          object.x +
            object.w / 2,
          object.y +
            object.h / 2,
          Math.max(
            object.w,
            object.h,
          ) *
            0.65,
          0xff9f37,
          0.12,
        )
        .setDepth(
          object.y +
            object.h -
            1,
        )
        .setBlendMode(
          Phaser.BlendModes.ADD,
        );

    this.glows.push({
      body: glow,
      phase:
        object.x *
        0.013,
      baseAlpha: 0.14,
    });
  }

  private drawBed(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      0x65462f,
      1,
    );

    g.fillRoundedRect(
      object.x,
      object.y,
      object.w,
      object.h,
      8,
    );

    g.fillStyle(
      this.definition.accent,
      0.75,
    );

    g.fillRoundedRect(
      object.x + 8,
      object.y + 10,
      object.w - 16,
      object.h - 18,
      7,
    );

    g.fillStyle(
      0xf0e4c8,
      0.9,
    );

    g.fillRoundedRect(
      object.x + 12,
      object.y + 12,
      Math.min(
        48,
        object.w * 0.32,
      ),
      object.h - 24,
      6,
    );
  }

  private drawTable(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      0x765033,
      1,
    );

    g.fillRoundedRect(
      object.x,
      object.y,
      object.w,
      object.h,
      8,
    );

    g.lineStyle(
      3,
      0xa97849,
      0.8,
    );

    g.lineBetween(
      object.x + 10,
      object.y + 14,
      object.x +
        object.w -
        10,
      object.y + 14,
    );

    const chairColor =
      0x5d412d;

    g.fillStyle(
      chairColor,
      1,
    );

    g.fillRoundedRect(
      object.x - 14,
      object.y + 18,
      12,
      Math.min(
        38,
        object.h - 20,
      ),
      4,
    );

    g.fillRoundedRect(
      object.x +
        object.w +
        2,
      object.y + 18,
      12,
      Math.min(
        38,
        object.h - 20,
      ),
      4,
    );
  }

  private drawCounter(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      0x765035,
      1,
    );

    g.fillRoundedRect(
      object.x,
      object.y,
      object.w,
      object.h,
      7,
    );

    g.fillStyle(
      0xa87845,
      0.9,
    );

    g.fillRoundedRect(
      object.x + 4,
      object.y + 5,
      object.w - 8,
      13,
      5,
    );

    g.lineStyle(
      2,
      0x4d3526,
      0.65,
    );

    const segments =
      Math.max(
        2,
        Math.floor(
          object.w / 70,
        ),
      );

    for (
      let index = 1;
      index < segments;
      index += 1
    ) {
      const x =
        object.x +
        (object.w /
          segments) *
          index;

      g.lineBetween(
        x,
        object.y + 22,
        x,
        object.y +
          object.h -
          8,
      );
    }
  }

  private drawShelf(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      0x67462f,
      1,
    );

    g.fillRoundedRect(
      object.x,
      object.y,
      object.w,
      object.h,
      6,
    );

    for (
      let y =
        object.y + 24;
      y <
      object.y +
        object.h -
        10;
      y += 30
    ) {
      g.fillStyle(
        0xb28250,
        0.95,
      );

      g.fillRect(
        object.x + 7,
        y,
        object.w - 14,
        6,
      );

      for (
        let x =
          object.x + 14;
        x <
        object.x +
          object.w -
          12;
        x += 17
      ) {
        g.fillStyle(
          ((x + y) /
            17) %
              2 >
            1
            ? 0x8a4c42
            : 0x5f7f54,
          0.88,
        );

        g.fillRoundedRect(
          x,
          y - 13,
          9,
          13,
          2,
        );
      }
    }
  }

  private drawPlants(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      0x704c33,
      1,
    );

    g.fillRoundedRect(
      object.x + 10,
      object.y +
        object.h -
        36,
      object.w - 20,
      30,
      7,
    );

    for (
      let index = 0;
      index < 5;
      index += 1
    ) {
      const x =
        object.x +
        18 +
        (index *
          (object.w - 36)) /
          4;

      const y =
        object.y +
        object.h -
        42 -
        (index % 2) *
          14;

      g.fillStyle(
        index % 2 === 0
          ? 0x4f8b4e
          : 0x6ba45e,
        1,
      );

      g.fillCircle(
        x,
        y,
        13,
      );

      g.fillStyle(
        index % 3 === 0
          ? 0xef9caf
          : 0xf1d36f,
        0.9,
      );

      g.fillCircle(
        x + 4,
        y - 4,
        4,
      );
    }
  }

  private drawFishingGear(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      0x66513c,
      0.8,
    );

    g.fillRoundedRect(
      object.x,
      object.y,
      object.w,
      object.h,
      5,
    );

    g.lineStyle(
      2,
      0xd4c5a4,
      0.7,
    );

    for (
      let index = 0;
      index < 4;
      index += 1
    ) {
      const x =
        object.x +
        10 +
        index *
          Math.max(
            12,
            (object.w - 20) /
              4,
          );

      g.lineBetween(
        x,
        object.y + 8,
        x +
          object.w *
            0.35,
        object.y +
          object.h -
          8,
      );
    }
  }

  private drawSmithProp(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      0x4d5152,
      1,
    );

    g.fillRoundedRect(
      object.x,
      object.y,
      object.w,
      object.h,
      7,
    );

    g.fillStyle(
      0x737a78,
      0.9,
    );

    g.fillRoundedRect(
      object.x + 10,
      object.y + 10,
      object.w - 20,
      Math.max(
        14,
        object.h * 0.28,
      ),
      5,
    );
  }

  private drawGeneric(
    g: Phaser.GameObjects.Graphics,
    object: InteriorObjectDefinition,
  ): void {
    g.fillStyle(
      this.definition.accent,
      object.solid
        ? 0.78
        : 0.38,
    );

    g.fillRoundedRect(
      object.x,
      object.y,
      object.w,
      object.h,
      8,
    );

    g.fillStyle(
      0xffffff,
      0.07,
    );

    g.fillRoundedRect(
      object.x + 6,
      object.y + 6,
      Math.max(
        12,
        object.w - 12,
      ),
      Math.min(
        10,
        object.h *
          0.2,
      ),
      5,
    );
  }

  private drawHeader(): void {
    this.scene.add
      .text(
        42,
        44,
        this.definition.name,
        {
          fontFamily:
            'Georgia, serif',
          fontSize:
            '21px',
          fontStyle:
            'bold',
          color:
            '#fff8e7',
          backgroundColor:
            'rgba(25,31,25,.68)',
          padding: {
            x: 12,
            y: 8,
          },
        },
      )
      .setDepth(-800);

    this.scene.add
      .text(
        44,
        91,
        this.definition.subtitle,
        {
          fontFamily:
            'Georgia, serif',
          fontSize:
            '11px',
          color:
            '#efe5ce',
          backgroundColor:
            'rgba(25,31,25,.42)',
          padding: {
            x: 8,
            y: 5,
          },
        },
      )
      .setDepth(-800);
  }
}

function rugColorFor(
  id: string,
): number {
  return {
    inn: 0x9a594b,
    smith: 0x586b77,
    shop: 0x758a55,
    home: 0x8b668f,
    'fisher-home': 0x587f91,
    'settlement-home': 0x8a7457,
  }[id] ?? 0x7e745d;
}
