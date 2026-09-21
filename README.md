# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, decisões autônomas, diálogo por escolhas e uma economia simulada**.

## Estado atual — v0.7.0 Economy & Settlement

A vila agora possui uma economia persistente ligada ao comportamento dos NPCs.

### Trabalho e renda

O NPC Brain continua decidindo se um morador vai trabalhar, descansar, socializar, cuidar da família etc.

Quando ele realmente trabalha ou pesca, o EconomySystem acumula tempo produtivo.

No fechamento do dia:

- tempo trabalhado vira renda;
- profissão define produção;
- impostos alimentam o tesouro da vila;
- famílias pagam despesas;
- a vila consome comida e mercadorias;
- estoques alteram preços;
- escassez afeta fome e prosperidade.

### Profissões

- Elena / Jardineira → comida + pequenas mercadorias;
- Bram / Ferreiro → metal + mercadorias;
- Mira / Comerciante → mercadorias + importação de madeira/pedra;
- Theo / Pescador → comida;
- Luma / Taverneira → comida + mercadorias;
- Crianças → não possuem renda.

### Mercado

Recursos atuais:

- comida;
- madeira;
- pedra;
- metal;
- mercadorias.

Os preços variam automaticamente conforme estoque/população.

Pressione **M** para abrir o painel econômico.

### Famílias e despesas

Moradores da mesma residência dividem o custo de vida.

Se a família não consegue pagar suas despesas:

- a prosperidade cai;
- a fome aumenta;
- um evento econômico é registrado.

### Construção e expansão

A vila possui terrenos disponíveis.

Uma nova casa pode ser iniciada quando:

- existe necessidade/desejo de moradia;
- a família/tesouro possui dinheiro;
- a vila possui madeira, pedra e mercadorias suficientes;
- não existe outra obra ativa.

Moradores que vivem dentro do próprio comércio também podem buscar uma residência independente.

Durante a obra:

- o canteiro aparece fisicamente no mapa;
- o progresso avança diariamente;
- Bram trabalhando acelera a construção.

Quando termina:

- surge uma casa real;
- a família muda de residência;
- o novo lar possui porta, colisão e interior;
- dormir/acordar passa a usar a nova casa;
- o evento entra na memória.

## Diálogo

A v0.6.4 continua presente.

Com **F**, o jogador usa uma árvore completa de escolhas e agora também pode perguntar sobre:

- finanças pessoais;
- mercado/preços;
- estoques;
- expansão;
- casas em construção.

## Controles

- WASD / setas: mover
- E / Enter: diálogo rápido / interagir
- F: diálogo completo por escolhas
- B: painel NPC Brain
- M: economia / mercado
- R: reiniciar memória e simulação

## Arquitetura

```text
Life Simulation
      ↓
NPC Brain
      ↓
Economy System
├── trabalho → renda
├── produção → estoque
├── consumo → preços
├── família → despesas
├── escassez → necessidades
└── pressão por moradia
          ↓
     Construction
          ↓
   Settlement growth
```

Documentação:

- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`
- `docs/DYNAMIC_DIALOGUE.md`
- `docs/CHOICE_DIALOGUE.md`
- `docs/ECONOMY_SETTLEMENT.md`

## Próximo marco

**v0.8 — Generations & RPG Systems**.
