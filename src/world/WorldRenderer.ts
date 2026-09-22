import Phaser from 'phaser';
import {
  bridgeRect,
  buildings,
  plaza,
  pond,
  roads,
  trees,
  WORLD,
  zones,
} from '../data/world';
import {
  BUILDING_VISUALS,
  isLandmarkBuildingId,
} from '../data/buildingAssets';
import { settlementLots } from '../data/economy';
import type {
  ConstructionProject,
  SettlementBuilding,
} from '../types';

interface AmbientParticle {
  body: Phaser.GameObjects.Arc;
  baseX: number;
  baseY: number;
  phase: number;
}

interface SmokePuff {
  body: Phaser.GameObjects.Arc;
  baseX: number;
  baseY: number;
  phase: number;
}

export class WorldRenderer {
  private settlementObjects: Phaser.GameObjects.GameObject[] = [];
  private landmarkObjects: Phaser.GameObjects.GameObject[] = [];
  private lanternGlows: Phaser.GameObjects.Arc[] = [];
  private buildingGlows: Phaser.GameObjects.Arc[] = [];
  private fountainDrops: AmbientParticle[] = [];
  private smoke: SmokePuff[] = [];
  private river?: Phaser.GameObjects.TileSprite;
  private riverSheen: Phaser.GameObjects.Graphics;
  private lastDynamicUpdate = -Infinity;

  constructor(
    private readonly scene: Phaser.Scene,
  ) {
    this.riverSheen = scene.add
      .graphics()
      .setDepth(-906);
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

    this.createTerrain();
    this.createVillageProps();
    this.createLandmarkBuildings();
    this.createAmbientEffects();
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

    this.animateWater(elapsedSeconds);
    this.animateFountain(elapsedSeconds);
    this.animateSmoke(elapsedSeconds);
    this.animateLights(
      elapsedSeconds,
      nightStrength,
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
        .filter((project) => project.status === 'building')
        .map((project) => project.lotId),
      ...settlementBuildings.map((building) => building.lotId),
    ]);

    for (const lot of settlementLots) {
      if (occupiedLots.has(lot.id)) continue;
      this.drawEmptyLot(lot);
    }
  }

  private createTerrain(): void {
    this.scene.add
      .tileSprite(
        WORLD.width / 2,
        WORLD.height / 2,
        WORLD.width,
        WORLD.height,
        'env-grass',
      )
      .setDepth(-1000);

    // Subtle darker meadows visually break the huge grass plane without
    // creating extra texture assets.
    const meadow = this.scene.add
      .graphics()
      .setDepth(-985);

    meadow.fillStyle(0x315f3b, 0.08);
    meadow.fillEllipse(530, 850, 520, 360);
    meadow.fillEllipse(1020, 1130, 670, 390);
    meadow.fillEllipse(1740, 680, 480, 310);

    for (const road of roads) {
      this.scene.add
        .tileSprite(
          road.x + road.w / 2,
          road.y + road.h / 2,
          road.w,
          road.h,
          'env-stone',
        )
        .setDepth(-955);
    }

    const plazaMask = this.scene.add
      .graphics()
      .fillStyle(0xffffff)
      .fillCircle(
        plaza.x,
        plaza.y,
        plaza.radius,
      )
      .setVisible(false);

    this.scene.add
      .tileSprite(
        plaza.x,
        plaza.y,
        plaza.radius * 2,
        plaza.radius * 2,
        'env-stone',
      )
      .setDepth(-948)
      .setMask(
        plazaMask.createGeometryMask(),
      );

    // A soft ring makes the plaza feel deliberately landscaped rather than
    // simply cut out of the road texture.
    this.scene.add
      .graphics()
      .setDepth(-947)
      .lineStyle(
        8,
        0xd7c99d,
        0.32,
      )
      .strokeCircle(
        plaza.x,
        plaza.y,
        plaza.radius - 5,
      );

    const riverMask = this.scene.add
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

    this.river = this.scene.add
      .tileSprite(
        pond.x + pond.w / 2,
        pond.y + pond.h / 2,
        pond.w,
        pond.h,
        'env-water',
      )
      .setDepth(-925)
      .setMask(
        riverMask.createGeometryMask(),
      );

    // River banks.
    const bank = this.scene.add
      .graphics()
      .setDepth(-926);

    bank.lineStyle(
      20,
      0x4f7848,
      0.82,
    );
    bank.strokeRoundedRect(
      pond.x - 7,
      pond.y - 7,
      pond.w + 14,
      pond.h + 14,
      50,
    );

    bank.lineStyle(
      6,
      0xb8a274,
      0.42,
    );
    bank.strokeRoundedRect(
      pond.x + 4,
      pond.y + 4,
      pond.w - 8,
      pond.h - 8,
      42,
    );

    // The bridge visually covers the passable gap in the river collision.
    this.scene.add
      .image(
        bridgeRect.x +
          bridgeRect.w / 2,
        bridgeRect.y +
          bridgeRect.h / 2,
        'prop-bridge',
      )
      .setDisplaySize(
        bridgeRect.w + 22,
        bridgeRect.h + 30,
      )
      .setDepth(
        bridgeRect.y +
          bridgeRect.h / 2,
      );
  }

  private createVillageProps(): void {
    this.scene.add
      .image(
        plaza.x,
        plaza.y,
        'prop-fountain',
      )
      .setDisplaySize(
        238,
        205,
      )
      .setDepth(
        plaza.y - 4,
      );

    const treeKeys = [
      'prop-treeGreen',
      'prop-treeGreen',
      'prop-treePink',
      'prop-treeGreen',
      'prop-treeGold',
    ];

    trees.forEach((tree, index) => {
      const key =
        treeKeys[
          index %
            treeKeys.length
        ]!;

      const width =
        index % 4 === 0
          ? 110
          : 92;

      const height =
        index % 4 === 0
          ? 132
          : 112;

      this.scene.add
        .image(
          tree.x,
          tree.y,
          key,
        )
        .setOrigin(
          0.5,
          0.78,
        )
        .setDisplaySize(
          width,
          height,
        )
        .setDepth(
          Math.round(
            tree.y + 28,
          ),
        );
    });

    this.createGarden();
    this.createMarketYard();
    this.createForgeYard();
    this.createTavernYard();
    this.createRiverWalk();
    this.createLamps();
  }

  private createGarden(): void {
    const garden = zones.elenaGarden;

    this.scene.add
      .image(
        garden.x + 215,
        garden.y + 350,
        'prop-fence',
      )
      .setDisplaySize(
        375,
        105,
      )
      .setDepth(
        garden.y + 365,
      );

    const flowerSpots = [
      [205, 850],
      [285, 830],
      [375, 855],
      [470, 825],
      [185, 900],
      [485, 920],
      [555, 900],
    ];

    for (
      let index = 0;
      index <
      flowerSpots.length;
      index += 1
    ) {
      const [x, y] =
        flowerSpots[index]!;

      this.scene.add
        .image(
          x,
          y,
          index % 2 === 0
            ? 'prop-bush'
            : 'prop-treePink',
        )
        .setDisplaySize(
          index % 2 === 0
            ? 58
            : 54,
          index % 2 === 0
            ? 42
            : 64,
        )
        .setDepth(y);
    }
  }

  private createMarketYard(): void {
    this.scene.add
      .image(
        1595,
        470,
        'prop-market',
      )
      .setDisplaySize(
        230,
        118,
      )
      .setDepth(490);

    for (
      const [x, y] of [
        [1435, 500],
        [1760, 495],
        [1820, 455],
      ]
    ) {
      this.scene.add
        .image(
          x,
          y,
          'prop-bush',
        )
        .setDisplaySize(
          58,
          42,
        )
        .setDepth(y);
    }
  }

  private createForgeYard(): void {
    this.scene.add
      .image(
        760,
        435,
        'prop-bush',
      )
      .setDisplaySize(
        62,
        44,
      )
      .setDepth(435);

    this.scene.add
      .image(
        1165,
        450,
        'prop-bush',
      )
      .setDisplaySize(
        62,
        44,
      )
      .setDepth(450);
  }

  private createTavernYard(): void {
    for (
      const [x, y] of [
        [120, 435],
        [535, 430],
      ]
    ) {
      this.scene.add
        .image(
          x,
          y,
          'prop-bush',
        )
        .setDisplaySize(
          64,
          46,
        )
        .setDepth(y);
    }
  }

  private createRiverWalk(): void {
    const reeds = [
      [1260, 700],
      [1260, 1010],
      [1600, 690],
      [1600, 1035],
      [1265, 1210],
      [1598, 1215],
    ];

    for (
      const [x, y] of reeds
    ) {
      this.scene.add
        .image(
          x,
          y,
          'prop-bush',
        )
        .setDisplaySize(
          60,
          44,
        )
        .setDepth(y);
    }
  }

  private createLamps(): void {
    const lamps = [
      [720, 555],
      [1140, 555],
      [720, 785],
      [1140, 785],
      [1275, 760],
      [1620, 820],
      [1820, 930],
      [350, 760],
      [605, 430],
      [1300, 430],
    ];

    for (
      const [x, y] of lamps
    ) {
      this.scene.add
        .image(
          x,
          y,
          'prop-lamp',
        )
        .setOrigin(
          0.5,
          0.9,
        )
        .setDisplaySize(
          42,
          112,
        )
        .setDepth(
          y + 22,
        );

      const glow =
        this.scene.add
          .circle(
            x,
            y - 46,
            34,
            0xf2c96a,
            0,
          )
          .setDepth(
            y + 23,
          )
          .setBlendMode(
            Phaser.BlendModes.ADD,
          );

      this.lanternGlows.push(
        glow,
      );
    }
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

      const visual =
        BUILDING_VISUALS[
          building.id
        ];

      if (
        !this.scene.textures.exists(
          visual.key,
        )
      ) {
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

      // Scale against the physical footprint rather than hard-coded old-map
      // sizes. This keeps art and physics aligned after the rebuild.
      const targetWidth =
        building.w +
        (building.id ===
        'fisher-home'
          ? 90
          : 48);

      const targetHeight =
        Math.round(
          targetWidth *
            (visual.height /
              visual.width),
        );

      const depth =
        building.y +
        building.h -
        2;

      const image =
        this.scene.add
          .image(
            x,
            bottomY,
            visual.key,
          )
          .setOrigin(
            0.5,
            1,
          )
          .setDisplaySize(
            targetWidth,
            targetHeight,
          )
          .setDepth(depth);

      this.landmarkObjects.push(
        image,
      );

      for (
        const glowConfig of
        visual.glow ?? []
      ) {
        const scale =
          targetWidth /
          visual.width;

        const glow =
          this.scene.add
            .circle(
              x +
                glowConfig.x *
                  scale,
              bottomY +
                glowConfig.y *
                  scale,
              glowConfig.radius *
                scale,
              glowConfig.color,
              0,
            )
            .setDepth(
              depth + 0.1,
            )
            .setBlendMode(
              Phaser.BlendModes.ADD,
            );

        this.buildingGlows.push(
          glow,
        );
      }

      if (
        building.id ===
          'inn' ||
        building.id ===
          'smith'
      ) {
        const smokeX =
          building.id ===
          'inn'
            ? x + 105
            : x + 88;

        const smokeY =
          bottomY -
          targetHeight +
          32;

        for (
          let puff = 0;
          puff < 3;
          puff += 1
        ) {
          const body =
            this.scene.add
              .circle(
                smokeX,
                smokeY,
                9 + puff * 2,
                0xd7dde0,
                0.18,
              )
              .setDepth(
                depth + 0.15,
              );

          this.smoke.push({
            body,
            baseX: smokeX,
            baseY: smokeY,
            phase:
              puff * 1.73,
          });
        }
      }
    }
  }

  private createAmbientEffects(): void {
    for (
      let index = 0;
      index < 8;
      index += 1
    ) {
      const angle =
        (Math.PI * 2 * index) /
        8;

      const baseX =
        plaza.x +
        Math.cos(angle) *
          54;

      const baseY =
        plaza.y -
        34 +
        Math.sin(angle) *
          18;

      const body =
        this.scene.add
          .circle(
            baseX,
            baseY,
            3,
            0xbff3fb,
            0.45,
          )
          .setDepth(
            plaza.y + 3,
          );

      this.fountainDrops.push({
        body,
        baseX,
        baseY,
        phase:
          index * 0.78,
      });
    }
  }

  private animateWater(
    elapsedSeconds: number,
  ): void {
    if (this.river) {
      this.river.tilePositionY =
        elapsedSeconds * 7;

      this.river.tilePositionX =
        Math.sin(
          elapsedSeconds * 0.35,
        ) *
        5;
    }

    this.riverSheen.clear();

    for (
      let row = 0;
      row < 8;
      row += 1
    ) {
      const y =
        pond.y +
        60 +
        row * 88;

      const drift =
        ((elapsedSeconds *
          (8 + row * 0.35)) %
          44) -
        22;

      this.riverSheen
        .lineStyle(
          2,
          0xd4f4f5,
          0.15,
        )
        .lineBetween(
          pond.x +
            42 +
            drift,
          y,
          pond.x +
            102 +
            drift,
          y,
        );
    }
  }

  private animateFountain(
    elapsedSeconds: number,
  ): void {
    for (
      let index = 0;
      index <
      this.fountainDrops.length;
      index += 1
    ) {
      const drop =
        this.fountainDrops[
          index
        ]!;

      const t =
        elapsedSeconds * 2.2 +
        drop.phase;

      drop.body.setPosition(
        drop.baseX +
          Math.sin(t) * 5,
        drop.baseY -
          Math.abs(
            Math.sin(t),
          ) *
            15,
      );

      drop.body.setAlpha(
        0.2 +
          Math.abs(
            Math.cos(t),
          ) *
            0.38,
      );
    }
  }

  private animateSmoke(
    elapsedSeconds: number,
  ): void {
    for (
      let index = 0;
      index <
      this.smoke.length;
      index += 1
    ) {
      const puff =
        this.smoke[index]!;

      const cycle =
        (elapsedSeconds * 0.22 +
          puff.phase) %
        1;

      puff.body
        .setPosition(
          puff.baseX +
            Math.sin(
              elapsedSeconds *
                0.8 +
                puff.phase,
            ) *
              8,
          puff.baseY -
            cycle * 55,
        )
        .setScale(
          0.7 + cycle * 1.15,
        )
        .setAlpha(
          (1 - cycle) *
            0.22,
        );
    }
  }

  private animateLights(
    elapsedSeconds: number,
    nightStrength: number,
  ): void {
    const glowAlpha =
      Phaser.Math.Clamp(
        nightStrength * 0.5,
        0,
        0.5,
      );

    for (
      let index = 0;
      index <
      this.lanternGlows.length;
      index += 1
    ) {
      const pulse =
        0.9 +
        Math.sin(
          elapsedSeconds * 1.7 +
            index * 1.31,
        ) *
          0.1;

      this.lanternGlows[
        index
      ]!.setAlpha(
        glowAlpha * pulse,
      );
    }

    for (
      let index = 0;
      index <
      this.buildingGlows.length;
      index += 1
    ) {
      const pulse =
        0.88 +
        Math.sin(
          elapsedSeconds * 1.45 +
            index * 0.91,
        ) *
          0.12;

      this.buildingGlows[
        index
      ]!.setAlpha(
        glowAlpha *
          pulse *
          0.85,
      );
    }
  }

  private drawSettlementBuilding(
    building: SettlementBuilding,
  ): void {
    const g =
      this.scene.add
        .graphics()
        .setDepth(
          building.y,
        );

    g.fillStyle(
      0x17371f,
      0.18,
    );
    g.fillRoundedRect(
      building.x + 8,
      building.y + 18,
      building.w,
      building.h,
      12,
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
      10,
    );

    g.fillStyle(
      building.roof,
      1,
    );
    g.fillTriangle(
      building.x - 12,
      building.y + 60,
      building.x +
        building.w / 2,
      building.y - 8,
      building.x +
        building.w +
        12,
      building.y + 60,
    );

    g.fillStyle(
      0x5a3d2a,
      1,
    );
    g.fillRoundedRect(
      building.x +
        building.w / 2 -
        20,
      building.y +
        building.h -
        58,
      40,
      58,
      7,
    );

    const label =
      this.scene.add
        .text(
          building.x +
            building.w / 2,
          building.y +
            building.h +
            16,
          building.name,
          {
            fontFamily:
              'Georgia, serif',
            fontSize:
              '11px',
            fontStyle:
              'bold',
            color:
              '#fff6dd',
            backgroundColor:
              'rgba(78,54,36,.82)',
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

    const g =
      this.scene.add
        .graphics()
        .setDepth(lot.y);

    g.fillStyle(
      0xb58c60,
      0.3,
    );
    g.fillRoundedRect(
      lot.x + 10,
      lot.y + 12,
      lot.w - 20,
      lot.h - 18,
      12,
    );

    g.lineStyle(
      6,
      0x89603f,
      0.9,
    );
    g.strokeRoundedRect(
      lot.x + 25,
      lot.y + 30,
      lot.w - 50,
      Math.min(
        95,
        lot.h - 50,
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
      let index = 0;
      index <
      beamCount;
      index += 1
    ) {
      const x =
        lot.x +
        38 +
        index *
          ((lot.w - 76) /
            Math.max(
              1,
              beamCount - 1,
            ));

      g.lineBetween(
        x,
        lot.y + 35,
        x,
        lot.y + 120,
      );
    }

    const label =
      this.scene.add
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
            fontFamily:
              'system-ui',
            fontSize:
              '11px',
            fontStyle:
              'bold',
            align:
              'center',
            color:
              '#fff5d8',
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
    const g =
      this.scene.add
        .graphics()
        .setDepth(-650);

    g.lineStyle(
      2,
      0xe6d8a8,
      0.16,
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
        .setAlpha(0.62);

    this.settlementObjects.push(
      g,
      label,
    );
  }
}
