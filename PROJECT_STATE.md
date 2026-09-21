# Vila de Aster — Estado do Projeto

## Visão

RPG 2D top-down browser-first, com estética chibi própria, história forte e um mundo em que NPCs possuem rotina, relações, memória e decisões próprias.

## Versão atual

**v0.2.0 — Foundation**

### Concluído

- migração do protótipo monolítico para Phaser 3 + TypeScript + Vite;
- Player separado como entidade;
- NPC separado como entidade;
- dados de mundo e NPCs fora da lógica principal;
- SaveSystem;
- TimeSystem;
- DialogueSystem;
- EventSystem;
- HUD desacoplada;
- WorldRenderer;
- VillageScene como orquestradora;
- CI preparada para validar TypeScript + build Vite.

### Experiência preservada

- movimentação;
- câmera;
- colisões;
- 5 NPCs;
- rotinas;
- memória local;
- afinidade;
- dia/noite;
- diálogo;
- evento “O Eco Sob o Rio”.

## Decisões oficiais

- permanecer em 2D top-down;
- manter e evoluir a identidade visual chibi atual;
- usar Phaser como engine do cliente;
- TypeScript como linguagem principal;
- mundo e sistemas devem ser data-driven;
- IA generativa não controlará cada frame: comportamento cotidiano será local/determinístico;
- IA externa entrará depois para decisões de alto nível, diálogo e memória semântica;
- browser-first; multiplayer fica fora da primeira vertical slice.

## Próximo alvo

**v0.3.0 — Living Village**

- animação direcional;
- interiores;
- objetos interativos;
- NPCs com atividades mais naturais;
- memória v2;
- relações NPC ↔ NPC;
- primeiro sistema de escolhas/consequências.
