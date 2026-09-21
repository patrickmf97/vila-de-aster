import Phaser from 'phaser';
import {
  buildings,
  pond,
  roads,
  trees,
  WORLD,
} from '../data/world';
import { settlementLots } from '../data/economy';
import type {
  ConstructionProject,
  SettlementBuilding,
} from '../types';

export class WorldRenderer {
  private settlementObjects: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  create(
    settlementBuildings: SettlementBuilding[] = [],
    constructionProjects: ConstructionProject[] = [],
  ): void {
    this.scene.cameras.main.setBounds(
      0,
      0,
      WORLD.width,
      WORLD.height,
    );

    const ground = this.scene.add
      .graphics()
      .setDepth(-1000);
    ground.fillStyle(0x82b866, 1);
    ground.fillRect(
      0,
      0,
      WORLD.width,
      WORLD.height,
    );

    ground.fillStyle(0x4e8e48, 0.12);
    for (
      let y = 15;
      y < WORLD.height;
      y += 34
    ) {
      for (
        let x = 15 + (y % 68);
        x < WORLD.width;
        x += 45
      ) {
        ground.fillRect(x, y, 2, 7);
      }
    }

    const paths = this.scene.add
      .graphics()
      .setDepth(-900);
    roads.forEach((road) => {
      paths.fillStyle(0xc8b083, 1);
      paths.fillRect(
        road.x,
        road.y,
        road.w,
        road.h,
      );
      paths.fillStyle(0x786448, 0.18);
      for (
        let y = road.y + 10;
        y < road.y + road.h;
        y += 28
      ) {
        for (
          let x =
            road.x + 10 + (y % 20);
          x < road.x + road.w;
          x += 38
        ) {
          paths.fillRect(x, y, 12, 5);
        }
      }
    });
    paths.fillStyle(0xb4a074, 1);
    paths.fillCircle(700, 650, 165);

    this.drawPond();
    this.drawDecor();
    buildings.forEach((building) =>
      this.drawBuilding(building),
    );
    trees.forEach((tree) =>
      this.drawTree(tree.x, tree.y),
    );

    this.syncSettlement(
      settlementBuildings,
      constructionProjects,
    );
  }

  syncSettlement(
    settlementBuildings: SettlementBuilding[],
    constructionProjects: ConstructionProject[],
  ): void {
    for (const object of this.settlementObjects) {
      object.destroy();
    }
    this.settlementObjects = [];

    for (const project of constructionProjects) {
      if (project.status === 'building') {
        this.drawConstructionProject(project);
      }
    }

    for (const building of settlementBuildings) {
      this.drawSettlementBuilding(building);
    }

    const occupiedLots = new Set([
      ...constructionProjects
        .filter(
          (project) =>
            project.status === 'building',
        )
        .map((project) => project.lotId),
      ...settlementBuildings.map(
        (building) => building.lotId,
      ),
    ]);

    for (const lot of settlementLots) {
      if (occupiedLots.has(lot.id)) continue;
      this.drawEmptyLot(lot);
    }
  }

  private drawPond(): void {
    const g = this.scene.add
      .graphics()
      .setDepth(-800);
    g.fillStyle(0x4b9bc8, 1);
    g.fillRoundedRect(
      pond.x,
      pond.y,
      pond.w,
      pond.h,
      52,
    );

    g.lineStyle(
      3,
      0xd8f5ff,
      0.35,
    );
    for (
      let i = 0;
      i < 5;
      i += 1
    ) {
      g.strokeCircle(
        pond.x + 50 + i * 48,
        pond.y + 70 + (i % 2) * 24,
        14,
      );
    }

    g.fillStyle(0x7b5131, 1);
    g.fillRect(
      pond.x + 108,
      pond.y - 8,
      64,
      pond.h + 16,
    );
    g.fillStyle(0xaa7749, 1);
    for (
      let y = pond.y - 2;
      y < pond.y + pond.h;
      y += 18
    ) {
      g.fillRect(
        pond.x + 112,
        y,
        56,
        12,
      );
    }
  }

  private drawDecor(): void {
    const g = this.scene.add
      .graphics()
      .setDepth(-700);

    g.fillStyle(0x6d4a2d, 1);
    g.fillRect(250, 760, 190, 110);
    for (
      let y = 778;
      y < 850;
      y += 28
    ) {
      for (
        let x = 268;
        x < 425;
        x += 32
      ) {
        g.fillStyle(
          0x4c8f4d,
          1,
        );
        g.fillCircle(x, y, 7);
        g.fillStyle(
          0xf2d25a,
          1,
        );
        g.fillRect(
          x - 2,
          y - 11,
          4,
          5,
        );
      }
    }

    g.fillStyle(0x7b7f80, 1);
    g.fillCircle(700, 650, 48);
    g.fillStyle(0x55a6d0, 1);
    g.fillCircle(700, 650, 37);
    g.fillStyle(0xa9b0b2, 1);
    g.fillRect(694, 600, 12, 55);
    g.fillCircle(700, 603, 15);

    const flowers = [
      [200, 610],
      [230, 625],
      [420, 620],
      [470, 665],
      [865, 690],
      [905, 705],
      [1370, 620],
      [1410, 660],
      [1580, 680],
      [1640, 610],
      [1100, 600],
      [1145, 620],
    ];
    const flowerColors = [
      0xf7e36f,
      0xff8eb5,
      0xb9a5ff,
      0xf6f1de,
    ];
    flowers.forEach(
      ([x, y], index) => {
        g.fillStyle(
          flowerColors[
            index % flowerColors.length
          ],
          1,
        );
        g.fillCircle(x, y, 5);
      },
    );

    g.fillStyle(0x6b4427, 1);
    g.fillRect(720, 70, 8, 55);
    g.fillRect(688, 75, 72, 30);
    this.scene.add
      .text(724, 90, 'NORTE ↑', {
        color: '#f5e5bd',
        fontFamily: 'system-ui',
        fontSize: '13px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(-690);
  }

  private drawBuilding(
    building: (typeof buildings)[number],
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(building.y);

    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(
      building.x + 10,
      building.y + 18,
      building.w,
      building.h,
      12,
    );

    g.fillStyle(building.wall, 1);
    g.fillRoundedRect(
      building.x,
      building.y + 50,
      building.w,
      building.h - 50,
      10,
    );

    g.fillStyle(building.roof, 1);
    g.fillTriangle(
      building.x - 18,
      building.y + 70,
      building.x +
        building.w / 2,
      building.y - 5,
      building.x +
        building.w +
        18,
      building.y + 70,
    );

    g.fillStyle(0x6a442b, 1);
    g.fillRoundedRect(
      building.x +
        building.w / 2 -
        24,
      building.y +
        building.h -
        68,
      48,
      68,
      7,
    );
    g.fillStyle(0xe5b34d, 1);
    g.fillCircle(
      building.x +
        building.w / 2 +
        13,
      building.y +
        building.h -
        34,
      3,
    );

    g.fillStyle(0x79b9ce, 1);
    g.fillRect(
      building.x + 42,
      building.y + 100,
      56,
      42,
    );
    g.fillRect(
      building.x +
        building.w -
        98,
      building.y + 100,
      56,
      42,
    );

    g.fillStyle(0x5f3f27, 1);
    g.fillRoundedRect(
      building.x +
        building.w / 2 -
        27,
      building.y + 54,
      54,
      36,
      8,
    );

    this.scene.add
      .text(
        building.x +
          building.w / 2,
        building.y + 72,
        building.sign,
        {
          fontFamily: 'serif',
          fontSize: '22px',
        },
      )
      .setOrigin(0.5)
      .setDepth(
        building.y + 1,
      );

    this.scene.add
      .text(
        building.x +
          building.w / 2,
        building.y +
          building.h +
          21,
        building.name,
        {
          fontFamily: 'system-ui',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#f9f5e8',
          backgroundColor:
            'rgba(26,36,28,0.78)',
          padding: {
            x: 9,
            y: 5,
          },
        },
      )
      .setOrigin(0.5)
      .setDepth(
        building.y +
          building.h +
          1,
      );
  }

  private drawSettlementBuilding(
    building: SettlementBuilding,
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(building.y);

    g.fillStyle(0x000000, 0.16);
    g.fillRoundedRect(
      building.x + 8,
      building.y + 16,
      building.w,
      building.h,
      12,
    );

    g.fillStyle(building.wall, 1);
    g.fillRoundedRect(
      building.x,
      building.y + 42,
      building.w,
      building.h - 42,
      10,
    );

    g.fillStyle(building.roof, 1);
    g.fillTriangle(
      building.x - 14,
      building.y + 60,
      building.x + building.w / 2,
      building.y - 3,
      building.x + building.w + 14,
      building.y + 60,
    );

    g.fillStyle(0x6a442b, 1);
    g.fillRoundedRect(
      building.x +
        building.w / 2 -
        21,
      building.y +
        building.h -
        60,
      42,
      60,
      6,
    );

    g.fillStyle(0x78b8ce, 1);
    g.fillRect(
      building.x + 30,
      building.y + 84,
      44,
      34,
    );
    g.fillRect(
      building.x +
        building.w -
        74,
      building.y + 84,
      44,
      34,
    );

    const sign = this.scene.add
      .text(
        building.x + building.w / 2,
        building.y + 61,
        building.sign,
        {
          fontFamily: 'serif',
          fontSize: '20px',
        },
      )
      .setOrigin(0.5)
      .setDepth(building.y + 2);

    const label = this.scene.add
      .text(
        building.x + building.w / 2,
        building.y + building.h + 17,
        building.name,
        {
          fontFamily: 'system-ui',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#f9f5e8',
          backgroundColor:
            'rgba(26,36,28,0.8)',
          padding: {
            x: 8,
            y: 4,
          },
        },
      )
      .setOrigin(0.5)
      .setDepth(
        building.y + building.h + 2,
      );

    this.settlementObjects.push(
      g,
      sign,
      label,
    );
  }

  private drawConstructionProject(
    project: ConstructionProject,
  ): void {
    const lot = settlementLots.find(
      (entry) =>
        entry.id === project.lotId,
    );
    if (!lot) return;

    const g = this.scene.add
      .graphics()
      .setDepth(lot.y);

    g.fillStyle(0xb89b68, 0.55);
    g.fillRect(
      lot.x + 15,
      lot.y + 80,
      lot.w - 30,
      16,
    );

    g.lineStyle(7, 0x8b643f, 1);
    g.strokeRect(
      lot.x + 25,
      lot.y + 35,
      lot.w - 50,
      Math.min(
        105,
        lot.h - 55,
      ),
    );

    const beamCount = Math.max(
      1,
      Math.round(
        project.progress / 20,
      ),
    );

    for (
      let i = 0;
      i < beamCount;
      i += 1
    ) {
      const x =
        lot.x +
        38 +
        i *
          ((lot.w - 76) /
            Math.max(
              1,
              beamCount - 1,
            ));
      g.lineBetween(
        x,
        lot.y + 40,
        x,
        lot.y + 132,
      );
    }

    const label = this.scene.add
      .text(
        lot.x + lot.w / 2,
        lot.y + lot.h / 2,
        '🏗️ ' +
          project.name +
          '\n' +
          Math.round(
            project.progress,
          ) +
          '%',
        {
          fontFamily: 'system-ui',
          fontSize: '12px',
          fontStyle: 'bold',
          align: 'center',
          color: '#fff5d8',
          backgroundColor:
            'rgba(72,51,31,.82)',
          padding: {
            x: 8,
            y: 5,
          },
        },
      )
      .setOrigin(0.5)
      .setDepth(
        lot.y + lot.h + 2,
      );

    this.settlementObjects.push(
      g,
      label,
    );
  }

  private drawEmptyLot(
    lot: (typeof settlementLots)[number],
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(-650);

    g.lineStyle(
      2,
      0xe6d8a8,
      0.2,
    );
    g.strokeRoundedRect(
      lot.x,
      lot.y,
      lot.w,
      lot.h,
      12,
    );

    const label = this.scene.add
      .text(
        lot.x + lot.w / 2,
        lot.y + lot.h / 2,
        'Terreno disponível',
        {
          fontFamily: 'system-ui',
          fontSize: '10px',
          color: '#e8f0d7',
          backgroundColor:
            'rgba(38,60,35,.45)',
          padding: {
            x: 6,
            y: 3,
          },
        },
      )
      .setOrigin(0.5)
      .setDepth(-640);

    this.settlementObjects.push(
      g,
      label,
    );
  }

  private drawTree(
    x: number,
    y: number,
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(y);

    g.fillStyle(0x000000, 0.13);
    g.fillEllipse(
      x + 6,
      y + 47,
      68,
      30,
    );
    g.fillStyle(0x694529, 1);
    g.fillRect(
      x - 7,
      y + 20,
      14,
      38,
    );
    g.fillStyle(0x2f7047, 1);
    g.fillCircle(x, y, 34);
    g.fillStyle(0x42875a, 1);
    g.fillCircle(
      x - 18,
      y + 4,
      21,
    );
    g.fillCircle(
      x + 19,
      y + 7,
      22,
    );
    g.fillStyle(0x5b9d66, 1);
    g.fillCircle(
      x - 3,
      y - 18,
      18,
    );
  }
}
