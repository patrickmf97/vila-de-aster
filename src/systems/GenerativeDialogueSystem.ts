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

interface LocalChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LocalEngine {
  chat: {
    completions: {
      create(request: {
        messages: LocalChatMessage[];
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
        repetition_penalty?: number;
      }): Promise<{
        choices: Array<{
          message: {
            content: string | null;
          };
        }>;
      }>;
    };
  };
}

const PRIMARY_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
const FALLBACK_MODEL = 'SmolLM2-360M-Instruct-q4f32_1-MLC';

let localEngine: LocalEngine | null = null;
let localEnginePromise: Promise<LocalEngine> | null = null;
let activeModel = '';
let progressListener: ((status: string) => void) | null = null;

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
      this.addMessage('npc', this.localGreeting(context));
    }

    this.status.textContent = localEngine
      ? 'IA local pronta • ' + activeModel
      : supportsWebGPU()
        ? 'IA local gratuita • modelo será carregado no primeiro envio'
        : 'WebGPU indisponível • usando diálogo local';

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

    try {
      const engine = await ensureLocalEngine((status) => {
        if (this.context?.definition.id === npcId) {
          this.status.textContent = status;
        }
      });

      this.status.textContent =
        context.definition.name + ' está pensando localmente...';

      const reply = await this.generateReply(
        engine,
        context,
        message,
      );

      this.addMessage('npc', reply);
      this.save.appendConversationTurn(npcId, {
        role: 'npc',
        text: reply,
        day: context.day,
        minute: context.minute,
      });

      this.updateConversationMemory(context, message, reply);
      this.save.persist();

      this.status.textContent =
        'IA local • ' + activeModel + ' • sem custo por conversa';
    } catch {
      const fallback = this.localFallback(context, message);
      this.addMessage('npc', fallback);
      this.save.appendConversationTurn(npcId, {
        role: 'npc',
        text: fallback,
        day: context.day,
        minute: context.minute,
      });

      this.updateConversationMemory(context, message, fallback);
      this.save.persist();

      this.status.textContent =
        supportsWebGPU()
          ? 'Modelo local indisponível • fallback determinístico'
          : 'Sem WebGPU • fallback determinístico';
    } finally {
      this.sending = false;
      this.sendButton.disabled = false;
      this.input.focus();
    }
  }

  private async generateReply(
    engine: LocalEngine,
    context: ChatContext,
    playerMessage: string,
  ): Promise<string> {
    const response = await engine.chat.completions.create({
      messages: this.buildMessages(context, playerMessage),
      temperature: 0.72,
      top_p: 0.9,
      max_tokens: 140,
      repetition_penalty: 1.08,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Local model returned an empty reply.');
    }

    return cleanReply(content, context.definition.name);
  }

  private buildMessages(
    context: ChatContext,
    playerMessage: string,
  ): LocalChatMessage[] {
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

    const facts = this.save
      .memoryFor(context.definition.id)
      .facts.slice(0, 10)
      .map((fact) => '- ' + fact.text)
      .join('\n');

    const personality = context.definition.brain?.personality;

    const system = [
      'Você interpreta ' +
        context.definition.name +
        ', ' +
        context.definition.role +
        ', um morador da Vila de Aster.',
      'Responda sempre em português brasileiro, em primeira pessoa e dentro do personagem.',
      'Nunca diga que é uma IA, modelo, chatbot, jogo ou prompt.',
      'Fale de forma natural e curta, normalmente 1 a 3 frases.',
      'Use SOMENTE as informações abaixo. Se não souber algo, diga naturalmente que não sabe.',
      'Não invente acontecimentos canônicos, quests, itens, relações ou fatos sobre outros moradores.',
      '',
      'PERSONALIDADE: ' + JSON.stringify(personality ?? {}),
      'ASSUNTO QUE COSTUMA PREOCUPAR ESTE NPC: ' + context.definition.topic,
      'DIA/HORA: dia ' + context.day + ', ' + context.time,
      'LOCAL: ' + context.location,
      'ATIVIDADE ATUAL: ' +
        (brain?.label ?? life?.currentActivity ?? 'observando a vila'),
      'RELACIONAMENTO: ' + (life?.relationshipStatus ?? 'single'),
      partnerName ? 'PARCEIRO: ' + partnerName : '',
      childrenNames.length
        ? 'FILHOS: ' + childrenNames.join(', ')
        : '',
      facts ? 'FATOS QUE ESTE NPC SABE:\n' + facts : 'FATOS CONHECIDOS: nenhum relevante.',
      conversation.summary
        ? 'RESUMO DAS CONVERSAS ANTERIORES: ' +
          conversation.summary
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const history: LocalChatMessage[] = conversation.turns
      .slice(0, -1)
      .slice(-6)
      .map((turn) => ({
        role: turn.role === 'player' ? 'user' : 'assistant',
        content: turn.text,
      }));

    return [
      { role: 'system', content: system },
      ...history,
      { role: 'user', content: playerMessage },
    ];
  }

  private updateConversationMemory(
    context: ChatContext,
    playerMessage: string,
    npcReply: string,
  ): void {
    const npcId = context.definition.id;
    const conversation = this.save.conversationFor(npcId);

    const exchange =
      'Jogador disse "' +
      compact(playerMessage, 120) +
      '". ' +
      context.definition.name +
      ' respondeu "' +
      compact(npcReply, 140) +
      '".';

    const summary = [conversation.summary, exchange]
      .filter(Boolean)
      .join(' ')
      .slice(-900);

    this.save.setConversationSummary(npcId, summary);

    const fact = extractExplicitPlayerFact(playerMessage);
    if (fact) {
      this.save.addFact(npcId, {
        id:
          'player-chat:' +
          context.day +
          ':' +
          Math.floor(context.minute) +
          ':' +
          stableHash(fact),
        text: fact,
        importance: 3,
        createdDay: context.day,
        source: 'player',
      });
    }
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
    message: string,
  ): string {
    const lower = message.toLowerCase();
    const memory = this.save.memoryFor(context.definition.id);

    if (
      lower.includes('rio') ||
      lower.includes('tremor') ||
      lower.includes('água')
    ) {
      const riverFact = memory.facts.find(
        (fact) => fact.id === 'river-echo',
      );

      return riverFact
        ? context.definition.topic
        : 'Não sei muita coisa sobre isso ainda. Talvez outro morador tenha visto algo que eu não vi.';
    }

    if (
      lower.includes('família') ||
      lower.includes('casad') ||
      lower.includes('filh')
    ) {
      const life = context.life;
      if (life?.partnerId || life?.children.length) {
        return 'Minha família ocupa bastante os meus pensamentos. Cada dia por aqui muda um pouco quando a gente tem alguém para cuidar.';
      }
    }

    const fact = memory.facts[0];
    if (fact) {
      return (
        'Posso não ter uma resposta perfeita, mas lembro disso: ' +
        fact.text
      );
    }

    return context.definition.topic;
  }
}

async function ensureLocalEngine(
  onProgress: (status: string) => void,
): Promise<LocalEngine> {
  if (localEngine) return localEngine;

  if (!supportsWebGPU()) {
    throw new Error('WebGPU is not available.');
  }

  progressListener = onProgress;

  if (!localEnginePromise) {
    localEnginePromise = loadLocalEngine();
  }

  try {
    localEngine = await localEnginePromise;
    return localEngine;
  } finally {
    localEnginePromise = null;
  }
}

async function loadLocalEngine(): Promise<LocalEngine> {
  const webllm = await import('@mlc-ai/web-llm');
  const candidates = [PRIMARY_MODEL, FALLBACK_MODEL];

  let lastError: unknown;

  for (const model of candidates) {
    try {
      activeModel = model;
      progressListener?.(
        'Preparando IA local • ' + friendlyModelName(model),
      );

      const engine = await webllm.CreateMLCEngine(
        model,
        {
          initProgressCallback: (report: {
            progress?: number;
            text?: string;
          }) => {
            const percentage =
              typeof report.progress === 'number'
                ? Math.round(report.progress * 100)
                : null;

            progressListener?.(
              percentage !== null
                ? 'Baixando modelo local • ' +
                    percentage +
                    '% • primeira vez apenas'
                : report.text ?? 'Carregando modelo local...',
            );
          },
          logLevel: 'WARN',
        },
        {
          context_window_size: 2048,
        },
      );

      progressListener?.(
        'IA local pronta • ' + friendlyModelName(model),
      );

      return engine as unknown as LocalEngine;
    } catch (error) {
      lastError = error;
      progressListener?.(
        'Tentando modelo local mais leve...',
      );
    }
  }

  activeModel = '';
  throw lastError ?? new Error('Unable to load a local model.');
}

function supportsWebGPU(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

function friendlyModelName(model: string): string {
  if (model.startsWith('Llama-3.2-1B')) {
    return 'Llama 3.2 1B';
  }
  if (model.startsWith('SmolLM2-360M')) {
    return 'SmolLM2 360M';
  }
  return model;
}

function cleanReply(
  value: string,
  npcName: string,
): string {
  let reply = value
    .replace(/^\s*(assistant|npc)\s*:\s*/i, '')
    .replace(
      new RegExp(
        '^\\s*' + escapeRegExp(npcName) + '\\s*:\\s*',
        'i',
      ),
      '',
    )
    .trim();

  if (reply.length > 700) {
    reply = reply.slice(0, 700).trimEnd() + '…';
  }

  return reply || 'Preciso pensar um pouco antes de responder.';
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
      pattern: /\bmeu nome (?:é|e)\s+([^,.!?]{2,40})/i,
      format: (value) =>
        'O jogador disse que seu nome é ' + value.trim() + '.',
    },
    {
      pattern: /\beu (?:vim|venho) (?:de|da|do)\s+([^,.!?]{2,70})/i,
      format: (value) =>
        'O jogador disse que veio de ' + value.trim() + '.',
    },
    {
      pattern: /\beu moro (?:em|na|no)\s+([^,.!?]{2,70})/i,
      format: (value) =>
        'O jogador disse que mora em ' + value.trim() + '.',
    },
    {
      pattern: /\beu gosto de\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que gosta de ' + value.trim() + '.',
    },
    {
      pattern: /\beu não gosto de\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que não gosta de ' + value.trim() + '.',
    },
    {
      pattern: /\beu trabalho (?:como|com)\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que trabalha ' + value.trim() + '.',
    },
  ];

  for (const rule of rules) {
    const match = normalized.match(rule.pattern);
    if (match?.[1]) return rule.format(match[1]);
  }

  return null;
}

function compact(value: string, max: number): string {
  const compacted = value.replace(/\s+/g, ' ').trim();
  return compacted.length <= max
    ? compacted
    : compacted.slice(0, max - 1) + '…';
}

function escapeRegExp(value: string): string {
  return value.replace(/[$.*+?^(){}|[\]\\]/g, '\\$&');
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}
