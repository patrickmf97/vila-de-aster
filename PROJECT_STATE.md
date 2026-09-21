# Vila de Aster — Estado do Projeto

## Versão atual

**v0.6.3 — Dynamic Dialogue**

## Decisão arquitetural

Os modelos generativos foram removidos.

A conversa dos NPCs agora é produzida por um motor semântico próprio do jogo.

## Componentes

### SemanticDialoguePlanner

Identifica intenções como:

- saudação;
- identidade;
- profissão;
- atividade atual;
- estado emocional;
- rio / Eco Sob o Rio;
- família;
- opinião sobre outro NPC;
- memória sobre o jogador;
- vila;
- opinião pessoal;
- recuperação de memória;
- continuidade da conversa;
- assunto desconhecido.

### Dialogue Bank

Contém blocos modulares separados por:

- tom;
- personalidade;
- profissão;
- relação;
- contexto;
- assunto.

As respostas são compostas de forma determinística a partir do estado do NPC.

### DynamicDialogueSystem

Mantém a interface de conversa livre, histórico, afinidade e extração de fatos explícitos do jogador.

## Resultado

```text
Life Simulation → o que existe na vida
NPC Brain       → o que o NPC decide fazer
Dynamic Dialogue→ como o NPC conversa
```

Nenhum modelo, API ou servidor de IA participa do diálogo.

## Próximo alvo

**v0.7.0 — Economy & Settlement**.
