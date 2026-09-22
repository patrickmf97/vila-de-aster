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

type MenuId =
  | 'root'
  | 'personal'
  | 'world'
  | 'people'
  | 'memories'
  | 'follow-up';

interface DialogueChoice {
  id: string;
  label: string;
  query?: string;
  affinity?: number;
  menu?: MenuId;
  close?: boolean;
  accent?: 'normal' | 'personal' | 'back' | 'exit';
}

export class DynamicDialogueSystem {
  private root = document.getElementById('npcChat')!;
  private name = document.getElementById('npcChatName')!;
  private status = document.getElementById('npcChatStatus')!;
  private messages = document.getElementById('npcChatMessages')!;
  private choices = document.getElementById('npcChatChoices')!;
  private closeButton = document.getElementById('npcChatClose') as HTMLButtonElement;

  private context: ChatContext | null = null;
  private readonly planner: SemanticDialoguePlanner;
  private lastIntent = 'greeting';

  constructor(private readonly save: SaveSystem) {
    this.planner = new SemanticDialoguePlanner(save);
    this.closeButton.addEventListener('click', () => this.close());
  }

  get isOpen(): boolean {
    return this.context !== null;
  }

  open(context: ChatContext): void {
    this.context = context;
    this.lastIntent = 'greeting';

    this.name.textContent =
      context.definition.emoji +
      ' ' +
      context.definition.name +
      ' • ' +
      context.definition.role;

    this.messages.replaceChildren();
    this.renderSavedConversation(context.definition.id);

    if (!this.messages.childElementCount) {
      this.addMessage('npc', this.localGreeting(context));
    }

    this.root.classList.remove('hidden');
    this.renderMenu('root');
    this.updateStatus('Escolha um assunto');
  }

  close(): void {
    this.context = null;
    this.choices.replaceChildren();
    this.root.classList.add('hidden');
  }

  private renderMenu(menu: MenuId): void {
    if (!this.context) return;

    const available = this.choicesFor(menu);
    this.choices.replaceChildren();

    for (const choice of available) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className =
        'npc-dialogue-choice ' +
        'choice-' +
        (choice.accent ?? 'normal');
      button.textContent = choice.label;
      button.addEventListener('click', () => this.choose(choice));
      this.choices.appendChild(button);
    }
  }

  private choose(choice: DialogueChoice): void {
    if (!this.context) return;

    if (choice.close) {
      this.addMessage(
        'player',
        choice.label,
      );
      this.addMessage(
        'npc',
        farewellFor(this.context.definition.id),
      );
      this.save.persist();
      window.setTimeout(() => this.close(), 480);
      return;
    }

    if (choice.menu && !choice.query) {
      this.renderMenu(choice.menu);
      this.updateStatus(menuLabel(choice.menu));
      return;
    }

    if (!choice.query) return;

    const context = this.context;
    const npcId = context.definition.id;

    this.addMessage('player', choice.label);
    this.save.appendConversationTurn(npcId, {
      role: 'player',
      text: choice.label,
      day: context.day,
      minute: context.minute,
    });

    const planned = this.planner.reply(
      context,
      choice.query,
    );

    this.lastIntent = planned.intent;
    this.addMessage('npc', planned.reply);
    this.save.appendConversationTurn(npcId, {
      role: 'npc',
      text: planned.reply,
      day: context.day,
      minute: context.minute,
    });

    this.updateConversationSummary(
      context,
      choice.label,
      planned.reply,
    );

    const memory = this.save.memoryFor(npcId);
    memory.talks += 1;
    memory.affinity = Math.min(
      100,
      memory.affinity +
        (choice.affinity ?? affinityGain(planned.intent)),
    );
    memory.lastDay = context.day;

    this.save.persist();
    this.renderMenu('follow-up');
    this.updateStatus(intentLabel(planned.intent));
  }

  private choicesFor(menu: MenuId): DialogueChoice[] {
    if (!this.context) return [];

    const context = this.context;
    const memory = this.save.memoryFor(context.definition.id);

    if (menu === 'root') {
      const choices: DialogueChoice[] = [
        {
          id: 'wellbeing',
          label: 'Como você está?',
          query: 'Como você está?',
          affinity: 1,
        },
        {
          id: 'activity',
          label: 'O que você está fazendo agora?',
          query: 'O que você está fazendo agora?',
          affinity: 1,
        },
        {
          id: 'personal',
          label: 'Quero saber mais sobre você.',
          menu: 'personal',
          accent: 'personal',
        },
        {
          id: 'world',
          label: 'Quero falar sobre Aster.',
          menu: 'world',
        },
        {
          id: 'people',
          label: 'Quero falar sobre as pessoas daqui.',
          menu: 'people',
        },
      ];

      if (memory.facts.length) {
        choices.push({
          id: 'memories',
          label: 'Tem alguma coisa que você sabe e acha importante?',
          menu: 'memories',
        });
      }

      choices.push({
        id: 'player-memory',
        label: 'O que você lembra sobre mim?',
        query: 'O que você lembra de mim?',
        affinity: 2,
      });

      if (memory.affinity >= 55) {
        choices.push({
          id: 'confession',
          label: 'Posso perguntar algo mais pessoal?',
          query: 'Me conta um segredo, algo que você não conta para todo mundo.',
          affinity: 3,
          accent: 'personal',
        });
      }

      choices.push({
        id: 'exit',
        label: 'Vou indo. Até mais.',
        close: true,
        accent: 'exit',
      });

      return choices;
    }

    if (menu === 'personal') {
      return [
        {
          id: 'background',
          label: 'Como foi sua história até chegar aqui?',
          query: 'Me conte sua história e seu passado.',
          affinity: 2,
        },
        {
          id: 'dreams',
          label: 'Qual é o seu maior sonho?',
          query: 'Quais são seus sonhos e o que você quer para o futuro?',
          affinity: 2,
        },
        {
          id: 'worries',
          label: 'O que mais te preocupa?',
          query: 'O que mais te preocupa? Do que você tem medo?',
          affinity: 2,
        },
        {
          id: 'values',
          label: 'O que é realmente importante para você?',
          query: 'O que é importante para você? O que você valoriza?',
          affinity: 2,
        },
        {
          id: 'leisure',
          label: 'O que você faz quando não está trabalhando?',
          query: 'O que você faz no tempo livre para relaxar?',
          affinity: 1,
        },
        {
          id: 'favorite-place',
          label: 'Qual é seu lugar favorito em Aster?',
          query: 'Qual é seu lugar favorito? Onde você gosta de ficar?',
          affinity: 1,
        },
        {
          id: 'profession',
          label: 'Me conte sobre seu trabalho.',
          query: 'O que você faz? Qual é sua profissão?',
          affinity: 1,
        },
        {
          id: 'finances',
          label: 'E suas finanças? Está conseguindo se manter?',
          query: 'Como estão suas finanças, seu dinheiro e suas contas?',
          affinity: 1,
        },
        {
          id: 'work-feeling',
          label: 'Você gosta do que faz?',
          query: 'Você gosta do seu trabalho? Como se sente sobre ele?',
          affinity: 1,
        },
        {
          id: 'family',
          label: 'E sua família?',
          query: 'Me fale sobre sua família, parceiro e filhos.',
          affinity: 2,
        },
        {
          id: 'back',
          label: '← Outros assuntos',
          menu: 'root',
          accent: 'back',
        },
      ];
    }

    if (menu === 'world') {
      return [
        {
          id: 'village',
          label: 'O que você acha da Vila de Aster?',
          query: 'O que você acha da Vila de Aster?',
          affinity: 1,
        },
        {
          id: 'river',
          label: 'O que você sabe sobre o rio e os tremores?',
          query: 'O que você sabe sobre o rio, a água, o tremor e o Eco?',
          affinity: 2,
        },
        {
          id: 'river-worry',
          label: 'Isso tudo te assusta?',
          query: 'O rio e os tremores te preocupam? Você tem medo disso?',
          affinity: 2,
        },
        {
          id: 'market',
          label: 'Como anda o mercado e a economia da vila?',
          query: 'Como está a economia da vila, o mercado, os preços e o estoque?',
          affinity: 1,
        },
        {
          id: 'construction',
          label: 'Tem alguma casa nova sendo construída?',
          query: 'Como está a construção, as casas novas e a expansão da vila?',
          affinity: 1,
        },
        {
          id: 'future-village',
          label: 'Como você gostaria de ver Aster no futuro?',
          query: 'Quais são seus sonhos para o futuro e para a vila?',
          affinity: 2,
        },
        {
          id: 'favorite-village-place',
          label: 'Onde você mais gosta de ficar por aqui?',
          query: 'Qual é seu lugar favorito em Aster?',
          affinity: 1,
        },
        {
          id: 'back',
          label: '← Outros assuntos',
          menu: 'root',
          accent: 'back',
        },
      ];
    }

    if (menu === 'people') {
      const people = context.definitions
        .filter((entry) => entry.id !== context.definition.id)
        .slice(0, 10)
        .map<DialogueChoice>((entry) => ({
          id: 'person-' + entry.id,
          label: 'O que você acha de ' + entry.name + '?',
          query: 'O que você acha de ' + entry.name + '?',
          affinity: 1,
        }));

      return [
        ...people,
        {
          id: 'family',
          label: 'Quero saber sobre sua família.',
          query: 'Me fale sobre sua família, parceiro e filhos.',
          affinity: 2,
        },
        {
          id: 'back',
          label: '← Outros assuntos',
          menu: 'root',
          accent: 'back',
        },
      ];
    }

    if (menu === 'memories') {
      const facts = memory.facts
        .slice()
        .sort(
          (a, b) =>
            b.importance - a.importance ||
            b.createdDay - a.createdDay,
        )
        .slice(0, 6)
        .map<DialogueChoice>((fact, index) => ({
          id: 'fact-' + index,
          label: 'Sobre isso: “' + compact(fact.text, 62) + '”',
          query: 'O que você sabe sobre isto: ' + fact.text,
          affinity: 1,
        }));

      return [
        ...facts,
        {
          id: 'back',
          label: '← Outros assuntos',
          menu: 'root',
          accent: 'back',
        },
      ];
    }

    return this.followUpChoices(this.lastIntent);
  }

  private followUpChoices(intent: string): DialogueChoice[] {
    const common: DialogueChoice[] = [
      {
        id: 'topics',
        label: 'Quero falar de outra coisa.',
        menu: 'root',
        accent: 'back',
      },
      {
        id: 'exit',
        label: 'Acho que já falei demais. Até mais.',
        close: true,
        accent: 'exit',
      },
    ];

    const byIntent: Record<string, DialogueChoice[]> = {
      profession: [
        {
          id: 'work-feeling',
          label: 'Você gosta desse trabalho?',
          query: 'Você gosta do seu trabalho?',
          affinity: 1,
        },
        {
          id: 'work-origin',
          label: 'Como começou nisso?',
          query: 'Me conte sua história e como chegou até esse trabalho.',
          affinity: 2,
        },
      ],
      'work-feeling': [
        {
          id: 'dream',
          label: 'E o que gostaria de fazer no futuro?',
          query: 'Qual é seu sonho para o futuro?',
          affinity: 2,
        },
      ],
      background: [
        {
          id: 'dream',
          label: 'E o que você quer para o futuro?',
          query: 'Qual é seu sonho para o futuro?',
          affinity: 2,
        },
        {
          id: 'values',
          label: 'O que essa história te ensinou?',
          query: 'O que é importante para você? Quais são seus valores?',
          affinity: 2,
        },
      ],
      dreams: [
        {
          id: 'worry',
          label: 'O que poderia atrapalhar esse sonho?',
          query: 'O que mais te preocupa? Do que você tem medo?',
          affinity: 2,
        },
      ],
      worries: [
        {
          id: 'support',
          label: 'Espero que você consiga lidar com isso.',
          query: 'No que você acredita? O que te ajuda quando está preocupado?',
          affinity: 3,
          accent: 'personal',
        },
      ],
      river: [
        {
          id: 'river-worry',
          label: 'Você acha que o rio está perigoso?',
          query: 'O rio te preocupa? Você tem medo do que está acontecendo?',
          affinity: 2,
        },
        {
          id: 'river-personal',
          label: 'Isso já afetou você pessoalmente?',
          query: 'O que você sabe sobre o rio e como isso afeta sua vida e trabalho?',
          affinity: 2,
        },
      ],
      family: [
        {
          id: 'family-values',
          label: 'Família é importante para você?',
          query: 'O que é importante para você? O que você valoriza na família?',
          affinity: 2,
        },
      ],
      'npc-opinion': [
        {
          id: 'people',
          label: 'Quero perguntar sobre outra pessoa.',
          menu: 'people',
        },
      ],
      'player-memory': [
        {
          id: 'personal',
          label: 'Quero conhecer você melhor também.',
          menu: 'personal',
          accent: 'personal',
        },
      ],
      confession: [
        {
          id: 'support',
          label: 'Pode confiar em mim.',
          query: 'O que é importante para você quando decide confiar em alguém?',
          affinity: 4,
          accent: 'personal',
        },
      ],
      'confession-locked': [
        {
          id: 'respect',
          label: 'Tudo bem. Não vou insistir.',
          query: 'O que você valoriza em alguém que respeita seus limites?',
          affinity: 3,
          accent: 'personal',
        },
      ],
    };

    return [...(byIntent[intent] ?? []), ...common];
  }

  private renderSavedConversation(npcId: string): void {
    const conversation = this.save.conversationFor(npcId);
    const cleanTurns = conversation.turns.filter(
      (turn) =>
        turn.role === 'player' ||
        isMeaningfulDialogueText(turn.text),
    );

    if (cleanTurns.length !== conversation.turns.length) {
      conversation.turns = cleanTurns;
      this.save.persist();
    }

    for (const turn of cleanTurns.slice(-6)) {
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
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  private localGreeting(context: ChatContext): string {
    const memory = this.save.memoryFor(context.definition.id);

    if (memory.talks > 1) {
      return context.definition.remembered;
    }

    return context.definition.intro;
  }

  private updateConversationSummary(
    context: ChatContext,
    playerChoice: string,
    npcReply: string,
  ): void {
    const conversation = this.save.conversationFor(context.definition.id);

    const exchange =
      'Jogador escolheu "' +
      compact(playerChoice, 100) +
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

  private updateStatus(topic: string): void {
    if (!this.context) return;

    const affinity =
      this.save.memoryFor(this.context.definition.id).affinity;

    this.status.textContent =
      topic +
      ' • afinidade ' +
      affinity +
      '/100 • escolhas contextuais';
  }
}

function affinityGain(intent: string): number {
  return {
    greeting: 1,
    identity: 1,
    profession: 1,
    'work-feeling': 1,
    background: 2,
    dreams: 2,
    worries: 2,
    leisure: 1,
    'favorite-place': 1,
    values: 2,
    confession: 3,
    'confession-locked': 1,
    finances: 1,
    market: 1,
    construction: 1,
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
    'work-feeling': 'relação com o trabalho',
    background: 'história pessoal',
    dreams: 'sonhos',
    worries: 'preocupações',
    leisure: 'tempo livre',
    'favorite-place': 'lugar favorito',
    values: 'valores',
    confession: 'confidência',
    'confession-locked': 'confiança',
    finances: 'finanças pessoais',
    market: 'mercado da vila',
    construction: 'expansão de Aster',
    activity: 'atividade atual',
    wellbeing: 'estado emocional',
    river: 'rio e Eco',
    family: 'família',
    'npc-opinion': 'relações sociais',
    'player-memory': 'memória do jogador',
    village: 'Vila de Aster',
    opinion: 'personalidade',
    'memory-fact': 'memória',
    'follow-up': 'continuidade',
    unknown: 'contexto',
  }[intent] ?? 'conversa';
}

function menuLabel(menu: MenuId): string {
  return {
    root: 'Assuntos',
    personal: 'Conhecendo melhor',
    world: 'Vila de Aster',
    people: 'Moradores',
    memories: 'Memórias',
    'follow-up': 'Continuar conversa',
  }[menu];
}

function farewellFor(npcId: string): string {
  const lines: Record<string, string[]> = {
    elena: [
      'Até mais. E presta atenção nas pequenas mudanças por aí.',
      'A gente se vê. Foi bom conversar.',
    ],
    bram: [
      'Até mais. Tenho trabalho esperando.',
      'Certo. Nos vemos por aí.',
    ],
    mira: [
      'Até mais. Se descobrir alguma novidade, meu balcão está logo ali.',
      'Volte quando quiser — conversar ainda é de graça.',
    ],
    theo: [
      'Até mais. Vou ver se os peixes resolveram colaborar.',
      'A gente se vê perto do rio.',
    ],
    luma: [
      'Até mais! A porta da taverna continua aberta.',
      'Vai com calma. Depois você me conta o resto.',
    ],
  };

  const available = lines[npcId] ?? [
    'Até mais. Foi bom conversar.',
  ];

  return available[Math.abs(stableHash(npcId + Date.now().toString())) % available.length]!;
}

function isMeaningfulDialogueText(value: string): boolean {
  return value.replace(/[.\s…!?—-]/g, '').length >= 2;
}

function compact(value: string, max: number): string {
  const compacted = value.replace(/\s+/g, ' ').trim();
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
