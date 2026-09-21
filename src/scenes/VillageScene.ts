import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Npc } from '../entities/Npc';
import { npcDefinitions } from '../data/npcs';
import { collisionRects, doors, WORLD } from '../data/world';
import { WorldRenderer } from '../world/WorldRenderer';
import { SaveSystem } from '../systems/SaveSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { EventSystem } from '../systems/EventSystem';
import { Hud } from '../ui/Hud';
import type { DoorDefinition, Point } from '../types';

interface VillageSceneData {
  spawn?: Point;
  fromInterior?: boolean;
}

type InteractionTarget =
  | { type: 'npc'; npc: Npc; distance: number }
  | { type: 'door'; door: DoorDefinition; distance: number };

export class VillageScene extends Phaser.Scene {
  private player!: Player;
  private npcs: Npc[] = [];
  private save!: SaveSystem;
  private timeSystem!: TimeSystem;
  private dialogue!: DialogueSystem;
  private eventSystem!: EventSystem;
  private hud!: Hud;
  private spawnOverride?: Point;
  private fromInterior = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private resetKey!: Phaser.Input.Keyboard.Key;

  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private persistAccumulator = 0;

  constructor() {
    super('VillageScene');
  }

  init(data: VillageSceneData): void {
    this.spawnOverride = data.spawn;
    this.fromInterior = !!data.fromInterior;
  }

  create(): void {
    this.save = new SaveSystem();
    this.timeSystem = new TimeSystem(
      this.save.snapshot.day,
      this.save.snapshot.gameMinutes,
    );
    this.dialogue = new DialogueSystem();
    this.eventSystem = new EventSystem(this.save);
    this.hud = new Hud();

    new WorldRenderer(this).create();

    const start = this.spawnOverride ?? this.save.snapshot.player ?? { x: 930, y: 790 };
    this.player = new Player(this, start.x, start.y);
    this.npcs = npcDefinitions.map((definition) => new Npc(this, definition));

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.resetKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    this.nightOverlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x151f46, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100000);

    this.scale.on('resize', this.resizeOverlay, this);
    this.eventSystem.riverEchoActive && this.hud.setRiverQuest();

    if (this.fromInterior) {
      this.hud.showToast('🌿 Você voltou para as ruas da vila.');
    } else {
      this.hud.showToast('🌿 Bem-vindo à Vila de Aster. Fale com os moradores.');
    }

    this.spawnOverride = undefined;
    this.fromInterior = false;
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
        this.hud.showToast('🌅 Um novo dia começou.');
      }
    }

    const elapsedSeconds = this.time.now / 1000;
    this.npcs.forEach((npc) =>
      npc.updateRoutine(this.timeSystem.minuteOfDay, dt, elapsedSeconds),
    );

    const target = this.nearestInteraction();
    this.hud.setInteractionHint(
      !this.dialogue.isOpen && target !== null,
      target?.type === 'door'
        ? `entrar em ${target.door.label.replace('Entrar em ', '')}`
        : 'conversar',
    );

    if (
      Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      Phaser.Input.Keyboard.JustDown(this.enterKey)
    ) {
      if (this.dialogue.isOpen) {
        this.dialogue.advance();
      } else if (target?.type === 'npc') {
        this.startNpcDialogue(target.npc);
      } else if (target?.type === 'door') {
        this.enterBuilding(target.door);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.resetKey)) {
      if (window.confirm('Apagar a memória dos NPCs e reiniciar o protótipo?')) {
        this.save.reset();
        window.location.reload();
      }
    }

    this.persistAccumulator += dt;
    if (this.persistAccumulator >= 3) {
      this.persistAccumulator = 0;
      this.persist();
    }

    this.nightOverlay.setAlpha(this.timeSystem.darkness);
    this.syncHud();
  }

  private readonly canMove = (x: number, y: number, radius: number): boolean => {
    if (
      x - radius < 0 ||
      y - radius < 0 ||
      x + radius > WORLD.width ||
      y + radius > WORLD.height
    ) {
      return false;
    }

    return !collisionRects.some((rect) => {
      const nearestX = Phaser.Math.Clamp(x, rect.x, rect.x + rect.w);
      const nearestY = Phaser.Math.Clamp(y, rect.y, rect.y + rect.h);
      return Phaser.Math.Distance.Between(x, y, nearestX, nearestY) < radius;
    });
  };

  private nearestInteraction(): InteractionTarget | null {
    let best: InteractionTarget | null = null;

    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y,
      );
      if (distance <= 78 && (!best || distance < best.distance)) {
        best = { type: 'npc', npc, distance };
      }
    }

    for (const door of doors) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        door.x,
        door.y,
      );
      if (distance <= 82 && (!best || distance < best.distance)) {
        best = { type: 'door', door, distance };
      }
    }

    return best;
  }

  private enterBuilding(door: DoorDefinition): void {
    this.persist();
    this.cameras.main.fadeOut(180, 20, 24, 22);
    this.time.delayedCall(190, () => {
      this.scene.start('InteriorScene', {
        buildingId: door.buildingId,
        returnPoint: door.returnPoint,
      });
    });
  }

  private startNpcDialogue(npc: Npc): void {
    const definition = npc.definition;
    const memory = this.save.memoryFor(definition.id);

    memory.talks += 1;
    memory.affinity = Math.min(100, memory.affinity + 8);
    memory.lastDay = this.timeSystem.day;

    const schedule = npc.scheduleAt(this.timeSystem.minuteOfDay);
    const lines = [
      memory.talks === 1 ? definition.intro : definition.remembered,
    ];

    if (memory.talks >= 2) lines.push(definition.topic);
    if (memory.talks >= 3) {
      lines.push(
        `Eu lembro das nossas ${memory.talks} conversas. Já não considero você exatamente um estranho.`,
      );
    }

    lines.push(`Agora estou ${schedule.label}. A vila muda bastante dependendo da hora.`);

    if (this.eventSystem.shouldTriggerRiverEcho()) {
      this.eventSystem.triggerRiverEcho();
      lines.push(
        '...Você também sentiu? Um tremor leve. Veio da direção do rio. Isso não acontecia há anos.',
      );
      this.hud.setRiverQuest();
      this.hud.showToast('⚠️ Evento do mundo desbloqueado: “O Eco Sob o Rio”');
    } else if (this.eventSystem.riverEchoActive) {
      lines.push(
        'Desde aquele tremor, ninguém está totalmente tranquilo. Cada morador parece saber um pedaço diferente da história.',
      );
    }

    this.dialogue.open({
      name: definition.name,
      role: definition.role,
      portrait: definition.emoji,
      lines,
      onClose: () => this.persist(),
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

  private persist(): void {
    this.save.patch({
      player: { x: this.player.x, y: this.player.y },
      day: this.timeSystem.day,
      gameMinutes: this.timeSystem.minutes,
    });
    this.save.persist();
  }

  private resizeOverlay(gameSize: Phaser.Structs.Size): void {
    this.nightOverlay.setDisplaySize(gameSize.width, gameSize.height);
  }
}
