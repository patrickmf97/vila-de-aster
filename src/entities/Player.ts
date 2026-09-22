import Phaser from 'phaser';
import type { Facing } from '../types';

export interface MovementInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class Player extends Phaser.GameObjects.Container {
  private readonly visualRoot: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly bodyShape: Phaser.GameObjects.Arc;
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
  private readonly scarf: Phaser.GameObjects.Rectangle;
  private readonly backpack: Phaser.GameObjects.Rectangle;
  private walkPhase = 0;
  private sprite?: Phaser.GameObjects.Image;

  speed = 210;
  radius = 18;
  facing: Facing = 'down';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y);

    this.shadow = scene.add.ellipse(
      0,
      23,
      38,
      14,
      0x17341f,
      0.22,
    );

    this.visualRoot = scene.add.container(0, 0);

    this.backpack = scene.add
      .rectangle(
        0,
        4,
        24,
        24,
        0x6e4e35,
        0.95,
      )
      .setOrigin(0.5);

    this.leftFoot = scene.add.ellipse(
      -7,
      18,
      9,
      6,
      0x263d61,
    );
    this.rightFoot = scene.add.ellipse(
      7,
      18,
      9,
      6,
      0x263d61,
    );

    this.leftArm = scene.add
      .rectangle(
        -17,
        4,
        7,
        20,
        0xefbd98,
      )
      .setOrigin(0.5, 0.15);

    this.rightArm = scene.add
      .rectangle(
        17,
        4,
        7,
        20,
        0xefbd98,
      )
      .setOrigin(0.5, 0.15);

    this.bodyShape = scene.add.circle(
      0,
      5,
      16,
      0x355a8a,
    );
    this.bodyShape.setScale(1, 1.04);

    this.scarf = scene.add.rectangle(
      0,
      -2,
      23,
      5,
      0xe2bd62,
      0.95,
    );

    this.hairBack = scene.add.circle(
      0,
      -15,
      13.8,
      0x563b2b,
    );

    this.head = scene.add.circle(
      0,
      -13,
      12.4,
      0xefbd98,
    );

    this.hairTop = scene.add.ellipse(
      0,
      -21,
      25,
      13,
      0x563b2b,
    );
    this.hairTop.setRotation(-0.05);

    this.hairHighlight = scene.add.ellipse(
      -5,
      -23,
      8,
      4,
      0x79533c,
      0.55,
    );

    this.leftEye = scene.add.circle(
      -4,
      -14,
      1.5,
      0x3c302a,
    );
    this.rightEye = scene.add.circle(
      4,
      -14,
      1.5,
      0x3c302a,
    );

    this.mouth = scene.add.ellipse(
      0,
      -8.5,
      4,
      1.4,
      0x8b5d56,
      0.75,
    );

    this.visualRoot.add([
      this.backpack,
      this.leftFoot,
      this.rightFoot,
      this.leftArm,
      this.rightArm,
      this.bodyShape,
      this.scarf,
      this.hairBack,
      this.head,
      this.hairTop,
      this.hairHighlight,
      this.leftEye,
      this.rightEye,
      this.mouth,
    ]);

    this.add([
      this.shadow,
      this.visualRoot,
    ]);

    scene.add.existing(this);
    this.applyFacing();
    this.setDepth(y);
  }

  updateMovement(
    input: MovementInput,
    deltaSeconds: number,
    canMove: (
      x: number,
      y: number,
      radius: number,
    ) => boolean,
  ): boolean {
    let dx =
      Number(input.right) -
      Number(input.left);
    let dy =
      Number(input.down) -
      Number(input.up);

    if (
      dx === 0 &&
      dy === 0
    ) {
      this.setWalkPose(0, false);
      return false;
    }

    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;

    const nextFacing: Facing =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? 'right'
          : 'left'
        : dy > 0
          ? 'down'
          : 'up';

    if (
      nextFacing !== this.facing
    ) {
      this.facing = nextFacing;
      this.applyFacing();
    }

    const nextX =
      this.x +
      dx *
        this.speed *
        deltaSeconds;

    const nextY =
      this.y +
      dy *
        this.speed *
        deltaSeconds;

    if (
      canMove(
        nextX,
        this.y,
        this.radius,
      )
    ) {
      this.x = nextX;
    }

    if (
      canMove(
        this.x,
        nextY,
        this.radius,
      )
    ) {
      this.y = nextY;
    }

    this.walkPhase +=
      deltaSeconds * 11;

    this.setWalkPose(
      this.walkPhase,
      true,
    );

    this.setDepth(
      Math.round(this.y),
    );

    return true;
  }

  useTexture(textureKey: string): void {
    if (this.sprite) this.sprite.destroy();

    this.sprite = this.scene.add
      .image(0, -4, textureKey)
      .setDisplaySize(52, 65)
      .setOrigin(0.5, 0.62);

    this.visualRoot.setVisible(false);
    this.addAt(this.sprite, 1);
  }

  face(
    facing: Facing,
  ): void {
    this.facing = facing;
    this.applyFacing();
  }

  private setWalkPose(
    phase: number,
    moving: boolean,
  ): void {
    const wave =
      moving
        ? Math.sin(phase)
        : 0;

    const bob =
      moving
        ? Math.abs(
            Math.sin(phase),
          ) * -1.45
        : Math.sin(
            this.scene.time.now /
              780,
          ) * 0.22;

    if (this.sprite) {
      this.sprite.y = -4 + bob;
      this.sprite.rotation = moving ? Math.sin(phase * 0.5) * 0.016 : 0;
    }

    this.visualRoot.y = bob;
    this.visualRoot.rotation =
      moving
        ? Math.sin(
            phase * 0.5,
          ) * 0.016
        : 0;

    this.leftFoot.y =
      18 +
      wave * 2.4;
    this.rightFoot.y =
      18 -
      wave * 2.4;

    this.leftArm.rotation =
      moving
        ? wave * 0.32
        : 0;

    this.rightArm.rotation =
      moving
        ? -wave * 0.32
        : 0;

    this.shadow.scaleX =
      moving
        ? 1 -
          Math.abs(wave) * 0.04
        : 1;
  }

  private applyFacing(): void {
    const horizontalShift =
      this.facing === 'left'
        ? -3
        : this.facing === 'right'
          ? 3
          : 0;

    this.leftEye.x =
      -4 + horizontalShift;
    this.rightEye.x =
      4 + horizontalShift;
    this.mouth.x =
      horizontalShift * 0.4;

    const lookingAway =
      this.facing === 'up';

    this.leftEye.setVisible(
      !lookingAway,
    );
    this.rightEye.setVisible(
      !lookingAway,
    );
    this.mouth.setVisible(
      !lookingAway,
    );

    this.backpack.setVisible(
      lookingAway ||
        this.facing === 'left' ||
        this.facing === 'right',
    );

    if (
      this.facing === 'left'
    ) {
      this.leftArm.setDepth(5);
      this.rightArm.setDepth(-1);
      this.backpack.x = 7;
      this.backpack.setDepth(-2);
    } else if (
      this.facing === 'right'
    ) {
      this.leftArm.setDepth(-1);
      this.rightArm.setDepth(5);
      this.backpack.x = -7;
      this.backpack.setDepth(-2);
    } else if (
      lookingAway
    ) {
      this.leftArm.setDepth(0);
      this.rightArm.setDepth(0);
      this.backpack.x = 0;
      this.backpack.setDepth(5);
    } else {
      this.leftArm.setDepth(0);
      this.rightArm.setDepth(0);
      this.backpack.x = 0;
      this.backpack.setDepth(-2);
    }
  }
}
