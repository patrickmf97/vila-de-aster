# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, economia simulada e direção de arte cozy fantasy**.

## Estado atual — v0.8.4 Buildings Match

A v0.8.4 inicia a **Fase B do asset pack final**: os cinco prédios principais deixam de depender da arte simplificada do mapa-base e passam a existir como assets independentes, inspirados diretamente no sheet visual aprovado.

### Construções integradas

- **Taverna Lua Cheia**
  - telhado de terracota;
  - chaminé e fumaça;
  - janelas quentes;
  - emblema da lua;
  - barris e flores.

- **Forja do Bram**
  - telhado de ardósia;
  - grande chaminé;
  - fachada de pedra;
  - fogo da forja;
  - bigornas e barris.

- **Empório da Mira**
  - telhado verde;
  - toldo vermelho/creme;
  - caixas de produtos;
  - cestas;
  - fachada de comércio.

- **Casa da Elena**
  - telhado vermelho;
  - flores integradas à fachada;
  - cerca branca;
  - jardim;
  - leitura visual delicada.

- **Casa do Theo**
  - telhado azul;
  - píer;
  - bandeira de peixe;
  - redes;
  - barris;
  - barco e água.

### Integração técnica

Os prédios são carregados como SVGs separados e renderizados por cima do ambiente estático.

Isso permite:

- trocar/refinar cada prédio sem reconstruir o mapa;
- profundidade por Y;
- personagem andando atrás/na frente;
- iluminação noturna própria;
- colisões e portas preservadas;
- custo de renderização muito baixo.

## Performance preservada

- mapa-base continua pré-renderizado;
- somente 5 imagens estáticas adicionais;
- glows atualizados na frequência ambiental já reduzida;
- nenhuma biblioteca nova;
- sem filtros CSS pesados;
- Life/NPC Brain/Economy continuam throttled.

## Controles

- WASD / setas: mover
- E / Enter: interagir
- F: diálogo por escolhas
- B: NPC Brain
- M: economia
- 1–8: hotbar
- Esc: fechar compêndio

## Próxima etapa da Fase B

- acabamento de posicionamento e escala após validação visual;
- variantes de construção para settlement;
- props específicos ao redor dos prédios;
- integração dos demais assets ambientais do pack.
