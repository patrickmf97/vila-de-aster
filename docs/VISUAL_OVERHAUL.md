# Visual Overhaul — v0.8.0

## Escopo implementado

### Terreno
- cor-base atualizada;
- manchas tonais;
- lâminas de grama;
- textura procedural determinística.

### Caminhos
- bordas arredondadas;
- contorno de terra;
- pedrinhas e marcas;
- praça circular integrada.

### Praça
- fonte redesenhada;
- bancos;
- postes;
- flores;
- detalhes em anéis de pedra.

### Água
- duas camadas de profundidade;
- borda orgânica;
- pedras;
- vegetação;
- ponte refinada;
- ondulações animadas;
- shimmer horizontal.

### Vegetação
- árvores em camadas;
- sombras;
- flores;
- pedras;
- cercas;
- jardim.

### Prédios
- nova paleta;
- janelas detalhadas;
- sombras;
- telhados refinados;
- decoração específica por prédio.

### Atmosfera
- ciclo visual por horário;
- vaga-lumes;
- tint global;
- pulso mágico no rio quando o Eco está ativo.

### UI
- glass escuro mais quente;
- dourado suave;
- gradientes discretos;
- opções pessoais com acento lilás/ciano.

## Performance

A v0.8.0 continua sem assets pesados e sem novas bibliotecas.

O overhaul usa Phaser Graphics e poucos objetos animados, mantendo o projeto adequado para navegador.

## Arquivos principais

```text
src/world/WorldRenderer.ts
src/world/AtmosphereRenderer.ts
src/data/world.ts
src/scenes/VillageScene.ts
src/styles.css
```
