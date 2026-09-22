# World Polish — v0.9.1

## Problemas atacados

A v0.9.0 tinha três classes principais de defeito:

1. **recortes não-seamless sendo repetidos**
   - grass;
   - stone;
   - water;
   - props com fundo quadrado.

2. **arte e física divergentes**
   - hitboxes largas demais;
   - ponte e rio não perfeitamente alinhados;
   - NPCs atravessando obstáculos.

3. **animações incompletas**
   - activity props escondidos pelo novo spritesheet;
   - ambientes internos visualmente muito parecidos.

## Estratégia

### Terreno

Crops do concept são tratados como **decais/peças**, não como tiles universais.

A superfície principal usa formas contínuas de baixo custo e recebe arte mascarada somente para dar textura.

### Física

`world.ts` é a fonte única para:

- footprints;
- portas;
- obstáculos;
- rio;
- ponte;
- walkability;
- navegação.

### NPCs

O roteamento continua leve:

```text
destino
  ↓
nearest walkable point
  ↓
bridge routing, se necessário
  ↓
obstacle corner detour
  ↓
axis collision check
```

### Interiores

O renderer continua procedural para manter baixo peso, mas cada edifício possui composição visual própria e mobiliário específico.

## Meta de performance

Nenhum sistema estratégico roda a 60 Hz.

- render/input: até 60 fps
- atmosphere: 15 Hz
- world effects: 12 Hz
- life/brain/economy: 10 Hz
- HUD: 4 Hz
- roster: 1 Hz
