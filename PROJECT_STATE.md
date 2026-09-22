# Vila de Aster — Estado do Projeto

## Versão atual

**v0.8.1 — Characters & Animation Polish**

## Direção visual

Aster agora possui uma linguagem visual consistente entre:

- mundo externo;
- iluminação;
- prédios;
- personagens;
- interiores;
- HUD;
- diálogos.

## Character System

### Perfis visuais nomeados

Elena, Bram, Mira, Theo e Luma possuem estilos próprios em:

`src/data/characterStyles.ts`

### Fallback

NPCs gerados usam:

- profissão;
- seed do id;
- idade/role;
- paletas pré-definidas.

Isso permite que filhos e futuros moradores nasçam sem depender de assets manuais.

## Animações

### Movimento

- alternância de pés;
- braços;
- bob vertical;
- pequena rotação corporal;
- sombra reage ao passo.

### Idle

- respiração sutil;
- microgestos.

### Atividades

- trabalho;
- pesca;
- socialização;
- comer;
- brincar;
- família;
- investigação;
- sono.

## Jogador

O jogador agora usa a mesma linguagem chibi modular dos NPCs, mantendo identidade azul própria.

## Interiores

InteriorRenderer agora desenha:

- piso de tábuas;
- janelas;
- tapete;
- rodapé;
- entrada iluminada;
- objetos com highlight/sombra.

## Sistemas preservados

- v0.8.0 Art & Atmosphere;
- v0.7.1 Dialogue & Movement;
- Economy & Settlement;
- Choice Dialogue;
- NPC Brain;
- Life Simulation.

## Próximo alvo

**v0.9 — Generations & RPG Systems**

- envelhecimento completo;
- profissão/aprendizado;
- morte e legado;
- herança;
- inventário;
- quests;
- combate;
- região externa.
