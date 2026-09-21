import Phaser from 'phaser';
import type { Facing } from '../types';

export interface MovementInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class Player extends Phaser.GameObjects.Container {
  private readonly bodyShape: Phaser.GameObjects.Arc;
  private readonly head: Phaser.GameObjects.Arc;
  private readonly hair: Phaser.GameObjects.Arc;
  private readonly leftEye: Phaser.GameObjects.Arc;
  private readonly rightEye: Phaser.GameObjects.Arc;
  private readonly leftArm: Phaser.GameObjects.Rectangle;
  private readonly rightArm: Phaser.GameObjects.Rectangle;
  private readonly leftFoot: Phaser.GameObjects.Arc;
  private readonly rightFoot: Phaser.GameObjects.Arc;
  private walkPhase = 0;

  speed = 210;
  radius = 18;
  facing: Facing = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const shadow = scene.add.ellipse(0, 22, 34, 14, 0x000000, 0.22);
    this.leftFoot = scene.add.ellipse(-7, 18, 9, 6, 0x263d61);
    this.rightFoot = scene.add.ellipse(7, 18, 9, 6, 0x263d61);
    this.leftArm = scene.add.rectangle(-17, 4, 7, 20, 0xefbd98).setOrigin(0.5, 0.15);
    this.rightArm = scene.add.rectangle(17, 4, 7, 20, 0xefbd98).setOrigin(0.5, 0.15);
    this.bodyShape = scene.add.circle(0, 5, 16, 0x355a8a);
    this.head = scene.add.circle(0, -13, 13, 0xefbd98);
    this.hair = scene.add.circle(0, -19, 13, 0x563b2b);
    this.leftEye = scene.add.circle(-4, -14, 1.5, 0xffffff);
    this.rightEye = scene.add.circle(4, -14, 1.5, 0xffffff);

    this.add([
      shadow,
      this.leftFoot,
      this.rightFoot,
      this.leftArm,
      this.rightArm,
      this.bodyShape,
      this.head,
      this.hair,
      this.leftEye,
      this.rightEye,
    ]);

    scene.add.existing(this);
    this.applyFacing();
    this.setDepth(y);
  }

  updateMovement(
    input: MovementInput,
    deltaSeconds: number,
    canMove: (x: number, y: number, radius: number) => boolean,
  ): boolean {
    let dx = Number(input.right) - Number(input.left);
    let dy = Number(input.down) - Number(input.up);

    if (dx === 0 && dy === 0) {
      this.setWalkPose(0, false);
      return false;
    }

    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;

    const nextFacing: Facing =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? 'right' : 'left'
        : dy > 0 ? 'down' : 'up';

    if (nextFacing !== this.facing) {
      this.facing = nextFacing;
      this.applyFacing();
    }

    const nextX = this.x + dx * this.speed * deltaSeconds;
    const nextY = this.y + dy * this.speed * deltaSeconds;

    if (canMove(nextX, this.y, this.radius)) this.x = nextX;
    if (canMove(this.x, nextY, this.radius)) this.y = nextY;

    this.walkPhase += deltaSeconds * 11;
    this.setWalkPose(this.walkPhase, true);
    this.setDepth(Math.round(this.y));
    return true;
  }

  face(facing: Facing): void {
    this.facing = facing;
    this.applyFacing();
  }

  private setWalkPose(phase: number, moving: boolean): void {
    const wave = moving ? Math.sin(phase) : 0;
    const bob = moving ? Math.abs(Math.sin(phase)) * -1.5 : 0;

    this.bodyShape.y = 5 + bob;
    this.head.y = -13 + bob;
    this.hair.y = -19 + bob;
    this.leftEye.y = -14 + bob;
    this.rightEye.y = -14 + bob;

    this.leftFoot.y = 18 + bob + wave * 2.2;
    this.rightFoot.y = 18 + bob - wave * 2.2;

    this.leftArm.rotation = wave * 0.34;
    this.rightArm.rotation = -wave * 0.34;
  }

  private applyFacing(): void {
    const horizontalShift =
      this.facing === 'left' ? -3 :
      this.facing === 'right' ? 3 : 0;

    this.leftEye.x = -4 + horizontalShift;
    this.rightEye.x = 4 + horizontalShift;

    const lookingAway = this.facing === 'up';
    this.leftEye.setVisible(!lookingAway);
    this.rightEye.setVisible(!lookingAway);

    if (this.facing === 'left') {
      this.leftArm.setDepth(5);
      this.rightArm.setDepth(-1);
    } else if (this.facing === 'right') {
      this.leftArm.setDepth(-1);
      this.rightArm.setDepth(5);
    } else {
      this.leftArm.setDepth(0);
      this.rightArm.setDepth(0);
    }
  }
}
