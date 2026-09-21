import Phaser from 'phaser';
import type { Facing, NpcActivity, NpcDefinition, ScheduleEntry } from '../types';

export class Npc extends Phaser.GameObjects.Container {
  readonly definition: NpcDefinition;
  private readonly body: Phaser.GameObjects.Arc;
  private readonly head: Phaser.GameObjects.Arc;
  private readonly leftEye: Phaser.GameObjects.Arc;
  private readonly rightEye: Phaser.GameObjects.Arc;
  private readonly leftFoot: Phaser.GameObjects.Arc;
  private readonly rightFoot: Phaser.GameObjects.Arc;
  private readonly activityLabel: Phaser.GameObjects.Text;
  private facing: Facing = 'down';
  private walkPhase = 0;
  private readonly wanderSeed: number;

  constructor(scene: Phaser.Scene, definition: NpcDefinition) {
    super(scene, definition.x, definition.y);
    this.definition = definition;
    this.wanderSeed = [...definition.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);

    const shadow = scene.add.ellipse(0, 20, 32, 14, 0x000000, 0.18);
    this.leftFoot = scene.add.ellipse(-6, 16, 8, 5, darken(definition.color, 0.72));
    this.rightFoot = scene.add.ellipse(6, 16, 8, 5, darken(definition.color, 0.72));
    this.body = scene.add.circle(0, 4, 15, definition.color);
    this.head = scene.add.circle(0, -13, 12, 0xf4c6a7);
    this.leftEye = scene.add.circle(-4, -14, 1.4, 0x3d2b26);
    this.rightEye = scene.add.circle(4, -14, 1.4, 0x3d2b26);

    const icon = scene.add.text(0, -32, definition.emoji, {
      fontFamily: 'serif',
      fontSize: '16px',
    }).setOrigin(0.5);

    const label = scene.add.text(0, 38, definition.name, {
      fontFamily: 'system-ui',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#142014',
      backgroundColor: 'rgba(255,255,255,0.38)',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5);

    this.activityLabel = scene.add.text(0, 55, '', {
      fontFamily: 'system-ui',
      fontSize: '9px',
      color: '#2f4032',
      backgroundColor: 'rgba(235,247,232,0.72)',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    this.add([
      shadow,
      this.leftFoot,
      this.rightFoot,
      this.body,
      this.head,
      this.leftEye,
      this.rightEye,
      icon,
      label,
      this.activityLabel,
    ]);

    scene.add.existing(this);
    this.setDepth(yToDepth(this.y));
  }

  scheduleAt(minuteOfDay: number): ScheduleEntry {
    return this.definition.schedule.find(
      (entry) => minuteOfDay >= entry.from && minuteOfDay < entry.to,
    ) ?? this.definition.schedule[0];
  }

  updateRoutine(minuteOfDay: number, deltaSeconds: number, elapsedSeconds: number): void {
    const schedule = this.scheduleAt(minuteOfDay);
    const activity = schedule.activity ?? inferActivity(schedule.label);
    const micro = this.microOffset(activity, elapsedSeconds);
    const targetX = schedule.x + micro.x;
    const targetY = schedule.y + micro.y;
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

    this.activityLabel.setText(activityText(activity));

    if (distance > 5 && activity !== 'sleep') {
      const speed = activity === 'walk' ? 54 : 38;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      this.x += vx * speed * deltaSeconds;
      this.y += vy * speed * deltaSeconds;
      this.updateFacing(vx, vy);

      this.walkPhase += deltaSeconds * 9;
      const wave = Math.sin(this.walkPhase);
      this.leftFoot.y = 16 + wave * 2;
      this.rightFoot.y = 16 - wave * 2;
      const bob = Math.abs(wave) * -0.7;
      this.body.y = 4 + bob;
      this.head.y = -13 + bob;
      this.leftEye.y = -14 + bob;
      this.rightEye.y = -14 + bob;
    } else {
      this.leftFoot.y = 16;
      this.rightFoot.y = 16;
      this.body.y = 4;
      this.head.y = -13;
      this.leftEye.y = -14;
      this.rightEye.y = -14;
    }

    const sleeping = activity === 'sleep';
    this.setAlpha(sleeping ? 0.58 : 1);
    this.setDepth(yToDepth(this.y));
  }

  private microOffset(activity: NpcActivity, elapsedSeconds: number): { x: number; y: number } {
    if (!['work', 'socialize', 'rest'].includes(activity)) return { x: 0, y: 0 };

    const amplitude = activity === 'socialize' ? 22 : activity === 'work' ? 12 : 7;
    const t = elapsedSeconds * (activity === 'socialize' ? 0.14 : 0.09) + this.wanderSeed;

    return {
      x: Math.sin(t) * amplitude,
      y: Math.cos(t * 0.73) * amplitude * 0.55,
    };
  }

  private updateFacing(vx: number, vy: number): void {
    this.facing =
      Math.abs(vx) > Math.abs(vy)
        ? vx > 0 ? 'right' : 'left'
        : vy > 0 ? 'down' : 'up';

    const shift = this.facing === 'left' ? -2.5 : this.facing === 'right' ? 2.5 : 0;
    this.leftEye.x = -4 + shift;
    this.rightEye.x = 4 + shift;

    const visible = this.facing !== 'up';
    this.leftEye.setVisible(visible);
    this.rightEye.setVisible(visible);
  }
}

function inferActivity(label: string): NpcActivity {
  const value = label.toLowerCase();
  if (value.includes('dorm')) return 'sleep';
  if (value.includes('pesc')) return 'fish';
  if (value.includes('convers') || value.includes('praça')) return 'socialize';
  if (value.includes('caminh') || value.includes('voltando')) return 'walk';
  if (value.includes('trabalh') || value.includes('forja') || value.includes('empório') || value.includes('taverna')) return 'work';
  return 'rest';
}

function activityText(activity: NpcActivity): string {
  return {
    sleep: '💤 descansando',
    work: '🔨 trabalhando',
    walk: '👣 a caminho',
    socialize: '💬 socializando',
    rest: '🌿 descansando',
    fish: '🎣 pescando',
  }[activity];
}

function yToDepth(y: number): number {
  return Math.round(y);
}

function darken(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * factor);
  const g = Math.floor(((color >> 8) & 0xff) * factor);
  const b = Math.floor((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}
