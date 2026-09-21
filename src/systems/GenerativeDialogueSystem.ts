import type {
  NpcBrainState,
  NpcDefinition,
  NpcLifeState,
} from '../types';
import type { SaveSystem } from './SaveSystem';

interface ChatContext {
  definition: NpcDefinition;
  life?: NpcLifeState;
  brain?: NpcBrainState;
  definitions: NpcDefinition[];
  day: number;
  minute: number;
  time: string;
  location: string;
}

interface ApiResponse {
  reply?: string;
  memory?: string;
  summary?: string;
  source?: string;
  model?: string;
  error?: string;
}

export class GenerativeDialogueSystem {
  private root = document.getElementById('npcChat')!;
  private name = document.getElementById('npcChatName')!;
  private status = document.getElementById('npcChatStatus')!;
  private messages = document.getElementById('npcChatMessages')!;
  private input = document.getElementById('npcChatInput') as HTMLInputElement;
  private sendButton = document.getElementById('npcChatSend') as HTMLButtonElement;
  private closeButton = document.getElementById('npcChatClose') as HTMLButtonElement;

  private context: ChatContext | null = null;
  private sending = false;

  constructor(private readonly save: SaveSystem) {
    this.sendButton.addEventListener('click', () => void this.send());
    this.closeButton.addEventListener('click', () => this.close());

    this.input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        event.preventDefault();
        void this.send();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    });
  }

  get isOpen(): boolean {
    return this.context !== null;
  }

  open(context: ChatContext): void {
    this.context = context;
    this.name.textContent =
      context.definition.emoji +
      ' ' +
      context.definition.name +
      ' • conversa livre';

    this.messages.replaceChildren();
    this.renderSavedConversation(context.definition.id);

    if (!this.messages.childElementCount) {
      this.addMessage(
        'npc',
        this.localGreeting(context),
      );
    }

    this.status.textContent = 'Conectando quando você enviar uma mensagem';
    this.root.classList.remove('hidden');
    this.input.value = '';
    this.input.focus();
  }

  close(): void {
    this.context = null;
    this.root.classList.add('hidden');
    this.input.blur();
  }

  private async send(): Promise<void> {
    if (!this.context || this.sending) return;

    const message = this.input.value.trim();
    if (!message) return;

    const context = this.context;
    const npcId = context.definition.id;

    this.input.value = '';
    this.sending = true;
    this.sendButton.disabled = true;

    this.addMessage('player', message);
    this.save.appendConversationTurn(npcId, {
      role: 'player',
      text: message,
      day: context.day,
      minute: context.minute,
    });

    this.status.textContent = context.definition.name + ' está pensando...';

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 14_000);

    try {
      const response = await fetch('/api/npc-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(
          this.buildRequest(context, message),
        ),
      });

      if (!response.ok) {
        throw new Error('Generative endpoint unavailable.');
      }

      const payload = (await response.json()) as ApiResponse;
      if (!payload.reply) {
        throw new Error('Missing NPC reply.');
      }

      this.addMessage('npc', payload.reply);
      this.save.appendConversationTurn(npcId, {
        role: 'npc',
        text: payload.reply,
        day: context.day,
        minute: context.minute,
      });

      if (payload.summary) {
        this.save.setConversationSummary(
          npcId,
          payload.summary,
        );
      }

      if (payload.memory) {
        this.save.addFact(npcId, {
          id:
            'player-chat:' +
            context.day +
            ':' +
            Math.floor(context.minute) +
            ':' +
            stableHash(payload.memory),
          text: payload.memory,
          importance: 3,
          createdDay: context.day,
          source: 'player',
        });
      }

      this.save.persist();
      this.status.textContent =
        'IA online' +
        (payload.model ? ' • ' + payload.model : '');
    } catch {
      const fallback = this.localFallback(context, message);
      this.addMessage('npc', fallback);
      this.save.appendConversationTurn(npcId, {
        role: 'npc',
        text: fallback,
        day: context.day,
        minute: context.minute,
      });
      this.save.persist();
      this.status.textContent =
        'Modo local • IA indisponível';
    } finally {
      window.clearTimeout(timeout);
      this.sending = false;
      this.sendButton.disabled = false;
      this.input.focus();
    }
  }

  private buildRequest(
    context: ChatContext,
    playerMessage: string,
  ): object {
    const life = context.life;
    const brain = context.brain;
    const conversation =
      this.save.conversationFor(context.definition.id);

    const partnerName = life?.partnerId
      ? context.definitions.find(
          (entry) => entry.id === life.partnerId,
        )?.name
      : undefined;

    const childrenNames = (life?.children ?? [])
      .map(
        (id) =>
          context.definitions.find(
            (entry) => entry.id === id,
          )?.name,
      )
      .filter((name): name is string => !!name);

    return {
      npc: {
        id: context.definition.id,
        name: context.definition.name,
        role: context.definition.role,
        topic: context.definition.topic,
        personality:
          context.definition.brain?.personality,
      },
      state: {
        day: context.day,
        time: context.time,
        activity:
          brain?.label ??
          life?.currentActivity ??
          'observando a vila',
        relationshipStatus:
          life?.relationshipStatus ?? 'single',
        partnerName,
        childrenNames,
        location: context.location,
      },
      memoryFacts: this.save
        .memoryFor(context.definition.id)
        .facts.slice(0, 12)
        .map((fact) => ({
          text: fact.text,
          source: fact.source,
          importance: fact.importance,
        })),
      conversationSummary: conversation.summary,
      recentConversation: conversation.turns.map(
        (turn) => ({
          role: turn.role,
          text: turn.text,
        }),
      ),
      playerMessage,
    };
  }

  private renderSavedConversation(npcId: string): void {
    const conversation = this.save.conversationFor(npcId);

    for (const turn of conversation.turns.slice(-6)) {
      this.addMessage(turn.role, turn.text);
    }
  }

  private addMessage(
    role: 'player' | 'npc',
    text: string,
  ): void {
    const row = document.createElement('div');
    row.className =
      'npc-chat-message ' +
      (role === 'player' ? 'from-player' : 'from-npc');
    row.textContent = text;
    this.messages.appendChild(row);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  private localGreeting(context: ChatContext): string {
    const memory = this.save.memoryFor(context.definition.id);

    if (memory.talks > 1) {
      return context.definition.remembered;
    }

    return context.definition.intro;
  }

  private localFallback(
    context: ChatContext,
    _message: string,
  ): string {
    const fact = this.save
      .memoryFor(context.definition.id)
      .facts[0];

    if (fact) {
      return (
        'Minha cabeça está meio cheia agora. ' +
        'Mas eu ainda lembro disso: ' +
        fact.text
      );
    }

    return (
      'Não consegui organizar meus pensamentos agora. ' +
      context.definition.topic
    );
  }
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}
