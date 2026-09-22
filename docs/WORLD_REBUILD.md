# World Rebuild — v0.9.0

## Objetivo

Desenhar a vila a partir dos assets de produção e das necessidades de gameplay, não a partir da geometria do protótipo antigo.

## Planta

O mundo mede 2000 × 1400.

### Núcleo
A praça central fica em torno de 930 × 665 e concentra:
- fonte;
- quatro acessos;
- iluminação;
- pontos de socialização.

### Norte
O eixo norte contém:
- Taverna;
- Forja;
- Empório;
- faixa comercial pavimentada.

### Oeste/Sudoeste
Área mais natural e residencial:
- jardim da Elena;
- flores;
- árvores;
- cerca;
- acesso ao prado sul.

### Leste
O rio é uma barreira física real.
A travessia principal ocorre pela ponte entre y=790 e y=920.

### Sudeste
Distrito de pesca:
- Casa do Theo;
- docas;
- margens;
- caminho de pedra.

## Colisões

O player usa circle-vs-rect.

NPCs usam `navigationWaypoint()` para atravessar o rio pelo corredor da ponte.

## Renderer

Elementos estáticos são criados uma vez.
Somente efeitos pequenos atualizam em frequência reduzida.

## Interiores

O renderer interno reconhece categorias de mobiliário:
- hearth/forge;
- bed;
- table;
- counter/workbench;
- shelf/books/rack;
- plants;
- fishing gear;
- smith props.

Fogo e iluminação usam glows animados a 15 Hz.

## Compatibilidade

Preservados:
- saves;
- Life Simulation;
- NPC Brain;
- relações/famílias;
- economia;
- settlement;
- diálogos;
- controles mobile;
- GitHub Pages.
