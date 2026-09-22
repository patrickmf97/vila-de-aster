# Vila de Aster — Estado do Projeto

## Versão atual

**v0.8.2 — Performance & Visual Match**

## Motivo

A v0.8.0/v0.8.1 aumentou muito a quantidade de objetos gráficos vivos.

Em especial:

- Phaser Graphics estáticos continuavam sendo enviados ao renderer;
- água era redesenhada a cada frame;
- textos de atividade podiam ser regenerados continuamente;
- HUD atualizava DOM a cada frame;
- `backdrop-filter` forçava composição cara no Firefox/Linux.

## Nova arquitetura visual

```text
VillageScene
├── villageEnvironment.svg
│   └── rasterizado 1x pelo Phaser
├── WorldRenderer
│   ├── mapa estático
│   ├── settlement dinâmico
│   ├── água 12Hz
│   └── luzes noturnas
├── AtmosphereRenderer
│   └── efeitos 15Hz
└── personagens
    └── animação frame-rate
```

## Frequências

- render/movimento: até 60 fps;
- simulação: 10 Hz;
- atmosfera: 15 Hz;
- água: 12 Hz;
- HUD: 4 Hz;
- sincronização de roster: 1 Hz;
- persistência: a cada 3 s.

## UI

A interface agora segue a direção visual de pergaminho + madeira + verde musgo, sem blur de fundo.

## Compatibilidade

Toda a lógica das versões anteriores permanece preservada.

## Próximo passo

Validar a v0.8.2 em Firefox/Chrome e, com a base estável, iniciar a v0.9.
