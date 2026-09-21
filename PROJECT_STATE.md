# Vila de Aster — Estado do Projeto

## Versão atual

**v0.5.0 — NPC Brain**

## O que mudou

A Vila de Aster deixou de depender apenas de agendas fixas.

Cada NPC possui agora:

- personalidade;
- energia;
- fome;
- necessidade social;
- segurança;
- propósito;
- curiosidade;
- ação atual;
- destino atual;
- motivos da decisão;
- ranking persistente de decisões recentes.

## Personalidades iniciais

- Elena: curiosa, empática e orientada à família.
- Bram: altamente disciplinado e corajoso, porém menos sociável.
- Mira: sociável, disciplinada e curiosa.
- Theo: equilibrado, curioso e ligado à família.
- Luma: extremamente sociável e empática.

## Arquitetura

A agenda permanece como fallback.

Fluxo:

```text
Life Simulation
      ↓
necessidades
      ↓
Utility AI
      ↓
decisão + motivos
      ↓
intenção
      ↓
corpo do NPC
```

A IA generativa ainda não participa desse processo.

## Debug

Pressionar **B** exibe as decisões recentes no jogo.

Cada registro contém:

- NPC;
- ação escolhida;
- score;
- principal motivo.

O save mantém também os candidatos avaliados para análise posterior.

## Próximo alvo

**v0.6.0 — Generative NPC**

- backend de IA;
- prompt de personalidade/lore por NPC;
- diálogo livre com limites de conhecimento;
- memória curta e longa;
- resumo automático de conversas;
- fallback sem IA;
- integração com decisões de alto nível sem substituir a Utility AI local.
