# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, decisões autônomas e diálogo contextual por escolhas**.

## Estado atual — v0.6.4 Choice Dialogue

A conversa dos NPCs agora usa uma árvore de escolhas de RPG.

O jogador abre a conversa com **F** e escolhe assuntos em vez de digitar texto livremente.

### Assuntos disponíveis

- estado atual;
- atividade;
- passado;
- sonhos;
- preocupações;
- valores;
- lazer;
- lugar favorito;
- profissão;
- relação com o trabalho;
- família;
- Vila de Aster;
- rio / Eco Sob o Rio;
- opinião sobre outros moradores;
- memórias específicas;
- o que o NPC lembra do jogador;
- confidências desbloqueadas por afinidade.

As opções mudam conforme:

- NPC;
- personalidade;
- profissão;
- memória;
- relações;
- parceiro e filhos;
- evento do rio;
- afinidade;
- fatos conhecidos;
- histórico da conversa.

## Afinidade e desbloqueios

Conversas pessoais aumentam mais afinidade do que perguntas superficiais.

Ao atingir afinidade suficiente, surgem opções que não aparecem para estranhos, como confidências pessoais.

## Perfis pessoais

Elena, Bram, Mira, Theo e Luma possuem dados próprios de:

- história;
- sonhos;
- medos e preocupações;
- lazer;
- lugares favoritos;
- valores;
- sentimentos sobre o trabalho;
- confidências.

NPCs gerados usam um perfil-base compatível com crianças e futuras gerações.

## Controles

- WASD / setas: mover
- E / Enter: diálogo rápido
- F: diálogo completo por escolhas
- B: painel NPC Brain
- R: reiniciar memória e simulação

## Arquitetura

```text
abrir conversa
      ↓
menu de assuntos
      ↓
opção escolhida
      ↓
SemanticDialoguePlanner
      ↓
memória + personalidade + relações + estado
      ↓
banco modular
      ↓
resposta
      ↓
follow-ups contextuais
```

Documentação:
- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`
- `docs/DYNAMIC_DIALOGUE.md`
- `docs/CHOICE_DIALOGUE.md`

## Próximo marco

**v0.7.0 — Economy & Settlement**.
