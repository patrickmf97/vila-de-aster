# Vila de Aster — Estado do Projeto

## Versão atual

**v0.6.0 — Generative NPC**

## Mudança central

NPCs agora possuem duas formas de conversa:

1. diálogo local, rápido e determinístico;
2. conversa livre generativa.

A IA generativa foi colocada **por cima** do NPC Brain, e não no lugar dele.

## Contexto enviado ao modelo

A função recebe somente:

- identidade e profissão do NPC;
- personalidade;
- atividade/decisão atual;
- dia, horário e localização;
- estado familiar;
- até 12 fatos conhecidos pelo NPC;
- resumo persistente da conversa;
- últimas 8 falas;
- mensagem atual do jogador.

O modelo não recebe o save completo.

## Memória de conversa

Cada NPC mantém:

- até 8 turnos recentes;
- resumo persistente de longo prazo;
- fatos novos explicitamente ditos pelo jogador.

A resposta generativa devolve:

- fala do NPC;
- possível fato de memória;
- resumo atualizado.

## Segurança de arquitetura

- `OPENAI_API_KEY` fica somente no backend;
- função Vercel valida payload e limites;
- rate limit básico por origem/IP;
- mensagens do jogador têm limite;
- respostas usam schema estruturado;
- chamadas usam `store: false`;
- IA não pode alterar estado canônico;
- sem API, o jogo usa fallback local.

## Responsabilidades

```text
Life Simulation → o que existe na vida
NPC Brain       → o que o NPC decide fazer
Generative NPC  → como o NPC conversa sobre o que sabe
```

## Próximo alvo

**v0.7.0 — Economy & Settlement**

- dinheiro por NPC;
- renda;
- despesas;
- estoque e recursos;
- trabalho afetando produção;
- consumo;
- necessidade de moradia;
- construção de casas;
- expansão orgânica da vila.
