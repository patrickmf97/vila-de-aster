# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família e NPCs capazes de decidir o que fazer**.

## Estado atual — v0.5.0 NPC Brain

A agenda dos NPCs agora é um plano padrão, não uma ordem absoluta.

Cada morador possui:

- necessidades dinâmicas;
- personalidade própria;
- Utility AI;
- decisões explicáveis;
- memória persistente;
- residência e família;
- capacidade de desviar da rotina quando outra ação é mais importante.

Ações avaliadas atualmente:

- seguir agenda;
- dormir;
- comer;
- descansar;
- socializar;
- passar tempo com a família;
- trabalhar;
- pescar;
- investigar o rio.

Pressione **B** durante o jogo para abrir o painel de diagnóstico e observar decisões recentes com score e motivo dominante.

## Como rodar

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Controles

- WASD / setas: mover
- E / Enter: interagir
- B: abrir/fechar painel NPC Brain
- R: reiniciar memória e simulação

## Sistemas principais

```text
src/systems/
├── DialogueSystem.ts
├── EventSystem.ts
├── LifeSimulationSystem.ts
├── NpcBrainSystem.ts
├── RelationshipSystem.ts
├── SaveSystem.ts
└── TimeSystem.ts
```

Documentação técnica:

- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`

## Próximo marco

**v0.6.0 — Generative NPC**: backend, diálogo generativo controlado por lore, memória resumida e integração da IA com o cérebro local sem entregar o controle de cada frame ao modelo.
