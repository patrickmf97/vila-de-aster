# Production Asset Pipeline — v0.8.6

## Fontes aprovadas

A produção visual deriva dos quatro sheets aprovados nesta fase:

- tileset de ambiente;
- catálogo de props;
- construções principais;
- sprites de personagens.

## Estratégia

Os sheets não são exibidos diretamente no jogo.

O pipeline é:

```text
sheet aprovado
  ↓
crop por elemento
  ↓
remoção de fundo de catálogo
  ↓
redimensionamento
  ↓
WebP otimizado
  ↓
módulo TypeScript/data URI
  ↓
Phaser Loader
```

## Benefícios

- fidelidade ao concept;
- arquivos pequenos;
- sem servidor externo;
- compatível com GitHub Pages;
- carregamento único;
- fallback seguro;
- fácil substituir um asset isolado.

## Spritesheets

Dimensão final por personagem:

```text
672 × 93
8 frames
84 × 93 por frame
```

## Terrain

O WorldRenderer agora compõe o mapa com tiles reais:

- `env-grass`;
- `env-stone`;
- `env-water`.

## Props

- `prop-fountain`;
- `prop-bridge`;
- `prop-fence`;
- `prop-lamp`;
- `prop-treeGreen`;
- `prop-treePink`;
- `prop-treeGold`;
- `prop-bush`;
- `prop-market`.

## Construções

Os landmarks usam WebP recortado do sheet oficial e continuam obedecendo às colisões e portas de `world.ts`.
