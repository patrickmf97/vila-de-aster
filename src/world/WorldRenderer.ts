import Phaser from 'phaser';
import {
  bridgeRect,
  buildings,
  plaza,
  pond,
  roadPaths,
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

interface SwayingProp {
  body: Phaser.GameObjects.Image;
  baseRotation: number;
  phase: number;
  amount: number;
}

export class WorldRenderer {
  private settlementObjects: Phaser.GameObjects.GameObject[] = [];
  private landmarkObjects: Phaser.GameObjects.GameObject[] = [];
  private lanternGlows: Phaser.GameObjects.Arc[] = [];
  private buildingGlows: Phaser.GameObjects.Arc[] = [];
  private fountainDrops: AmbientParticle[] = [];
  private smoke: SmokePuff[] = [];
  private swayingProps: SwayingProp[] = [];
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
    this.animateFoliage(elapsedSeconds);
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
    const terrain = this.scene.add
      .graphics()
      .setDepth(-1000);

    terrain.fillStyle(
      0x739e59,
      1,
    );
    terrain.fillRect(
      0,
      0,
      WORLD.width,
      WORLD.height,
    );

    // Low-cost organic grass variation. These broad shapes replace the
    // obvious square repetition that came from treating a catalog crop as
    // a seamless tile.
    terrain.fillStyle(
      0x4f7e48,
      0.09,
    );
    terrain.fillEllipse(
      470,
      870,
      620,
      390,
    );
    terrain.fillEllipse(
      1060,
      1140,
      720,
      410,
    );
    terrain.fillEllipse(
      1770,
      610,
      470,
      340,
    );
    terrain.fillEllipse(
      330,
      245,
      520,
      270,
    );

    terrain.fillStyle(
      0xa8c67b,
      0.07,
    );
    terrain.fillEllipse(
      930,
      660,
      950,
      520,
    );


    const roadGraphics =
      this.scene.add
        .graphics()
        .setDepth(-960);

    for (const path of roadPaths) {
      this.drawRoadPath(
        roadGraphics,
        path.points,
        path.width,
      );
    }

    // Plaza uses one source crop only, stretched and clipped as a single
    // surface. No repeated seams.
    roadGraphics.fillStyle(
      0xcdbd99,
      1,
    );
    roadGraphics.fillCircle(
      plaza.x,
      plaza.y,
      plaza.radius + 8,
    );

    this.drawPlazaCobbles(
      roadGraphics,
    );

    roadGraphics.lineStyle(
      6,
      0xe3d5b4,
      0.48,
    );
    roadGraphics.strokeCircle(
      plaza.x,
      plaza.y,
      plaza.radius - 4,
    );

    this.createRiver();
  }

  private drawPlazaCobbles(
    graphics: Phaser.GameObjects.Graphics,
  ): void {
    const spacing = 29;
    let row = 0;

    for (
      let y =
        plaza.y -
        plaza.radius +
        26;
      y <=
      plaza.y +
        plaza.radius -
        26;
      y += spacing
    ) {
      const offset =
        row % 2 === 0
          ? 0
          : spacing / 2;

      for (
        let x =
          plaza.x -
          plaza.radius +
          24 +
          offset;
        x <=
        plaza.x +
          plaza.radius -
          24;
        x += spacing
      ) {
        const dx =
          x - plaza.x;
        const dy =
          y - plaza.y;

        if (
          dx * dx +
            dy * dy >
          (plaza.radius - 25) *
            (plaza.radius - 25)
        ) {
          continue;
        }

        const seed =
          Math.abs(
            Math.floor(
              x * 13 +
                y * 7,
            ),
          );

        const width =
          19 +
          (seed % 8);
        const height =
          11 +
          (seed % 5);

        graphics.fillStyle(
          seed % 3 === 0
            ? 0xb3a287
            : seed % 3 === 1
              ? 0xdccdae
              : 0xc5b596,
          0.62,
        );

        graphics.fillRoundedRect(
          x - width / 2,
          y - height / 2,
          width,
          height,
          4,
        );
      }

      row += 1;
    }
  }

  private drawRoadPath(
    graphics: Phaser.GameObjects.Graphics,
    points: Array<{ x: number; y: number }>,
    width: number,
  ): void {
    if (points.length < 2) return;

    graphics.lineStyle(
      width + 18,
      0x6d684f,
      0.18,
    );
    graphics.beginPath();
    graphics.moveTo(
      points[0]!.x,
      points[0]!.y,
    );
    for (
      let index = 1;
      index < points.length;
      index += 1
    ) {
      graphics.lineTo(
        points[index]!.x,
        points[index]!.y,
      );
    }
    graphics.strokePath();

    graphics.lineStyle(
      width,
      0xc8b894,
      1,
    );
    graphics.beginPath();
    graphics.moveTo(
      points[0]!.x,
      points[0]!.y,
    );
    for (
      let index = 1;
      index < points.length;
      index += 1
    ) {
      graphics.lineTo(
        points[index]!.x,
        points[index]!.y,
      );
    }
    graphics.strokePath();

    for (const point of points) {
      graphics.fillStyle(
        0xc8b894,
        1,
      );
      graphics.fillCircle(
        point.x,
        point.y,
        width / 2,
      );
    }

    // Deterministic cobblestone accents: enough texture to feel paved, but
    // much cheaper and cleaner than repeating the sheet crop.
    for (
      let segment = 0;
      segment < points.length - 1;
      segment += 1
    ) {
      const from =
        points[segment]!;
      const to =
        points[segment + 1]!;
      const distance =
        Phaser.Math.Distance.Between(
          from.x,
          from.y,
          to.x,
          to.y,
        );
      const count =
        Math.max(
          2,
          Math.floor(
            distance / 46,
          ),
        );

      for (
        let index = 1;
        index < count;
        index += 1
      ) {
        const t =
          index / count;
        const x =
          Phaser.Math.Linear(
            from.x,
            to.x,
            t,
          );
        const y =
          Phaser.Math.Linear(
            from.y,
            to.y,
            t,
          );
        const normalX =
          -(to.y - from.y) /
          Math.max(
            1,
            distance,
          );
        const normalY =
          (to.x - from.x) /
          Math.max(
            1,
            distance,
          );
        const offset =
          (((index * 37 +
            segment * 19) %
            41) -
            20) *
          0.58;

        graphics.fillStyle(
          index % 2 === 0
            ? 0xa9997d
            : 0xe2d6ba,
          0.42,
        );
        graphics.fillRoundedRect(
          x +
            normalX *
              offset -
            8,
          y +
            normalY *
              offset -
            4,
          16 +
            (index % 3) *
              4,
          8 +
            (index % 2) *
              3,
          3,
        );
      }
    }
  }

  private createRiver(): void {
    const riverBase =
      this.scene.add
        .graphics()
        .setDepth(-930);

    riverBase.fillStyle(
      0x4d9ec5,
      1,
    );
    riverBase.fillRoundedRect(
      pond.x,
      pond.y,
      pond.w,
      pond.h,
      44,
    );

    const bank =
      this.scene.add
        .graphics()
        .setDepth(-924);

    bank.lineStyle(
      18,
      0x527a49,
      0.9,
    );
    bank.strokeRoundedRect(
      pond.x - 5,
      pond.y - 5,
      pond.w + 10,
      pond.h + 10,
      48,
    );

    bank.lineStyle(
      5,
      0xb9a77d,
      0.42,
    );
    bank.strokeRoundedRect(
      pond.x + 5,
      pond.y + 5,
      pond.w - 10,
      pond.h - 10,
      40,
    );

    // Bridge is centered exactly over the collision corridor.
    this.scene.add
      .image(
        bridgeRect.x +
          bridgeRect.w / 2,
        bridgeRect.y +
          bridgeRect.h / 2,
        'prop-bridge',
      )
      .setDisplaySize(
        bridgeRect.w - 34,
        bridgeRect.h - 18,
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

    trees.forEach(
      (tree, index) => {
        const key =
          treeKeys[
            index %
              treeKeys.length
          ]!;

        const width =
          index % 4 === 0
            ? 98
            : 84;
        const height =
          index % 4 === 0
            ? 118
            : 102;

        const image =
          this.addMaskedProp(
            key,
            tree.x,
            tree.y,
            width,
            height,
            Math.round(
              tree.y + 24,
            ),
            0.9,
          );

        this.swayingProps.push({
          body: image,
          baseRotation: 0,
          phase:
            index * 0.71,
          amount:
            index % 3 === 0
              ? 0.012
              : 0.007,
        });
      },
    );

    this.createGarden();
    this.createMarketYard();
    this.createForgeYard();
    this.createTavernYard();
    this.createRiverWalk();
    this.createLamps();
  }

  private addMaskedProp(
    key: string,
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number,
    alpha = 1,
  ): Phaser.GameObjects.Image {
    const mask =
      this.scene.add
        .graphics()
        .fillStyle(
          0xffffff,
          1,
        )
        .fillEllipse(
          x,
          y,
          width * 0.94,
          height * 0.94,
        )
        .setVisible(false);

    return this.scene.add
      .image(
        x,
        y,
        key,
      )
      .setDisplaySize(
        width,
        height,
      )
      .setAlpha(alpha)
      .setDepth(depth)
      .setMask(
        mask.createGeometryMask(),
      );
  }

  private createGarden(): void {
    const garden =
      zones.elenaGarden;

    this.scene.add
      .image(
        garden.x + 225,
        garden.y + 365,
        'prop-fence',
      )
      .setDisplaySize(
        390,
        102,
      )
      .setDepth(
        garden.y + 382,
      );

    const shrubs = [
      [180, 850, 64, 46],
      [255, 830, 58, 42],
      [425, 845, 62, 45],
      [505, 875, 60, 44],
      [180, 925, 58, 42],
      [510, 940, 62, 45],
    ];

    shrubs.forEach(
      ([x, y, w, h], index) => {
        const image =
          this.addMaskedProp(
            'prop-bush',
            x,
            y,
            w,
            h,
            y,
            0.95,
          );

        if (index % 2 === 0) {
          image.setTint(
            0xfff2f5,
          );
        }
      },
    );

    const blossom =
      this.addMaskedProp(
        'prop-treePink',
        425,
        1010,
        92,
        106,
        1030,
        0.92,
      );

    this.swayingProps.push({
      body: blossom,
      baseRotation: 0,
      phase: 1.4,
      amount: 0.008,
    });
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
    this.riverSheen.clear();

    for (
      let row = 0;
      row < 10;
      row += 1
    ) {
      const y =
        pond.y +
        44 +
        row * 82;

      const drift =
        ((elapsedSeconds *
          (8 + row * 0.35)) %
          44) -
        22;

      this.riverSheen
        .lineStyle(
          2,
          0xd9f5f7,
          0.24,
        )
        .lineBetween(
          pond.x +
            32 +
            drift,
          y,
          pond.x +
            112 +
            drift,
          y,
        );
    }
  }

  private animateFoliage(
    elapsedSeconds: number,
  ): void {
    for (
      let index = 0;
      index <
      this.swayingProps.length;
      index += 1
    ) {
      const prop =
        this.swayingProps[
          index
        ]!;

      prop.body.setRotation(
        prop.baseRotation +
          Math.sin(
            elapsedSeconds *
              0.82 +
              prop.phase,
          ) *
            prop.amount,
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
