import Phaser from 'phaser';
import {
  buildings,
  pond,
  roads,
  trees,
  WORLD,
  type Building,
} from '../data/world';
import { settlementLots } from '../data/economy';
import type {
  ConstructionProject,
  SettlementBuilding,
} from '../types';

const PALETTE = {
  grass: 0x91c96f,
  grassMid: 0x72ad5c,
  grassDark: 0x456f42,
  path: 0xd4bd8d,
  pathEdge: 0xb99c6b,
  soil: 0xb58c60,
  wood: 0x89603f,
  woodDark: 0x5a3d2a,
  wall: 0xddd0a9,
  water: 0x62b2d8,
  waterDeep: 0x438ab7,
  waterLight: 0xb8e6f2,
  warmLight: 0xf1ce78,
  echo: 0x76dce7,
  echoLilac: 0xa79ae8,
};

export class WorldRenderer {
  private settlementObjects: Phaser.GameObjects.GameObject[] = [];
  private waterAnimation: Phaser.GameObjects.Graphics;
  private lanternGlows: Phaser.GameObjects.Arc[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    this.waterAnimation = scene.add.graphics().setDepth(-620);
  }

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

    this.drawGround();
    this.drawPaths();
    this.drawPond();
    this.drawPlaza();
    this.drawDecor();

    buildings.forEach((building) =>
      this.drawBuilding(building),
    );

    trees.forEach((tree, index) =>
      this.drawTree(tree.x, tree.y, index),
    );

    this.syncSettlement(
      settlementBuildings,
      constructionProjects,
    );
  }

  update(
    elapsedSeconds: number,
    nightStrength: number,
  ): void {
    this.animateWater(elapsedSeconds);

    const glowAlpha = Phaser.Math.Clamp(
      nightStrength * 0.34,
      0,
      0.34,
    );

    for (let index = 0; index < this.lanternGlows.length; index += 1) {
      const glow = this.lanternGlows[index]!;
      const pulse =
        0.88 +
        Math.sin(elapsedSeconds * 2 + index * 1.7) *
          0.12;
      glow.setAlpha(glowAlpha * pulse);
    }
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
        .filter((project) => project.status === 'building')
        .map((project) => project.lotId),
      ...settlementBuildings.map((building) => building.lotId),
    ]);

    for (const lot of settlementLots) {
      if (occupiedLots.has(lot.id)) continue;
      this.drawEmptyLot(lot);
    }
  }

  private drawGround(): void {
    const ground = this.scene.add
      .graphics()
      .setDepth(-1000);

    ground.fillStyle(PALETTE.grass, 1);
    ground.fillRect(0, 0, WORLD.width, WORLD.height);

    for (let y = 28; y < WORLD.height; y += 74) {
      for (let x = 26; x < WORLD.width; x += 82) {
        const seed = stableHash(x + ':' + y);
        const offsetX = (seed % 31) - 15;
        const offsetY = ((seed >> 3) % 25) - 12;
        const radius = 24 + (seed % 34);

        ground.fillStyle(
          seed % 2 === 0
            ? PALETTE.grassMid
            : PALETTE.grassDark,
          seed % 2 === 0 ? 0.07 : 0.045,
        );
        ground.fillEllipse(
          x + offsetX,
          y + offsetY,
          radius * 1.75,
          radius,
        );
      }
    }

    for (let y = 18; y < WORLD.height; y += 31) {
      for (let x = 20 + (y % 43); x < WORLD.width; x += 48) {
        const seed = stableHash('blade:' + x + ':' + y);
        if (seed % 5 === 0) continue;

        ground.lineStyle(
          1,
          seed % 3 === 0 ? 0x3e793e : 0x5f9f4f,
          0.22,
        );
        ground.lineBetween(x, y + 4, x + (seed % 3) - 1, y - 3);
      }
    }
  }

  private drawPaths(): void {
    const paths = this.scene.add
      .graphics()
      .setDepth(-900);

    roads.forEach((road, roadIndex) => {
      paths.fillStyle(PALETTE.pathEdge, 0.34);
      paths.fillRoundedRect(
        road.x - 8,
        road.y - 8,
        road.w + 16,
        road.h + 16,
        24,
      );

      paths.fillStyle(PALETTE.path, 1);
      paths.fillRoundedRect(
        road.x,
        road.y,
        road.w,
        road.h,
        18,
      );

      for (let y = road.y + 14; y < road.y + road.h - 8; y += 28) {
        for (
          let x = road.x + 14 + ((y + roadIndex * 17) % 29);
          x < road.x + road.w - 10;
          x += 39
        ) {
          const seed = stableHash('stone:' + x + ':' + y);
          paths.fillStyle(
            seed % 2 === 0 ? 0x9e845f : 0xe1cf9f,
            seed % 2 === 0 ? 0.16 : 0.22,
          );
          paths.fillRoundedRect(
            x,
            y,
            8 + (seed % 7),
            3 + (seed % 4),
            3,
          );
        }
      }
    });

    paths.fillStyle(PALETTE.pathEdge, 0.38);
    paths.fillCircle(700, 650, 174);
    paths.fillStyle(0xcab482, 1);
    paths.fillCircle(700, 650, 164);

    paths.lineStyle(2, 0xe4d4a7, 0.28);
    for (let radius = 118; radius <= 154; radius += 18) {
      paths.strokeCircle(700, 650, radius);
    }
  }

  private drawPond(): void {
    const g = this.scene.add
      .graphics()
      .setDepth(-800);

    g.fillStyle(0x3f7445, 0.18);
    g.fillRoundedRect(
      pond.x - 20,
      pond.y - 18,
      pond.w + 40,
      pond.h + 36,
      65,
    );

    g.fillStyle(PALETTE.waterDeep, 1);
    g.fillRoundedRect(
      pond.x,
      pond.y,
      pond.w,
      pond.h,
      58,
    );

    g.fillStyle(PALETTE.water, 0.82);
    g.fillRoundedRect(
      pond.x + 8,
      pond.y + 7,
      pond.w - 16,
      pond.h - 21,
      50,
    );

    const rocks = [
      [pond.x + 18, pond.y + 26, 16],
      [pond.x + pond.w - 18, pond.y + 45, 13],
      [pond.x + 32, pond.y + pond.h - 9, 11],
      [pond.x + pond.w - 35, pond.y + pond.h - 12, 17],
    ];

    for (const [x, y, r] of rocks) {
      g.fillStyle(0x718070, 0.9);
      g.fillCircle(x, y, r);
      g.fillStyle(0x9cab91, 0.45);
      g.fillCircle(x - 3, y - 4, r * 0.55);
    }

    this.drawReeds(g, pond.x + 18, pond.y + pond.h - 15);
    this.drawReeds(g, pond.x + pond.w - 28, pond.y + 18);

    g.fillStyle(PALETTE.woodDark, 1);
    g.fillRoundedRect(
      pond.x + 102,
      pond.y - 13,
      76,
      pond.h + 26,
      4,
    );

    g.fillStyle(PALETTE.wood, 1);
    for (let y = pond.y - 7; y < pond.y + pond.h + 8; y += 18) {
      g.fillRoundedRect(
        pond.x + 107,
        y,
        66,
        12,
        3,
      );
    }

    g.lineStyle(3, 0x4d3929, 0.7);
    g.lineBetween(
      pond.x + 110,
      pond.y - 11,
      pond.x + 110,
      pond.y + pond.h + 11,
    );
    g.lineBetween(
      pond.x + 170,
      pond.y - 11,
      pond.x + 170,
      pond.y + pond.h + 11,
    );
  }

  private drawPlaza(): void {
    const g = this.scene.add
      .graphics()
      .setDepth(-690);

    g.lineStyle(3, 0x9a8b69, 0.35);
    g.strokeCircle(700, 650, 150);

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
      const x = 700 + Math.cos(angle) * 136;
      const y = 650 + Math.sin(angle) * 136;
      g.fillStyle(0xe2d3a8, 0.25);
      g.fillCircle(x, y, 4);
    }

    g.fillStyle(0x687774, 1);
    g.fillCircle(700, 650, 54);
    g.fillStyle(0x92a19b, 1);
    g.fillCircle(700, 650, 46);
    g.fillStyle(PALETTE.waterDeep, 1);
    g.fillCircle(700, 650, 38);
    g.fillStyle(PALETTE.water, 1);
    g.fillCircle(700, 650, 31);

    g.fillStyle(0x9aa5a1, 1);
    g.fillRoundedRect(693, 592, 14, 63, 5);
    g.fillCircle(700, 594, 17);
    g.fillStyle(PALETTE.waterLight, 0.72);
    g.fillCircle(700, 589, 5);

    this.drawBench(g, 565, 636, false);
    this.drawBench(g, 810, 636, false);

    this.drawLantern(598, 540);
    this.drawLantern(802, 540);
    this.drawLantern(598, 752);
    this.drawLantern(802, 752);

    const plazaFlowers = [
      [555, 570], [845, 572], [552, 730], [848, 728],
      [620, 505], [780, 505], [620, 795], [780, 795],
    ];
    plazaFlowers.forEach(([x, y], index) =>
      this.drawFlowerCluster(
        g,
        x,
        y,
        index % 2 === 0 ? 0xf4d66f : 0xd7a5d8,
      ),
    );
  }

  private drawDecor(): void {
    const g = this.scene.add
      .graphics()
      .setDepth(-700);

    this.drawGarden(g);
    this.drawSignpost(g, 724, 92);
    this.drawFence(g, 220, 748, 240, 8);

    const flowers = [
      [200, 610], [230, 625], [420, 620], [470, 665],
      [865, 690], [905, 705], [1370, 620], [1410, 660],
      [1580, 680], [1640, 610], [1100, 600], [1145, 620],
      [315, 435], [1540, 445], [1010, 420], [1185, 435],
    ];

    const flowerColors = [
      0xf4d66f,
      0xe989ad,
      0xb6a7e7,
      0xf5efe0,
      0xe7a36d,
    ];

    flowers.forEach(([x, y], index) =>
      this.drawFlowerCluster(
        g,
        x,
        y,
        flowerColors[index % flowerColors.length]!,
      ),
    );

    const stones = [
      [500, 540], [545, 850], [1080, 865],
      [1480, 720], [1220, 690], [330, 1060],
    ];

    for (const [x, y] of stones) {
      g.fillStyle(0x7d8b78, 0.72);
      g.fillEllipse(x, y, 22, 13);
      g.fillStyle(0xaab49d, 0.34);
      g.fillEllipse(x - 3, y - 2, 11, 5);
    }
  }

  private drawBuilding(building: Building): void {
    const g = this.scene.add
      .graphics()
      .setDepth(building.y);

    g.fillStyle(0x18351f, 0.16);
    g.fillRoundedRect(
      building.x + 13,
      building.y + 21,
      building.w,
      building.h,
      16,
    );

    g.fillStyle(building.wall, 1);
    g.fillRoundedRect(
      building.x,
      building.y + 48,
      building.w,
      building.h - 48,
      12,
    );

    g.fillStyle(building.wall, 0.55);
    for (let y = building.y + 72; y < building.y + building.h - 12; y += 26) {
      g.fillRect(
        building.x + 12,
        y,
        building.w - 24,
        2,
      );
    }

    g.fillStyle(building.roof, 1);
    g.fillTriangle(
      building.x - 20,
      building.y + 71,
      building.x + building.w / 2,
      building.y - 8,
      building.x + building.w + 20,
      building.y + 71,
    );

    g.lineStyle(4, shade(building.roof, 0.75), 0.8);
    g.lineBetween(
      building.x + 7,
      building.y + 65,
      building.x + building.w / 2,
      building.y - 2,
    );
    g.lineBetween(
      building.x + building.w / 2,
      building.y - 2,
      building.x + building.w - 7,
      building.y + 65,
    );

    this.drawWindowsAndDoor(g, building);
    this.drawBuildingIdentity(g, building);

    const signPlate = this.scene.add
      .text(
        building.x + building.w / 2,
        building.y + 63,
        building.sign,
        {
          fontFamily: 'serif',
          fontSize: '22px',
          backgroundColor: 'rgba(87,58,34,.88)',
          padding: { x: 8, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setDepth(building.y + 2);

    this.scene.add
      .text(
        building.x + building.w / 2,
        building.y + building.h + 20,
        building.name,
        {
          fontFamily: 'system-ui',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#fff8e7',
          backgroundColor: 'rgba(35,48,35,0.78)',
          padding: { x: 9, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setDepth(building.y + building.h + 1);

    signPlate.setAlpha(0.98);
  }

  private drawWindowsAndDoor(
    g: Phaser.GameObjects.Graphics,
    building: Building,
  ): void {
    const doorX = building.x + building.w / 2 - 23;
    const doorY = building.y + building.h - 68;

    g.fillStyle(PALETTE.woodDark, 1);
    g.fillRoundedRect(doorX, doorY, 46, 68, 8);
    g.fillStyle(0xe8bb5a, 1);
    g.fillCircle(doorX + 34, doorY + 34, 3);

    const windows = [
      building.x + 43,
      building.x + building.w - 99,
    ];

    for (const x of windows) {
      g.fillStyle(0x5c4934, 0.8);
      g.fillRoundedRect(x - 4, building.y + 96, 64, 50, 5);
      g.fillStyle(0x79bdd1, 1);
      g.fillRect(x, building.y + 100, 56, 42);
      g.fillStyle(PALETTE.waterLight, 0.32);
      g.fillRect(x + 6, building.y + 105, 18, 6);
      g.lineStyle(2, 0xe5d2a1, 0.65);
      g.lineBetween(x + 28, building.y + 101, x + 28, building.y + 141);
      g.lineBetween(x + 1, building.y + 121, x + 55, building.y + 121);
    }
  }

  private drawBuildingIdentity(
    g: Phaser.GameObjects.Graphics,
    building: Building,
  ): void {
    if (building.id === 'inn') {
      this.drawLantern(building.x + 28, building.y + 122);
      this.drawLantern(building.x + building.w - 28, building.y + 122);
      g.fillStyle(PALETTE.wood, 1);
      g.fillRoundedRect(building.x + 20, building.y + building.h - 26, 72, 18, 5);
      g.fillRoundedRect(building.x + building.w - 92, building.y + building.h - 26, 72, 18, 5);
      g.fillStyle(0x76503a, 1);
      g.fillCircle(building.x + 24, building.y + building.h - 14, 14);
      return;
    }

    if (building.id === 'smith') {
      g.fillStyle(0x6b584b, 1);
      g.fillRect(building.x + building.w - 62, building.y - 4, 33, 79);
      g.fillStyle(0x394344, 0.45);
      g.fillCircle(building.x + building.w - 46, building.y - 17, 18);
      g.fillCircle(building.x + building.w - 32, building.y - 33, 13);

      g.fillStyle(0x4b4f50, 1);
      g.fillRoundedRect(building.x + 18, building.y + building.h - 31, 50, 16, 5);
      g.fillTriangle(
        building.x + 26,
        building.y + building.h - 31,
        building.x + 43,
        building.y + building.h - 47,
        building.x + 60,
        building.y + building.h - 31,
      );
      return;
    }

    if (building.id === 'shop') {
      g.fillStyle(0xe3b15d, 1);
      g.fillRoundedRect(building.x + 26, building.y + 77, building.w - 52, 17, 5);
      g.fillStyle(0xb95e4f, 0.92);
      for (let x = building.x + 30; x < building.x + building.w - 32; x += 38) {
        g.fillRect(x, building.y + 77, 19, 16);
      }

      g.fillStyle(0x9b7549, 1);
      g.fillRoundedRect(building.x + 18, building.y + building.h - 31, 52, 24, 4);
      g.fillRoundedRect(building.x + building.w - 70, building.y + building.h - 31, 52, 24, 4);
      return;
    }

    if (building.id === 'home') {
      const flowers = [
        [building.x + 20, building.y + building.h - 16],
        [building.x + 55, building.y + building.h - 12],
        [building.x + building.w - 52, building.y + building.h - 13],
        [building.x + building.w - 22, building.y + building.h - 17],
      ];
      flowers.forEach(([x, y], index) =>
        this.drawFlowerCluster(
          g,
          x,
          y,
          index % 2 === 0 ? 0xe98db5 : 0xf1d56d,
        ),
      );
      return;
    }

    if (building.id === 'fisher-home') {
      g.lineStyle(3, 0x6b6651, 0.85);
      g.strokeCircle(
        building.x + 28,
        building.y + building.h - 22,
        17,
      );
      g.lineStyle(1, 0xd6d1b5, 0.45);
      for (let offset = -10; offset <= 10; offset += 5) {
        g.lineBetween(
          building.x + 18,
          building.y + building.h - 32 + offset,
          building.x + 38,
          building.y + building.h - 12 + offset,
        );
      }
    }
  }

  private drawSettlementBuilding(
    building: SettlementBuilding,
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(building.y);

    g.fillStyle(0x17371f, 0.15);
    g.fillRoundedRect(
      building.x + 10,
      building.y + 17,
      building.w,
      building.h,
      14,
    );

    g.fillStyle(building.wall, 1);
    g.fillRoundedRect(
      building.x,
      building.y + 42,
      building.w,
      building.h - 42,
      11,
    );

    g.fillStyle(building.roof, 1);
    g.fillTriangle(
      building.x - 15,
      building.y + 60,
      building.x + building.w / 2,
      building.y - 5,
      building.x + building.w + 15,
      building.y + 60,
    );

    g.fillStyle(PALETTE.woodDark, 1);
    g.fillRoundedRect(
      building.x + building.w / 2 - 21,
      building.y + building.h - 60,
      42,
      60,
      7,
    );

    g.fillStyle(0x79bdd1, 1);
    g.fillRoundedRect(building.x + 30, building.y + 84, 44, 34, 3);
    g.fillRoundedRect(
      building.x + building.w - 74,
      building.y + 84,
      44,
      34,
      3,
    );

    const sign = this.scene.add
      .text(
        building.x + building.w / 2,
        building.y + 60,
        building.sign,
        {
          fontFamily: 'serif',
          fontSize: '19px',
          backgroundColor: 'rgba(87,58,34,.82)',
          padding: { x: 7, y: 4 },
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
          color: '#fff8e7',
          backgroundColor: 'rgba(35,48,35,.8)',
          padding: { x: 8, y: 4 },
        },
      )
      .setOrigin(0.5)
      .setDepth(building.y + building.h + 2);

    this.settlementObjects.push(g, sign, label);
  }

  private drawConstructionProject(
    project: ConstructionProject,
  ): void {
    const lot = settlementLots.find(
      (entry) => entry.id === project.lotId,
    );
    if (!lot) return;

    const g = this.scene.add
      .graphics()
      .setDepth(lot.y);

    g.fillStyle(PALETTE.soil, 0.32);
    g.fillRoundedRect(
      lot.x + 12,
      lot.y + 18,
      lot.w - 24,
      lot.h - 24,
      14,
    );

    g.lineStyle(7, PALETTE.wood, 1);
    g.strokeRoundedRect(
      lot.x + 25,
      lot.y + 35,
      lot.w - 50,
      Math.min(105, lot.h - 55),
      5,
    );

    const beamCount = Math.max(
      1,
      Math.round(project.progress / 20),
    );

    for (let i = 0; i < beamCount; i += 1) {
      const x =
        lot.x +
        38 +
        i *
          ((lot.w - 76) /
            Math.max(1, beamCount - 1));
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
        '🏗️ ' + project.name + '\n' + Math.round(project.progress) + '%',
        {
          fontFamily: 'system-ui',
          fontSize: '12px',
          fontStyle: 'bold',
          align: 'center',
          color: '#fff5d8',
          backgroundColor: 'rgba(72,51,31,.82)',
          padding: { x: 8, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setDepth(lot.y + lot.h + 2);

    this.settlementObjects.push(g, label);
  }

  private drawEmptyLot(
    lot: (typeof settlementLots)[number],
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(-650);

    g.fillStyle(PALETTE.grassDark, 0.035);
    g.fillRoundedRect(
      lot.x,
      lot.y,
      lot.w,
      lot.h,
      13,
    );
    g.lineStyle(2, 0xe6d8a8, 0.18);
    g.strokeRoundedRect(
      lot.x,
      lot.y,
      lot.w,
      lot.h,
      13,
    );

    const label = this.scene.add
      .text(
        lot.x + lot.w / 2,
        lot.y + lot.h / 2,
        '🌱 Terreno disponível',
        {
          fontFamily: 'system-ui',
          fontSize: '10px',
          color: '#eef5db',
          backgroundColor: 'rgba(38,60,35,.42)',
          padding: { x: 6, y: 3 },
        },
      )
      .setOrigin(0.5)
      .setDepth(-640);

    this.settlementObjects.push(g, label);
  }

  private drawTree(
    x: number,
    y: number,
    index: number,
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(y);

    const scale = 0.92 + (index % 4) * 0.035;

    g.fillStyle(0x25472f, 0.16);
    g.fillEllipse(
      x + 7,
      y + 48,
      72 * scale,
      28 * scale,
    );

    g.fillStyle(0x6d4a2e, 1);
    g.fillRoundedRect(
      x - 7 * scale,
      y + 16,
      14 * scale,
      44 * scale,
      4,
    );

    g.fillStyle(0x2f7047, 1);
    g.fillCircle(x, y, 35 * scale);
    g.fillStyle(0x42875a, 1);
    g.fillCircle(x - 19 * scale, y + 5, 23 * scale);
    g.fillCircle(x + 20 * scale, y + 8, 24 * scale);
    g.fillStyle(0x5b9d66, 1);
    g.fillCircle(x - 4, y - 19 * scale, 20 * scale);
    g.fillStyle(0x79ad72, 0.48);
    g.fillCircle(x - 12, y - 18 * scale, 9 * scale);
  }

  private drawGarden(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x6d4a2d, 1);
    g.fillRoundedRect(250, 760, 190, 110, 8);

    g.lineStyle(2, 0x4f3928, 0.5);
    for (let y = 780; y < 850; y += 28) {
      g.lineBetween(260, y, 430, y);
      for (let x = 268; x < 425; x += 32) {
        g.fillStyle(0x4c8f4d, 1);
        g.fillCircle(x, y, 7);
        g.fillStyle(0xf2d25a, 1);
        g.fillCircle(x, y - 9, 4);
      }
    }
  }

  private drawSignpost(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
  ): void {
    g.fillStyle(PALETTE.woodDark, 1);
    g.fillRoundedRect(x - 4, y - 10, 8, 62, 3);
    g.fillRoundedRect(x - 38, y - 5, 76, 31, 5);

    this.scene.add
      .text(x, y + 10, 'NORTE ↑', {
        color: '#fff0c7',
        fontFamily: 'system-ui',
        fontSize: '12px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(-690);
  }

  private drawBench(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    vertical: boolean,
  ): void {
    g.fillStyle(PALETTE.woodDark, 0.9);

    if (vertical) {
      g.fillRoundedRect(x, y, 16, 55, 4);
      g.fillRect(x + 3, y + 8, 10, 3);
      g.fillRect(x + 3, y + 42, 10, 3);
    } else {
      g.fillRoundedRect(x, y, 55, 16, 4);
      g.fillRect(x + 8, y + 3, 3, 10);
      g.fillRect(x + 43, y + 3, 3, 10);
    }
  }

  private drawLantern(
    x: number,
    y: number,
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(y - 5);

    g.fillStyle(0x493c31, 1);
    g.fillRoundedRect(x - 3, y, 6, 34, 2);
    g.fillStyle(0x665445, 1);
    g.fillRoundedRect(x - 8, y - 10, 16, 15, 3);
    g.fillStyle(PALETTE.warmLight, 1);
    g.fillCircle(x, y - 3, 4);

    const glow = this.scene.add
      .circle(x, y - 3, 21, PALETTE.warmLight, 0)
      .setDepth(y - 6);
    this.lanternGlows.push(glow);
  }

  private drawFence(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    posts: number,
  ): void {
    g.lineStyle(4, 0x8c6c48, 0.82);
    g.lineBetween(x, y, x + width, y);
    g.lineBetween(x, y + 16, x + width, y + 16);

    for (let i = 0; i <= posts; i += 1) {
      const px = x + (width / posts) * i;
      g.fillStyle(0x765636, 1);
      g.fillRoundedRect(px - 3, y - 8, 6, 31, 2);
    }
  }

  private drawFlowerCluster(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    color: number,
  ): void {
    g.fillStyle(0x4c8a4b, 0.9);
    g.fillRect(x - 1, y, 2, 8);

    g.fillStyle(color, 1);
    g.fillCircle(x - 4, y - 2, 4);
    g.fillCircle(x + 4, y - 2, 4);
    g.fillCircle(x, y - 6, 4);
    g.fillStyle(0xf7e7a2, 1);
    g.fillCircle(x, y - 3, 2.3);
  }

  private drawReeds(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
  ): void {
    g.lineStyle(2, 0x4b7745, 0.86);
    for (let i = 0; i < 5; i += 1) {
      g.lineBetween(
        x + i * 5,
        y,
        x + i * 5 + (i % 2 ? 3 : -2),
        y - 18 - (i % 3) * 4,
      );
    }
  }

  private animateWater(
    elapsedSeconds: number,
  ): void {
    this.waterAnimation.clear();

    for (let row = 0; row < 3; row += 1) {
      const y = pond.y + 36 + row * 39;
      const offset = (elapsedSeconds * (12 + row * 2)) % 55;

      for (let x = pond.x + 25 - offset; x < pond.x + pond.w - 22; x += 62) {
        this.waterAnimation.lineStyle(
          2,
          PALETTE.waterLight,
          0.22 + row * 0.035,
        );
        this.waterAnimation.beginPath();
        this.waterAnimation.moveTo(x, y);
        this.waterAnimation.lineTo(x + 18, y);
        this.waterAnimation.strokePath();
      }
    }

    const shimmerX =
      pond.x +
      35 +
      ((elapsedSeconds * 20) % Math.max(1, pond.w - 70));

    this.waterAnimation.fillStyle(
      PALETTE.waterLight,
      0.28,
    );
    this.waterAnimation.fillEllipse(
      shimmerX,
      pond.y + 62,
      24,
      5,
    );
  }
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function shade(
  color: number,
  factor: number,
): number {
  const r = Math.round(((color >> 16) & 0xff) * factor);
  const g = Math.round(((color >> 8) & 0xff) * factor);
  const b = Math.round((color & 0xff) * factor);

  return (r << 16) | (g << 8) | b;
}
