# Dynamic Dialogue — v0.6.3

O Dynamic Dialogue é o motor de conversa da Vila de Aster.

Ele foi criado para produzir a sensação de NPCs inteligentes sem depender de LLM, API ou inferência local pesada.

## Fluxo

```text
mensagem do jogador
        ↓
normalização
        ↓
detecção de intenção
        ↓
consulta ao estado do NPC
        ↓
consulta à memória
        ↓
seleção de tom
        ↓
seleção de blocos
        ↓
composição da resposta
        ↓
atualização de memória/afinidade
```

## Fontes de contexto

Cada resposta pode depender de:

- NPC atual;
- profissão;
- personalidade;
- energia;
- decisão atual do NPC Brain;
- parceiro;
- filhos;
- afinidade;
- relação com outros NPCs;
- fatos conhecidos;
- fatos ditos pelo jogador;
- horário;
- evento do rio;
- conversa anterior.

## Intenções iniciais

- greeting
- identity
- profession
- activity
- wellbeing
- river
- family
- npc-opinion
- player-memory
- village
- opinion
- memory-fact
- follow-up
- unknown

A lista pode crescer sem alterar a arquitetura.

## Banco modular

Arquivo:

```text
src/data/dialogueBank.ts
```

Os textos são divididos em pequenos blocos reutilizáveis.

Por exemplo:

```text
[saudação social]
+
[estado atual]
+
[memória relevante]
+
[pergunta de continuidade]
```

O objetivo não é escrever dez mil respostas manualmente, e sim ter centenas de blocos que produzam milhares de combinações coerentes.

## Memória do jogador

O sistema reconhece deterministicamente frases como:

- meu nome é...
- eu vim de...
- eu moro em...
- eu gosto de...
- eu não gosto de...
- eu trabalho como...

Essas informações entram na Memory v2 daquele NPC.

## Coerência

Um NPC não recebe automaticamente conhecimento global.

Se Theo souber algo sobre o rio e Bram ainda não souber, as respostas podem ser diferentes.

A propagação continua acontecendo pelo RelationshipSystem e pela memória.

## Performance

Não há:

- download de modelo;
- inicialização de WebGPU;
- inferência WASM;
- chamadas HTTP;
- custo por token.

A resposta acontece no mesmo processo JavaScript do jogo.
