import type {
  NpcBrainState,
  NpcDefinition,
  NpcLifeState,
} from '../types';
import type { SaveSystem } from './SaveSystem';
import {
  SemanticDialoguePlanner,
  type SemanticDialogueContext,
} from './SemanticDialoguePlanner';

interface ChatContext extends SemanticDialogueContext {
  definition: NpcDefinition;
  life?: NpcLifeState;
  brain?: NpcBrainState;
  definitions: NpcDefinition[];
  day: number;
  minute: number;
  time: string;
  location: string;
}

export class DynamicDialogueSystem {
  private root = document.getElementById('npcChat')!;
  private name = document.getElementById('npcChatName')!;
  private status = document.getElementById('npcChatStatus')!;
  private messages = document.getElementById('npcChatMessages')!;
  private input = document.getElementById('npcChatInput') as HTMLInputElement;
  private sendButton = document.getElementById('npcChatSend') as HTMLButtonElement;
  private closeButton = document.getElementById('npcChatClose') as HTMLButtonElement;

  private context: ChatContext | null = null;
  private readonly planner: SemanticDialoguePlanner;

  constructor(private readonly save: SaveSystem) {
    this.planner = new SemanticDialoguePlanner(save);

    this.sendButton.addEventListener('click', () => this.send());
    this.closeButton.addEventListener('click', () => this.close());

    this.input.addEventListener('keydown', (event) => {
      event.stopPropagation();

      if (event.key === 'Enter') {
        event.preventDefault();
        this.send();
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
      ' • conversa dinâmica';

    this.messages.replaceChildren();
    this.renderSavedConversation(context.definition.id);

    if (!this.messages.childElementCount) {
      this.addMessage(
        'npc',
        this.localGreeting(context),
      );
    }

    this.status.textContent =
      'Diálogo dinâmico • memória ativa • resposta instantânea';

    this.root.classList.remove('hidden');
    this.input.value = '';
    this.input.focus();
  }

  close(): void {
    this.context = null;
    this.root.classList.add('hidden');
    this.input.blur();
  }

  private send(): void {
    if (!this.context) return;

    const message = this.input.value.trim();
    if (!message) return;

    const context = this.context;
    const npcId = context.definition.id;

    this.input.value = '';

    this.addMessage('player', message);
    this.save.appendConversationTurn(npcId, {
      role: 'player',
      text: message,
      day: context.day,
      minute: context.minute,
    });

    this.rememberExplicitPlayerFact(
      context,
      message,
    );

    const planned = this.planner.reply(
      context,
      message,
    );

    this.addMessage('npc', planned.reply);
    this.save.appendConversationTurn(npcId, {
      role: 'npc',
      text: planned.reply,
      day: context.day,
      minute: context.minute,
    });

    this.updateConversationSummary(
      context,
      message,
      planned.reply,
    );

    const memory = this.save.memoryFor(npcId);
    memory.talks += 1;
    memory.affinity = Math.min(
      100,
      memory.affinity + affinityGain(planned.intent),
    );
    memory.lastDay = context.day;

    this.save.persist();

    this.status.textContent =
      'Diálogo dinâmico • ' +
      intentLabel(planned.intent) +
      ' • memória ativa';
  }

  private renderSavedConversation(npcId: string): void {
    const conversation =
      this.save.conversationFor(npcId);

    for (
      const turn of conversation.turns.slice(-6)
    ) {
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
      (role === 'player'
        ? 'from-player'
        : 'from-npc');
    row.textContent = text;
    this.messages.appendChild(row);
    this.messages.scrollTop =
      this.messages.scrollHeight;
  }

  private localGreeting(
    context: ChatContext,
  ): string {
    const memory =
      this.save.memoryFor(
        context.definition.id,
      );

    if (memory.talks > 1) {
      return context.definition.remembered;
    }

    return context.definition.intro;
  }

  private rememberExplicitPlayerFact(
    context: ChatContext,
    message: string,
  ): void {
    const fact =
      extractExplicitPlayerFact(message);

    if (!fact) return;

    this.save.addFact(
      context.definition.id,
      {
        id:
          'player-dialogue:' +
          context.day +
          ':' +
          Math.floor(context.minute) +
          ':' +
          stableHash(fact),
        text: fact,
        importance: 3,
        createdDay: context.day,
        source: 'player',
      },
    );
  }

  private updateConversationSummary(
    context: ChatContext,
    playerMessage: string,
    npcReply: string,
  ): void {
    const conversation =
      this.save.conversationFor(
        context.definition.id,
      );

    const exchange =
      'Jogador: "' +
      compact(playerMessage, 100) +
      '". ' +
      context.definition.name +
      ': "' +
      compact(npcReply, 120) +
      '".';

    this.save.setConversationSummary(
      context.definition.id,
      [conversation.summary, exchange]
        .filter(Boolean)
        .join(' ')
        .slice(-900),
    );
  }
}

function affinityGain(intent: string): number {
  return {
    greeting: 1,
    identity: 1,
    profession: 1,
    activity: 1,
    wellbeing: 2,
    river: 2,
    family: 3,
    'npc-opinion': 2,
    'player-memory': 3,
    village: 1,
    opinion: 2,
    'memory-fact': 2,
    'follow-up': 1,
    unknown: 0,
  }[intent] ?? 1;
}

function intentLabel(intent: string): string {
  return {
    greeting: 'saudação',
    identity: 'identidade',
    profession: 'profissão',
    activity: 'atividade atual',
    wellbeing: 'estado emocional',
    river: 'conhecimento do rio',
    family: 'família',
    'npc-opinion': 'relações sociais',
    'player-memory': 'memória do jogador',
    village: 'conhecimento da vila',
    opinion: 'personalidade',
    'memory-fact': 'memória recuperada',
    'follow-up': 'continuidade',
    unknown: 'resposta contextual',
  }[intent] ?? 'contexto';
}

function extractExplicitPlayerFact(
  message: string,
): string | null {
  const normalized = message.trim();

  const rules: Array<{
    pattern: RegExp;
    format: (value: string) => string;
  }> = [
    {
      pattern:
        /\bmeu nome (?:é|e)\s+([^,.!?]{2,40})/i,
      format: (value) =>
        'O jogador disse que seu nome é ' +
        value.trim() +
        '.',
    },
    {
      pattern:
        /\beu (?:vim|venho) (?:de|da|do)\s+([^,.!?]{2,70})/i,
      format: (value) =>
        'O jogador disse que veio de ' +
        value.trim() +
        '.',
    },
    {
      pattern:
        /\beu moro (?:em|na|no)\s+([^,.!?]{2,70})/i,
      format: (value) =>
        'O jogador disse que mora em ' +
        value.trim() +
        '.',
    },
    {
      pattern:
        /\beu gosto de\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que gosta de ' +
        value.trim() +
        '.',
    },
    {
      pattern:
        /\beu não gosto de\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que não gosta de ' +
        value.trim() +
        '.',
    },
    {
      pattern:
        /\beu trabalho (?:como|com)\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que trabalha ' +
        value.trim() +
        '.',
    },
  ];

  for (const rule of rules) {
    const match =
      normalized.match(rule.pattern);

    if (match?.[1]) {
      return rule.format(match[1]);
    }
  }

  return null;
}

function compact(
  value: string,
  max: number,
): string {
  const compacted =
    value.replace(/\s+/g, ' ').trim();

  return compacted.length <= max
    ? compacted
    : compacted.slice(0, max - 1) + '…';
}

function stableHash(value: string): number {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}
