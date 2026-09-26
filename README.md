# Vila de Aster

RPG 2D top-down para navegador com mundo vivo, memória, relações, famílias, economia e direção de arte cozy fantasy.

## v0.9.1 — World Polish

A v0.9.1 é uma revisão estrutural da reconstrução anterior. O foco foi remover artefatos visuais dos recortes, alinhar física e arte, melhorar rotas dos NPCs e refinar interiores/animações.

### Terreno e mapa

O jogo não trata mais os recortes do catálogo como tiles perfeitamente repetíveis.

- base de grama contínua;
- manchas orgânicas mascaradas com a arte aprovada;
- caminhos desenhados como superfícies contínuas;
- detalhes de pedra aplicados sem grade aparente;
- praça com um único recorte mascarado;
- rio composto por uma única superfície de água mascarada;
- ponte centralizada no corredor físico;
- margens do rio redesenhadas;
- vegetação mascarada para esconder bordas quadradas dos recortes.

Isso elimina o efeito de tabuleiro/colagem visível da v0.9.0.

### Física

Arte, colisão e navegação agora compartilham a mesma geometria.

- footprint dos prédios considera apenas a parte física inferior;
- player pode passar visualmente atrás dos telhados;
- ponte é o único corredor de travessia do rio;
- árvores, fonte, cercas e doca possuem colisões explícitas;
- destinos inválidos de NPC são corrigidos para pontos caminháveis;
- NPCs fazem detour leve ao redor de obstáculos;
- movimento dos NPCs valida colisão a cada eixo, assim como o player.

### Personagens e animações

- spritesheets de produção preservados;
- idle por direção;
- caminhada lateral alternada;
- bob/rotação suave;
- props de atividade voltaram a funcionar com sprites reais;
- martelo, pesca, comida, investigação e sono permanecem visíveis;
- animações continuam leves para browser/mobile.

### Ambientação

- água com pulso/reflexo leve sem deslocar o recorte;
- brilho do rio;
- fonte animada;
- fumaça;
- luzes noturnas;
- vegetação com sway sutil;
- vaga-lumes e névoa;
- ciclo dia/noite preservado.

### Interiores

Cada interior mantém mobiliário e colisões próprios e ganhou identidade visual mais clara:

- Taverna: madeira e zona social quente;
- Forja: zona de trabalho escura/metálica;
- Empório: faixa de exposição/comércio;
- Casa da Elena: ambiente claro e orgânico;
- Casa do Theo: tons frios, cordas e influência do rio;
- casas geradas continuam suportadas.

Entrada e saída agora usam transição de câmera consistente.

### Mobile

- D-pad;
- Falar;
- Interagir;
- multitouch;
- câmera adaptada a tablet/celular;
- funciona dentro e fora dos prédios.

### Performance

- nenhuma biblioteca nova;
- sem pathfinder pesado;
- simulação: 10 Hz;
- atmosfera: 15 Hz;
- efeitos de mundo: 12 Hz;
- HUD: 4 Hz;
- roster: 1 Hz.

## Controles

- WASD / setas: mover
- E / Enter: interagir
- F: conversa por escolhas
- B: NPC Brain
- M: economia
- 1–8: hotbar
- Esc: fechar compêndio
