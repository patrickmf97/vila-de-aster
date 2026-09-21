# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória e NPCs inteligentes**.

## Estado atual — v0.2.0 Foundation

A experiência do MVP foi migrada para uma base modular usando:

- Phaser 3.90
- TypeScript
- Vite
- localStorage para persistência do protótipo

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite.

Build de produção:

```bash
npm run build
npm run preview
```

## Controles

- WASD / setas: mover
- E / Enter: conversar
- R: apagar a memória local e reiniciar

## Arquitetura

```text
src/
├── data/
│   ├── npcs.ts
│   └── world.ts
├── entities/
│   ├── Npc.ts
│   └── Player.ts
├── scenes/
│   └── VillageScene.ts
├── systems/
│   ├── DialogueSystem.ts
│   ├── EventSystem.ts
│   ├── SaveSystem.ts
│   └── TimeSystem.ts
├── ui/
│   └── Hud.ts
├── world/
│   └── WorldRenderer.ts
├── main.ts
├── styles.css
└── types.ts
```

## Sistemas preservados do MVP

- vila explorável;
- visual chibi original gerado por formas;
- câmera seguindo o jogador;
- colisões;
- 5 NPCs com rotinas por horário;
- diálogo contextual;
- memória persistente;
- afinidade simples;
- ciclo dia/noite;
- evento narrativo **O Eco Sob o Rio**.

## Próximo marco

A v0.3 será focada em transformar a fundação técnica em uma **vertical slice de jogo**: animações melhores, interiores, objetos interativos, rotina avançada e memória v2.
