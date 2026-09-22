# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, decisões autônomas, diálogo por escolhas, economia simulada e ambientação cozy fantasy**.

## Estado atual — v0.8.0 Art Direction & Atmosphere

A v0.8.0 é o primeiro grande overhaul visual da Vila de Aster.

Ela mantém toda a lógica da v0.7.1, mas substitui a aparência de protótipo por uma direção de arte mais consistente e atmosférica.

### Novidades visuais

- nova paleta oficial;
- grama com variação de tom e textura;
- caminhos mais orgânicos;
- praça central redesenhada;
- fonte mais detalhada;
- bancos e postes;
- água com profundidade e animação;
- margem com pedras e vegetação;
- ponte refinada;
- árvores em camadas;
- flores, cercas, pedras e detalhes ambientais;
- prédios com identidade visual própria;
- HUD dark cozy glass;
- iluminação variável por horário;
- manhã, tarde, entardecer e noite com identidade própria;
- vaga-lumes à noite;
- brilho especial no rio quando o Eco está ativo.

### Identidade dos prédios

- **Taverna Lua Cheia** → terracota, lanternas, bancos e calor;
- **Forja do Bram** → azul ardósia, chaminé, metal e fumaça;
- **Empório da Mira** → verde oliva, toldo e caixas;
- **Casa da Elena** → flores e tons suaves;
- **Casa do Theo** → detalhes ligados à pesca.

As casas criadas pelo Settlement System continuam compatíveis com a nova linguagem visual.

## Sistemas preservados

A atualização visual não altera a lógica de:

- Life Simulation;
- NPC Brain;
- Choice Dialogue;
- Economy & Settlement;
- memória;
- relações;
- famílias;
- construções;
- interiores;
- movimento sem teleporte.

## Controles

- WASD / setas: mover
- E / Enter: diálogo rápido / interagir
- F: diálogo por escolhas
- B: painel NPC Brain
- M: economia / mercado
- R: reiniciar memória e simulação

## Arquitetura visual

```text
VillageScene
├── WorldRenderer
│   ├── terreno
│   ├── caminhos
│   ├── praça
│   ├── água
│   ├── vegetação
│   ├── prédios
│   └── settlement
│
└── AtmosphereRenderer
    ├── iluminação por horário
    ├── vaga-lumes
    ├── tint atmosférico
    └── efeitos do Eco
```

Documentação:

- `docs/ART_DIRECTION.md`
- `docs/VISUAL_OVERHAUL.md`
- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`
- `docs/CHOICE_DIALOGUE.md`
- `docs/ECONOMY_SETTLEMENT.md`

## Próximo marco visual

**v0.8.1 — Characters & Animation Polish**

Depois disso, os sistemas de gerações/RPG passam para a linha **v0.9**.
