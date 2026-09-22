# Vila de Aster — Estado do Projeto

## Versão atual

**v0.8.3 — Full Art Integration**

## Meta

Alinhar o jogo em todos os pontos ao concept art oficial sem regredir em performance.

## Camadas visuais

```text
VillageScene
├── villageEnvironment.svg
│   ├── terreno
│   ├── caminhos
│   ├── prédios
│   ├── praça
│   ├── rio
│   ├── vegetação
│   └── props
├── WorldRenderer
│   ├── textura estática
│   ├── settlement
│   ├── água
│   └── luzes
├── AtmosphereRenderer
├── NPC / Player
└── UI DOM
    ├── marca
    ├── calendário
    ├── hotbar
    ├── diálogo
    ├── chat
    └── compêndio
```

## Retratos

SVGs individuais ficam em:

`src/assets/portraits/`

Mapeamento:

`src/data/portraits.ts`

## UI

O concept foi traduzido para componentes leves:

- brand card;
- parchment card;
- player medallion;
- status bars;
- date chip;
- hotbar;
- quick menu;
- codex;
- dialogue portrait;
- NPC chat portrait.

## Performance preservada

- render/movimento: até 60 fps;
- simulação: 10 Hz;
- atmosfera: 15 Hz;
- água: 12 Hz;
- HUD: 4 Hz;
- roster: 1 Hz.

## Próximo passo

v0.9 — Generations & RPG Systems.
