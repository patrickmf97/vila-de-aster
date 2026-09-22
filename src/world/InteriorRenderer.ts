import Phaser from 'phaser';
import {
  INTERIOR_SIZE,
} from '../data/interiors';
import type {
  InteriorDefinition,
  Rect,
} from '../types';

export class InteriorRenderer {
  readonly collisionRects: Rect[];

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
    const g = this.scene.add
      .graphics()
      .setDepth(-1000);

    this.drawShell(g);
    this.drawFloor(g);
    this.drawWindows(g);
    this.drawRug(g);
    this.drawDecor(g);
    this.drawDoorway(g);
    this.drawHeader();

    this.definition.objects.forEach(
      (object) => {
        const objectGraphics =
          this.scene.add
            .graphics()
            .setDepth(
              object.y,
            );

        objectGraphics.fillStyle(
          0x14251a,
          0.16,
        );

        objectGraphics.fillRoundedRect(
          object.x + 6,
          object.y + 8,
          object.w,
          object.h,
          11,
        );

        objectGraphics.fillStyle(
          this.definition.accent,
          object.solid
            ? 0.82
            : 0.34,
        );

        objectGraphics.fillRoundedRect(
          object.x,
          object.y,
          object.w,
          object.h,
          10,
        );

        objectGraphics.fillStyle(
          0xffffff,
          0.08,
        );

        objectGraphics.fillRoundedRect(
          object.x + 6,
          object.y + 6,
          Math.max(
            12,
            object.w - 12,
          ),
          Math.min(
            11,
            object.h * 0.18,
          ),
          5,
        );

        this.scene.add
          .text(
            object.x +
              object.w / 2,
            object.y +
              object.h / 2 -
              4,
            object.emoji,
            {
              fontFamily:
                'serif',
              fontSize:
                object.w < 80
                  ? '24px'
                  : '30px',
            },
          )
          .setOrigin(0.5)
          .setDepth(
            object.y + 1,
          );

        this.scene.add
          .text(
            object.x +
              object.w / 2,
            object.y +
              object.h +
              7,
            object.label,
            {
              fontFamily:
                'system-ui',
              fontSize:
                '10px',
              fontStyle:
                'bold',
              color:
                '#fffaf0',
              backgroundColor:
                'rgba(14,24,18,.76)',
              padding: {
                x: 6,
                y: 3,
              },
            },
          )
          .setOrigin(
            0.5,
            0,
          )
          .setDepth(
            object.y + 2,
          );
      },
    );
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

    g.fillStyle(
      0x142018,
      0.14,
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
      INTERIOR_SIZE.width -
        34,
      0,
      34,
      INTERIOR_SIZE.height,
    );

    g.fillRect(
      0,
      INTERIOR_SIZE.height -
        34,
      INTERIOR_SIZE.width,
      34,
    );

    g.lineStyle(
      2,
      0xffffff,
      0.06,
    );

    g.strokeRoundedRect(
      35,
      35,
      INTERIOR_SIZE.width -
        70,
      INTERIOR_SIZE.height -
        70,
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
      INTERIOR_SIZE.width -
        68,
      INTERIOR_SIZE.height -
        68,
    );

    const plankHeight = 28;

    for (
      let y = 42;
      y <
      INTERIOR_SIZE.height -
        42;
      y += plankHeight
    ) {
      const row =
        Math.floor(
          y / plankHeight,
        );

      g.fillStyle(
        row % 2 === 0
          ? 0xffffff
          : 0x493d31,
        row % 2 === 0
          ? 0.022
          : 0.025,
      );

      g.fillRect(
        35,
        y,
        INTERIOR_SIZE.width -
          70,
        plankHeight - 1,
      );

      g.lineStyle(
        1,
        0x42382d,
        0.11,
      );

      g.lineBetween(
        35,
        y +
          plankHeight -
          1,
        INTERIOR_SIZE.width -
          35,
        y +
          plankHeight -
          1,
      );

      const offset =
        row % 2 === 0
          ? 75
          : 115;

      for (
        let x = offset;
        x <
        INTERIOR_SIZE.width -
          35;
        x += 120
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
      0.35,
    );

    g.fillRect(
      35,
      35,
      INTERIOR_SIZE.width -
        70,
      7,
    );
  }

  private drawWindows(
    g: Phaser.GameObjects.Graphics,
  ): void {
    const windows = [
      230,
      590,
    ];

    for (const x of windows) {
      g.fillStyle(
        0x4a3b2e,
        0.86,
      );

      g.fillRoundedRect(
        x - 42,
        52,
        84,
        62,
        7,
      );

      g.fillStyle(
        0x9ed8df,
        0.82,
      );

      g.fillRoundedRect(
        x - 36,
        58,
        72,
        50,
        5,
      );

      g.fillStyle(
        0xf3d98a,
        0.16,
      );

      g.fillRect(
        x - 31,
        63,
        26,
        11,
      );

      g.lineStyle(
        3,
        0xede0bb,
        0.62,
      );

      g.lineBetween(
        x,
        59,
        x,
        107,
      );

      g.lineBetween(
        x - 35,
        83,
        x + 35,
        83,
      );
    }
  }

  private drawRug(
    g: Phaser.GameObjects.Graphics,
  ): void {
    const rugColor =
      rugColorFor(
        this.definition.id,
      );

    g.fillStyle(
      0x1b261d,
      0.12,
    );

    g.fillRoundedRect(
      306,
      210,
      208,
      128,
      22,
    );

    g.fillStyle(
      rugColor,
      0.72,
    );

    g.fillRoundedRect(
      300,
      203,
      208,
      128,
      22,
    );

    g.lineStyle(
      4,
      0xf0dba2,
      0.22,
    );

    g.strokeRoundedRect(
      311,
      214,
      186,
      106,
      17,
    );

    g.lineStyle(
      2,
      0xffffff,
      0.07,
    );

    g.lineBetween(
      330,
      267,
      478,
      267,
    );
  }

  private drawDecor(
    g: Phaser.GameObjects.Graphics,
  ): void {
    // warm wall lamps
    const lamps = [150, INTERIOR_SIZE.width - 150];
    for (const x of lamps) {
      g.fillStyle(0x4f3d2e, 1);
      g.fillRoundedRect(x - 4, 128, 8, 32, 3);
      g.fillStyle(0xf0c96b, 1);
      g.fillCircle(x, 126, 7);
      g.fillStyle(0xf0c96b, 0.08);
      g.fillCircle(x, 126, 31);
    }

    // wall tapestry / emblem
    g.fillStyle(this.definition.accent, 0.9);
    g.fillRoundedRect(
      INTERIOR_SIZE.width / 2 - 42,
      47,
      84,
      58,
      8,
    );
    g.fillStyle(0xf1deb0, 0.78);
    g.fillCircle(
      INTERIOR_SIZE.width / 2,
      73,
      12,
    );
    g.lineStyle(3, 0xf1deb0, 0.55);
    g.strokeCircle(
      INTERIOR_SIZE.width / 2,
      73,
      21,
    );

    // plants soften corners
    const plantXs = [72, INTERIOR_SIZE.width - 72];
    for (const x of plantXs) {
      g.fillStyle(0x765438, 1);
      g.fillRoundedRect(
        x - 15,
        INTERIOR_SIZE.height - 105,
        30,
        25,
        5,
      );
      g.fillStyle(0x4d8a4f, 1);
      g.fillCircle(
        x - 8,
        INTERIOR_SIZE.height - 112,
        13,
      );
      g.fillCircle(
        x + 7,
        INTERIOR_SIZE.height - 118,
        15,
      );
      g.fillStyle(0x6faa62, 0.75);
      g.fillCircle(
        x,
        INTERIOR_SIZE.height - 130,
        11,
      );
    }

    // building-specific visual identity
    if (this.definition.id === 'inn') {
      g.fillStyle(0x8b5f3d, 1);
      g.fillRoundedRect(72, 188, 90, 30, 6);
      g.fillRoundedRect(
        INTERIOR_SIZE.width - 162,
        188,
        90,
        30,
        6,
      );
      g.fillStyle(0xe0b65b, 0.78);
      g.fillCircle(105, 184, 5);
      g.fillCircle(INTERIOR_SIZE.width - 105, 184, 5);
    } else if (this.definition.id === 'smith') {
      g.fillStyle(0x424a4c, 1);
      g.fillRoundedRect(72, 188, 110, 32, 5);
      g.fillStyle(0xe78345, 0.72);
      g.fillCircle(115, 181, 10);
    } else if (this.definition.id === 'shop') {
      g.fillStyle(0xa97b4b, 1);
      g.fillRoundedRect(65, 180, 105, 42, 5);
      g.fillStyle(0xd7b969, 0.92);
      for (let i = 0; i < 4; i += 1) {
        g.fillCircle(88 + i * 22, 174, 6);
      }
    } else if (
      this.definition.id === 'home' ||
      this.definition.id === 'settlement-home'
    ) {
      g.fillStyle(0xc37d8f, 0.55);
      g.fillRoundedRect(70, 184, 96, 28, 6);
      g.fillStyle(0xf2d36e, 0.95);
      g.fillCircle(92, 179, 6);
      g.fillCircle(118, 176, 6);
      g.fillCircle(144, 180, 6);
    } else if (this.definition.id === 'fisher-home') {
      g.lineStyle(3, 0x6d6c59, 0.75);
      g.strokeCircle(118, 190, 24);
      g.lineStyle(1, 0xd8d1ba, 0.55);
      g.lineBetween(99, 173, 137, 207);
      g.lineBetween(99, 205, 137, 173);
    }
  }

  private drawDoorway(
    g: Phaser.GameObjects.Graphics,
  ): void {
    g.fillStyle(
      this.definition.accent,
      1,
    );

    g.fillRoundedRect(
      350,
      INTERIOR_SIZE.height -
        44,
      120,
      44,
      10,
    );

    g.fillStyle(
      0x171717,
      0.28,
    );

    g.fillRoundedRect(
      382,
      INTERIOR_SIZE.height -
        35,
      56,
      17,
      6,
    );

    g.fillStyle(
      0xf0d58c,
      0.1,
    );

    g.fillEllipse(
      410,
      INTERIOR_SIZE.height -
        58,
      115,
      40,
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
            'system-ui',
          fontSize:
            '21px',
          fontStyle:
            'bold',
          color:
            '#fffaf0',
          backgroundColor:
            'rgba(18,29,22,.66)',
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
            'system-ui',
          fontSize:
            '12px',
          color:
            '#f4ead2',
          backgroundColor:
            'rgba(18,29,22,.42)',
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
