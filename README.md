# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, decisões autônomas e diálogo dinâmico contextual**.

## Estado atual — v0.6.3 Dynamic Dialogue

A conversa livre dos NPCs não usa mais nenhum modelo generativo.

O jogador continua digitando livremente com **F**, mas a resposta é construída instantaneamente a partir de:

- intenção detectada na frase;
- personalidade do NPC;
- profissão;
- memória individual;
- afinidade;
- relações com outros moradores;
- parceiro e filhos;
- atividade atual;
- horário e estado de energia;
- conhecimento real sobre eventos da vila;
- histórico recente da conversa.

## Banco modular de diálogos

O sistema não depende de uma lista única de respostas.

Ele combina blocos de:

- saudações;
- humor;
- profissão;
- família;
- relações;
- opiniões;
- conhecimento do rio;
- memórias do jogador;
- contexto da vila;
- continuidade de conversa;
- personalidade.

Com variações por NPC e contexto, centenas de blocos geram milhares de combinações possíveis.

## Vantagens

- resposta praticamente instantânea;
- nenhuma chave ou API;
- nenhum download de modelo;
- zero custo por conversa;
- funciona igual no Firefox, Chrome e demais navegadores modernos;
- lore totalmente controlado;
- NPC não alucina fatos inexistentes;
- fácil adicionar novos assuntos e personalidades.

## Controles

- WASD / setas: mover
- E / Enter: diálogo rápido
- F: conversa dinâmica livre
- B: painel NPC Brain
- R: reiniciar memória e simulação

## Arquitetura

```text
texto do jogador
      ↓
classificador de intenção
      ↓
memória + personalidade + estado
      ↓
banco modular de diálogos
      ↓
compositor contextual
      ↓
resposta instantânea
```

Documentação:
- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`
- `docs/DYNAMIC_DIALOGUE.md`

## Próximo marco

**v0.7.0 — Economy & Settlement**.
