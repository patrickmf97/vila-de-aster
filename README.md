# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, decisões autônomas e diálogo generativo local**.

## Estado atual — v0.6.1 Local NPC AI

A conversa livre dos NPCs não depende mais de OpenAI, API paga ou chave externa.

### O que existe nesta versão

- tecla **E** mantém o diálogo rápido/determinístico;
- tecla **F** abre conversa livre com IA local;
- WebLLM roda o modelo diretamente no navegador via WebGPU;
- modelo principal: **Llama 3.2 1B Instruct** quantizado;
- fallback de modelo: **SmolLM2 360M Instruct**;
- o primeiro uso baixa o modelo; depois o navegador usa o cache;
- nenhum token é cobrado por conversa;
- nenhuma chave de API é necessária;
- contexto limitado à personalidade, estado, relações e fatos conhecidos pelo NPC;
- histórico curto por NPC;
- resumo persistente local;
- fatos explícitos do jogador podem entrar na memória do NPC;
- se WebGPU/modelo local não estiver disponível, o jogo usa fallback determinístico;
- Utility AI continua controlando comportamento e estado canônico.

## Como rodar

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Não existem variáveis de ambiente de IA e não é necessário configurar API.

## Controles

- WASD / setas: mover
- E / Enter: diálogo local
- F: conversa livre com IA local
- B: painel NPC Brain
- R: reiniciar memória e simulação

## Arquitetura

```text
Phaser / navegador
      ↓
GenerativeDialogueSystem
      ↓
dynamic import @mlc-ai/web-llm
      ↓
WebGPU
      ↓
Llama 3.2 1B
   ou SmolLM2 360M
```

A IA roda no dispositivo do jogador. O modelo não altera diretamente quests, inventário, casamento, filhos, dinheiro ou decisões da Utility AI.

Documentação técnica:

- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`
- `docs/GENERATIVE_NPC.md`

## Próximo marco

**v0.7.0 — Economy & Settlement**: dinheiro por NPC, produção/consumo, recursos, custo de vida, construção de novas casas e expansão física da vila.
