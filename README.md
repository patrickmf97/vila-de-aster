# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, economia simulada e uma ambientação cozy fantasy leve para web**.

## Estado atual — v0.8.2 Performance & Visual Match

A v0.8.2 corrige o principal problema da primeira implementação visual: o mundo estava bonito como protótipo vetorial, mas distante do concept art e caro demais para renderizar continuamente no navegador.

### Novo mapa ilustrado

O cenário principal agora usa uma composição SVG de 1900×1250 rasterizada uma única vez pelo Phaser.

A linguagem visual aproxima o jogo do concept art oficial:

- caminhos de pedra;
- gramado com textura;
- árvores em camadas e variações de cor;
- árvores rosadas/douradas;
- vegetação mais densa;
- flores e arbustos;
- praça de pedra;
- fonte refinada;
- lanternas;
- prédios com telhados texturizados;
- placas de madeira;
- toldo do Empório;
- Forja com chaminé;
- jardim da Elena;
- detalhes de pesca na casa do Theo;
- rio com margem, pedras, reflexos e ponte.

### Interface

O glass/blur escuro foi substituído por uma UI mais próxima do guia conceitual:

- pergaminho/creme;
- bordas de madeira;
- verde musgo;
- dourado suave;
- painel de escolhas verde;
- diálogo claro e legível.

Além de combinar melhor com o jogo, isso remove o caro `backdrop-filter` sobre o canvas.

## Otimizações

### Renderização

Antes:

```text
centenas de comandos Phaser Graphics
+ árvores/prédios como objetos separados
+ água redesenhada a 60fps
+ blur CSS sobre canvas animado
```

Agora:

```text
1 textura do mapa ilustrado
+ settlement dinâmico
+ água a 12fps
+ atmosfera a 15fps
+ UI sem backdrop blur
```

### Simulação

- Life Simulation / NPC Brain / Economy: 10 Hz;
- movimento dos personagens continua na taxa de renderização;
- HUD: 4 Hz;
- roster: 1 Hz;
- colisões dinâmicas são cacheadas;
- texto dos NPCs só recria textura quando realmente muda;
- nomes/atividades só aparecem quando o jogador está próximo;
- resolução do renderer fixada em 1 para evitar custo excessivo em telas HiDPI.

## Sistemas preservados

- Life Simulation;
- NPC Brain;
- Choice Dialogue;
- Economy & Settlement;
- famílias;
- construções;
- interiores;
- movimento físico entre zonas;
- v0.8.1 Characters & Animation.

## Controles

- WASD / setas: mover
- E / Enter: interagir
- F: diálogo por escolhas
- B: painel NPC Brain
- M: economia
- R: reiniciar simulação

## Próximo marco

Após validar fluidez e visual no navegador:

**v0.9 — Generations & RPG Systems**
