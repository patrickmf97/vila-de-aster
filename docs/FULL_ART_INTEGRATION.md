# Full Art Integration — v0.8.3

## Objetivo

Integrar a direção de arte do concept board diretamente ao jogo.

## Princípio

O concept não é usado como uma imagem gigante sobre o gameplay.

Ele é traduzido em módulos:

- cenário estático SVG;
- props integrados ao mapa;
- retratos SVG;
- UI DOM;
- personagens Phaser;
- camadas dinâmicas leves.

## Assets

### Cenário

`src/assets/villageEnvironment.svg`

### Retratos

```text
src/assets/portraits/
  patrick.svg
  elena.svg
  bram.svg
  mira.svg
  theo.svg
  luma.svg
```

## UI

### Topo esquerdo
Branding narrativo azul-escuro.

### Topo direito
Calendário/relógio em pergaminho.

### Inferior
Hotbar, medalhão, barras, data e menu rápido.

### Diálogo
Retrato ilustrado + painel em pergaminho.

### Choice Dialogue
Retrato, histórico e opções em painel verde musgo.

### Compêndio
Quatro páginas:

- personagens;
- construções;
- ciclo;
- mapa.

## Interiores

A decoração interna agora possui elementos coerentes com cada atividade/profissão.

## Custo

Nenhuma nova biblioteca foi adicionada.

Os novos assets são SVGs pequenos e a lógica continua usando frequências reduzidas de atualização.
