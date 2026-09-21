# Roadmap — Vila de Aster

## Fase 1 — Vertical Slice da Vila
1. Organizar o código em módulos (player, world, NPC, dialogue, time, events, save).
2. Criar mapa mais rico com zonas da vila e interiores básicos.
3. Adicionar animações de caminhada e direção aos personagens.
4. Evoluir NPCs para rotinas com estados: trabalhar, caminhar, comer, descansar, socializar.
5. Criar sistema de diálogo ramificado e consequências.
6. Expandir memória: fatos sobre o jogador, eventos e relações entre NPCs.
7. Sistema de save/load completo.

## Fase 2 — IA dos NPCs
1. Perfil persistente por NPC: personalidade, valores, objetivos, relações e conhecimento.
2. Utility AI / máquina de estados para decisões cotidianas.
3. IA generativa apenas para diálogos e decisões de alto nível, com regras de lore.
4. Memória curta e longa resumida para reduzir custo.
5. NPCs conversando entre si e propagando informações.

## Fase 3 — RPG
1. Inventário e itens.
2. Interação com objetos.
3. Quests e eventos dinâmicos.
4. Combate e atributos.
5. Equipamentos, dinheiro e economia local.
6. Áreas externas: floresta, ruínas e outras regiões.

## Fase 4 — Mundo Vivo
1. Clima e estações.
2. Economia simulada.
3. Reputação e facções.
4. Eventos que alteram lojas, rotinas e disponibilidade de NPCs.
5. Diretor de mundo para coordenar acontecimentos dinâmicos sem quebrar o lore.

## Próximo sprint recomendado
- Refatorar o MVP para Phaser 3 + TypeScript + Vite.
- Manter exatamente a experiência atual enquanto trocamos a fundação técnica.
- Em seguida, implementar animação de personagens + rotina avançada + memória v2.
