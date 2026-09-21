# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações e NPCs que continuam vivendo sem depender do jogador**.

## Estado atual — v0.4.0 Life Simulation

A vila agora possui uma simulação persistente de vida:

- cada NPC possui residência real;
- moradores entram em casa à noite e desaparecem do mapa externo;
- ao entrar na residência, o jogador encontra os moradores dentro;
- NPCs dormem, acordam e reaparecem na porta da residência atual;
- casamento pode fazer o casal compartilhar residência;
- relacionamentos podem evoluir de solteiro → namoro → casamento;
- casais podem formar família;
- crianças são geradas como novos moradores persistentes;
- filhos possuem pais, casa, rotina infantil, visual menor e entram na população;
- eventos familiares ficam registrados no histórico da vila;
- população aparece no HUD e cresce dinamicamente;
- memória v2 e relações NPC ↔ NPC continuam funcionando.

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
- R: apagar memória, famílias e reiniciar a simulação

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
│   ├── LifeSimulationSystem.ts
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

**v0.5.0 — NPC Brain**: necessidades, personalidade, valores, objetivos, Utility AI e decisões capazes de substituir parte da agenda fixa.
