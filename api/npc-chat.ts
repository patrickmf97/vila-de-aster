import OpenAI from 'openai';

interface ChatTurn {
  role: 'player' | 'npc';
  text: string;
}

interface NpcChatRequest {
  npc: {
    id: string;
    name: string;
    role: string;
    topic: string;
    personality?: Record<string, number>;
  };
  state: {
    day: number;
    time: string;
    activity: string;
    relationshipStatus: string;
    partnerName?: string;
    childrenNames?: string[];
    location: string;
  };
  memoryFacts: Array<{
    text: string;
    source: string;
    importance: number;
  }>;
  conversationSummary: string;
  recentConversation: ChatTurn[];
  playerMessage: string;
}

interface NpcChatResponse {
  reply: string;
  memory: string;
  summary: string;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function GET(): Response {
  return Response.json({
    ok: true,
    configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL ?? 'gpt-5',
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'OPENAI_API_KEY is not configured.' },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  if (!allowRequest(ip)) {
    return Response.json(
      { error: 'Rate limit exceeded.' },
      { status: 429 },
    );
  }

  let body: NpcChatRequest;

  try {
    body = (await request.json()) as NpcChatRequest;
  } catch {
    return Response.json(
      { error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const validationError = validate(body);
  if (validationError) {
    return Response.json(
      { error: validationError },
      { status: 400 },
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const model = process.env.OPENAI_MODEL ?? 'gpt-5';

  const instructions = [
    'Você interpreta um NPC de um RPG chamado Vila de Aster.',
    'Responda sempre em português brasileiro, em primeira pessoa e dentro do personagem.',
    'Nunca diga que é uma IA, modelo, prompt ou sistema.',
    'Use apenas os fatos, memórias, relações e contexto enviados nesta requisição.',
    'Se o jogador perguntar algo que o NPC não sabe, admita que não sabe. Não invente lore canônico.',
    'Não altere quests, casamento, filhos, inventário, economia ou qualquer estado do jogo.',
    'A resposta deve ser natural e curta: normalmente 1 a 3 frases.',
    'O campo memory deve registrar apenas um fato novo, explícito e durável dito pelo jogador que valha lembrar depois. Use string vazia quando não houver.',
    'O campo summary deve resumir de forma curta a relação/conversa até agora sem inventar informação.',
  ].join('\n');

  const context = {
    npc: body.npc,
    current_state: body.state,
    known_facts: body.memoryFacts.slice(0, 12),
    previous_summary: body.conversationSummary.slice(0, 900),
    recent_conversation: body.recentConversation.slice(-8),
    player_message: body.playerMessage,
  };

  try {
    const response = await client.responses.create({
      model,
      store: false,
      max_output_tokens: 260,
      instructions,
      input: JSON.stringify(context),
      text: {
        format: {
          type: 'json_schema',
          name: 'npc_dialogue',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              reply: { type: 'string' },
              memory: { type: 'string' },
              summary: { type: 'string' },
            },
            required: ['reply', 'memory', 'summary'],
          },
        },
      },
    });

    const parsed = parseStructuredResponse(response.output_text);

    return Response.json({
      reply: parsed.reply.slice(0, 900),
      memory: parsed.memory.slice(0, 280),
      summary: parsed.summary.slice(0, 900),
      source: 'openai',
      model,
    });
  } catch (error) {
    console.error('npc-chat failed', error);

    return Response.json(
      { error: 'Generative dialogue unavailable.' },
      { status: 502 },
    );
  }
}

function validate(body: NpcChatRequest): string | null {
  if (!body || typeof body !== 'object') return 'Missing body.';
  if (!body.npc?.id || !body.npc?.name) return 'Missing NPC identity.';
  if (!body.state || typeof body.state.day !== 'number') return 'Missing NPC state.';
  if (!Array.isArray(body.memoryFacts)) return 'Invalid memory facts.';
  if (!Array.isArray(body.recentConversation)) return 'Invalid conversation.';
  if (typeof body.playerMessage !== 'string') return 'Missing player message.';

  const message = body.playerMessage.trim();
  if (!message) return 'Player message is empty.';
  if (message.length > 320) return 'Player message is too long.';

  if (body.recentConversation.length > 8) {
    return 'Conversation history is too long.';
  }

  return null;
}

function parseStructuredResponse(outputText: string): NpcChatResponse {
  const value = JSON.parse(outputText) as Partial<NpcChatResponse>;

  if (
    typeof value.reply !== 'string' ||
    typeof value.memory !== 'string' ||
    typeof value.summary !== 'string'
  ) {
    throw new Error('Invalid structured response.');
  }

  return {
    reply: value.reply.trim(),
    memory: value.memory.trim(),
    summary: value.summary.trim(),
  };
}

function allowRequest(key: string): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + 60_000,
    });
    return true;
  }

  if (existing.count >= 12) return false;

  existing.count += 1;
  return true;
}
