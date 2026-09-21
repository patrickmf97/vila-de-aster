import type {
  NpcBrainState,
  NpcDefinition,
  NpcLifeState,
} from '../types';
import type { SaveSystem } from './SaveSystem';
import {
  dialogueBank,
  fillDialogue,
  pickDialogue,
  type DialogueTone,
} from '../data/dialogueBank';

export interface SemanticDialogueContext {
  definition: NpcDefinition;
  life?: NpcLifeState;
  brain?: NpcBrainState;
  definitions: NpcDefinition[];
  day: number;
  minute: number;
  time: string;
  location: string;
}

export interface SemanticReply {
  reply: string;
  confidence: number;
  intent: string;
}

export class SemanticDialoguePlanner {
  constructor(private readonly save: SaveSystem) {}

  reply(
    context: SemanticDialogueContext,
    message: string,
  ): SemanticReply {
    const normalized = normalize(message);
    const definition = context.definition;
    const memory = this.save.memoryFor(definition.id);
    const life = context.life;
    const brain = context.brain;
    const tone = toneFor(definition);
    const seed = stableHash(
      definition.id +
        ':' +
        context.day +
        ':' +
        Math.floor(context.minute / 30) +
        ':' +
        normalized,
    );

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

    if (
      matches(normalized, [
        'oi',
        'ola',
        'bom dia',
        'boa tarde',
        'boa noite',
        'e ai',
      ])
    ) {
      return result(
        'greeting',
        0.99,
        pickDialogue(dialogueBank.greeting[tone], seed),
      );
    }

    if (
      matches(normalized, [
        'quem e voce',
        'seu nome',
        'como se chama',
        'quem voce e',
      ])
    ) {
      return result(
        'identity',
        0.99,
        'Eu sou ' +
          definition.name +
          ', ' +
          roleWithArticle(definition.role) +
          ' aqui na Vila de Aster.',
      );
    }

    if (
      matches(normalized, [
        'o que voce faz',
        'trabalha com',
        'profissao',
        'seu trabalho',
      ])
    ) {
      const lines =
        dialogueBank.profession[
          definition.role as keyof typeof dialogueBank.profession
        ];

      return result(
        'profession',
        0.98,
        lines
          ? pickDialogue(lines, seed)
          : 'Meu trabalho por aqui é ser ' +
              definition.role.toLowerCase() +
              '.',
      );
    }

    if (
      matches(normalized, [
        'o que esta fazendo',
        'fazendo agora',
        'onde vai',
        'aonde vai',
        'vai fazer o que',
      ])
    ) {
      return result(
        'activity',
        0.99,
        'Agora eu ' +
          activityPhrase(
            brain?.label ??
              life?.currentActivity ??
              'estou por aqui',
          ) +
          '.',
      );
    }

    if (
      matches(normalized, [
        'como voce esta',
        'tudo bem',
        'como esta',
        'como se sente',
      ])
    ) {
      const energy = life?.energy ?? 70;
      const band =
        energy < 35
          ? 'low'
          : energy < 65
            ? 'medium'
            : 'high';

      const base = pickDialogue(
        dialogueBank.wellbeing[band],
        seed,
      );
      const flavor = pickDialogue(
        dialogueBank.personality[tone],
        seed + 3,
      );

      return result(
        'wellbeing',
        0.98,
        base + ' ' + flavor,
      );
    }

    if (
      matches(normalized, [
        'rio',
        'agua',
        'tremor',
        'eco',
        'pedra',
        'peixe',
      ])
    ) {
      const knowsRiver = memory.facts.some(
        (fact) =>
          fact.id === 'river-echo' ||
          normalize(fact.text).includes('rio') ||
          normalize(fact.text).includes('tremor'),
      );

      const base = pickDialogue(
        knowsRiver
          ? dialogueBank.riverKnown
          : dialogueBank.riverUnknown,
        seed,
      );

      const personal =
        knowsRiver && definition.topic
          ? ' ' + definition.topic
          : '';

      return result(
        'river',
        0.99,
        compactSentence(base + personal),
      );
    }

    if (
      matches(normalized, [
        'familia',
        'filho',
        'filha',
        'filhos',
        'casado',
        'casada',
        'casamento',
        'parceiro',
        'parceira',
      ])
    ) {
      if (childrenNames.length) {
        const base = pickDialogue(
          dialogueBank.familyChildren,
          seed,
        );
        return result(
          'family',
          0.99,
          base +
            ' ' +
            'Aqui em casa, ' +
            naturalNames(childrenNames) +
            (childrenNames.length > 1
              ? ' fazem'
              : ' faz') +
            ' parte dessa história.',
        );
      }

      if (partnerName) {
        const base = pickDialogue(
          dialogueBank.familyPartner,
          seed,
        );
        return result(
          'family',
          0.99,
          base + ' ' + partnerName + ' faz parte disso.',
        );
      }

      return result(
        'family',
        0.97,
        pickDialogue(dialogueBank.familySingle, seed),
      );
    }

    const namedNpc = findMentionedNpc(
      normalized,
      context.definitions,
      definition.id,
    );

    if (namedNpc) {
      const relation = this.save.relationshipFor(
        definition.id,
        namedNpc.id,
      );

      const bank =
        relation.score >= 45
          ? dialogueBank.relationshipPositive
          : relation.score > 0
            ? dialogueBank.relationshipNeutral
            : dialogueBank.relationshipUnknown;

      const base = fillDialogue(
        pickDialogue(bank, seed),
        { name: namedNpc.name },
      );

      const sharedMemory = memory.facts.find(
        (fact) => fact.source === namedNpc.id,
      );

      return result(
        'npc-opinion',
        0.97,
        sharedMemory
          ? base +
              ' E eu lembro de algo que ' +
              namedNpc.name +
              ' me contou: ' +
              lowercaseFirst(sharedMemory.text)
          : base,
      );
    }

    if (
      matches(normalized, [
        'lembra de mim',
        'o que sabe sobre mim',
        'o que voce sabe de mim',
        'voce me conhece',
      ])
    ) {
      const playerFacts = memory.facts.filter(
        (fact) => fact.source === 'player',
      );

      if (!playerFacts.length) {
        return result(
          'player-memory',
          0.99,
          'Ainda não sei muita coisa sobre você. Se quiser, pode me contar algo que eu deva lembrar.',
        );
      }

      const intro = pickDialogue(
        dialogueBank.memoryIntro,
        seed,
      );

      return result(
        'player-memory',
        0.99,
        intro +
          ' ' +
          playerFacts
            .slice(0, 3)
            .map((fact) => stripPlayerPrefix(fact.text))
            .join('; ') +
          '.',
      );
    }

    if (
      matches(normalized, [
        'vila',
        'aster',
        'onde estamos',
        'esse lugar',
        'esta vila',
      ])
    ) {
      return result(
        'village',
        0.96,
        pickDialogue(dialogueBank.village, seed),
      );
    }

    if (
      matches(normalized, [
        'o que acha',
        'sua opiniao',
        'voce acha',
        'o que pensa',
      ])
    ) {
      const flavor = pickDialogue(
        dialogueBank.personality[tone],
        seed,
      );
      const followUp = pickDialogue(
        dialogueBank.followUps,
        seed + 7,
      );

      return result(
        'opinion',
        0.82,
        flavor + ' ' + followUp,
      );
    }

    const matchingFact = bestMatchingFact(
      normalized,
      memory.facts.map((fact) => fact.text),
    );

    if (matchingFact) {
      return result(
        'memory-fact',
        0.9,
        pickDialogue(
          dialogueBank.acknowledgements,
          seed,
        ) +
          ' O que eu sei é isto: ' +
          matchingFact,
      );
    }

    const recent = this.save
      .conversationFor(definition.id)
      .turns.filter((turn) => turn.role === 'npc')
      .slice(-1)[0];

    if (recent && normalized.length < 26) {
      const ack = pickDialogue(
        dialogueBank.acknowledgements,
        seed,
      );
      const follow = pickDialogue(
        dialogueBank.followUps,
        seed + 4,
      );

      return result(
        'follow-up',
        0.78,
        ack + ' ' + follow,
      );
    }

    const unknown = pickDialogue(
      dialogueBank.unknown,
      seed,
    );
    const contextual = pickDialogue(
      dialogueBank.personality[tone],
      seed + 11,
    );

    return result(
      'unknown',
      0.62,
      unknown + ' ' + contextual,
    );
  }
}

function result(
  intent: string,
  confidence: number,
  reply: string,
): SemanticReply {
  return {
    intent,
    confidence,
    reply: compactSentence(reply),
  };
}

function toneFor(
  definition: NpcDefinition,
): DialogueTone {
  const p = definition.brain?.personality;
  if (!p) return 'neutral';

  const ranked: Array<[DialogueTone, number]> = [
    ['social', p.sociability],
    ['curious', p.curiosity],
    ['disciplined', p.discipline],
    ['warm', p.empathy],
  ];

  ranked.sort((a, b) => b[1] - a[1]);

  const best = ranked[0];
  if (!best || best[1] < 70) return 'neutral';

  if (
    p.sociability < 55 &&
    p.empathy < 65
  ) {
    return 'reserved';
  }

  return best[0];
}

function activityPhrase(value: string): string {
  return value
    .replace(/^decidius+/i, '')
    .replace(/^estous+/i, '')
    .replace(/^eus+/i, '')
    .trim();
}

function roleWithArticle(role: string): string {
  const feminine = new Set([
    'Jardineira',
    'Comerciante',
    'Taverneira',
    'Criança',
  ]);

  return feminine.has(role)
    ? 'uma ' + role.toLowerCase()
    : 'um ' + role.toLowerCase();
}

function findMentionedNpc(
  normalized: string,
  definitions: NpcDefinition[],
  currentId: string,
): NpcDefinition | undefined {
  return definitions.find(
    (entry) =>
      entry.id !== currentId &&
      normalized.includes(normalize(entry.name)),
  );
}

function bestMatchingFact(
  normalizedMessage: string,
  facts: string[],
): string | null {
  const words = significantWords(normalizedMessage);
  let best: { fact: string; score: number } | null = null;

  for (const fact of facts) {
    const factWords = significantWords(normalize(fact));
    const overlap = words.filter((word) =>
      factWords.includes(word),
    ).length;

    if (
      overlap >= 2 &&
      (!best || overlap > best.score)
    ) {
      best = { fact, score: overlap };
    }
  }

  return best?.fact ?? null;
}

function significantWords(value: string): string[] {
  const stop = new Set([
    'que',
    'com',
    'para',
    'uma',
    'uns',
    'das',
    'dos',
    'isso',
    'essa',
    'esse',
    'voce',
    'sobre',
    'como',
    'porque',
    'por',
    'mais',
    'muito',
    'aqui',
    'esta',
    'tem',
  ]);

  return normalize(value)
    .split(/s+/)
    .filter(
      (word) =>
        word.length >= 3 && !stop.has(word),
    );
}

function stripPlayerPrefix(value: string): string {
  return value
    .replace(/^O jogador disse ques*/i, '')
    .replace(/.$/, '');
}

function naturalNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return (
    names.slice(0, -1).join(', ') +
    ' e ' +
    names[names.length - 1]
  );
}

function matches(
  value: string,
  patterns: string[],
): boolean {
  return patterns.some((pattern) =>
    value.includes(normalize(pattern)),
  );
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^p{L}p{N}s]/gu, ' ')
    .replace(/s+/g, ' ')
    .trim();
}

function lowercaseFirst(value: string): string {
  if (!value) return value;
  return value[0].toLocaleLowerCase('pt-BR') + value.slice(1);
}

function compactSentence(value: string): string {
  return value
    .replace(/s+/g, ' ')
    .replace(/.s*./g, '.')
    .trim();
}

function stableHash(value: string): number {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}
