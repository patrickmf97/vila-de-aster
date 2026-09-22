# Vila de Aster

RPG 2D top-down para navegador com mundo vivo, memória, relações, famílias, economia e direção de arte cozy fantasy.

## v0.9.0 — World Rebuild

A v0.9.0 reconstrói a vila em torno dos assets de produção, em vez de encaixar os assets na planta antiga.

### Nova planta da vila

- praça central mais compacta e legível;
- eixo comercial ao norte;
- Taverna a noroeste;
- Forja ao norte;
- Empório a nordeste;
- Casa da Elena e jardim no sudoeste;
- rio vertical separando o distrito do Theo;
- ponte funcional como corredor real;
- Casa do Theo e docas no sudeste;
- prado sul reservado para expansão econômica.

### Física e colisões

- hitboxes dos prédios redesenhadas;
- colisão do rio dividida ao redor da ponte;
- fonte, cercas, árvores e docas entram na física;
- saves antigos com spawn inválido migram para um ponto seguro;
- colisão do player não cria arrays a cada frame;
- NPCs usam navegação leve para atravessar o rio pela ponte.

### Visual

O WorldRenderer agora é explicitamente dividido em:

```text
terrain
roads / plaza
river / banks
environment props
landmark buildings
settlement
ambient effects
```

Efeitos implementados:

- água em movimento;
- brilho/reflexo do rio;
- fonte animada;
- fumaça de Taverna/Forja;
- lanternas noturnas;
- luzes de janelas;
- vaga-lumes;
- névoa leve em horários adequados;
- transição de manhã/tarde/entardecer/noite;
- efeito do Eco do Rio adaptado ao novo curso d'água.

### Interiores

Todos os interiores principais foram redesenhados:

- Taverna Lua Cheia;
- Forja do Bram;
- Empório da Mira;
- Casa da Elena;
- Casa do Theo;
- casas geradas pelo settlement.

Cada interior possui:

- fluxo livre da porta para o centro;
- zona de trabalho;
- zona social;
- zona privada;
- mobiliário específico;
- colisões por objeto;
- iluminação animada;
- fogo/lareira/forja animados;
- personagens usando os sprites de produção.

### NPCs e animações

- spritesheets de produção continuam ativos;
- idle por direção;
- caminhada lateral alternando frames;
- movimento de rotina;
- animações de trabalho/pesca/socialização preservadas;
- navegação pelo rio agora respeita a ponte;
- rotinas dos cinco moradores foram atualizadas para a nova geografia.

### Mobile

- D-pad;
- Falar;
- Interagir;
- multitouch;
- funciona no exterior e interiores;
- UI responsiva preservada.

### Performance

- simulação: 10 Hz;
- atmosfera: 15 Hz;
- água/luzes: 12 Hz;
- HUD: 4 Hz;
- roster: 1 Hz;
- mundo estático usa GameObjects leves;
- assets continuam WebP compactados;
- nenhum pathfinder pesado foi adicionado.

## Controles

- WASD / setas: mover
- E / Enter: interagir
- F: conversa por escolhas
- B: NPC Brain
- M: economia
- 1–8: hotbar
- Esc: fechar compêndio
