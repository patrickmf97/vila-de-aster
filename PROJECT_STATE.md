# Vila de Aster — Estado do Projeto

## Versão atual

**v0.9.1 — World Polish**

## Estado visual

A vila deixou de usar crops não-seamless como TileSprites repetidos.

### Composição atual

```text
base contínua
├── grass color field
├── meadow decals mascarados
├── road paths contínuos
├── praça mascarada
├── rio único mascarado
├── props mascarados
├── prédios
├── personagens
└── atmosfera
```

## Física

A geometria central vive em `src/data/world.ts`.

Ela define:

- edifícios;
- portas;
- rio;
- ponte;
- árvores;
- props físicos;
- colisões;
- zonas;
- rotas leves de NPC.

NPC e player usam a mesma noção de área caminhável.

## NPCs

- respeitam colisões no exterior;
- atravessam o rio pela ponte;
- fazem desvio leve de obstáculos;
- mantêm rotinas, Brain e Life Simulation;
- props de atividades funcionam junto aos sprites de produção.

## Interiores

- cinco interiores principais;
- casas geradas;
- colisão por móvel;
- identidade visual por prédio;
- iluminação dinâmica;
- transição fade exterior/interior.

## Performance

A arquitetura continua throttled e sem pathfinder pesado.

## Próximo foco

Depois da validação visual/funcional da v0.9.1:

- sistemas RPG;
- regiões externas;
- clima/estações;
- gerações e legado.
