# Vila de Aster

RPG 2D top-down para navegador com mundo vivo, memória, relações, famílias, economia e direção de arte cozy fantasy.

## v0.8.6 — Production Assets

Esta versão substitui os principais placeholders visuais por **assets derivados diretamente dos quatro sheets aprovados**.

### Assets realmente integrados

**Terreno**
- grama ilustrada;
- pavimento de pedra;
- água ilustrada.

**Cenário**
- fonte;
- ponte;
- cerca;
- postes;
- árvores verdes;
- árvores rosadas;
- árvores douradas;
- arbustos;
- prop de mercado.

**Construções**
- Taverna Lua Cheia;
- Forja do Bram;
- Empório da Mira;
- Casa da Elena;
- Casa do Theo.

Os cinco prédios agora usam recortes WebP reais do sheet de construções, não SVGs redesenhados.

**Personagens**
- Patrick;
- Elena;
- Bram;
- Mira;
- Theo;
- Luma.

Cada personagem usa um spritesheet real de 8 frames derivado do sheet aprovado:
1. frente;
2. costas;
3. esquerda;
4. direita;
5. andar esquerda 1;
6. andar direita 1;
7. andar esquerda 2;
8. andar direita 2.

NPCs gerados continuam usando o fallback procedural.

### Mobile

A interface touch continua ativa automaticamente em dispositivos móveis:
- D-pad;
- Falar;
- Interagir;
- multitouch;
- funciona dentro e fora dos prédios.

### Performance

Os recortes foram convertidos para WebP e empacotados no projeto:
- nenhuma dependência externa;
- nenhum download de IA;
- nenhuma imagem gigante do concept durante gameplay;
- simulação continua throttled;
- assets são carregados uma vez pelo Phaser.

## Próximo passo

Após validação visual da v0.8.6:
- ajustar escala/posição dos assets reais;
- ampliar uso de props do catálogo;
- refinar interiores com o pack;
- criar variações de settlement com a mesma linguagem visual.
