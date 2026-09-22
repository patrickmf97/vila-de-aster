# Performance — v0.8.2

## Alvos

- navegador desktop comum;
- Firefox/Chrome;
- Linux/Windows;
- movimento responsivo mesmo em hardware integrado.

## Mudanças

### Cenário

O cenário estático não deve existir como centenas de GameObjects.

O arquivo:

`src/assets/villageEnvironment.svg`

é carregado pelo Phaser e rasterizado como uma textura do mundo.

### Loop

Sistemas estratégicos não precisam rodar a 60 Hz.

```text
60 fps → movimento / input
15 Hz → atmosfera
12 Hz → água / lanternas
10 Hz → brain / life / economy / relationships
4 Hz  → HUD
1 Hz  → roster
```

### DOM

Evitar:

- backdrop-filter;
- alteração de textContent sem mudança;
- innerHTML repetido;
- grandes sombras/blur sobre canvas animado.

### Textos Phaser

`Text.setText()` recria textura.

NPCs mantêm cache do último texto e só chamam `setText` quando o conteúdo muda.

Labels ficam ocultos quando distantes.

### Colisões

As colisões de casas construídas ficam em cache e só são recalculadas quando o settlement muda.
