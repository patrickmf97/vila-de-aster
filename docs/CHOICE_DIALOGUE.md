# Choice Dialogue — v0.6.4

O Choice Dialogue transforma o motor semântico da Vila de Aster em uma árvore de conversa de RPG.

## Objetivo

Dar controle narrativo ao jogador sem depender de texto livre ou modelo generativo.

## Menus

### Assuntos principais

- estado emocional;
- atividade;
- vida pessoal;
- Aster;
- moradores;
- memórias;
- memória sobre o jogador;
- confidências;
- despedida.

### Vida pessoal

- passado;
- sonhos;
- preocupações;
- valores;
- lazer;
- lugar favorito;
- trabalho;
- relação com trabalho;
- família.

### Pessoas

O menu é criado dinamicamente a partir dos moradores atualmente existentes.

Isso significa que filhos e novos NPCs também podem aparecer como assunto no futuro.

### Memórias

Os fatos mais importantes que o NPC conhece viram opções de conversa.

O jogador não consegue perguntar ao NPC por um fato que não existe na memória dele através desse menu.

## Afinidade

Cada opção possui um ganho aproximado:

```text
assunto casual       +1
assunto pessoal      +2
família              +2 / +3
apoio emocional      +3
confidência          +3
respeitar limite     +3
apoio após segredo   +4
```

A afinidade máxima é 100.

## Confidências

A opção de confidência só aparece com:

```text
afinidade >= 55
```

Cada NPC possui confidências próprias.

## Follow-ups

Depois da fala do NPC, o sistema usa o intent da resposta para montar opções de continuidade.

Exemplos:

```text
trabalho
├── Você gosta desse trabalho?
└── Como começou nisso?

passado
├── E o futuro?
└── O que essa história te ensinou?

rio
├── Você acha perigoso?
└── Isso já afetou você pessoalmente?

confidência
└── Pode confiar em mim.
```

## Arquivos principais

```text
src/data/dialogueBank.ts
src/data/npcDialogueProfiles.ts
src/systems/SemanticDialoguePlanner.ts
src/systems/DynamicDialogueSystem.ts
```

O nome `DynamicDialogueSystem` foi mantido porque ele continua sendo o orquestrador do diálogo, embora a UI agora seja baseada em escolhas.
