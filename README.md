# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, decisões autônomas e diálogo generativo local**.

## Estado atual — v0.6.2 Local NPC AI

A conversa livre não depende de OpenAI, API paga ou chave externa.

### Estratégia automática

1. Se houver WebGPU, o jogo tenta **WebLLM + Llama 3.2 1B**.
2. Se a GPU falhar, tenta **SmolLM2 360M**.
3. Se WebGPU não existir, usa **Transformers.js + SmolLM2 135M Instruct em CPU/WASM**.
4. Se nenhum modelo puder rodar, usa o fallback determinístico.

No Firefox/Linux sem WebGPU, a rota CPU/WASM é escolhida automaticamente.

O primeiro uso baixa o modelo necessário e o navegador reutiliza o cache depois.

## Controles

- WASD / setas: mover
- E / Enter: diálogo local
- F: conversa livre com IA local
- B: painel NPC Brain
- R: reiniciar memória e simulação

## Arquitetura

```text
F
↓
GenerativeDialogueSystem
├─ WebGPU disponível → WebLLM → Llama 3.2 1B / SmolLM2 360M
└─ sem WebGPU       → Transformers.js → WASM/CPU → SmolLM2 135M
↓
Memory v2
```

Nenhuma chave, servidor de IA ou cobrança por token é necessária.

Documentação:
- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`
- `docs/GENERATIVE_NPC.md`

## Próximo marco

**v0.7.0 — Economy & Settlement**.
