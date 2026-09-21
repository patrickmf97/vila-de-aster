# Life Simulation — v0.4

A Life Simulation é a camada que mantém cada morador existindo independentemente da renderização.

## Estado persistente por NPC

Cada morador possui:

- idade;
- estágio de vida;
- residência;
- localização atual;
- atividade;
- energia;
- necessidade social;
- desejo de formar família;
- estado de relacionamento;
- parceiro;
- pais;
- filhos;
- datas de namoro/casamento;
- eventos familiares pendentes.

## Localização

`currentZone = "world"` significa que o NPC deve existir no mapa externo.

Qualquer outro valor representa um interior. Durante o sono, a residência atual é usada como zona, então mudar de casa não exige reescrever o mapa ou a definição original do personagem.

## Relacionamentos

A progressão atual é deliberadamente determinística:

1. NPCs convivem no mundo e aumentam o relacionamento existente.
2. Compatibilidade é calculada de forma estável a partir dos IDs.
3. Relação + compatibilidade podem iniciar namoro.
4. Tempo + relação mais alta podem gerar casamento.
5. O casal escolhe uma residência compartilhada.
6. Desejo de família + tempo de casamento podem iniciar um evento de filho.
7. No vencimento do evento, nasce um novo morador.

## Crianças

Crianças são gravadas em `generatedNpcs` e recebem:

- ID único;
- nome;
- cor derivada dos pais;
- pais;
- residência;
- rotina infantil;
- estado de vida;
- presença real na população.

A implementação é extensível para crescimento, profissão, casamento e novas gerações.

## Escala temporal experimental

Nesta etapa, 28 dias de jogo equivalem a um ano de envelhecimento. É um valor de protótipo e será rebalanceado quando o ciclo de gerações estiver completo.
