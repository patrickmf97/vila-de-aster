# Phase B — Buildings Match

## Objetivo

Substituir a leitura visual genérica das cinco construções principais por assets independentes coerentes com o concept art.

## Arquivos

```text
src/assets/buildings/
  tavern.svg
  smith.svg
  shop.svg
  elena.svg
  theo.svg

src/data/buildingAssets.ts
```

## Pipeline

```text
concept sheet
    ↓
asset game-ready por prédio
    ↓
SVG leve
    ↓
Phaser Loader
    ↓
WorldRenderer
    ↓
Y-depth + night glow
```

## Regras de performance

- cada prédio é uma única textura;
- nenhum prédio é redesenhado por frame;
- glow usa o update throttled do WorldRenderer;
- colisões continuam vindo de `world.ts`;
- portas continuam independentes do sprite visual.

## Profundidade

A profundidade usa a base física da construção:

```text
depth = building.y + building.h - 2
```

Assim NPC/player acima da fachada fica atrás do prédio e, ao descer, passa para a frente.

## Próximo passo

Validar escala/alinhamento no GitHub Pages e então seguir para:
- variantes de settlement;
- props externos;
- integração do restante do asset pack.
