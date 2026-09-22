import Phaser from 'phaser';
import { buildings, pond, trees, WORLD } from '../data/world';
import { BUILDING_VISUALS, isLandmarkBuildingId } from '../data/buildingAssets';
import { settlementLots } from '../data/economy';
import type {
  ConstructionProject,
  SettlementBuilding,
} from '../types';

export class WorldRenderer {
  private settlementObjects: Phaser.GameObjects.GameObject[] = [];
  private waterAnimation: Phaser.GameObjects.Graphics;
  private lanternGlows: Phaser.GameObjects.Arc[] = [];
  private landmarkObjects: Phaser.GameObjects.GameObject[] = [];
  private buildingGlows: Phaser.GameObjects.Arc[] = [];
  private lastDynamicUpdate = -Infinity;

  constructor(
    private readonly scene: Phaser.Scene,
  ) {
    this.waterAnimation = scene.add
      .graphics()
      .setDepth(-620);
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

    this.createProductionTerrain();
    this.createEnvironmentProps();
    this.createLandmarkBuildings();
    this.createNightLanterns();

    this.syncSettlement(
      settlementBuildings,
      constructionProjects,
    );
  }

  update(
    elapsedSeconds: number,
    nightStrength: number,
  ): void {
    if (
      elapsedSeconds -
        this.lastDynamicUpdate <
      1 / 12
    ) {
      return;
    }

    this.lastDynamicUpdate =
      elapsedSeconds;

    this.animateWater(
      elapsedSeconds,
    );

    const glowAlpha =
      Phaser.Math.Clamp(
        nightStrength * 0.42,
        0,
        0.42,
      );

    for (
      let index = 0;
      index <
      this.lanternGlows.length;
      index += 1
    ) {
      const glow =
        this.lanternGlows[
          index
        ]!;

      const pulse =
        0.9 +
        Math.sin(
          elapsedSeconds * 1.7 +
            index * 1.31,
        ) *
          0.1;

      glow.setAlpha(
        glowAlpha * pulse,
      );
    }

    for (
      let index = 0;
      index <
      this.buildingGlows.length;
      index += 1
    ) {
      const glow =
        this.buildingGlows[
          index
        ]!;

      const pulse =
        0.88 +
        Math.sin(
          elapsedSeconds * 1.45 +
            index * 0.91,
        ) *
          0.12;

      glow.setAlpha(
        glowAlpha *
          pulse *
          0.78,
      );
    }
  }

  syncSettlement(
    settlementBuildings: SettlementBuilding[],
    constructionProjects: ConstructionProject[],
  ): void {
    for (
      const object of
      this.settlementObjects
    ) {
      object.destroy();
    }

    this.settlementObjects = [];

    for (
      const project of
      constructionProjects
    ) {
      if (
        project.status ===
        'building'
      ) {
        this.drawConstructionProject(
          project,
        );
      }
    }

    for (
      const building of
      settlementBuildings
    ) {
      this.drawSettlementBuilding(
        building,
      );
    }

    const occupiedLots =
      new Set([
        ...constructionProjects
          .filter(
            (project) =>
              project.status ===
              'building',
          )
          .map(
            (project) =>
              project.lotId,
          ),
        ...settlementBuildings.map(
          (building) =>
            building.lotId,
        ),
      ]);

    for (
      const lot of settlementLots
    ) {
      if (
        occupiedLots.has(
          lot.id,
        )
      ) {
        continue;
      }

      this.drawEmptyLot(lot);
    }
  }

  private createProductionTerrain(): void {
    this.scene.add
      .tileSprite(
        WORLD.width / 2,
        WORLD.height / 2,
        WORLD.width,
        WORLD.height,
        'env-grass',
      )
      .setDepth(-1000);

    const roadDepth = -940;

    const roads = [
      { x: 700, y: 625, w: 190, h: 1250 },
      { x: 950, y: 660, w: 1900, h: 175 },
      { x: 1270, y: 885, w: 190, h: 730 },
      { x: 1680, y: 945, w: 315, h: 105 },
    ];

    for (const road of roads) {
      this.scene.add
        .tileSprite(
          road.x,
          road.y,
          road.w,
          road.h,
          'env-stone',
        )
        .setDepth(roadDepth);
    }

    const plazaMaskShape = this.scene.add
      .graphics()
      .fillStyle(0xffffff)
      .fillCircle(700, 650, 176)
      .setVisible(false);

    const plaza = this.scene.add
      .tileSprite(
        700,
        650,
        360,
        360,
        'env-stone',
      )
      .setDepth(-930);

    plaza.setMask(
      plazaMaskShape.createGeometryMask(),
    );

    const pondMaskShape = this.scene.add
      .graphics()
      .fillStyle(0xffffff)
      .fillRoundedRect(
        pond.x,
        pond.y,
        pond.w,
        pond.h,
        48,
      )
      .setVisible(false);

    const water = this.scene.add
      .tileSprite(
        pond.x + pond.w / 2,
        pond.y + pond.h / 2,
        pond.w,
        pond.h,
        'env-water',
      )
      .setDepth(-925);

    water.setMask(
      pondMaskShape.createGeometryMask(),
    );
  }

  private createEnvironmentProps(): void {
    this.scene.add
      .image(700, 650, 'prop-fountain')
      .setDisplaySize(220, 190)
      .setDepth(620);

    this.scene.add
      .image(
        pond.x + pond.w / 2,
        pond.y + pond.h / 2,
        'prop-bridge',
      )
      .setDisplaySize(205, 106)
      .setDepth(pond.y + pond.h / 2 + 40);

    const treeKeys = [
      'prop-treeGreen',
      'prop-treePink',
      'prop-treeGold',
    ];

    trees.forEach((tree, index) => {
      const key =
        treeKeys[
          index % treeKeys.length
        ]!;

      this.scene.add
        .image(
          tree.x,
          tree.y + 24,
          key,
        )
        .setOrigin(0.5, 0.82)
        .setDisplaySize(
          index % 3 === 0 ? 92 : 82,
          index % 3 === 0 ? 112 : 100,
        )
        .setDepth(
          Math.round(tree.y + 30),
        );
    });

    const bushes = [
      [520, 520],
      [1040, 520],
      [1490, 510],
      [360, 760],
      [920, 790],
      [1510, 1040],
      [1120, 1090],
    ];

    for (const [x, y] of bushes) {
      this.scene.add
        .image(x, y, 'prop-bush')
        .setDisplaySize(70, 48)
        .setDepth(y);
    }

    const lamps = [
      [596, 528],
      [804, 528],
      [596, 755],
      [804, 755],
      [1240, 710],
      [1560, 710],
    ];

    for (const [x, y] of lamps) {
      this.scene.add
        .image(x, y, 'prop-lamp')
        .setOrigin(0.5, 0.9)
        .setDisplaySize(42, 110)
        .setDepth(y + 18);
    }

    this.scene.add
      .image(300, 1010, 'prop-fence')
      .setDisplaySize(310, 92)
      .setDepth(1012);

    this.scene.add
      .image(1370, 424, 'prop-market')
      .setDisplaySize(190, 95)
      .setDepth(430);
  }

  private createLandmarkBuildings(): void {
    for (const object of this.landmarkObjects) {
      object.destroy();
    }
    this.landmarkObjects = [];

    for (const glow of this.buildingGlows) {
      glow.destroy();
    }
    this.buildingGlows = [];

    for (const building of buildings) {
      if (!isLandmarkBuildingId(building.id)) continue;

      const visual = BUILDING_VISUALS[building.id];

      if (!this.scene.textures.exists(visual.key)) {
        continue;
      }

      const x =
        building.x +
        building.w / 2 +
        (visual.offsetX ?? 0);
      const bottomY =
        building.y +
        building.h +
        (visual.offsetY ?? 0);
      const depth =
        building.y +
        building.h -
        2;

      const image = this.scene.add
        .image(
          x,
          bottomY,
          visual.key,
        )
        .setOrigin(0.5, 1)
        .setDisplaySize(
          visual.width,
          visual.height,
        )
        .setDepth(depth);

      this.landmarkObjects.push(image);



      for (const glowConfig of visual.glow ?? []) {
        const glow = this.scene.add
          .circle(
            x + glowConfig.x,
            bottomY + glowConfig.y,
            glowConfig.radius,
            glowConfig.color,
            0,
          )
          .setDepth(depth + 0.1)
          .setBlendMode(
            Phaser.BlendModes.ADD,
          );

        this.buildingGlows.push(
          glow,
        );
      }
    }
  }

  private createNightLanterns(): void {
    const positions = [
      [596, 528],
      [804, 528],
      [596, 755],
      [804, 755],
      [295, 305],
      [535, 305],
      [1410, 317],
      [1635, 317],
    ];

    for (
      const [x, y] of
      positions
    ) {
      const glow =
        this.scene.add
          .circle(
            x,
            y,
            30,
            0xf1ce78,
            0,
          )
          .setDepth(-605);

      this.lanternGlows.push(
        glow,
      );
    }
  }

  private animateWater(
    elapsedSeconds: number,
  ): void {
    this.waterAnimation.clear();

    const lineXs = [
      1290,
      1350,
      1460,
    ];

    for (
      let row = 0;
      row < 3;
      row += 1
    ) {
      const y =
        pond.y +
        38 +
        row * 40;

      const drift =
        ((elapsedSeconds *
          (7 + row * 1.3)) %
          34) -
        17;

      for (
        const baseX of lineXs
      ) {
        this.waterAnimation
          .lineStyle(
            2,
            0xc7f1f4,
            0.19,
          )
          .lineBetween(
            baseX + drift,
            y,
            baseX +
              22 +
              drift,
            y,
          );
      }
    }
  }

  private drawSettlementBuilding(
    building: SettlementBuilding,
  ): void {
    const g = this.scene.add
      .graphics()
      .setDepth(
        building.y,
      );

    g.fillStyle(
      0x17371f,
      0.16,
    );

    g.fillRoundedRect(
      building.x + 10,
      building.y + 18,
      building.w,
      building.h,
      14,
    );

    g.fillStyle(
      building.wall,
      1,
    );

    g.fillRoundedRect(
      building.x,
      building.y + 42,
      building.w,
      building.h - 42,
      11,
    );

    g.fillStyle(
      building.roof,
      1,
    );

    g.fillTriangle(
      building.x - 16,
      building.y + 62,
      building.x +
        building.w / 2,
      building.y - 6,
      building.x +
        building.w +
        16,
      building.y + 62,
    );

    g.lineStyle(
      4,
      0x5a3d2a,
      0.3,
    );

    for (
      let x =
        building.x + 10;
      x <
      building.x +
        building.w -
        10;
      x += 35
    ) {
      g.lineBetween(
        x,
        building.y + 51,
        x + 20,
        building.y + 51,
      );
    }

    g.fillStyle(
      0x5a3d2a,
      1,
    );

    g.fillRoundedRect(
      building.x +
        building.w / 2 -
        21,
      building.y +
        building.h -
        60,
      42,
      60,
      7,
    );

    g.fillStyle(
      0x79bdd1,
      1,
    );

    g.fillRoundedRect(
      building.x + 30,
      building.y + 84,
      44,
      34,
      3,
    );

    g.fillRoundedRect(
      building.x +
        building.w -
        74,
      building.y + 84,
      44,
      34,
      3,
    );

    const label =
      this.scene.add
        .text(
          building.x +
            building.w / 2,
          building.y +
            building.h +
            17,
          building.name,
          {
            fontFamily:
              'Georgia, serif',
            fontSize:
              '12px',
            fontStyle:
              'bold',
            color:
              '#fff6dd',
            backgroundColor:
              'rgba(78,54,36,.84)',
            padding: {
              x: 8,
              y: 4,
            },
          },
        )
        .setOrigin(0.5)
        .setDepth(
          building.y +
            building.h +
            2,
        );

    this.settlementObjects.push(
      g,
      label,
    );
  }

  private drawConstructionProject(
    project: ConstructionProject,
  ): void {
    const lot =
      settlementLots.find(
        (entry) =>
          entry.id ===
          project.lotId,
      );

    if (!lot) return;

    const g = this.scene.add
      .graphics()
      .setDepth(lot.y);

    g.fillStyle(
      0xb58c60,
      0.38,
    );

    g.fillRoundedRect(
      lot.x + 12,
      lot.y + 18,
      lot.w - 24,
      lot.h - 24,
      14,
    );

    g.lineStyle(
      7,
      0x89603f,
      1,
    );

    g.strokeRoundedRect(
      lot.x + 25,
      lot.y + 35,
      lot.w - 50,
      Math.min(
        105,
        lot.h - 55,
      ),
      5,
    );

    const beamCount =
      Math.max(
        1,
        Math.round(
          project.progress /
            20,
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

    const label =
      this.scene.add
        .text(
          lot.x +
            lot.w / 2,
          lot.y +
            lot.h / 2,
          '🏗️ ' +
            project.name +
            '\n' +
            Math.round(
              project.progress,
            ) +
            '%',
          {
            fontFamily:
              'system-ui',
            fontSize:
              '12px',
            fontStyle:
              'bold',
            align:
              'center',
            color:
              '#fff5d8',
            backgroundColor:
              'rgba(72,51,31,.84)',
            padding: {
              x: 8,
              y: 5,
            },
          },
        )
        .setOrigin(0.5)
        .setDepth(
          lot.y +
            lot.h +
            2,
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
      0.13,
    );

    g.strokeRoundedRect(
      lot.x,
      lot.y,
      lot.w,
      lot.h,
      13,
    );

    const label =
      this.scene.add
        .text(
          lot.x +
            lot.w / 2,
          lot.y +
            lot.h / 2,
          '🌱 terreno',
          {
            fontFamily:
              'system-ui',
            fontSize:
              '9px',
            color:
              '#f1f2d9',
            backgroundColor:
              'rgba(54,78,47,.42)',
            padding: {
              x: 6,
              y: 3,
            },
          },
        )
        .setOrigin(0.5)
        .setDepth(-640)
        .setAlpha(0.72);

    this.settlementObjects.push(
      g,
      label,
    );
  }
}
