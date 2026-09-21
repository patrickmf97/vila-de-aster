import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { interiors, INTERIOR_SIZE } from '../data/interiors';
import type { InteriorDefinition, InteriorObjectDefinition, Point, Rect } from '../types';
import { InteriorRenderer } from '../world/InteriorRenderer';
import { DialogueSystem } from '../systems/DialogueSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { Hud } from '../ui/Hud';

interface InteriorSceneData {
  buildingId: string;
  returnPoint: Point;
}

export class InteriorScene extends Phaser.Scene {
  private definition!: InteriorDefinition;
  private returnPoint!: Point;
  private player!: Player;
  private renderer!: InteriorRenderer;
  private dialogue!: DialogueSystem;
  private save!: SaveSystem;
  private timeSystem!: TimeSystem;
  private hud!: Hud;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private persistAccumulator = 0;

  constructor() {
    super('InteriorScene');
  }

  init(data: InteriorSceneData): void {
    this.definition = interiors[data.buildingId] ?? interiors.inn;
    this.returnPoint = data.returnPoint;
  }

  create(): void {
    this.save = new SaveSystem();
    this.timeSystem = new TimeSystem(
      this.save.snapshot.day,
      this.save.snapshot.gameMinutes,
    );
    this.dialogue = new DialogueSystem();
    this.hud = new Hud();

    this.renderer = new InteriorRenderer(this, this.definition);
    this.renderer.create();

    this.player = new Player(
      this,
      this.definition.spawn.x,
      this.definition.spawn.y,
    );
    this.player.face('up');

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.cameras.main.setBounds(0, 0, INTERIOR_SIZE.width, INTERIOR_SIZE.height);
    this.cameras.main.centerOn(INTERIOR_SIZE.width / 2, INTERIOR_SIZE.height / 2);
    this.cameras.main.setZoom(Math.min(
      this.scale.width / INTERIOR_SIZE.width,
      this.scale.height / INTERIOR_SIZE.height,
    ));

    this.scale.on('resize', this.resizeCamera, this);
    this.hud.setQuest(`Explore ${this.definition.name} e examine os objetos.`);
    this.hud.showToast(`🚪 Você entrou em ${this.definition.name}.`);
    this.syncHud();
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.033);

    if (!this.dialogue.isOpen) {
      this.player.updateMovement(
        {
          up: this.cursors.up.isDown || this.wasd.W.isDown,
          down: this.cursors.down.isDown || this.wasd.S.isDown,
          left: this.cursors.left.isDown || this.wasd.A.isDown,
          right: this.cursors.right.isDown || this.wasd.D.isDown,
        },
        dt,
        this.canMove,
      );

      if (this.timeSystem.update(dt)) {
        this.hud.showToast('🌅 Um novo dia começou enquanto você estava dentro.');
      }
    }

    const target = this.getInteractionTarget();
    this.hud.setInteractionHint(
      !this.dialogue.isOpen && target !== null,
      target?.label ?? 'interagir',
    );

    if (
      Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      Phaser.Input.Keyboard.JustDown(this.enterKey)
    ) {
      if (this.dialogue.isOpen) {
        this.dialogue.advance();
      } else if (target?.type === 'exit') {
        this.leaveInterior();
      } else if (target?.type === 'object') {
        this.inspectObject(target.object);
      }
    }

    this.persistAccumulator += dt;
    if (this.persistAccumulator >= 3) {
      this.persistAccumulator = 0;
      this.persistTime();
    }

    this.syncHud();
  }

  private readonly canMove = (x: number, y: number, radius: number): boolean => {
    if (
      x - radius < 0 ||
      y - radius < 0 ||
      x + radius > INTERIOR_SIZE.width ||
      y + radius > INTERIOR_SIZE.height
    ) {
      return false;
    }

    return !this.renderer.collisionRects.some((rect) =>
      circleIntersectsRect(x, y, radius, rect),
    );
  };

  private getInteractionTarget():
    | { type: 'exit'; label: string }
    | { type: 'object'; label: string; object: InteriorObjectDefinition }
    | null {
    const exitDistance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.definition.exit.x,
      this.definition.exit.y,
    );

    let bestObject: { object: InteriorObjectDefinition; distance: number } | null = null;

    for (const object of this.definition.objects) {
      const centerX = object.x + object.w / 2;
      const centerY = object.y + object.h / 2;
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        centerX,
        centerY,
      );

      const threshold = Math.max(72, Math.min(115, Math.max(object.w, object.h) * 0.72));
      if (distance <= threshold && (!bestObject || distance < bestObject.distance)) {
        bestObject = { object, distance };
      }
    }

    if (bestObject && (exitDistance > 76 || bestObject.distance < exitDistance)) {
      return {
        type: 'object',
        label: `examinar ${bestObject.object.label.toLowerCase()}`,
        object: bestObject.object,
      };
    }

    if (exitDistance <= 76) {
      return { type: 'exit', label: 'sair' };
    }

    return null;
  }

  private inspectObject(object: InteriorObjectDefinition): void {
    this.dialogue.open({
      name: object.label,
      role: this.definition.name,
      portrait: object.emoji,
      lines: [object.text],
    });
  }

  private leaveInterior(): void {
    this.persistTime();
    this.hud.showToast('🌿 De volta à Vila de Aster.');
    this.scene.start('VillageScene', {
      spawn: this.returnPoint,
      fromInterior: true,
    });
  }

  private persistTime(): void {
    this.save.patch({
      day: this.timeSystem.day,
      gameMinutes: this.timeSystem.minutes,
    });
    this.save.persist();
  }

  private syncHud(): void {
    this.hud.setClock(
      this.timeSystem.formatted,
      this.timeSystem.day,
      this.timeSystem.icon,
    );
  }

  private resizeCamera(gameSize: Phaser.Structs.Size): void {
    this.cameras.main.setZoom(Math.min(
      gameSize.width / INTERIOR_SIZE.width,
      gameSize.height / INTERIOR_SIZE.height,
    ));
    this.cameras.main.centerOn(INTERIOR_SIZE.width / 2, INTERIOR_SIZE.height / 2);
  }
}

function circleIntersectsRect(
  x: number,
  y: number,
  radius: number,
  rect: Rect,
): boolean {
  const nearestX = Phaser.Math.Clamp(x, rect.x, rect.x + rect.w);
  const nearestY = Phaser.Math.Clamp(y, rect.y, rect.y + rect.h);
  return Phaser.Math.Distance.Between(x, y, nearestX, nearestY) < radius;
}
