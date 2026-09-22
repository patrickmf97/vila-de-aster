# Vila de Aster — Estado do Projeto

## Versão atual

**v0.9.0 — World Rebuild**

## Mundo

A vila agora usa uma planta desenhada para os assets de produção.

### Distritos

- Noroeste: Taverna Lua Cheia
- Norte: Forja do Bram
- Nordeste: Empório da Mira
- Centro: Praça e fonte
- Sudoeste: Casa/Jardim da Elena
- Leste: Rio vertical
- Sudeste: Casa e docas do Theo
- Sul: expansão dinâmica

## Física

- prédios com hitboxes menores que a arte;
- ponte é corredor navegável;
- rio é intransponível fora da ponte;
- árvores/fonte/cercas/docas colidem;
- saves antigos têm fallback de spawn;
- NPCs usam waypoint de travessia do rio.

## Renderização

```text
WorldRenderer
├── terreno
├── caminhos/praça
├── rio/margens
├── props
├── prédios
├── settlement
└── efeitos
```

## Efeitos

- água animada;
- fonte;
- fumaça;
- lanternas;
- fireflies;
- névoa;
- ciclo dia/noite;
- Eco do Rio.

## Interiores

Cada prédio tem layout próprio, colisões por móvel e iluminação temática animada.

## Performance

A arquitetura throttled permanece ativa. A reconstrução não adiciona biblioteca externa nem pathfinding pesado.
