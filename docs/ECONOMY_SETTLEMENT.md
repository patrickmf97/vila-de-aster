# Economy & Settlement — v0.7.0

## Objetivo

Fazer a Vila de Aster produzir, consumir e crescer sem depender diretamente do jogador.

## Estado individual

Cada NPC possui:

```text
coins
earnedTotal
spentTotal
workMinutesToday
lastIncome
lastExpenses
lastProcessedDay
```

## Produção

A produção depende do tempo em que o NPC realmente esteve em uma ação de trabalho.

Um NPC que escolhe descansar em vez de trabalhar produz menos e recebe menos.

## Recursos

```text
food
wood
stone
metal
goods
```

## Mercado

Cada recurso possui preço-base.

O preço diário usa:

```text
estoque alvo / estoque atual
```

O resultado é limitado para evitar inflação infinita.

Pouco estoque → preço maior.

Estoque alto → preço menor.

## Famílias

Despesas são calculadas por residência.

Adultos da casa dividem:

- custo pessoal;
- alimentação;
- dependentes.

Se o dinheiro não for suficiente, a família sofre pressão e fome.

## Tesouro

Parte da renda de trabalho entra no tesouro da vila como imposto simples.

O tesouro pode participar do financiamento de novas casas.

## Construção

Custo-base experimental:

```text
90 moedas
18 madeira
12 pedra
5 mercadorias
```

A família financia parte do custo e o tesouro cobre o restante.

## Necessidade de moradia

Uma construção pode ser motivada por:

- residência acima da capacidade;
- casal/família vivendo dentro de comércio/oficina;
- morador com recursos buscando casa independente;
- família crescente com filhos.

## Lotes

A v0.7 possui quatro lotes reservados e visíveis.

Cada lote só pode receber uma construção.

## Obra

O projeto fica persistido no save.

A cada dia:

```text
+22% progresso base
+30% quando Bram trabalhou no dia
```

Quando chega a 100%, vira um SettlementBuilding.

## Casa concluída

Uma casa nova possui:

- posição;
- dimensões;
- cor;
- porta;
- colisão;
- interior;
- proprietários;
- data de conclusão;
- residenceId próprio.

Os moradores mudam para esse residenceId, portanto toda Life Simulation passa a tratar a nova casa como lar real.

## Painel

Pressione **M**.

O painel mostra:

- tesouro;
- prosperidade;
- estoques;
- preços;
- obra ativa;
- eventos econômicos recentes.

## Arquivos principais

```text
src/data/economy.ts
src/systems/EconomySystem.ts
src/world/WorldRenderer.ts
src/systems/SaveSystem.ts
src/systems/NpcBrainSystem.ts
src/scenes/VillageScene.ts
src/scenes/InteriorScene.ts
```
