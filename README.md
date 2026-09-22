# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, decisões autônomas, diálogo por escolhas, economia simulada e ambientação cozy fantasy**.

## Estado atual — v0.8.1 Characters & Animation Polish

A v0.8.1 fecha o primeiro ciclo grande de overhaul visual.

Depois da ambientação da v0.8.0, os personagens e interiores agora seguem a mesma identidade visual do mundo.

### Personagens

Os moradores continuam usando o estilo vetorial/chibi original de Aster, mas agora possuem:

- proporções individuais;
- cabelo em camadas;
- cores próprias;
- acabamento de roupa;
- acessórios;
- expressão facial;
- silhueta distinta;
- animações de caminhada mais orgânicas;
- animação respiratória/idle;
- gestos sociais;
- objetos de profissão;
- animação de sono;
- animação de alimentação;
- animação de investigação.

### Identidades

- **Elena** → visual floral, rosa/creme, cabelo ondulado e animação ligada a plantas;
- **Bram** → corpo mais robusto, tons terrosos, acabamento metálico e martelo;
- **Mira** → visual organizado, verde/dourado, coque e caixas de comércio;
- **Theo** → azul, cabelo mais solto e animação de pesca;
- **Luma** → tons quentes, dourado e objeto de taverna.

NPCs gerados e futuras crianças usam perfis visuais de fallback por profissão/idade.

### Jogador

O protagonista mantém o visual azul original, agora com:

- roupa refinada;
- faixa dourada;
- mochila;
- cabelo em camadas;
- animação de braços/pernas;
- caminhada com bob e rotação sutil;
- melhor leitura de direção.

### Interiores

Os interiores receberam:

- piso em tábuas;
- rodapés;
- janelas;
- tapetes;
- entrada mais acolhedora;
- sombras de objetos;
- highlights;
- melhor profundidade visual.

### Conversas

A UI de diálogo foi refinada para combinar com o novo estilo:

- retrato com moldura visual;
- cabeçalho com profissão;
- escolhas com hierarquia visual;
- confidências com acento lilás;
- hint de interação mais integrado.

## Sistemas preservados

A v0.8.1 não altera a lógica de:

- Life Simulation;
- NPC Brain;
- Choice Dialogue;
- Economy & Settlement;
- famílias;
- construções;
- movimento físico entre zonas;
- memória e afinidade.

## Controles

- WASD / setas: mover
- E / Enter: diálogo rápido / interagir
- F: diálogo por escolhas
- B: painel NPC Brain
- M: economia / mercado
- R: reiniciar memória e simulação

## Arquivos visuais principais

```text
src/data/characterStyles.ts
src/entities/Npc.ts
src/entities/Player.ts
src/world/InteriorRenderer.ts
src/world/WorldRenderer.ts
src/world/AtmosphereRenderer.ts
src/styles.css
```

Documentação:

- `docs/ART_DIRECTION.md`
- `docs/VISUAL_OVERHAUL.md`
- `docs/CHARACTERS_ANIMATION.md`
- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`
- `docs/CHOICE_DIALOGUE.md`
- `docs/ECONOMY_SETTLEMENT.md`

## Próximo marco

**v0.9 — Generations & RPG Systems**
