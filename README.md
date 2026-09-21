# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória e NPCs inteligentes**.

## Estado atual — v0.3.0 Living Village

A vila agora possui uma camada de simulação mais rica sobre a fundação Phaser + TypeScript + Vite:

- animação procedural direcional do personagem;
- NPCs com atividade visível e microcomportamentos;
- quatro interiores exploráveis;
- portas e objetos interativos;
- pistas narrativas espalhadas no cenário;
- memória v2 baseada em fatos;
- relações NPC ↔ NPC;
- propagação de conhecimento entre moradores próximos;
- ciclo dia/noite, afinidade e evento **O Eco Sob o Rio** preservados.

## Como rodar

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Controles

- WASD / setas: mover
- E / Enter: interagir, conversar, entrar, sair ou examinar
- R: apagar a memória local e reiniciar

## Arquitetura

```text
src/
├── data/
│   ├── interiors.ts
│   ├── npcs.ts
│   └── world.ts
├── entities/
│   ├── Npc.ts
│   └── Player.ts
├── scenes/
│   ├── InteriorScene.ts
│   └── VillageScene.ts
├── systems/
│   ├── DialogueSystem.ts
│   ├── EventSystem.ts
│   ├── RelationshipSystem.ts
│   ├── SaveSystem.ts
│   └── TimeSystem.ts
├── ui/
│   └── Hud.ts
├── world/
│   ├── InteriorRenderer.ts
│   └── WorldRenderer.ts
├── main.ts
├── styles.css
└── types.ts
```

## Próximo marco

**v0.4.0 — NPC Brain**: necessidades, personalidade, valores, objetivos, Utility AI e decisões explicáveis.
