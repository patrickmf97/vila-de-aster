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
  private walkPhase = 0;

  speed = 210;
  radius = 18;
  facing: Facing = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const shadow = scene.add.ellipse(0, 22, 34, 14, 0x000000, 0.22);
    this.bodyShape = scene.add.circle(0, 5, 16, 0x355a8a);
    this.head = scene.add.circle(0, -13, 13, 0xefbd98);
    this.hair = scene.add.circle(0, -19, 13, 0x563b2b);
    this.leftEye = scene.add.circle(-4, -14, 1.5, 0xffffff);
    this.rightEye = scene.add.circle(4, -14, 1.5, 0xffffff);

    this.add([shadow, this.bodyShape, this.head, this.hair, this.leftEye, this.rightEye]);
    scene.add.existing(this);
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
      this.setBob(0);
      return false;
    }

    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'down' : 'up';
    }

    const nextX = this.x + dx * this.speed * deltaSeconds;
    const nextY = this.y + dy * this.speed * deltaSeconds;

    if (canMove(nextX, this.y, this.radius)) this.x = nextX;
    if (canMove(this.x, nextY, this.radius)) this.y = nextY;

    this.walkPhase += deltaSeconds * 10;
    this.setBob(Math.sin(this.walkPhase) * 1.4);
    this.updateEyes();
    this.setDepth(this.y);
    return true;
  }

  private setBob(value: number): void {
    this.bodyShape.y = 5 + value;
    this.head.y = -13 + value;
    this.hair.y = -19 + value;
    this.leftEye.y = -14 + value;
    this.rightEye.y = -14 + value;
  }

  private updateEyes(): void {
    const eyeShift = this.facing === 'left' ? -3 : this.facing === 'right' ? 3 : 0;
    this.leftEye.x = -4 + eyeShift;
    this.rightEye.x = 4 + eyeShift;
  }
}
