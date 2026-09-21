# Vila de Aster — MVP 01

Protótipo de RPG 2D top-down para navegador, focado em provar o conceito de **mundo vivo + NPCs com memória**.

## Como rodar

Opção simples:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

Também funciona abrindo `index.html` diretamente na maioria dos navegadores modernos.

## Controles

- WASD / setas: mover
- E / Enter: conversar
- R: apagar memória e reiniciar

## O que já existe

- mapa 2D desenhado em Canvas;
- câmera seguindo o jogador;
- colisões;
- 5 NPCs;
- rotinas dependentes do horário;
- ciclo dia/noite;
- diálogos contextuais;
- memória persistente em localStorage;
- afinidade simples;
- evento de mundo desbloqueado após múltiplas conversas;
- HUD responsiva.

## Próximo salto técnico

Migrar a base para Phaser 3 + TypeScript, separar mapa/entidades/sistemas, adicionar spritesheets reais e backend para memória persistente/IA generativa dos NPCs.
