import Phaser from 'phaser';
import { characterStyleFor, type CharacterVisualStyle } from '../data/characterStyles';
import {
  isWorldWalkable,
  navigationWaypoint,
} from '../data/world';
import type {
  Facing,
  NpcActivity,
  NpcBrainState,
  NpcDefinition,
  Point,
  ScheduleEntry,
} from '../types';

export class Npc extends Phaser.GameObjects.Container {
  readonly definition: NpcDefinition;
  currentActivity: NpcActivity = 'rest';

  private readonly visualRoot: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly visualBody: Phaser.GameObjects.Arc;
  private readonly outfitTrim: Phaser.GameObjects.Rectangle;
  private readonly head: Phaser.GameObjects.Arc;
  private readonly hairBack: Phaser.GameObjects.Arc;
  private readonly hairTop: Phaser.GameObjects.Ellipse;
  private readonly hairHighlight: Phaser.GameObjects.Ellipse;
  private readonly leftEye: Phaser.GameObjects.Arc;
  private readonly rightEye: Phaser.GameObjects.Arc;
  private readonly mouth: Phaser.GameObjects.Ellipse;
  private readonly leftArm: Phaser.GameObjects.Rectangle;
  private readonly rightArm: Phaser.GameObjects.Rectangle;
  private readonly leftFoot: Phaser.GameObjects.Ellipse;
  private readonly rightFoot: Phaser.GameObjects.Ellipse;
  private readonly accessory: Phaser.GameObjects.Text;
  private readonly activityProp: Phaser.GameObjects.Text;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly activityLabel: Phaser.GameObjects.Text;
  private lastActivityLabel = '';
  private lastActivityProp = '';
  private nameLabelVisible = false;
  private activityLabelVisible = false;

  private facing: Facing = 'down';
  private walkPhase = 0;
  private readonly wanderSeed: number;
  private readonly style: CharacterVisualStyle;
  private sprite?: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    definition: NpcDefinition,
  ) {
    super(scene, definition.x, definition.y);
    this.definition = definition;
    this.wanderSeed = [...definition.id].reduce(
      (sum, char) => sum + char.charCodeAt(0),
      0,
    );

    const style = characterStyleFor(definition);
    this.style = style;

    this.shadow = scene.add.ellipse(
      0,
      22,
      36 * style.bodyScaleX,
      14,
      0x18351f,
      0.2,
    );

    this.visualRoot = scene.add.container(0, 0);

    this.leftFoot = scene.add.ellipse(
      -6,
      17,
      9,
      6,
      style.shoes,
    );
    this.rightFoot = scene.add.ellipse(
      6,
      17,
      9,
      6,
      style.shoes,
    );

    this.leftArm = scene.add
      .rectangle(
        -16 * style.bodyScaleX,
        4,
        6,
        18,
        style.skin,
      )
      .setOrigin(0.5, 0.18);
    this.rightArm = scene.add
      .rectangle(
        16 * style.bodyScaleX,
        4,
        6,
        18,
        style.skin,
      )
      .setOrigin(0.5, 0.18);

    this.visualBody = scene.add.circle(
      0,
      4,
      15,
      style.outfit,
    );
    this.visualBody.setScale(
      style.bodyScaleX,
      style.bodyScaleY,
    );

    this.outfitTrim = scene.add.rectangle(
      0,
      6,
      22 * style.bodyScaleX,
      5,
      style.trim,
      0.92,
    );

    this.hairBack = scene.add.circle(
      0,
      -15,
      13.2 * style.headScale,
      style.hair,
    );

    this.head = scene.add.circle(
      0,
      -13,
      11.8 * style.headScale,
      style.skin,
    );

    this.hairTop = scene.add.ellipse(
      0,
      -21,
      24 * style.headScale,
      hairHeight(style.hairStyle) * style.headScale,
      style.hair,
    );

    this.hairHighlight = scene.add.ellipse(
      -4,
      -23,
      8 * style.headScale,
      4 * style.headScale,
      style.hairLight,
      0.55,
    );

    this.leftEye = scene.add.circle(
      -4,
      -14,
      1.45,
      0x3c302a,
    );
    this.rightEye = scene.add.circle(
      4,
      -14,
      1.45,
      0x3c302a,
    );

    this.mouth = scene.add.ellipse(
      0,
      -8.6,
      4,
      1.4,
      0x8b5d56,
      0.78,
    );

    this.accessory = scene.add
      .text(
        accessoryX(style.hairStyle),
        accessoryY(style.hairStyle),
        style.accessory ?? '',
        {
          fontFamily: 'serif',
          fontSize: style.hairStyle === 'child'
            ? '10px'
            : '12px',
        },
      )
      .setOrigin(0.5);

    this.activityProp = scene.add
      .text(22, 2, '', {
        fontFamily: 'serif',
        fontSize: '15px',
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.visualRoot.add([
      this.leftFoot,
      this.rightFoot,
      this.leftArm,
      this.rightArm,
      this.visualBody,
      this.outfitTrim,
      this.hairBack,
      this.head,
      this.hairTop,
      this.hairHighlight,
      this.leftEye,
      this.rightEye,
      this.mouth,
      this.accessory,
    ]);

    this.nameLabel = scene.add
      .text(0, 40, definition.name, {
        fontFamily: 'system-ui',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#18301e',
        backgroundColor:
          'rgba(246, 243, 218, 0.68)',
        padding: {
          x: 5,
          y: 2,
        },
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.activityLabel = scene.add
      .text(0, 56, '', {
        fontFamily: 'system-ui',
        fontSize: '9px',
        color: '#314936',
        backgroundColor:
          'rgba(240, 247, 227, 0.78)',
        padding: {
          x: 4,
          y: 2,
        },
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.add([
      this.shadow,
      this.visualRoot,
      this.activityProp,
      this.nameLabel,
      this.activityLabel,
    ]);

    scene.add.existing(this);

    if (definition.scale) {
      this.setScale(definition.scale);
    }

    this.applyHairStyle(style.hairStyle);
    this.applyFacing();
    this.setDepth(yToDepth(this.y));
  }

  useTexture(textureKey: string): void {
    if (this.sprite) this.sprite.destroy();

    this.sprite = this.scene.add
      .sprite(0, -3, textureKey, 0)
      .setDisplaySize(56, 62)
      .setOrigin(0.5, 0.78);

    this.visualRoot.setVisible(false);
    this.activityProp
      .setVisible(false)
      .setDepth(3);
    this.addAt(this.sprite, 1);
  }

  scheduleAt(
    minuteOfDay: number,
  ): ScheduleEntry {
    return (
      this.definition.schedule.find(
        (entry) =>
          minuteOfDay >= entry.from &&
          minuteOfDay < entry.to,
      ) ?? this.definition.schedule[0]
    );
  }

  updateRoutine(
    minuteOfDay: number,
    deltaSeconds: number,
    elapsedSeconds: number,
    residenceTarget?: Point,
    brain?: NpcBrainState,
  ): void {
    const schedule = this.scheduleAt(minuteOfDay);
    const activity =
      brain?.currentActivity ??
      schedule.activity ??
      inferActivity(schedule.label);

    this.currentActivity = activity;

    const micro = this.microOffset(
      activity,
      elapsedSeconds,
    );

    const baseTarget =
      brain?.target ??
      (schedule.homeTarget && residenceTarget
        ? residenceTarget
        : {
            x: schedule.x,
            y: schedule.y,
          });

    const desiredTarget = {
      x: baseTarget.x + micro.x,
      y: baseTarget.y + micro.y,
    };

    const routedTarget =
      this.scene.scene.key === 'VillageScene'
        ? navigationWaypoint(
            { x: this.x, y: this.y },
            desiredTarget,
          )
        : desiredTarget;

    const targetX = routedTarget.x;
    const targetY = routedTarget.y;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      targetX,
      targetY,
    );

    this.setActivityLabel(
      brain?.label ?? activityText(activity),
    );

    if (
      distance > 5 &&
      activity !== 'sleep'
    ) {
      const speed =
        activity === 'walk' ? 54 : 38;

      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        targetX,
        targetY,
      );

      const vx = Math.cos(angle);
      const vy = Math.sin(angle);

      const step =
        speed *
        deltaSeconds;

      if (
        this.scene.scene.key !==
        'VillageScene'
      ) {
        this.x += vx * step;
        this.y += vy * step;
      } else {
        const nextX =
          this.x + vx * step;
        const nextY =
          this.y + vy * step;

        if (
          isWorldWalkable(
            nextX,
            this.y,
            12,
          )
        ) {
          this.x = nextX;
        }

        if (
          isWorldWalkable(
            this.x,
            nextY,
            12,
          )
        ) {
          this.y = nextY;
        }
      }

      this.updateFacing(vx, vy);

      this.walkPhase += deltaSeconds * 9.5;
      this.applyWalkPose(this.walkPhase);
    } else {
      this.applyIdlePose(
        activity,
        elapsedSeconds,
      );
    }

    const sleeping = activity === 'sleep';
    this.setAlpha(sleeping ? 0.62 : 1);
    this.setDepth(yToDepth(this.y));
  }

  moveToward(
    target: Point,
    deltaSeconds: number,
    label = '👣 a caminho',
    speed = 54,
  ): number {
    this.currentActivity = 'walk';
    this.setActivityLabel(label);
    this.setRotation(0);
    this.setAlpha(1);
    this.activityProp.setVisible(false);

    const routedTarget =
      this.scene.scene.key === 'VillageScene'
        ? navigationWaypoint(
            { x: this.x, y: this.y },
            target,
          )
        : target;

    const routeDistance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      routedTarget.x,
      routedTarget.y,
    );

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      target.x,
      target.y,
    );

    if (
      distance <= 5 ||
      deltaSeconds <= 0
    ) {
      this.resetPose();
      this.setDepth(yToDepth(this.y));
      return distance;
    }

    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      routedTarget.x,
      routedTarget.y,
    );

    const vx = Math.cos(angle);
    const vy = Math.sin(angle);
    const step = Math.min(
      routeDistance,
      speed * deltaSeconds,
    );

    if (
      this.scene.scene.key !==
      'VillageScene'
    ) {
      this.x += vx * step;
      this.y += vy * step;
    } else {
      const nextX =
        this.x + vx * step;
      const nextY =
        this.y + vy * step;

      if (
        isWorldWalkable(
          nextX,
          this.y,
          12,
        )
      ) {
        this.x = nextX;
      }

      if (
        isWorldWalkable(
          this.x,
          nextY,
          12,
        )
      ) {
        this.y = nextY;
      }
    }

    this.updateFacing(vx, vy);

    this.walkPhase += deltaSeconds * 9.5;
    this.applyWalkPose(this.walkPhase);
    this.setDepth(yToDepth(this.y));

    return Math.max(0, distance - step);
  }

  syncWorldPresence(
    visible: boolean,
    wakePoint?: Point,
  ): void {
    const wasVisible = this.visible;

    if (
      visible &&
      !wasVisible &&
      wakePoint
    ) {
      this.setPosition(
        wakePoint.x,
        wakePoint.y,
      );
    }

    this.setVisible(visible);
    this.setActive(visible);
  }

  setInteriorActivity(
    activity: NpcActivity,
    label?: string,
  ): void {
    this.currentActivity = activity;
    this.setActivityLabel(
      label ?? activityText(activity),
    );

    const elapsed =
      this.scene.time.now / 1000;

    this.applyIdlePose(
      activity,
      elapsed,
    );

    this.setAlpha(
      activity === 'sleep' ? 0.68 : 1,
    );

    this.setRotation(
      activity === 'sleep' ? -0.08 : 0,
    );
  }

  setLabelVisibility(
    showName: boolean,
    showActivity: boolean,
  ): void {
    if (showName !== this.nameLabelVisible) {
      this.nameLabelVisible = showName;
      this.nameLabel.setVisible(showName);
    }

    if (showActivity !== this.activityLabelVisible) {
      this.activityLabelVisible = showActivity;
      this.activityLabel.setVisible(showActivity);
    }
  }

  private setActivityLabel(text: string): void {
    if (text === this.lastActivityLabel) return;
    this.lastActivityLabel = text;
    this.activityLabel.setText(text);
  }

  private setActivityProp(text: string): void {
    if (text !== this.lastActivityProp) {
      this.lastActivityProp = text;
      this.activityProp.setText(text);
    }
    this.activityProp.setVisible(Boolean(text));
  }

  private applyWalkPose(
    phase: number,
  ): void {
    const wave = Math.sin(phase);
    const bob = Math.abs(wave) * -1.15;

    if (this.sprite) {
      const alternate =
        Math.floor(phase / Math.PI) % 2 === 0;

      const frame =
        this.facing === 'left'
          ? alternate ? 4 : 6
          : this.facing === 'right'
            ? alternate ? 5 : 7
            : this.facing === 'up'
              ? 1
              : 0;

      this.sprite
        .setFrame(frame)
        .setPosition(0, -3 + bob)
        .setRotation(
          Math.sin(phase * 0.5) * 0.012,
        );
    }

    this.visualRoot.y = bob;
    this.visualRoot.rotation =
      Math.sin(phase * 0.5) * 0.018;

    this.leftFoot.y =
      17 + wave * 2.7;
    this.rightFoot.y =
      17 - wave * 2.7;

    this.leftArm.rotation =
      -wave * 0.28;
    this.rightArm.rotation =
      wave * 0.28;

    this.shadow.scaleX =
      1 - Math.abs(wave) * 0.04;

    this.activityProp.setVisible(false);
  }

  private applyIdlePose(
    activity: NpcActivity,
    elapsedSeconds: number,
  ): void {
    const phase =
      elapsedSeconds * 1.8 +
      this.wanderSeed * 0.07;

    const breathe = Math.sin(phase) * 0.45;

    this.resetPose();
    if (this.sprite) {
      const frame =
        this.facing === 'left'
          ? 2
          : this.facing === 'right'
            ? 3
            : this.facing === 'up'
              ? 1
              : 0;

      this.sprite
        .setFrame(frame)
        .setPosition(
          0,
          -3 + breathe * 0.18,
        )
        .setRotation(0);
    }
    this.visualRoot.y = breathe * 0.42;
    this.shadow.scaleX =
      1 + breathe * 0.006;

    const prop =
      activityPropFor(
        activity,
        this.style.workProp,
        this.style.idleProp,
      );

    this.setActivityProp(prop);

    if (activity === 'work') {
      const swing =
        Math.sin(elapsedSeconds * 5.2 + this.wanderSeed) *
        0.34;

      this.rightArm.rotation =
        -0.24 + swing;
      this.activityProp
        .setPosition(22, -1)
        .setRotation(-0.12 + swing * 0.7);
      this.visualRoot.rotation =
        swing * 0.035;
      return;
    }

    if (activity === 'fish') {
      const pull =
        Math.sin(elapsedSeconds * 2.4 + this.wanderSeed) *
        0.12;

      this.rightArm.rotation =
        -0.52 + pull;
      this.activityProp
        .setPosition(24, -5)
        .setRotation(0.12 + pull);
      return;
    }

    if (activity === 'socialize') {
      const gesture =
        Math.sin(elapsedSeconds * 2.1 + this.wanderSeed) *
        0.22;

      this.leftArm.rotation =
        -0.18 + gesture;
      this.rightArm.rotation =
        0.12 - gesture * 0.45;
      this.visualRoot.rotation =
        gesture * 0.025;
      return;
    }

    if (activity === 'eat') {
      const lift =
        Math.max(
          0,
          Math.sin(elapsedSeconds * 3.2 + this.wanderSeed),
        );

      this.rightArm.rotation =
        -0.3 - lift * 0.4;
      this.activityProp
        .setPosition(20, 2 - lift * 7)
        .setRotation(0);
      return;
    }

    if (activity === 'investigate') {
      this.activityProp
        .setPosition(20, -8)
        .setRotation(
          Math.sin(elapsedSeconds * 1.8) * 0.08,
        );

      this.visualRoot.rotation =
        Math.sin(elapsedSeconds * 1.2) * 0.018;
      return;
    }

    if (activity === 'play') {
      this.activityProp
        .setPosition(21, -5)
        .setRotation(
          Math.sin(elapsedSeconds * 2.8) * 0.16,
        );
      this.leftArm.rotation =
        Math.sin(elapsedSeconds * 3) * 0.25;
      return;
    }

    if (activity === 'family') {
      this.leftArm.rotation = -0.16;
      this.rightArm.rotation = 0.16;
      return;
    }

    if (activity === 'sleep') {
      this.activityProp
        .setText('💤')
        .setVisible(true)
        .setPosition(20, -24)
        .setRotation(0);

      this.visualRoot.rotation = -0.055;
      this.leftEye.setScale(1, 0.25);
      this.rightEye.setScale(1, 0.25);
      this.mouth.setScale(0.8, 0.7);
    }
  }

  private resetPose(): void {
    this.visualRoot.y = 0;
    this.visualRoot.rotation = 0;

    this.leftFoot.y = 17;
    this.rightFoot.y = 17;

    this.leftArm.rotation = 0;
    this.rightArm.rotation = 0;

    this.leftEye.setScale(1);
    this.rightEye.setScale(1);
    this.mouth.setScale(1);

    this.shadow.scaleX = 1;

    this.activityProp
      .setRotation(0)
      .setPosition(22, 2)
      .setVisible(false);
  }

  private microOffset(
    activity: NpcActivity,
    elapsedSeconds: number,
  ): {
    x: number;
    y: number;
  } {
    if (
      ![
        'work',
        'socialize',
        'rest',
      ].includes(activity)
    ) {
      return {
        x: 0,
        y: 0,
      };
    }

    const amplitude =
      activity === 'socialize'
        ? 22
        : activity === 'work'
          ? 12
          : 7;

    const t =
      elapsedSeconds *
        (activity === 'socialize'
          ? 0.14
          : 0.09) +
      this.wanderSeed;

    return {
      x: Math.sin(t) * amplitude,
      y:
        Math.cos(t * 0.73) *
        amplitude *
        0.55,
    };
  }

  private updateFacing(
    vx: number,
    vy: number,
  ): void {
    const next: Facing =
      Math.abs(vx) > Math.abs(vy)
        ? vx > 0
          ? 'right'
          : 'left'
        : vy > 0
          ? 'down'
          : 'up';

    if (next !== this.facing) {
      this.facing = next;
      this.applyFacing();
    }
  }

  private applyFacing(): void {
    const shift =
      this.facing === 'left'
        ? -2.5
        : this.facing === 'right'
          ? 2.5
          : 0;

    this.leftEye.x = -4 + shift;
    this.rightEye.x = 4 + shift;
    this.mouth.x = shift * 0.45;

    const lookingAway =
      this.facing === 'up';

    if (this.sprite) {
      const frame =
        this.facing === 'left'
          ? 2
          : this.facing === 'right'
            ? 3
            : this.facing === 'up'
              ? 1
              : 0;

      this.sprite.setFrame(frame);
    }

    this.leftEye.setVisible(!lookingAway);
    this.rightEye.setVisible(!lookingAway);
    this.mouth.setVisible(!lookingAway);

    if (this.facing === 'left') {
      this.leftArm.setDepth(4);
      this.rightArm.setDepth(-2);
      this.activityProp.x = -22;
      this.activityProp.setFlipX(true);
    } else if (
      this.facing === 'right'
    ) {
      this.leftArm.setDepth(-2);
      this.rightArm.setDepth(4);
      this.activityProp.x = 22;
      this.activityProp.setFlipX(false);
    } else {
      this.leftArm.setDepth(0);
      this.rightArm.setDepth(0);
      this.activityProp.x = 22;
      this.activityProp.setFlipX(false);
    }
  }

  private applyHairStyle(
    hairStyle:
      | 'soft'
      | 'short'
      | 'wave'
      | 'messy'
      | 'bun'
      | 'child',
  ): void {
    if (hairStyle === 'short') {
      this.hairBack.setScale(0.94, 0.78);
      this.hairTop.setScale(1, 0.84);
      return;
    }

    if (hairStyle === 'wave') {
      this.hairBack.setScale(1.1, 1.14);
      this.hairTop.setScale(1.05, 1.05);
      return;
    }

    if (hairStyle === 'messy') {
      this.hairBack.setScale(1.03, 0.95);
      this.hairTop.setRotation(-0.08);
      this.hairHighlight.setRotation(-0.15);
      return;
    }

    if (hairStyle === 'bun') {
      this.hairBack.setScale(1, 1.02);

      const bun = this.scene.add.circle(
        9,
        -26,
        5.6,
        this.style.hair,
      );
      const bunLight = this.scene.add.circle(
        7.5,
        -27,
        2.2,
        this.style.hairLight,
        0.5,
      );

      this.visualRoot.addAt(
        bun,
        Math.max(
          0,
          this.visualRoot.getIndex(this.head),
        ),
      );
      this.visualRoot.add(bunLight);
      return;
    }

    if (hairStyle === 'child') {
      this.hairBack.setScale(0.96, 0.92);
      this.hairTop.setScale(0.96, 0.9);
    }
  }
}

function inferActivity(
  label: string,
): NpcActivity {
  const value = label.toLowerCase();

  if (value.includes('dorm')) return 'sleep';
  if (value.includes('pesc')) return 'fish';
  if (value.includes('brinc')) return 'play';
  if (value.includes('família')) return 'family';
  if (value.includes('comendo')) return 'eat';
  if (value.includes('investig')) return 'investigate';

  if (
    value.includes('convers') ||
    value.includes('praça')
  ) {
    return 'socialize';
  }

  if (
    value.includes('caminh') ||
    value.includes('voltando')
  ) {
    return 'walk';
  }

  if (
    value.includes('trabalh') ||
    value.includes('forja') ||
    value.includes('empório') ||
    value.includes('taverna')
  ) {
    return 'work';
  }

  return 'rest';
}

function activityText(
  activity: NpcActivity,
): string {
  return {
    sleep: '💤 descansando',
    work: '🔨 trabalhando',
    walk: '👣 a caminho',
    socialize: '💬 socializando',
    rest: '🌿 descansando',
    fish: '🎣 pescando',
    play: '🪁 brincando',
    family: '🏠 com a família',
    eat: '🍲 comendo',
    investigate: '🔎 investigando',
  }[activity];
}

function activityPropFor(
  activity: NpcActivity,
  workProp?: string,
  idleProp?: string,
): string {
  if (
    activity === 'work' ||
    activity === 'fish'
  ) {
    return (
      workProp ??
      (activity === 'fish'
        ? '🎣'
        : '🔨')
    );
  }

  if (activity === 'play') {
    return idleProp ?? '🪁';
  }

  if (activity === 'eat') {
    return '🍲';
  }

  if (activity === 'investigate') {
    return '🔎';
  }

  if (
    activity === 'rest' &&
    idleProp
  ) {
    return idleProp;
  }

  return '';
}

function hairHeight(
  style:
    | 'soft'
    | 'short'
    | 'wave'
    | 'messy'
    | 'bun'
    | 'child',
): number {
  return {
    soft: 13,
    short: 10,
    wave: 15,
    messy: 12,
    bun: 11,
    child: 11,
  }[style];
}

function accessoryX(
  style:
    | 'soft'
    | 'short'
    | 'wave'
    | 'messy'
    | 'bun'
    | 'child',
): number {
  return style === 'wave'
    ? 11
    : style === 'bun'
      ? -10
      : 12;
}

function accessoryY(
  style:
    | 'soft'
    | 'short'
    | 'wave'
    | 'messy'
    | 'bun'
    | 'child',
): number {
  return style === 'bun'
    ? -30
    : -27;
}

function yToDepth(
  y: number,
): number {
  return Math.round(y);
}
