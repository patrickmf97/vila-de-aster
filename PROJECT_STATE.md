# Vila de Aster — Estado do Projeto

## Versão atual

**v0.7.0 — Economy & Settlement**

## Sistemas ativos

### Life Simulation

- casas;
- sono;
- relações;
- namoro;
- casamento;
- filhos;
- envelhecimento experimental.

### NPC Brain

- necessidades;
- personalidade;
- Utility AI;
- decisões explicáveis.

### Choice Dialogue

- menus e submenus;
- perfis pessoais;
- memória;
- afinidade;
- confidências.

### Economy

Cada NPC possui:

- moedas;
- renda acumulada;
- gastos acumulados;
- tempo produtivo do dia;
- última renda;
- última despesa.

A vila possui:

- estoque;
- preços;
- tesouro;
- prosperidade;
- histórico econômico.

### Settlement

- 4 lotes de expansão;
- custos de construção;
- projetos persistentes;
- progresso diário;
- casas persistentes;
- residência dinâmica;
- interiores para casas novas.

## Ciclo econômico diário

```text
trabalho real do NPC
        ↓
renda + produção
        ↓
impostos
        ↓
despesas familiares
        ↓
consumo da vila
        ↓
ajuste de preços
        ↓
obra em andamento
        ↓
nova necessidade de moradia?
        ↓
possível nova construção
        ↓
prosperidade
```

## Integrações

- pouco dinheiro aumenta utilidade de trabalhar;
- falta de comida aumenta fome;
- construção depende de produção/importação;
- nova casa muda a rotina de sono;
- economia e construção aparecem no diálogo;
- painel M permite observar a simulação.

## Próximo alvo

**v0.8 — Generations & RPG Systems**

- crescimento de crianças;
- profissões herdadas/aprendidas;
- morte e legado;
- herança financeira;
- inventário;
- quests;
- combate;
- regiões externas.
