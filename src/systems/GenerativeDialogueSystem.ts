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

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface WebLlmEngine {
  chat: {
    completions: {
      create(request: {
        messages: ChatMessage[];
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

interface CpuGenerator {
  (
    messages: ChatMessage[],
    options: {
      max_new_tokens: number;
      do_sample: boolean;
      temperature: number;
      top_p: number;
      repetition_penalty: number;
    },
  ): Promise<unknown>;
}

type LocalBackend =
  | {
      kind: 'webgpu';
      name: string;
      engine: WebLlmEngine;
    }
  | {
      kind: 'wasm';
      name: string;
      generator: CpuGenerator;
    };

const GPU_PRIMARY_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
const GPU_FALLBACK_MODEL = 'SmolLM2-360M-Instruct-q4f32_1-MLC';
const CPU_MODEL = 'onnx-community/SmolLM2-135M-Instruct-ONNX';

let localBackend: LocalBackend | null = null;
let backendPromise: Promise<LocalBackend> | null = null;
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

    if (localBackend) {
      this.status.textContent =
        'IA local pronta • ' +
        localBackend.name +
        ' • ' +
        (localBackend.kind === 'webgpu' ? 'GPU' : 'CPU');
    } else if (supportsWebGPU()) {
      this.status.textContent =
        'IA local gratuita • GPU será preparada no primeiro envio';
    } else {
      this.status.textContent =
        'Sem WebGPU • IA local via CPU/WASM será carregada no primeiro envio';
    }

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
      const backend = await ensureLocalBackend((status) => {
        if (this.context?.definition.id === npcId) {
          this.status.textContent = status;
        }
      });

      this.status.textContent =
        context.definition.name +
        ' está pensando localmente • ' +
        (backend.kind === 'webgpu' ? 'GPU' : 'CPU');

      const reply = await this.generateReply(
        backend,
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
        'IA local • ' +
        backend.name +
        ' • ' +
        (backend.kind === 'webgpu' ? 'GPU' : 'CPU/WASM') +
        ' • sem custo por conversa';
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
        'IA local indisponível • fallback determinístico';
    } finally {
      this.sending = false;
      this.sendButton.disabled = false;
      this.input.focus();
    }
  }

  private async generateReply(
    backend: LocalBackend,
    context: ChatContext,
    playerMessage: string,
  ): Promise<string> {
    const messages = this.buildMessages(context, playerMessage);

    if (backend.kind === 'webgpu') {
      const response = await backend.engine.chat.completions.create({
        messages,
        temperature: 0.72,
        top_p: 0.9,
        max_tokens: 140,
        repetition_penalty: 1.08,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('WebGPU model returned an empty reply.');
      }

      return cleanReply(content, context.definition.name);
    }

    const output = await backend.generator(messages, {
      max_new_tokens: 96,
      do_sample: true,
      temperature: 0.72,
      top_p: 0.9,
      repetition_penalty: 1.08,
    });

    const content = extractTransformersReply(output);

    if (!content) {
      throw new Error('WASM model returned an empty reply.');
    }

    return cleanReply(content, context.definition.name);
  }

  private buildMessages(
    context: ChatContext,
    playerMessage: string,
  ): ChatMessage[] {
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
      .facts.slice(0, 8)
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
      'Fale de forma natural e curta, normalmente 1 ou 2 frases.',
      'Use SOMENTE as informações abaixo. Se não souber algo, diga naturalmente que não sabe.',
      'Não invente acontecimentos canônicos, quests, itens, relações ou fatos sobre outros moradores.',
      'PERSONALIDADE: ' + JSON.stringify(personality ?? {}),
      'ASSUNTO IMPORTANTE: ' + context.definition.topic,
      'DIA/HORA: dia ' + context.day + ', ' + context.time,
      'LOCAL: ' + context.location,
      'ATIVIDADE: ' +
        (brain?.label ?? life?.currentActivity ?? 'observando a vila'),
      'RELACIONAMENTO: ' + (life?.relationshipStatus ?? 'single'),
      partnerName ? 'PARCEIRO: ' + partnerName : '',
      childrenNames.length
        ? 'FILHOS: ' + childrenNames.join(', ')
        : '',
      facts
        ? 'FATOS QUE ESTE NPC SABE:\n' + facts
        : 'FATOS CONHECIDOS: nenhum relevante.',
      conversation.summary
        ? 'RESUMO ANTERIOR: ' + compact(conversation.summary, 420)
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const history: ChatMessage[] = conversation.turns
      .slice(0, -1)
      .slice(-4)
      .map((turn) => ({
        role: turn.role === 'player' ? 'user' : 'assistant',
        content: compact(turn.text, 220),
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

async function ensureLocalBackend(
  onProgress: (status: string) => void,
): Promise<LocalBackend> {
  if (localBackend) return localBackend;

  progressListener = onProgress;

  if (!backendPromise) {
    backendPromise = loadBestBackend();
  }

  try {
    localBackend = await backendPromise;
    return localBackend;
  } finally {
    backendPromise = null;
  }
}

async function loadBestBackend(): Promise<LocalBackend> {
  if (supportsWebGPU()) {
    try {
      return await loadWebGpuBackend();
    } catch {
      progressListener?.(
        'GPU local indisponível • alternando automaticamente para CPU/WASM...',
      );
    }
  } else {
    progressListener?.(
      'WebGPU não disponível • usando IA local via CPU/WASM...',
    );
  }

  return loadWasmBackend();
}

async function loadWebGpuBackend(): Promise<LocalBackend> {
  const webllm = await import('@mlc-ai/web-llm');
  const candidates = [
    GPU_PRIMARY_MODEL,
    GPU_FALLBACK_MODEL,
  ];

  let lastError: unknown;

  for (const model of candidates) {
    try {
      progressListener?.(
        'Preparando IA local GPU • ' + friendlyGpuModelName(model),
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
                ? 'Baixando modelo GPU • ' +
                    percentage +
                    '% • primeira vez apenas'
                : report.text ?? 'Carregando modelo GPU...',
            );
          },
          logLevel: 'WARN',
        },
        {
          context_window_size: 2048,
        },
      );

      return {
        kind: 'webgpu',
        name: friendlyGpuModelName(model),
        engine: engine as unknown as WebLlmEngine,
      };
    } catch (error) {
      lastError = error;
      progressListener?.(
        'Tentando outro modelo GPU...',
      );
    }
  }

  throw lastError ?? new Error('Unable to load WebGPU model.');
}

async function loadWasmBackend(): Promise<LocalBackend> {
  progressListener?.(
    'Preparando IA local CPU • SmolLM2 135M...',
  );

  const transformers = await import('@huggingface/transformers');

  const generator = await transformers.pipeline(
    'text-generation',
    CPU_MODEL,
    {
      device: 'wasm',
      dtype: 'q4',
      progress_callback: (report) => {
        const rawProgress =
          typeof report === 'object' &&
          report !== null &&
          'progress' in report &&
          typeof report.progress === 'number'
            ? report.progress
            : null;

        const percentage =
          rawProgress === null
            ? null
            : Math.round(
                rawProgress <= 1
                  ? rawProgress * 100
                  : rawProgress,
              );

        progressListener?.(
          percentage !== null
            ? 'Baixando IA CPU • ' +
                percentage +
                '% • primeira vez apenas'
            : 'Preparando arquivos da IA CPU...',
        );
      },
    },
  );

  progressListener?.(
    'IA local CPU pronta • SmolLM2 135M',
  );

  return {
    kind: 'wasm',
    name: 'SmolLM2 135M',
    generator: generator as unknown as CpuGenerator,
  };
}

function extractTransformersReply(output: unknown): string | null {
  if (!Array.isArray(output) || output.length === 0) {
    return null;
  }

  const first = output[0];

  if (
    typeof first !== 'object' ||
    first === null ||
    !('generated_text' in first)
  ) {
    return null;
  }

  const generated = first.generated_text;

  if (typeof generated === 'string') {
    return generated;
  }

  if (Array.isArray(generated)) {
    const last = generated[generated.length - 1];

    if (
      typeof last === 'object' &&
      last !== null &&
      'content' in last &&
      typeof last.content === 'string'
    ) {
      return last.content;
    }
  }

  return null;
}

function supportsWebGPU(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'gpu' in navigator
  );
}

function friendlyGpuModelName(model: string): string {
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
        '^\\s*' +
          escapeRegExp(npcName) +
          '\\s*:\\s*',
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
        'O jogador disse que seu nome é ' +
        value.trim() +
        '.',
    },
    {
      pattern: /\beu (?:vim|venho) (?:de|da|do)\s+([^,.!?]{2,70})/i,
      format: (value) =>
        'O jogador disse que veio de ' +
        value.trim() +
        '.',
    },
    {
      pattern: /\beu moro (?:em|na|no)\s+([^,.!?]{2,70})/i,
      format: (value) =>
        'O jogador disse que mora em ' +
        value.trim() +
        '.',
    },
    {
      pattern: /\beu gosto de\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que gosta de ' +
        value.trim() +
        '.',
    },
    {
      pattern: /\beu não gosto de\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que não gosta de ' +
        value.trim() +
        '.',
    },
    {
      pattern: /\beu trabalho (?:como|com)\s+([^,.!?]{2,80})/i,
      format: (value) =>
        'O jogador disse que trabalha ' +
        value.trim() +
        '.',
    },
  ];

  for (const rule of rules) {
    const match = normalized.match(rule.pattern);

    if (match?.[1]) {
      return rule.format(match[1]);
    }
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
