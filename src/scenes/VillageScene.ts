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
import { RelationshipSystem } from '../systems/RelationshipSystem';
import { LifeSimulationSystem } from '../systems/LifeSimulationSystem';
import { NpcBrainSystem } from '../systems/NpcBrainSystem';
import { GenerativeDialogueSystem } from '../systems/GenerativeDialogueSystem';
import { Hud } from '../ui/Hud';
import type { DoorDefinition, LifeEvent, Point } from '../types';

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
  private relationshipSystem!: RelationshipSystem;
  private lifeSystem!: LifeSimulationSystem;
  private brainSystem!: NpcBrainSystem;
  private generativeDialogue!: GenerativeDialogueSystem;
  private hud!: Hud;
  private spawnOverride?: Point;
  private fromInterior = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private resetKey!: Phaser.Input.Keyboard.Key;
  private brainKey!: Phaser.Input.Keyboard.Key;
  private freeChatKey!: Phaser.Input.Keyboard.Key;

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
    this.relationshipSystem = new RelationshipSystem(this.save);
    this.lifeSystem = new LifeSimulationSystem(this.save, npcDefinitions);
    this.brainSystem = new NpcBrainSystem(this.save, this.lifeSystem);
    this.generativeDialogue = new GenerativeDialogueSystem(this.save);
    this.hud = new Hud();

    new WorldRenderer(this).create();

    const start = this.spawnOverride ?? this.save.snapshot.player ?? { x: 930, y: 790 };
    this.player = new Player(this, start.x, start.y);
    this.syncNpcRoster();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.resetKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.brainKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.freeChatKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

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
      this.hud.showToast('🌿 A vila agora continua vivendo mesmo quando você não está olhando.');
    }

    this.spawnOverride = undefined;
    this.fromInterior = false;
    this.syncHud();
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.033);

    if (!this.dialogue.isOpen && !this.generativeDialogue.isOpen) {
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

    this.save.patch({
      day: this.timeSystem.day,
      gameMinutes: this.timeSystem.minutes,
    });

    const lifeEvents = this.lifeSystem.update(
      this.timeSystem.day,
      this.timeSystem.minuteOfDay,
      dt,
    );
    this.showLifeEvents(lifeEvents);
    this.syncNpcRoster();

    this.brainSystem.update(
      this.timeSystem.day,
      this.timeSystem.minuteOfDay,
      dt,
    );

    const elapsedSeconds = this.time.now / 1000;
    for (const npc of this.npcs) {
      const life = this.lifeSystem.getState(npc.definition.id);
      const residenceDoor = this.lifeSystem.getResidenceDoor(npc.definition.id);
      const inWorld = !life || life.currentZone === 'world';

      npc.syncWorldPresence(inWorld, residenceDoor);
      if (inWorld) {
        npc.updateRoutine(
          this.timeSystem.minuteOfDay,
          dt,
          elapsedSeconds,
          residenceDoor,
          this.brainSystem.getBrain(npc.definition.id),
        );
      }
    }

    this.relationshipSystem.update(
      this.npcs.filter((npc) => npc.visible),
      dt,
      this.timeSystem.day,
    );

    const target = this.nearestInteraction();
    this.hud.setInteractionHint(
      !this.dialogue.isOpen && !this.generativeDialogue.isOpen && target !== null,
      target?.type === 'door'
        ? 'entrar em ' + target.door.label.replace('Entrar em ', '')
        : 'conversar',
    );

    if (
      !this.generativeDialogue.isOpen &&
      (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      Phaser.Input.Keyboard.JustDown(this.enterKey))
    ) {
      if (this.dialogue.isOpen) {
        this.dialogue.advance();
      } else if (target?.type === 'npc') {
        this.startNpcDialogue(target.npc);
      } else if (target?.type === 'door') {
        this.enterBuilding(target.door);
      }
    }

    if (
      !this.dialogue.isOpen &&
      !this.generativeDialogue.isOpen &&
      Phaser.Input.Keyboard.JustDown(this.freeChatKey) &&
      target?.type === 'npc'
    ) {
      this.openGenerativeChat(target.npc);
    }

    if (!this.generativeDialogue.isOpen && Phaser.Input.Keyboard.JustDown(this.brainKey)) {
      this.hud.toggleBrainDebug();
    }

    if (Phaser.Input.Keyboard.JustDown(this.resetKey)) {
      if (window.confirm('Apagar memória, famílias e progresso da simulação?')) {
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

  private syncNpcRoster(): void {
    const definitions = this.lifeSystem.getAllDefinitions();
    const existing = new Set(this.npcs.map((npc) => npc.definition.id));

    for (const definition of definitions) {
      if (existing.has(definition.id)) continue;
      this.npcs.push(new Npc(this, definition));
      existing.add(definition.id);
    }
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
      if (!npc.visible) continue;

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

  private openGenerativeChat(npc: Npc): void {
    const definition = npc.definition;
    const definitions = this.lifeSystem.getAllDefinitions();
    const life = this.lifeSystem.getState(definition.id);
    const brain = this.brainSystem.getBrain(definition.id);

    this.generativeDialogue.open({
      definition,
      life,
      brain,
      definitions,
      day: this.timeSystem.day,
      minute: this.timeSystem.minuteOfDay,
      time: this.timeSystem.formatted,
      location: 'ruas da Vila de Aster',
    });
  }

  private startNpcDialogue(npc: Npc): void {
    const definition = npc.definition;
    const memory = this.save.memoryFor(definition.id);
    const life = this.lifeSystem.getState(definition.id);
    const definitions = this.lifeSystem.getAllDefinitions();

    memory.talks += 1;
    memory.affinity = Math.min(100, memory.affinity + 8);
    memory.lastDay = this.timeSystem.day;

    this.save.addFact(definition.id, {
      id: 'met-player',
      text: 'Conheceu o viajante que chegou recentemente à Vila de Aster.',
      importance: 1,
      createdDay: this.timeSystem.day,
      source: 'player',
    });

    const schedule = npc.scheduleAt(this.timeSystem.minuteOfDay);
    const brain = this.brainSystem.getBrain(definition.id);
    const lines = [
      memory.talks === 1 ? definition.intro : definition.remembered,
    ];

    if (memory.talks >= 2) lines.push(definition.topic);
    if (memory.talks >= 3) {
      lines.push(
        'Eu lembro das nossas ' + memory.talks + ' conversas. Já não considero você exatamente um estranho.',
      );
    }

    if (life?.relationshipStatus === 'dating' && life.partnerId) {
      const partner = definitions.find((entry) => entry.id === life.partnerId);
      if (partner) lines.push('Tenho passado bastante tempo com ' + partner.name + ' ultimamente.');
    }

    if (life?.relationshipStatus === 'married' && life.partnerId) {
      const partner = definitions.find((entry) => entry.id === life.partnerId);
      if (partner) lines.push('Eu e ' + partner.name + ' estamos construindo nossa vida juntos.');
    }

    if (life?.children.length) {
      const childNames = life.children
        .map((id) => definitions.find((entry) => entry.id === id)?.name)
        .filter((name): name is string => !!name);
      if (childNames.length) {
        lines.push('Minha família cresceu. ' + childNames.join(', ') + ' faz parte dela agora.');
      }
    }

    lines.push(
      'Agora decidi ' + (brain?.label ?? schedule.label) + '.'
    );
    if (brain?.reasons.length) {
      lines.push('O que pesou nessa decisão: ' + brain.reasons.slice(0, 2).join('; ') + '.');
    }

    const sharedFact = memory.facts.find(
      (fact) => fact.source !== 'player' && fact.source !== definition.id,
    );
    if (sharedFact) {
      const sourceName =
        definitions.find((entry) => entry.id === sharedFact.source)?.name ??
        'outro morador';
      lines.push('Aliás, ' + sourceName + ' me contou uma coisa: ' + sharedFact.text);
    }

    if (this.eventSystem.shouldTriggerRiverEcho()) {
      this.eventSystem.triggerRiverEcho();
      this.save.addFact(definition.id, {
        id: 'river-echo',
        text: 'Um tremor estranho veio da direção do rio e parece ligado às mudanças recentes na vila.',
        importance: 5,
        createdDay: this.timeSystem.day,
        source: definition.id,
      });
      lines.push(
        '...Você também sentiu? Um tremor leve. Veio da direção do rio. Isso não acontecia há anos.',
      );
      this.hud.setRiverQuest();
      this.hud.showToast('⚠️ Evento do mundo desbloqueado: “O Eco Sob o Rio”');
    } else if (this.eventSystem.riverEchoActive) {
      this.save.addFact(definition.id, {
        id: 'river-echo',
        text: 'Um tremor estranho veio da direção do rio e parece ligado às mudanças recentes na vila.',
        importance: 5,
        createdDay: this.timeSystem.day,
        source: 'village',
      });
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

  private showLifeEvents(events: LifeEvent[]): void {
    if (!events.length) return;

    const event = events[events.length - 1];
    const icon = {
      dating: '💞',
      marriage: '💍',
      'expecting-child': '🍼',
      'child-born': '👶',
      'moved-home': '🏠',
    }[event.type];

    this.hud.showToast(icon + ' ' + event.text);
  }

  private syncHud(): void {
    const names = new Map(
      this.lifeSystem.getAllDefinitions().map((definition) => [definition.id, definition.name]),
    );
    const brainLines = this.brainSystem.getRecentLogs(7).map((log) => {
      const name = names.get(log.npcId) ?? log.npcId;
      const reason = log.reasons[0] ?? 'sem motivo dominante';
      return name + ' → ' + log.label + ' [' + log.score + '] • ' + reason;
    });
    this.hud.setBrainDebug(brainLines.length ? brainLines : ['Aguardando decisões...']);
    this.hud.setPopulation(this.lifeSystem.getAllDefinitions().length);
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
