import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Npc } from '../entities/Npc';
import { npcDefinitions } from '../data/npcs';
import { interiors, INTERIOR_SIZE } from '../data/interiors';
import type {
  InteriorDefinition,
  InteriorObjectDefinition,
  LifeEvent,
  Point,
  Rect,
} from '../types';
import { InteriorRenderer } from '../world/InteriorRenderer';
import { DialogueSystem } from '../systems/DialogueSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { LifeSimulationSystem } from '../systems/LifeSimulationSystem';
import { NpcBrainSystem } from '../systems/NpcBrainSystem';
import { DynamicDialogueSystem } from '../systems/DynamicDialogueSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { Hud } from '../ui/Hud';

interface InteriorSceneData {
  buildingId: string;
  returnPoint: Point;
}

type InteriorTarget =
  | { type: 'exit'; label: string; distance: number }
  | { type: 'object'; label: string; object: InteriorObjectDefinition; distance: number }
  | { type: 'resident'; label: string; npc: Npc; distance: number };

export class InteriorScene extends Phaser.Scene {
  private definition!: InteriorDefinition;
  private buildingId!: string;
  private returnPoint!: Point;
  private player!: Player;
  private residents: Npc[] = [];
  private interiorRenderer!: InteriorRenderer;
  private dialogue!: DialogueSystem;
  private save!: SaveSystem;
  private timeSystem!: TimeSystem;
  private lifeSystem!: LifeSimulationSystem;
  private brainSystem!: NpcBrainSystem;
  private dynamicDialogue!: DynamicDialogueSystem;
  private economySystem!: EconomySystem;
  private hud!: Hud;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private brainKey!: Phaser.Input.Keyboard.Key;
  private freeChatKey!: Phaser.Input.Keyboard.Key;
  private marketKey!: Phaser.Input.Keyboard.Key;
  private persistAccumulator = 0;
  private simulationAccumulator = 0;
  private hudAccumulator = 0;
  private rosterAccumulator = 0;

  constructor() {
    super('InteriorScene');
  }

  init(data: InteriorSceneData): void {
    this.buildingId = data.buildingId;
    this.definition =
      interiors[data.buildingId] ??
      (data.buildingId.startsWith('settlement-home:')
        ? interiors['settlement-home']
        : interiors.inn);
    this.returnPoint = data.returnPoint;
  }

  create(): void {
    this.save = new SaveSystem();
    this.timeSystem = new TimeSystem(
      this.save.snapshot.day,
      this.save.snapshot.gameMinutes,
    );
    this.lifeSystem = new LifeSimulationSystem(this.save, npcDefinitions);

    const settlementBuilding =
      this.save.snapshot.settlementBuildings.find(
        (building) =>
          building.residenceId === this.buildingId,
      );
    if (settlementBuilding) {
      this.definition = {
        ...this.definition,
        name: settlementBuilding.name,
        subtitle:
          'Uma residência construída durante a expansão da Vila de Aster.',
      };
    }

    this.brainSystem = new NpcBrainSystem(this.save, this.lifeSystem);
    this.dynamicDialogue = new DynamicDialogueSystem(this.save);
    this.economySystem = new EconomySystem(this.save, this.lifeSystem);
    this.dialogue = new DialogueSystem();
    this.hud = new Hud();

    this.interiorRenderer = new InteriorRenderer(this, this.definition);
    this.interiorRenderer.create();

    this.player = new Player(
      this,
      this.definition.spawn.x,
      this.definition.spawn.y,
    );
    if (this.textures.exists('character-patrick')) {
      this.player.useTexture('character-patrick');
    }
    this.player.face('up');

    this.syncResidentRoster();
    this.syncResidents(0);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.brainKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.freeChatKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.marketKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    this.cameras.main.setBounds(0, 0, INTERIOR_SIZE.width, INTERIOR_SIZE.height);
    this.cameras.main.centerOn(INTERIOR_SIZE.width / 2, INTERIOR_SIZE.height / 2);
    this.cameras.main.setZoom(
      Phaser.Math.Clamp(
        Math.min(
          this.scale.width / INTERIOR_SIZE.width,
          this.scale.height / INTERIOR_SIZE.height,
        ),
        0.78,
        1.35,
      ),
    );

    this.scale.on('resize', this.resizeCamera, this);
    this.hud.setQuest('Explore ' + this.definition.name + ' e observe quem realmente vive aqui.');
    this.hud.showToast('🚪 Você entrou em ' + this.definition.name + '.');
    this.syncHud();
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.033);
    const simulationDt =
      this.dialogue.isOpen || this.dynamicDialogue.isOpen || this.hud.isModalOpen ? 0 : dt;

    if (!this.dialogue.isOpen && !this.dynamicDialogue.isOpen && !this.hud.isModalOpen) {
      this.player.updateMovement(
        {
          up: this.cursors.up.isDown || this.wasd.W.isDown || !!window.asterMobile?.up,
          down: this.cursors.down.isDown || this.wasd.S.isDown || !!window.asterMobile?.down,
          left: this.cursors.left.isDown || this.wasd.A.isDown || !!window.asterMobile?.left,
          right: this.cursors.right.isDown || this.wasd.D.isDown || !!window.asterMobile?.right,
        },
        dt,
        this.canMove,
      );

      if (this.timeSystem.update(dt)) {
        this.hud.showToast('🌅 Um novo dia começou enquanto você estava dentro.');
      }
    }

    this.save.patch({
      day: this.timeSystem.day,
      gameMinutes: this.timeSystem.minutes,
    });

    this.simulationAccumulator += simulationDt;
    this.rosterAccumulator += dt;

    if (this.simulationAccumulator >= 0.1) {
      const step = Math.min(this.simulationAccumulator, 0.25);
      this.simulationAccumulator = 0;

      const events = this.lifeSystem.update(
        this.timeSystem.day,
        this.timeSystem.minuteOfDay,
        step,
      );
      this.showLifeEvents(events);

      this.brainSystem.update(
        this.timeSystem.day,
        this.timeSystem.minuteOfDay,
        step,
      );

      const economyEvents = this.economySystem.update(
        this.timeSystem.day,
        this.timeSystem.minuteOfDay,
        step,
      );

      const importantEconomyEvent = economyEvents
        .slice()
        .reverse()
        .find((event) =>
          [
            'shortage',
            'construction-start',
            'construction-complete',
          ].includes(event.type),
        );

      if (importantEconomyEvent) {
        this.hud.showToast(
          '📊 ' + importantEconomyEvent.text,
        );
      }
    }

    if (this.rosterAccumulator >= 1) {
      this.rosterAccumulator = 0;
      this.syncResidentRoster();
    }

    this.syncResidents(simulationDt);
    this.interiorRenderer.update(
      this.time.now / 1000,
    );

    const target = this.getInteractionTarget();
    this.hud.setInteractionHint(
      !this.dialogue.isOpen && !this.dynamicDialogue.isOpen && target !== null,
      target?.label ?? 'interagir',
    );

    if (
      !this.dynamicDialogue.isOpen &&
      (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      Phaser.Input.Keyboard.JustDown(this.enterKey) ||
      this.consumeMobileAction('interact'))
    ) {
      if (this.dialogue.isOpen) {
        this.dialogue.advance();
      } else if (target?.type === 'exit') {
        this.leaveInterior();
      } else if (target?.type === 'object') {
        this.inspectObject(target.object);
      } else if (target?.type === 'resident') {
        this.talkToResident(target.npc);
      }
    }

    if (
      !this.dialogue.isOpen &&
      !this.dynamicDialogue.isOpen &&
      (Phaser.Input.Keyboard.JustDown(this.freeChatKey) ||
      this.consumeMobileAction('chat')) &&
      target?.type === 'resident' &&
      target.npc.currentActivity !== 'sleep'
    ) {
      this.openGenerativeChat(target.npc);
    }

    if (!this.dynamicDialogue.isOpen && Phaser.Input.Keyboard.JustDown(this.brainKey)) {
      this.hud.toggleBrainDebug();
    }

    if (
      !this.dialogue.isOpen &&
      !this.dynamicDialogue.isOpen &&
      Phaser.Input.Keyboard.JustDown(this.marketKey)
    ) {
      this.hud.toggleEconomyDebug();
    }

    this.persistAccumulator += dt;
    if (this.persistAccumulator >= 3) {
      this.persistAccumulator = 0;
      this.persistTime();
    }

    this.hudAccumulator += dt;
    if (this.hudAccumulator >= 0.25) {
      this.hudAccumulator = 0;
      this.syncHud();
    }
  }

  private consumeMobileAction(action: 'interact' | 'chat'): boolean {
    const controls = window.asterMobile;
    if (!controls?.[action]) return false;
    controls[action] = false;
    return true;
  }

  private syncResidentRoster(): void {
    const definitions = this.lifeSystem.getAllDefinitions();
    const existing = new Set(this.residents.map((npc) => npc.definition.id));

    for (const definition of definitions) {
      if (existing.has(definition.id)) continue;
      const npc = new Npc(this, definition);
      const assetKey = 'character-' + definition.id;
      if (this.textures.exists(assetKey)) {
        npc.useTexture(assetKey);
      }
      npc.setVisible(false);
      npc.setActive(false);
      this.residents.push(npc);
      existing.add(definition.id);
    }
  }

  private syncResidents(deltaSeconds = 0): void {
    const currentResidents = this.residents.filter((npc) => {
      const life = this.lifeSystem.getState(npc.definition.id);
      return life?.currentZone === this.buildingId;
    });

    const sleepSpots =
      this.definition.sleepSpots ?? [{ x: 610, y: 365 }];
    const residentSpots =
      this.definition.residentSpots ?? [{ x: 560, y: 350 }];

    for (const npc of this.residents) {
      const life = this.lifeSystem.getState(npc.definition.id);
      const brain = this.brainSystem.getBrain(npc.definition.id);

      if (!life) {
        npc.syncWorldPresence(false);
        continue;
      }

      const desiredZone = brain?.zone ?? life.currentZone;

      // The outside world is not rendered while the player is indoors.
      // An NPC whose destination is this building can therefore enter
      // through the visible interior door without a visible world teleport.
      if (
        life.currentZone === 'world' &&
        desiredZone === this.buildingId
      ) {
        life.currentZone = this.buildingId;
      }

      if (life.currentZone !== this.buildingId) {
        npc.syncWorldPresence(false);
        continue;
      }

      npc.syncWorldPresence(
        true,
        this.definition.exit,
      );

      if (desiredZone !== this.buildingId) {
        const remaining = npc.moveToward(
          this.definition.exit,
          deltaSeconds,
          '👣 saindo',
          52,
        );

        if (remaining <= 8) {
          life.currentZone = 'world';
          npc.syncWorldPresence(false);
        }
        continue;
      }

      const index = Math.max(
        0,
        currentResidents.indexOf(npc),
      );
      const spots =
        life.currentActivity === 'sleep'
          ? sleepSpots
          : residentSpots;
      const spot = spots[index % spots.length];

      const remaining = npc.moveToward(
        spot,
        deltaSeconds,
        life.currentActivity === 'sleep'
          ? '👣 indo dormir'
          : '👣 se acomodando',
        48,
      );

      if (remaining <= 6) {
        npc.setInteriorActivity(
          life.currentActivity,
          brain?.label,
        );
        npc.setDepth(Math.round(npc.y));
      }
    }
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

    return !this.interiorRenderer.collisionRects.some((rect) =>
      circleIntersectsRect(x, y, radius, rect),
    );
  };

  private getInteractionTarget(): InteriorTarget | null {
    const exitDistance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.definition.exit.x,
      this.definition.exit.y,
    );

    let best: InteriorTarget | null =
      exitDistance <= 76
        ? { type: 'exit', label: 'sair', distance: exitDistance }
        : null;

    for (const npc of this.residents) {
      if (!npc.visible) continue;
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y,
      );
      if (distance <= 76 && (!best || distance < best.distance)) {
        best = {
          type: 'resident',
          label: npc.currentActivity === 'sleep' ? 'observar' : 'conversar',
          npc,
          distance,
        };
      }
    }

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
      if (
        distance <= threshold &&
        (!best || distance < best.distance)
      ) {
        best = {
          type: 'object',
          label: 'examinar ' + object.label.toLowerCase(),
          object,
          distance,
        };
      }
    }

    return best;
  }

  private openGenerativeChat(npc: Npc): void {
    const definition = npc.definition;
    const definitions = this.lifeSystem.getAllDefinitions();

    this.dynamicDialogue.open({
      definition,
      life: this.lifeSystem.getState(definition.id),
      brain: this.brainSystem.getBrain(definition.id),
      definitions,
      day: this.timeSystem.day,
      minute: this.timeSystem.minuteOfDay,
      time: this.timeSystem.formatted,
      location: this.definition.name,
    });
  }

  private talkToResident(npc: Npc): void {
    const definition = npc.definition;
    const life = this.lifeSystem.getState(definition.id);
    if (!life) return;

    if (life.currentActivity === 'sleep') {
      this.dialogue.open({
        name: definition.name,
        role: 'Dormindo em casa',
        portrait: '💤',
        lines: [
          definition.name + ' está dormindo profundamente.',
          'A rotina continua mesmo quando ninguém está olhando.',
        ],
      });
      return;
    }

    const definitions = this.lifeSystem.getAllDefinitions();
    const brain = this.brainSystem.getBrain(definition.id);
    const lines = ['Você encontrou ' + definition.name + ' aqui.'];

    if (brain) {
      lines.push('Decidi ' + brain.label + '.');
      if (brain.reasons.length) {
        lines.push('O que pesou nisso: ' + brain.reasons.slice(0, 2).join('; ') + '.');
      }
    }

    if (life.partnerId) {
      const partner = definitions.find((entry) => entry.id === life.partnerId);
      if (partner && life.relationshipStatus === 'married') {
        lines.push('Aqui é onde eu e ' + partner.name + ' estamos construindo nossa vida.');
      }
    }

    if (life.children.length) {
      const children = life.children
        .map((id) => definitions.find((entry) => entry.id === id)?.name)
        .filter((name): name is string => !!name);
      if (children.length) {
        lines.push('A casa ficou bem mais movimentada desde que ' + children.join(', ') + ' chegou.');
      }
    }

    this.dialogue.open({
      name: definition.name,
      role: definition.role,
      portrait: definition.emoji,
      lines,
    });
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

  private persistTime(): void {
    this.save.patch({
      day: this.timeSystem.day,
      gameMinutes: this.timeSystem.minutes,
    });
    this.save.persist();
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
    this.hud.setEconomyDebug(
      this.economySystem.getSummaryLines(),
    );
    this.hud.setPopulation(this.lifeSystem.getAllDefinitions().length);
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
